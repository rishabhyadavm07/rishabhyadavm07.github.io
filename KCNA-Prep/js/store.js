const store = {
  get(key, def) { try { const v = localStorage.getItem('kcna_'+key); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(key, val) { try { localStorage.setItem('kcna_'+key, JSON.stringify(val)); } catch {} },
};
function getHistory() { return store.get('history', []); }
function saveHistory(h) { store.set('history', h); }
function getCardProgress() { return store.get('cards', {}); }
function saveCardProgress(p) { store.set('cards', p); }
function getStreak() { return store.get('streak', { count: 0, last: null }); }
function updateStreak() {
  const s = getStreak(); const today = new Date().toDateString();
  if (s.last === today) return s.count;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const count = s.last === yesterday ? s.count + 1 : 1;
  store.set('streak', { count, last: today }); return count;
}
function clearHistory() {
  if (!confirm('Clear all quiz history? This cannot be undone.')) return;
  store.set('history', []); renderDashboard(); showToast('History cleared');
}
