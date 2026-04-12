let fcList=[],fcIndex=0,fcFlipped=false,fcProgress={};

function getFilteredCards() {
  const topic=document.getElementById('fc-topic-filter').value;
  const diff=document.getElementById('fc-diff-filter').value;
  return FLASHCARDS.filter(c=>(topic==='all'||c.topic===topic)&&(diff==='all'||c.difficulty===diff));
}

function renderFlashcards() {
  fcProgress=getCardProgress(); fcList=getFilteredCards();
  fcIndex=0; fcFlipped=false; updateCard(); renderDots(); updateFcStats();
  document.getElementById('fc-stats-label').textContent=`${fcList.length} card${fcList.length!==1?'s':''}`;
}

function updateCard() {
  if(fcList.length===0){
    document.getElementById('fc-question').textContent='No cards match your filters.';
    document.getElementById('fc-answer').textContent='';
    document.getElementById('fc-pos').textContent='Card 0 of 0'; return;
  }
  const card=fcList[fcIndex];
  document.getElementById('flashcard').classList.remove('flipped'); fcFlipped=false;
  document.getElementById('fc-question').textContent=card.front;
  document.getElementById('fc-answer').innerHTML=card.back.replace(/\n/g,'<br>');
  document.getElementById('fc-topic-tag').textContent=TOPICS[card.topic]?.name||card.topic;
  document.getElementById('fc-topic-tag-back').textContent=TOPICS[card.topic]?.name||card.topic;
  document.getElementById('fc-diff-tag').innerHTML=`<span class="badge badge-${card.difficulty}">${card.difficulty}</span>`;
  document.getElementById('fc-pos').textContent=`Card ${fcIndex+1} of ${fcList.length}`;
}

function flipCard(){const el=document.getElementById('flashcard');fcFlipped=!fcFlipped;el.classList.toggle('flipped',fcFlipped);}
function nextCard(){if(!fcList.length)return;fcIndex=(fcIndex+1)%fcList.length;updateCard();renderDots();}
function prevCard(){if(!fcList.length)return;fcIndex=(fcIndex-1+fcList.length)%fcList.length;updateCard();renderDots();}

function markCard(status){
  if(!fcList.length)return;
  fcProgress[fcList[fcIndex].id]=status; saveCardProgress(fcProgress);
  updateFcStats(); renderDots(); nextCard();
  showToast(status==='known'?'✓ Marked as known!':'⟳ Added to practice list');
}

function resetProgress(){if(!confirm('Reset all flashcard progress?'))return;saveCardProgress({});fcProgress={};updateFcStats();renderDots();showToast('Progress reset');}

function shuffleCards(){
  for(let i=fcList.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[fcList[i],fcList[j]]=[fcList[j],fcList[i]];}
  fcIndex=0; updateCard(); renderDots(); showToast('Cards shuffled!');
}

function renderDots(){
  document.getElementById('fc-dots').innerHTML=fcList.slice(0,60).map((c,i)=>{
    const prog=fcProgress[c.id];
    const cls=i===fcIndex?'current':prog==='known'?'known':prog==='practice'?'practice':'';
    return `<div class="dot ${cls}" onclick="jumpToCard(${i})"></div>`;
  }).join('');
}

function jumpToCard(i){fcIndex=i;updateCard();renderDots();}

function updateFcStats(){
  const known=fcList.filter(c=>fcProgress[c.id]==='known').length;
  const practice=fcList.filter(c=>fcProgress[c.id]==='practice').length;
  document.getElementById('fc-known-count').textContent=`${known} known`;
  document.getElementById('fc-practice-count').textContent=`${practice} to practice`;
}
