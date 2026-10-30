#!/usr/bin/env python3
"""
Build the static parts of fanaticalnerd.com.

  1. Blog posts:  BLOGS/<folder>/blog.md  →  posts/<folder>.html
  2. Listings:    BLOGS/blogs.json, the latest-posts index in index.html and
                  the full index in blogs.html (between build: markers)
  3. Site chrome: partials/head.html, header.html and footer.html are stamped
                  into every content page between <!-- partial:NAME --> markers.
                  The nav link whose data-nav matches <body data-nav="..."> gets
                  aria-current="page".
  4. SEO/AEO:     sitemap.xml, feed.xml (RSS), llms.txt and llms-full.txt are
                  regenerated on every run. The FAQ in llms-full.txt is read
                  from the FAQPage structured data in index.html.
                  Posts are rendered to static HTML with vendor/marked.min.js,
                  so Node.js must be installed. A post's social card is
                  assets/og/post-<folder>.jpg when it exists, else the default.

Frontmatter format (YAML block at the top of blog.md):
---
title: My Post Title
date: 2026-05-26
author: Rishabh
ai_generated: Human Written, AI Edited
excerpt: One sentence shown on the listing page.
thumbnail: /BLOGS/<folder>/src/thumb.png
---

Usage:
  python3 build.py <folder>    # build one post, then refresh listings + chrome
  python3 build.py --all       # rebuild every post, listings and chrome
  python3 build.py --chrome    # only refresh listings + head/header/footer
"""

import html
import json
import re
import subprocess
import sys
from email.utils import format_datetime
from datetime import datetime, timezone
from datetime import date
from pathlib import Path

ROOT       = Path(__file__).parent
BLOGS_JSON = ROOT / "BLOGS" / "blogs.json"
POSTS_DIR  = ROOT / "posts"
PARTIALS   = ROOT / "partials"
BASE_URL   = "https://fanaticalnerd.com"
WPM        = 220

# Pages that use the shared partials (posts get them from TEMPLATE)
CHROME_PAGES = [
    "index.html",
    "404.html",
    "blogs.html",
    "intel.html",
    "jobs.html",
    "interview_ques.html",
    "Spectra.html",
    "resudit.html",
    "Disclosed-Reports/reports_index.html",
    "Disclosed-Reports/BAC-hackerone.html",
    "Disclosed-Reports/hackerone-authentication.html",
    "Disclosed-Reports/hackerone-injection.html",
]

# Indexable pages for sitemap.xml (posts are added automatically)
SITEMAP_PAGES = [
    "index.html",
    "blogs.html",
    "Spectra.html",
    "Disclosed-Reports/reports_index.html",
    "Disclosed-Reports/BAC-hackerone.html",
    "Disclosed-Reports/hackerone-authentication.html",
    "Disclosed-Reports/hackerone-injection.html",
    "interview_ques.html",
    "intel.html",
    "jobs.html",
    "resudit.html",
    "az500/index.html",
    "az500/notes/study-notes.html",
    "az500/quiz/index.html",
    "kcna/KCNA.html",
    "Exc/Exc.html",
]

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)

ARROW = ('<svg class="row__a" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" '
         'stroke-linecap="square" aria-hidden="true"><path class="ic-stroke" d="M3 12h17"/>'
         '<path class="ic-stroke" d="M14.5 6.5 20 12"/></svg>')

