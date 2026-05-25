#!/usr/bin/env python3
"""
Build a blog post HTML from blog-template.html + BLOGS/<folder>/blog.md

Usage:
  python build.py <folder>          # build one post
  python build.py --all             # rebuild all posts in blogs.json
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
TEMPLATE = ROOT / "blog-template.html"
BLOGS_JSON = ROOT / "BLOGS" / "blogs.json"
POSTS_DIR = ROOT / "posts"
BASE_URL = "https://rishabhyadavm07.github.io"


def load_metadata(folder: str) -> dict:
    data = json.loads(BLOGS_JSON.read_text())
    for entry in data["blogs"]:
        if entry["folder"] == folder:
            return entry
    raise ValueError(f"No entry for folder '{folder}' in blogs.json")


def build(folder: str) -> Path:
    meta = load_metadata(folder)
    template = TEMPLATE.read_text(encoding="utf-8")

    title = meta.get("title", "")
    author = meta.get("author", "Rishabh")
    date = meta.get("date", "")
    ai_generated = meta.get("AI_generated", "Human Written")
    description = meta.get("excerpt", "")
    thumbnail = meta.get("thumbnail", "")
    url = f"{BASE_URL}/posts/{folder}.html"

    replacements = {
        "{{TITLE}}": title,
        "{{FOLDER}}": folder,
        "{{DATE}}": date,
        "{{AUTHOR}}": author,
        "{{AI_GENERATED}}": ai_generated,
        "{{DESCRIPTION}}": description,
        "{{THUMBNAIL}}": thumbnail,
        "{{URL}}": url,
    }

    output = template
    for placeholder, value in replacements.items():
        output = output.replace(placeholder, value)

    out_path = POSTS_DIR / f"{folder}.html"
    POSTS_DIR.mkdir(exist_ok=True)
    out_path.write_text(output, encoding="utf-8")
    print(f"  built → posts/{folder}.html")
    return out_path


def build_all():
    data = json.loads(BLOGS_JSON.read_text())
    folders = [entry["folder"] for entry in data["blogs"]]
    print(f"Building {len(folders)} post(s)...")
    for folder in folders:
        build(folder)
    print("Done.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    arg = sys.argv[1]
    if arg == "--all":
        build_all()
    else:
        build(arg)
        print("Done.")
