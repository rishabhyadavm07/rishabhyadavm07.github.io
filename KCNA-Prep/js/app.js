// ═══════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════
let currentPage = 'dashboard';
document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', () => navigateTo(el.dataset.page));
});
function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  currentPage = page;
  if (page === 'dashboard') renderDashboard();
  if (page === 'flashcards') renderFlashcards();
  if (page === 'notes') renderNotes();
  if (page === 'quizio') {
    document.getElementById('quizio-active').style.display='none';
    document.getElementById('quizio-results').style.display='none';
    document.getElementById('quizio-browser').style.display='block';
    if(!QUIZIO_DATA) loadQuizioData(); else renderQuizioExams(qzFilter);
  }
}

// ═══════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg;
  t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500);
}

// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════
document.addEventListener('keydown',e=>{
  const active=document.querySelector('.page.active');
  if(!active)return;
  const tag=document.activeElement.tagName;
  if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA')return;
  const pageId=active.id;

  // FLASHCARDS shortcuts
  if(pageId==='page-flashcards'){
    if(e.key===' '||e.key==='Enter'){e.preventDefault();flipCard();}
    else if(e.key==='ArrowRight'||e.key==='n'||e.key==='N'){nextCard();}
    else if(e.key==='ArrowLeft'||e.key==='p'||e.key==='P'){prevCard();}
    else if(e.key==='k'||e.key==='K'){markCard('known');}
    else if(e.key==='m'||e.key==='M'){markCard('practice');}
  }

  // QUIZ shortcuts
  if(pageId==='page-quiz'){
    const quizActive=document.getElementById('quiz-active');
    if(quizActive&&quizActive.style.display!=='none'){
      if(['1','2','3','4'].includes(e.key)){
        const opts=document.querySelectorAll('#q-options .opt');
        const idx=parseInt(e.key)-1;
        if(opts[idx]&&!opts[idx].classList.contains('correct')&&!opts[idx].classList.contains('wrong'))
          opts[idx].click();
      }
      if(e.key==='Enter'){
        const btn=document.getElementById('q-next-btn');
        if(btn&&!btn.disabled)btn.click();
      }
    }
  }

  // EXAM SIMULATOR shortcuts
  if(pageId==='page-simulator'){
    const simActive=document.getElementById('sim-active');
    if(simActive&&simActive.style.display!=='none'){
      if(['1','2','3','4'].includes(e.key)){
        const opts=document.querySelectorAll('#sim-options .opt');
        const idx=parseInt(e.key)-1;
        if(opts[idx])simSelect(idx);
      }
      if(e.key==='ArrowRight'||e.key==='Enter'){simNext();}
      if(e.key==='ArrowLeft'){simPrev();}
    }
  }
});

// Show keyboard hint on flashcard page
function addKbdHint(){
  const row=document.querySelector('#page-flashcards .fc-controls');
  if(!row||row.querySelector('.kbd-hint'))return;
  const hint=document.createElement('div');
  hint.className='kbd-hint';
  hint.style.cssText='font-size:11px;color:var(--muted);margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center';
  hint.innerHTML=`<kbd class="kbd">Space</kbd>flip <kbd class="kbd">←→</kbd>prev/next <kbd class="kbd">K</kbd>know it <kbd class="kbd">M</kbd>practice`;
  row.insertAdjacentElement('afterend',hint);
}


function init(){
  renderDashboard();
  renderFlashcards();
  renderNotes();
  renderCheatSheet();
  initSimulator();
  addKbdHint();
}
init();