# ── Post template ─────────────────────────────────────────────────────────────
TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{PAGE_TITLE}}</title>
  <meta name="author" content="{{AUTHOR}}">
  <meta name="description" content="{{DESCRIPTION}}">
  <link rel="canonical" href="{{URL}}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="fanaticalnerd">
  <meta property="og:title" content="{{TITLE}}">
  <meta property="og:description" content="{{DESCRIPTION}}">
  <meta property="og:image" content="{{THUMBNAIL}}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{{TITLE}}">
  <meta property="og:url" content="{{URL}}">
  <meta property="og:locale" content="en_US">
  <meta property="article:published_time" content="{{DATE}}">
  <meta property="article:author" content="Rishabh Yadav">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{TITLE}}">
  <meta name="twitter:description" content="{{DESCRIPTION}}">
  <meta name="twitter:image" content="{{THUMBNAIL}}">
  <meta name="twitter:creator" content="@fanaticalnerd">
  <script type="application/ld+json">{{JSONLD}}</script>
{{HEAD}}
  <style>
    .post-meta { grid-column: 4 / -1; margin-top: clamp(24px, 3vw, 40px); display: flex; flex-wrap: wrap; gap: 8px 28px; }
    .post-intro { grid-column: 4 / 11; margin-top: 20px; }
    .post-body { padding-bottom: clamp(64px, 9vw, 120px); align-items: start; }
    .post-body .prose { grid-column: 4 / 11; min-width: 0; }
    .toc { grid-column: 1 / 4; grid-row: 1; position: sticky; top: calc(var(--header-h) + 32px); padding-right: 24px; }
    .toc[hidden] { display: none; }
    .toc ol { list-style: none; display: grid; gap: 2px; margin-top: 16px; }
    .toc a { display: grid; grid-template-columns: 28px 1fr; padding: 5px 0; font-size: 14px; line-height: 1.35; color: var(--fg-3); transition: color 0.25s; }
    .toc a::before { content: attr(data-n); font: 400 11px/1.9 var(--f-mono); }
    .toc a:hover, .toc a.is-active { color: var(--fg); }
    .toc a.is-active::before { color: var(--accent-text); }
    .toc .lvl-3 a { padding-left: 28px; font-size: 13px; }
    @media (pointer: coarse) { .toc a { padding-block: 12px; } }
    .toc .lvl-3 a::before { content: ''; }
    .post-end { padding-block: clamp(48px, 6vw, 72px); border-top: 1px solid var(--line); }
    .post-end .d3 { grid-column: 4 / 11; }
    .post-end__links { grid-column: 4 / -1; margin-top: 24px; display: flex; flex-wrap: wrap; gap: 12px; }
    .more { padding-bottom: clamp(64px, 9vw, 120px); }
    @media (max-width: 900px) {
      .post-meta, .post-intro, .post-body .prose, .post-end .d3, .post-end__links { grid-column: 1 / -1; }
      .toc { display: none; }
    }
  </style>
</head>
<body data-nav="writing" id="top">
  <a class="skip" href="#main">Skip to content</a>
{{HEADER}}
  <main id="main">
    <article>
      <header class="wrap grid mast">
        <div class="mast__crumb"><a class="label u" href="/blogs.html">← Writing</a></div>
        <h1 class="mast__title d2" data-split>{{TITLE}}</h1>
        <p class="post-intro intro reveal" style="--d:300ms">{{DESCRIPTION}}</p>
        <div class="post-meta reveal" style="--d:400ms">
          <span class="label"><span class="node"></span><time datetime="{{DATE}}">{{DATE_HUMAN}}</time></span>
          <span class="label">{{MINUTES}}</span>
          <span class="label">By {{AUTHOR}}</span>
          <span class="label">{{AI_GENERATED}}</span>
        </div>
      </header>

      <div class="wrap"><div class="rule"></div></div>

      <div class="wrap grid post-body" style="padding-top:clamp(40px,6vw,72px)">
        <nav class="toc" id="toc" aria-label="On this page" hidden>
          <span class="label">On this page</span>
          <ol id="toc-list"></ol>
        </nav>
        <div class="prose" id="post-content">
{{CONTENT}}
        </div>
      </div>
    </article>

    <section class="wrap grid post-end" aria-label="Feedback">
      <span class="sec__label label">Feedback</span>
      <p class="d3">Spotted a mistake, or a better way to break it? <em>Tell me.</em></p>
      <div class="post-end__links">
        <a class="btn btn--solid btn--sm" href="mailto:rishabhyadav.inbox@gmail.com">Email</a>
        <a class="btn btn--sm" href="https://twitter.com/fanaticalnerd" target="_blank" rel="noopener">X / Twitter</a>
        <a class="btn btn--sm" href="https://www.linkedin.com/in/rishabhyadavm07" target="_blank" rel="noopener">LinkedIn</a>
      </div>
    </section>

    {{MORE}}
  </main>
{{FOOTER}}
  <div class="lightbox" id="lightbox" role="dialog" aria-label="Image preview"><img id="lightbox-img" src="" alt=""></div>

  <script>
  (function () {
    const content = document.getElementById('post-content');

    const lb = document.getElementById('lightbox'), lbImg = document.getElementById('lightbox-img');
    const closeLb = () => { lb.classList.remove('is-open'); document.body.style.overflow = ''; };
    lb.addEventListener('click', closeLb);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

    function buildTOC() {
      const headings = [...content.querySelectorAll('h2, h3')];
      if (headings.length < 2) return;
      const list = document.getElementById('toc-list');
      let n = 0;
      headings.forEach((h, i) => {
        h.id = h.id || 'section-' + (i + 1);
        const li = document.createElement('li');
        li.className = 'lvl-' + h.tagName[1];
        const a = document.createElement('a');
        a.href = '#' + h.id;
        if (h.tagName === 'H2') a.dataset.n = String(++n).padStart(2, '0');
        a.textContent = h.textContent.replace(/[^\p{L}\p{N}\s:&'?,.-]/gu, '').trim().slice(0, 60);
        li.appendChild(a);
        list.appendChild(li);
      });
      document.getElementById('toc').hidden = false;
      const links = [...list.querySelectorAll('a')];
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        const idx = headings.indexOf(en.target);
        links.forEach((l, i) => l.classList.toggle('is-active', i === idx));
      }), { rootMargin: '-15% 0px -75% 0px' });
      headings.forEach(h => io.observe(h));
    }

    content.querySelectorAll('img').forEach(img => {
      img.addEventListener('click', () => { lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; });
    });
    buildTOC();
  })();
  </script>
  <script src="/assets/site.js" defer></script>
