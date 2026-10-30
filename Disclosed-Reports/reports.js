// Report library: loads a curated HackerOne list (Markdown-ish .txt) and renders a
// searchable, sortable grid. The source file comes from <main data-source="...">.
(function () {
  const main = document.querySelector('[data-source]');
  if (!main) return;

  const PAGE = 60;
  const grid = document.getElementById('reports');
  const countEl = document.getElementById('count');
  const statusEl = document.getElementById('status');
  const moreBtn = document.getElementById('more');
  const search = document.getElementById('search');
  const company = document.getElementById('company');
  const sort = document.getElementById('sort');

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + n.toLocaleString('en-US');

  let reports = [], filtered = [], shown = 0;

  function parse(text) {
    const re = /(\d+)\.\s+\[(.*)\]\((.*)\)\s+to\s+(.*?)\s+-\s+(\d+)\s+upvotes,\s+\$(.*)/;
    return text.split('\n').map(line => {
      const m = line.match(re);
      if (!m) return null;
      return {
        rank: parseInt(m[1], 10),
        title: m[2].trim(),
        url: m[3].trim(),
        company: m[4].trim(),
        upvotes: parseInt(m[5], 10),
        bounty: parseInt(m[6].replace(/[^\d]/g, ''), 10) || 0
      };
    }).filter(Boolean);
  }

  function tier(b) {
    if (b >= 10000) return 'high';
    if (b >= 3000) return 'mid';
    return '';
  }

  const ARROW = '<svg class="row__a" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="square" aria-hidden="true"><path class="ic-stroke" d="M6 18 18 6"/><path class="ic-stroke" d="M10 6h8"/></svg>';

  function card(r, n) {
    const safeUrl = /^https:\/\/hackerone\.com\//.test(r.url) ? r.url : '#';
    return `<li><a class="row report" href="${esc(safeUrl)}" target="_blank" rel="noopener">
      <span class="row__n">${String(n).padStart(4, '0')}</span>
      <span class="row__t">${esc(r.title)}</span>
      <span class="row__m"><b class="${tier(r.bounty)}">${r.bounty ? money(r.bounty) : 'No bounty'}</b></span>
      ${ARROW}
      <span class="row__d">${esc(r.company)} · ${r.upvotes.toLocaleString('en-US')} upvotes</span>
    </a></li>`;
  }

  function showMore() {
    const next = filtered.slice(shown, shown + PAGE);
    grid.insertAdjacentHTML('beforeend', next.map((r, j) => card(r, shown + j + 1)).join(''));
    shown += next.length;
    moreBtn.hidden = shown >= filtered.length;
    moreBtn.textContent = `Show more (${(filtered.length - shown).toLocaleString('en-US')} left)`;
  }

  function apply() {
    const q = search.value.trim().toLowerCase();
    const c = company.value;
    filtered = reports.filter(r =>
      (c === 'all' || r.company === c) &&
      (!q || r.title.toLowerCase().includes(q) || r.company.toLowerCase().includes(q)));
    const key = sort.value;
    filtered.sort((a, b) => key === 'bounty' ? b.bounty - a.bounty : key === 'upvotes' ? b.upvotes - a.upvotes : a.rank - b.rank);
    countEl.textContent = filtered.length.toLocaleString('en-US');
    grid.innerHTML = '';
    shown = 0;
    if (!filtered.length) {
      grid.innerHTML = '<li class="empty">Nothing matches. Loosen a filter and try again.</li>';
      moreBtn.hidden = true;
      return;
    }
    showMore();
  }

  async function init() {
    try {
      const res = await fetch(main.dataset.source);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      reports = parse(await res.text());
      const companies = [...new Set(reports.map(r => r.company))].sort((a, b) => a.localeCompare(b));
      company.insertAdjacentHTML('beforeend', companies.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join(''));
      statusEl.className = 'status';
      statusEl.textContent = reports.length.toLocaleString('en-US') + ' reports · ' + companies.length + ' programs';
      apply();
    } catch (e) {
      grid.innerHTML = '<li class="empty">The list didn\'t load. Reload the page to try again.</li>';
      statusEl.className = 'status status--off';
      statusEl.textContent = 'Offline';
    }
  }

  let t;
  search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(apply, 120); });
  company.addEventListener('change', apply);
  sort.addEventListener('change', apply);
  moreBtn.addEventListener('click', showMore);
  init();
})();
