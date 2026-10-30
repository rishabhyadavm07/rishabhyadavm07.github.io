// fanaticalnerd — shared behaviour: theme, menu, reveals, scramble, clock, copy.
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Theme (Ink / Paper) ──
  const themeBtns = document.querySelectorAll('[data-theme-toggle]');
  const syncThemeLabel = () => {
    const paper = root.dataset.theme === 'paper';
    themeBtns.forEach(b => {
      const label = b.querySelector('[data-theme-label]');
      if (label) label.textContent = paper ? 'Ink' : 'Paper';
      b.setAttribute('aria-label', paper ? 'Switch to dark theme' : 'Switch to light theme');
    });
  };
  themeBtns.forEach(b => b.addEventListener('click', () => {
    const next = root.dataset.theme === 'paper' ? 'ink' : 'paper';
    const apply = () => { root.dataset.theme = next; syncThemeLabel(); };
    if (document.startViewTransition && !reduced) document.startViewTransition(apply); else apply();
    try { localStorage.setItem('fn-theme', next); } catch (e) {}
  }));
  syncThemeLabel();

  // ── Header border once scrolled ──
  const hdr = document.querySelector('.hdr');
  if (hdr) {
    const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Mobile menu ──
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    root.classList.toggle('menu-open', open);
    document.querySelectorAll('[data-menu-open]').forEach(b => b.setAttribute('aria-expanded', String(open)));
    if (menu) menu.toggleAttribute('inert', !open);
    if (open) menu?.querySelector('[data-menu-close]')?.focus();
  };
  if (menu) menu.setAttribute('inert', '');
  document.querySelectorAll('[data-menu-open]').forEach(b => b.addEventListener('click', () => setMenu(true)));
  document.querySelectorAll('[data-menu-close], #menu a').forEach(b => b.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false); });

  // ── Split headings into words for the line-mask reveal ──
  function split(el) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    let i = 0;
    const wrap = (content) => {
      const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span'); inner.style.setProperty('--i', i++);
      if (typeof content === 'string') inner.textContent = content; else inner.appendChild(content);
      w.appendChild(inner);
      return w;
    };
    const walk = (node) => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            frag.appendChild(/^\s+$/.test(part) ? document.createTextNode(part) : wrap(part));
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          if (child.matches('.redact, [data-nosplit]')) {
            const holder = document.createElement('span');
            child.replaceWith(holder);
            holder.replaceWith(wrap(child));
          } else walk(child);
        }
      });
    };
    walk(el);
    el.setAttribute('aria-label', label);
  }
  document.querySelectorAll('[data-split]').forEach(split);

  // ── Reveal on scroll ──
  const show = el => el.classList.add('is-in');
  let io = null;
  if ('IntersectionObserver' in window && !reduced) {
    io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  }
  const observe = (els) => els.forEach(el => io ? io.observe(el) : show(el));
  observe(document.querySelectorAll('[data-split], .reveal, .rule, .scan'));
  window.fnObserve = (els) => observe(Array.from(els));

  // ── Scramble text on hover ──
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>';
  function scramble(el, finalText) {
    if (reduced) { el.textContent = finalText; return; }
    cancelAnimationFrame(el._raf);
    const len = finalText.length;
    let frame = 0;
    const tick = () => {
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = finalText[i];
        out += (ch === ' ' || frame >= i * 1.5 + 5) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (frame++ < len * 1.5 + 5) el._raf = requestAnimationFrame(tick);
    };
    tick();
  }
  window.fnScramble = scramble;
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const label = el.querySelector('[data-scramble-text]') || el;
    const text = label.textContent;
    el.addEventListener('mouseenter', () => scramble(label, text));
    el.addEventListener('focus', () => scramble(label, text));
  });

  // ── Live clock (IST) ──
  const clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const tick = () => { const t = fmt.format(new Date()); clocks.forEach(c => { c.textContent = t; }); };
    tick(); setInterval(tick, 1000);
  }

  // ── Copy to clipboard ──
  document.querySelectorAll('[data-copy]').forEach(btn => {
    const label = btn.querySelector('[data-copy-label]') || btn;
    const idle = label.textContent;
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy); scramble(label, 'Copied'); }
      catch (e) { scramble(label, 'Select & copy'); }
      clearTimeout(btn._t);
      btn._t = setTimeout(() => scramble(label, idle), 1800);
    });
  });

  // ── Cursor + pointer reactions (mouse/trackpad only, motion allowed) ──
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.classList.add('has-cursor');
    const cur = document.createElement('div');
    cur.className = 'cur';
    cur.setAttribute('aria-hidden', 'true');
    cur.innerHTML = '<div class="cur__frame"><i></i><i></i><i></i><i></i></div><div class="cur__dot"></div><div class="cur__label"></div>';
    document.body.appendChild(cur);
    const frame = cur.querySelector('.cur__frame'), dot = cur.querySelector('.cur__dot'), label = cur.querySelector('.cur__label');

    const TARGETS = 'a, button, [data-cursor], .tile, .scan, label[for]';
    const TEXT = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea, select, [contenteditable]';
    const IDLE = 28;
    let mx = -100, my = -100, target = null, pad = 6, raf = null;
    const f = { x: -100, y: -100, w: IDLE, h: IDLE };

    const autoLabel = el => {
      if (!el) return '';
      if (el.dataset.cursor !== undefined) return el.dataset.cursor;
      if (el.matches('[data-copy]')) return 'Copy';
      if (el.matches('a[href^="mailto:"]')) return 'Write';
      if (el.matches('a.row[href*="/posts/"]')) return 'Read';
      if (el.matches('a[target="_blank"]')) return 'Open ↗';
      if (el.matches('.tile, a.row')) return 'View';
      if (el.matches('.scan')) return 'Inspect';
      return '';
    };

    const loop = () => {
      let tx, ty, tw, th;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        tx = r.left - pad; ty = r.top - pad; tw = r.width + pad * 2; th = r.height + pad * 2;
      } else {
        tx = mx - IDLE / 2; ty = my - IDLE / 2; tw = IDLE; th = IDLE;
      }
      const k = target ? 0.24 : 0.2;
      f.x += (tx - f.x) * k; f.y += (ty - f.y) * k; f.w += (tw - f.w) * k; f.h += (th - f.h) * k;
      frame.style.transform = `translate3d(${f.x}px, ${f.y}px, 0)`;
      frame.style.width = f.w + 'px';
      frame.style.height = f.h + 'px';
      const moving = Math.abs(tx - f.x) + Math.abs(ty - f.y) + Math.abs(tw - f.w) + Math.abs(th - f.h) > 0.4;
      raf = (moving || target) ? requestAnimationFrame(loop) : null;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      if (!cur.classList.contains('is-on')) { f.x = mx - IDLE / 2; f.y = my - IDLE / 2; cur.classList.add('is-on'); }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      label.style.transform = `translate3d(${mx + 16}px, ${my + 14}px, 0)`;
      kick();
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => cur.classList.remove('is-on'));
    addEventListener('scroll', kick, { passive: true });
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));

    document.addEventListener('pointerover', e => {
      cur.classList.toggle('is-text', !!e.target.closest(TEXT));
      const el = e.target.closest(TARGETS);
      if (el === target) return;
      target = el;
      pad = el && el.matches('.tile, .row, .scan') ? 0 : 6;
      const text = autoLabel(el);
      label.textContent = text;
      cur.classList.toggle('is-lock', !!el);
      cur.classList.toggle('has-label', !!text);
      kick();
    });

    // Magnetic: buttons and nav links lean toward the cursor
    document.querySelectorAll('.btn, .nav a, .theme-btn, .menu-btn, .brand, [data-magnetic]').forEach(el => {
      el.classList.add('mag');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.32}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    // 3D tilt
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 24 + 'deg');
        el.style.setProperty('--rx', ((e.clientY - r.top) / r.height - 0.5) * -24 + 'deg');
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });

    // Inspection lens: colour only under the cursor, with a live coordinate readout
    document.querySelectorAll('.scan').forEach(s => {
      const coords = s.closest('figure')?.querySelector('[data-coords]');
      const idle = coords?.textContent;
      s.addEventListener('pointerenter', () => {
        clearTimeout(s._t);
        s.style.setProperty('--r', '150%');
        s.classList.add('is-spot');
        requestAnimationFrame(() => requestAnimationFrame(() => s.style.setProperty('--r', '84px')));
      });
      s.addEventListener('pointermove', e => {
        const r = s.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        s.style.setProperty('--mx', x + 'px');
        s.style.setProperty('--my', y + 'px');
        if (coords) coords.textContent = `X ${(x / r.width).toFixed(2)} · Y ${(y / r.height).toFixed(2)}`;
      });
      s.addEventListener('pointerleave', () => {
        s.style.setProperty('--r', '150%');
        s._t = setTimeout(() => s.classList.remove('is-spot'), 500);
        if (coords) coords.textContent = idle;
      });
    });

    // Big headlines: words near the cursor lift
    document.querySelectorAll('.d1[data-split]').forEach(h => {
      let words = [], ticking = false;
      const measure = () => {
        words = [...h.querySelectorAll('.w > span')].map(el => {
          const r = el.getBoundingClientRect();
          return { el, x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
        });
      };
      const settle = () => { h.classList.add('is-settled'); measure(); };
      setTimeout(settle, 2600);
      addEventListener('resize', () => { if (h.classList.contains('is-settled')) measure(); });
      addEventListener('pointermove', e => {
        if (!words.length || ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const px = e.clientX + scrollX, py = e.clientY + scrollY;
          words.forEach(w => {
            const d = Math.hypot(px - w.x, py - w.y);
            const lift = Math.max(0, 1 - d / 280);
            w.el.style.setProperty('--lift', (-lift * lift * 16).toFixed(2) + 'px');
          });
          ticking = false;
        });
      }, { passive: true });
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