</body>
</html>
"""


MARKED_JS = r"""
const { marked } = require(process.argv[1]);
let src = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => src += d).on('end', () => process.stdout.write(marked.parse(src, { breaks: true, gfm: true })));
"""


def slugify(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", html.unescape(text)).lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    return re.sub(r"[\s-]+", "-", text).strip("-")[:60] or "section"


def render_markdown(md_body: str, folder: str) -> str:
    """Render a post to static HTML with the same marked settings the site used."""
    try:
        out = subprocess.run(["node", "-e", MARKED_JS, str(ROOT / "vendor" / "marked.min.js")],
                             input=md_body, capture_output=True, text=True, check=True).stdout
    except FileNotFoundError:
        sys.exit("build.py needs Node.js to render posts (https://nodejs.org).")
    out = re.sub(r'src="(?!https?:|/|data:)([^"]+)"', rf'src="/BLOGS/{folder}/src/\1"', out)
    out = re.sub(r"<h1[^>]*>.*?</h1>\s*", "", out, count=1, flags=re.S)          # title is already in the page header
    out = re.sub(r"<(/?)h1(\b[^>]*)>", r"<\1h2\2>", out)                        # one h1 per page
    out = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', out)
    out = out.replace("<img ", '<img loading="lazy" decoding="async" ')
    seen = {}
    def add_id(m):
        slug = slugify(m.group(3))
        seen[slug] = seen.get(slug, 0) + 1
        if seen[slug] > 1:
            slug += f"-{seen[slug]}"
        return f'<{m.group(1)}{m.group(2)} id="{slug}">{m.group(3)}</{m.group(1)}>'
    out = re.sub(r"<(h[23])([^>]*)>(.*?)</\1>", add_id, out, flags=re.S)
    out = out.strip()
    return out or '<p class="note-box">This file is still open. The journal has no entries yet.</p>'


def page_title(title: str) -> str:
    """Keep <title> within ~65 characters so search results don't truncate it."""
    full = f"{title} — Rishabh Yadav"
    return full if len(full) <= 65 else title


def post_image(folder: str, meta: dict) -> str:
    og = ROOT / "assets" / "og" / f"post-{folder}.jpg"
    if og.exists():
        return f"{BASE_URL}/assets/og/post-{folder}.jpg"
    thumb = meta.get("thumbnail", "")
    if thumb:
        return BASE_URL + thumb if thumb.startswith("/") else thumb
    return f"{BASE_URL}/assets/og/default.jpg"


def post_jsonld(folder: str, meta: dict, image: str) -> str:
    url = f"{BASE_URL}/posts/{folder}.html"
    data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BlogPosting",
                "headline": meta.get("title", folder),
                "description": meta.get("excerpt", ""),
                "datePublished": meta.get("date", ""),
                "dateModified": lastmod(ROOT / "BLOGS" / folder / "blog.md"),
                "image": image,
                "url": url,
                "mainEntityOfPage": url,
                "author": {"@type": "Person", "name": "Rishabh Yadav", "url": f"{BASE_URL}/"},
                "publisher": {"@type": "Person", "name": "Rishabh Yadav", "url": f"{BASE_URL}/"},
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
                    {"@type": "ListItem", "position": 2, "name": "Writing", "item": f"{BASE_URL}/blogs.html"},
                    {"@type": "ListItem", "position": 3, "name": meta.get("title", folder), "item": url},
                ],
            },
        ],
    }
    return json.dumps(data, ensure_ascii=False).replace("</", "<\\/")


def parse_frontmatter(md_text: str) -> tuple[dict, str]:
    m = FRONTMATTER_RE.match(md_text)
    if not m:
        raise ValueError("blog.md has no frontmatter. Add a --- block at the top.")
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            key, _, val = line.partition(":")
            meta[key.strip().lower()] = val.strip()
    return meta, md_text[m.end():]


def human_date(iso: str) -> str:
    try:
        y, mth, d = (int(p) for p in iso.split("-"))
        return date(y, mth, d).strftime("%d %b %Y")
    except ValueError:
        return iso


def reading_time(folder: str) -> str:
    md = ROOT / "BLOGS" / folder / "blog.md"
    if not md.exists():
        return ""
    _, body = parse_frontmatter(md.read_text(encoding="utf-8"))
    words = len(re.findall(r"[A-Za-z0-9']+", re.sub(r"!\[.*?\]\(.*?\)|<[^>]+>", " ", body)))
    if words < 60:
        return "Open file"
    return f"{max(1, round(words / WPM))} min read"


def load_blogs() -> list:
    data = json.loads(BLOGS_JSON.read_text(encoding="utf-8")) if BLOGS_JSON.exists() else {}
    blogs = data.get("blogs", [])
    blogs.sort(key=lambda b: b.get("date", ""), reverse=True)
    return blogs


def sync_blogs_json(folder: str, meta: dict) -> list:
    data = json.loads(BLOGS_JSON.read_text(encoding="utf-8")) if BLOGS_JSON.exists() else {"blogs": [], "projects": []}
    entry = {
        "title":        meta.get("title", folder),
        "folder":       folder,
        "date":         meta.get("date", ""),
        "author":       meta.get("author", "Rishabh"),
        "AI_generated": meta.get("ai_generated", "Human Written"),
        "excerpt":      meta.get("excerpt", ""),
        "thumbnail":    meta.get("thumbnail", ""),
    }
    blogs = data.setdefault("blogs", [])
    for i, b in enumerate(blogs):
        if b["folder"] == folder:
            blogs[i] = entry
            break
    else:
        blogs.append(entry)
    blogs.sort(key=lambda b: b.get("date", ""), reverse=True)
    data["blogs"] = blogs
    BLOGS_JSON.write_text(json.dumps(data, indent=2), encoding="utf-8")
    return blogs


# ── Listings ──────────────────────────────────────────────────────────────────

def post_rows(blogs: list, indent: str) -> str:
    rows = []
    for n, b in enumerate(blogs, 1):
        meta = human_date(b.get("date", ""))
        mins = reading_time(b["folder"])
        if mins:
            meta += f" · {mins}"
        rows.append(
            f'{indent}<li><a class="row" href="/posts/{b["folder"]}.html">\n'
            f'{indent}  <span class="row__n">{n:02d}</span>\n'
            f'{indent}  <span class="row__t">{html.escape(b["title"])}</span>\n'
            f'{indent}  <span class="row__m">{meta}</span>\n'
            f'{indent}  {ARROW}\n'
            f'{indent}  <span class="row__d">{html.escape(b.get("excerpt", ""))}</span>\n'
            f'{indent}</a></li>'
        )
    return "\n".join(rows)


def replace_block(text: str, name: str, body: str) -> str:
    """Replace everything between <!-- build:NAME --> and <!-- /build:NAME -->."""
    pattern = re.compile(rf"(<!-- build:{name} -->\n)(.*?)(\n?)([ \t]*<!-- /build:{name} -->)", re.S)
    if not pattern.search(text):
        return text
    return pattern.sub(lambda m: m.group(1) + body + "\n" + m.group(4), text)


def sync_listings(blogs: list):
    index = ROOT / "index.html"
    if index.exists():
        text = index.read_text(encoding="utf-8")
        text = replace_block(text, "latest-posts", post_rows(blogs[:3], " " * 12))
        index.write_text(text, encoding="utf-8")
    listing = ROOT / "blogs.html"
    if listing.exists():
        text = listing.read_text(encoding="utf-8")
        text = replace_block(text, "all-posts", post_rows(blogs, " " * 12))
        text = re.sub(r'(<span id="post-count">)\d+(</span>)', rf"\g<1>{len(blogs):02d}\g<2>", text)
        listing.write_text(text, encoding="utf-8")



# ── Headline word split ──────────────────────────────────────────────────────
# Headings marked data-split are split into word spans here rather than in the
# browser, so the page never re-wraps after first paint (no layout shift).
SPLIT_RE = re.compile(r'<(h1|h2|p)(\s[^>]*\bdata-split\b[^>]*)>(.*?)</\1>', re.S)


def split_words(inner: str) -> str:
    out, i = [], 0
    tokens = re.split(r"(<[^>]+>)", inner)
    k = 0
    while k < len(tokens):
        tok = tokens[k]
        if tok.startswith("<") and re.match(r'<span\b[^>]*class="[^"]*\b(redact)\b', tok) or re.match(r"<[^>]*\bdata-nosplit\b", tok or ""):
            unit = tok
            k += 1
            while k < len(tokens) and tokens[k] != "</span>":
                unit += tokens[k]; k += 1
            unit += "</span>"
            out.append(f'<span class="w" aria-hidden="true"><span style="--i:{i}">{unit}</span></span>'); i += 1
        elif tok.startswith("<"):
            out.append(tok)
        else:
            for part in re.split(r"(\s+)", tok):
                if not part:
                    continue
                if part.isspace():
                    out.append(part)
                else:
                    out.append(f'<span class="w" aria-hidden="true"><span style="--i:{i}">{part}</span></span>'); i += 1
        k += 1
    return "".join(out)


def static_split(text: str) -> str:
    def one(m):
        tag, attrs, inner = m.groups()
        if 'data-split="static"' in attrs:
            return m.group(0)
        label = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", inner)).split())
        attrs = re.sub(r'\bdata-split(="[^"]*")?', 'data-split="static"', attrs, count=1)
        attrs = re.sub(r'\saria-label="[^"]*"', "", attrs)
        return f'<{tag}{attrs} aria-label="{html.escape(label, quote=True)}">{split_words(inner)}</{tag}>'
    return SPLIT_RE.sub(one, text)


# ── Site chrome ───────────────────────────────────────────────────────────────

def render_partial(name: str, nav: str = "") -> str:
    text = (PARTIALS / f"{name}.html").read_text(encoding="utf-8")
    if nav:
        text = text.replace(f'data-nav="{nav}"', f'data-nav="{nav}" aria-current="page"', 1)
    return text


def sync_chrome():
    for rel in CHROME_PAGES:
        path = ROOT / rel
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        m = re.search(r'<body[^>]*\bdata-nav="([^"]*)"', text)
        nav = m.group(1) if m else ""
        for name in ("head", "header", "footer"):
            pattern = re.compile(rf"(<!-- partial:{name} -->\n)(.*?)([ \t]*<!-- /partial:{name} -->)", re.S)
            text = pattern.sub(lambda mm: mm.group(1) + render_partial(name, nav) + mm.group(3), text)
        path.write_text(static_split(text), encoding="utf-8")
    print(f"  chrome → {len(CHROME_PAGES)} pages")


# ── Posts ─────────────────────────────────────────────────────────────────────

def more_section(blogs: list, folder: str) -> str:
    others = [b for b in blogs if b["folder"] != folder][:3]
    if not others:
        return ""
    return (
        '<section class="wrap grid more" aria-labelledby="more-title">\n'
        '      <div class="sec__head">\n'
        '        <span class="sec__label label">Next</span>\n'
        '        <h2 class="sec__title d3" id="more-title">More from the <em>notebook</em></h2>\n'
        '      </div>\n'
        '      <ol class="index sec__body">\n'
        + post_rows(others, " " * 8) +
        '\n      </ol>\n'
        '    </section>'
    )


def build(folder: str, blogs: list | None = None) -> Path:
    md_path = ROOT / "BLOGS" / folder / "blog.md"
    if not md_path.exists():
        raise FileNotFoundError(f"BLOGS/{folder}/blog.md not found")

    meta, md_body = parse_frontmatter(md_path.read_text(encoding="utf-8"))
    blogs = sync_blogs_json(folder, meta) if blogs is None else blogs

    thumb = post_image(folder, meta)

    output = TEMPLATE
    output = output.replace("{{HEAD}}", render_partial("head").rstrip("\n"))
    output = output.replace("{{HEADER}}", render_partial("header", "writing"))
    output = output.replace("{{FOOTER}}", render_partial("footer"))
    output = output.replace("{{MORE}}", more_section(blogs, folder))
    output = output.replace("{{CONTENT}}", render_markdown(md_body, folder))
    output = output.replace("{{JSONLD}}", post_jsonld(folder, meta, thumb))
    for placeholder, value in {
        "{{PAGE_TITLE}}":   html.escape(page_title(meta.get("title", folder))),
        "{{TITLE}}":        html.escape(meta.get("title", folder)),
        "{{FOLDER}}":       folder,
        "{{DATE}}":         meta.get("date", ""),
        "{{DATE_HUMAN}}":   human_date(meta.get("date", "")),
        "{{MINUTES}}":      reading_time(folder),
        "{{AUTHOR}}":       html.escape(meta.get("author", "Rishabh")),
        "{{AI_GENERATED}}": html.escape(meta.get("ai_generated", "Human Written")),
        "{{DESCRIPTION}}":  html.escape(meta.get("excerpt", "")),
        "{{THUMBNAIL}}":    thumb,
        "{{URL}}":          f"{BASE_URL}/posts/{folder}.html",
    }.items():
        output = output.replace(placeholder, value)

    POSTS_DIR.mkdir(exist_ok=True)
    out_path = POSTS_DIR / f"{folder}.html"
    out_path.write_text(static_split(output), encoding="utf-8")
    print(f"  built  → posts/{folder}.html")
    return out_path


def build_all():
    blogs_dir = ROOT / "BLOGS"
    folders = sorted(d.name for d in blogs_dir.iterdir() if d.is_dir() and (d / "blog.md").exists())
    print(f"Building {len(folders)} post(s)...")
    for folder in folders:
        meta, _ = parse_frontmatter((blogs_dir / folder / "blog.md").read_text(encoding="utf-8"))
        sync_blogs_json(folder, meta)
    blogs = load_blogs()
    for folder in folders:
        try:
            build(folder, blogs)
        except Exception as e:
            print(f"  SKIP {folder}: {e}")


def lastmod(path: Path) -> str:
    """Last commit date of a file, falling back to its modification time."""
    try:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", str(path)], cwd=ROOT,
                               capture_output=True, text=True).stdout.strip()
        if dirty:  # changed since the last commit, so it's new as of today
            return datetime.now().strftime("%Y-%m-%d")
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", str(path)], cwd=ROOT,
                             capture_output=True, text=True).stdout.strip()
        if out:
            return out
    except FileNotFoundError:
        pass
    return datetime.fromtimestamp(path.stat().st_mtime).strftime("%Y-%m-%d")


def write_sitemap(blogs: list):
    urls = []
    for rel in SITEMAP_PAGES:
        path = ROOT / rel
        if path.exists():
            loc = f"{BASE_URL}/" if rel == "index.html" else f"{BASE_URL}/{rel}"
            urls.append((loc, lastmod(path)))
    for b in blogs:
        if (POSTS_DIR / f"{b['folder']}.html").exists():
            urls.append((f"{BASE_URL}/posts/{b['folder']}.html", b.get("date", "")))
    body = "\n".join(f"  <url>\n    <loc>{html.escape(loc)}</loc>\n    <lastmod>{mod}</lastmod>\n  </url>" for loc, mod in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n", encoding="utf-8")
    print(f"  sitemap → {len(urls)} urls")


def write_feed(blogs: list):
    items = []
    for b in blogs:
        url = f"{BASE_URL}/posts/{b['folder']}.html"
        try:
            pub = format_datetime(datetime.strptime(b.get("date", ""), "%Y-%m-%d").replace(tzinfo=timezone.utc))
        except ValueError:
            continue
        items.append(
            "    <item>\n"
            f"      <title>{html.escape(b['title'])}</title>\n"
            f"      <link>{url}</link>\n"
            f"      <guid isPermaLink=\"true\">{url}</guid>\n"
            f"      <pubDate>{pub}</pubDate>\n"
            f"      <description>{html.escape(b.get('excerpt', ''))}</description>\n"
            "    </item>")
    (ROOT / "feed.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "  <channel>\n"
        "    <title>Writing — Rishabh Yadav</title>\n"
        f"    <link>{BASE_URL}/blogs.html</link>\n"
        "    <description>Field notes on AI red teaming, security automation and cloud security.</description>\n"
        "    <language>en</language>\n"
        f'    <atom:link href="{BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>\n'
        + "\n".join(items) + "\n  </channel>\n</rss>\n", encoding="utf-8")
    print(f"  feed   → {len(items)} posts")


# ── AI answer engines (llms.txt) ─────────────────────────────────────────────
# Plain, quotable facts for ChatGPT, Perplexity, Claude, Google AI Overviews etc.
# Keep in step with the Record section of index.html.
LLMS_SUMMARY = (
    "Rishabh Yadav, known online as fanaticalnerd, is a cloud and SaaS security research analyst at "
    "Bulwarkers WebSecurity. He researches SaaS security posture management (SSPM), writes API-driven "
    "detection logic mapped to CIS and SOC 2, builds open-source security tools and publishes free "
    "certification study hubs."
)

LLMS_PROFILE = """## Experience

- **Security Research Analyst, Bulwarkers WebSecurity** (Jul 2025 – present, remote). Researches and builds controls for an SSPM control library: deterministic, API-driven detection logic validated against live configurations. Platforms assessed include GitLab, Microsoft Entra ID, Google Cloud, Azure, Asana and Salesforce. Joined as a cloud security intern (Jul 2025 – Jan 2026).
- **Security Analyst Intern, SafeYourWeb Infosec** (Mar – Jun 2025, remote). Cloud security assessments, Linux server hardening and thick-client penetration testing, with checklists, SOPs and remediation reports.
- **Cloud Security Intern, Zerorisk Labs** (Dec 2024 – May 2025, remote). Cloud security architecture, identity management and data protection; company-sponsored Google Professional Cloud Security Engineer certification.

## Certifications

- Microsoft Certified: Cybersecurity Architect Expert (SC-100)
- Microsoft Certified: Azure Security Engineer Associate (AZ-500)
- Google Professional Cloud Security Engineer
- EC-Council Certified Ethical Hacker (Practical)
- EC-Council Certified Network Defender v2
- Kubernetes and Cloud Native Associate (KCNA), The Linux Foundation
- Certified API Security Analyst, APIsec University
- Google Cybersecurity Professional Certificate

## Recognition

- CTF runner-up at CyberBytes 2.0 (JECRC University)
- CTF runner-up at The Hackers Meetup, Jaipur Chapter
- APIsec Ambassador, for contributions to the API security community
- Technical coordinator and instructor, 7-day offensive security bootcamp by ZeroRisk Labs

## Education

- MCA, Cybersecurity, JECRC University, Jaipur (2023 – 2025)
- BCA, Delhi Global Institute of Technology (2020 – 2023)

## Skills

SSPM and CSPM research, detection logic, cloud security (Google Cloud, Azure), Microsoft Entra ID (Conditional Access, PIM, RBAC), Defender for Cloud, Microsoft Sentinel, Azure Policy, Key Vault, Zero Trust, API security, application security, attack path analysis, penetration testing, security automation, OSINT, threat detection, Kubernetes and container security, Terraform, Python.
"""

LLMS_PROJECTS = [
    ("Spectra", f"{BASE_URL}/Spectra.html", "Open-source, AI-native API client for macOS and Windows with a Rust core and a built-in MCP server (60+ tools). Tauri v2, React 19, MIT licensed."),
    ("Secure Picks", "https://github.com/rishabhyadavm07/Secure-Picks", "View-once, end-to-end encrypted photo sharing for iOS and Android with a Go relay server; photos never touch disk (X25519 + XSalsa20-Poly1305)."),
    ("Secure CI/CD", "https://github.com/rishabhyadavm07/Secure-CI-CD-Project", "DevSecOps pipeline with Semgrep, Checkov and TruffleHog scans, Cosign-signed images and a hardened Kubernetes deployment."),
    ("Email Security Gateway", f"{BASE_URL}/#work", "Mail gateway with SPF/DKIM/DMARC validation, YARA rules and VirusTotal lookups, quarantine routing and a DMARC dashboard."),
    ("Screen BreakTimer", "https://github.com/rishabhyadavm07/Screen-boundaries", "Native macOS and Windows break timer (25 minutes on, 3 off)."),
]

LLMS_TOOLS = [
    ("AZ-500 Practice Questions & Study Guide", f"{BASE_URL}/az500/index.html", "369 practice questions with rationales, study notes, revision sheets, architecture decks and flashcards."),
    ("KCNA Practice Exam & Study Guide", f"{BASE_URL}/kcna/KCNA.html", "Notes, flashcards, diagrams, cheat sheet and exam simulator for the Kubernetes and Cloud Native Associate."),
    ("Cloud Security Interview Questions", f"{BASE_URL}/interview_ques.html", "Searchable cloud security interview questions with optional AI hints."),
    ("HackerOne Report Library", f"{BASE_URL}/Disclosed-Reports/reports_index.html", "4,059 top public HackerOne reports on access control, authentication and injection."),
    ("Resudit — LaTeX Résumé ATS Optimizer", f"{BASE_URL}/resudit.html", "Tailors the skills section of a LaTeX résumé to a job description and scores ATS fit."),
    ("Security News Feed", f"{BASE_URL}/intel.html", "Security and world headlines from four sources."),
    ("Cloud Security Jobs", f"{BASE_URL}/jobs.html", "Saved searches for cloud security, AppSec and VAPT roles."),
]

LLMS_CONTACT = """## Contact

- Email: rishabhyadav.inbox@gmail.com
- LinkedIn: https://www.linkedin.com/in/rishabhyadavm07
- GitHub: https://github.com/rishabhyadavm07
- X / Twitter: https://twitter.com/fanaticalnerd
"""


def homepage_faq() -> list:
    """Questions and answers from the FAQPage structured data on the homepage."""
    text = (ROOT / "index.html").read_text(encoding="utf-8")
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
        try:
            data = json.loads(block)
        except ValueError:
            continue
        if data.get("@type") == "FAQPage":
            return [(q["name"], q["acceptedAnswer"]["text"]) for q in data.get("mainEntity", [])]
    return []


def write_llms(blogs: list):
    links = lambda items: "\n".join(f"- [{n}]({u}): {d}" for n, u, d in items)
    posts = [(b["title"], f"{BASE_URL}/posts/{b['folder']}.html", b.get("excerpt", "")) for b in blogs]
    head = f"# Rishabh Yadav (fanaticalnerd)\n\n> {LLMS_SUMMARY}\n\n"
    index = (head
             + f"- [Home and profile]({BASE_URL}/): experience, credentials, projects, writing and contact\n"
             + f"- [Full profile and every post as plain text]({BASE_URL}/llms-full.txt)\n\n"
             + "## Projects\n\n" + links(LLMS_PROJECTS) + "\n\n"
             + "## Writing\n\n" + links(posts) + "\n\n"
             + "## Free tools\n\n" + links(LLMS_TOOLS) + "\n\n" + LLMS_CONTACT)
    (ROOT / "llms.txt").write_text(index, encoding="utf-8")

    faq = homepage_faq()
    full = [head, LLMS_PROFILE, "\n## Projects\n\n" + links(LLMS_PROJECTS) + "\n",
            "\n## Free tools\n\n" + links(LLMS_TOOLS) + "\n"]
    if faq:
        full.append("\n## Frequently asked questions\n\n" + "\n\n".join(f"### {q}\n\n{a}" for q, a in faq) + "\n")
    full.append("\n" + LLMS_CONTACT)
    for b in blogs:
        md = ROOT / "BLOGS" / b["folder"] / "blog.md"
        if not md.exists():
            continue
        _, body = parse_frontmatter(md.read_text(encoding="utf-8"))
        body = re.sub(r"^#\s+.*\n", "", body.strip(), count=1).strip()
        body = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", r"[Image: \1]", body)
        body = re.sub(r"(?m)^(#{1,5}) ", r"#\1 ", body)  # nest post headings under the post title
        if len(body.split()) < 30:
            continue
        full.append(f"\n---\n\n## Post: {b['title']}\n\nPublished {b.get('date', '')} · {BASE_URL}/posts/{b['folder']}.html\n\n{body}\n")
    (ROOT / "llms-full.txt").write_text("".join(full), encoding="utf-8")
    print(f"  llms   → llms.txt + llms-full.txt ({len(faq)} FAQs, {len(posts)} posts)")


def refresh():
    blogs = load_blogs()
    sync_listings(blogs)
    print("  synced → index.html + blogs.html listings")
    sync_chrome()
    write_sitemap(blogs)
    write_feed(blogs)
    write_llms(blogs)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    arg = sys.argv[1]
    if arg == "--all":
        build_all()
    elif arg != "--chrome":
        build(arg)
        # Rebuild siblings so their "More" lists include the new post
        blogs = load_blogs()
        for b in blogs:
            if b["folder"] != arg and (ROOT / "BLOGS" / b["folder"] / "blog.md").exists():
                build(b["folder"], blogs)
    refresh()
    print("Done.")
