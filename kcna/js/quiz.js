let quizQuestions=[],quizIndex=0,quizAnswers=[],quizStartTime=null,quizTimer=null,quizConfig={},lastQuizConfig={};

function startQuiz(){
  const topic=document.getElementById('q-topic').value;
  const diff=document.getElementById('q-diff').value;
  const countVal=document.getElementById('q-count').value;
  const mode=document.getElementById('q-mode').value;
  let pool=QUESTIONS.filter(q=>(topic==='all'||q.topic===topic)&&(diff==='mixed'||q.difficulty===diff));
  if(!pool.length){showToast('No questions match those filters — try different settings.');return;}
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const count=countVal==='all'?pool.length:Math.min(parseInt(countVal),pool.length);
  quizQuestions=pool.slice(0,count); quizIndex=0; quizAnswers=[];
  quizConfig={topic,diff,mode,topicLabel:topic==='all'?'All Topics':TOPICS[topic]?.name};
  lastQuizConfig={...quizConfig}; quizStartTime=Date.now();
  clearInterval(quizTimer);
  const timerEl=document.getElementById('q-timer');
  quizTimer=setInterval(()=>{
    const s=Math.floor((Date.now()-quizStartTime)/1000),m=Math.floor(s/60);
    timerEl.textContent=`⏱ ${m}:${(s%60).toString().padStart(2,'0')}`;
  },1000);
  document.getElementById('quiz-config').style.display='none';
  document.getElementById('quiz-results').style.display='none';
  document.getElementById('quiz-active').style.display='block';
  document.getElementById('q-total').textContent=count;
  renderQuestion();
}

function renderQuestion(){
  const q=quizQuestions[quizIndex];
  document.getElementById('q-num').textContent=quizIndex+1;
  document.getElementById('q-progress').style.width=((quizIndex/quizQuestions.length)*100)+'%';
  const topicBadge=document.getElementById('q-topic-badge');
  topicBadge.textContent=TOPICS[q.topic]?.name||q.topic;
  topicBadge.style.background=(TOPICS[q.topic]?.color||'#666')+'22';
  topicBadge.style.color=TOPICS[q.topic]?.color||'#666';
  document.getElementById('q-diff-badge').className=`badge badge-${q.difficulty}`;
  document.getElementById('q-diff-badge').textContent=q.difficulty;
  document.getElementById('q-question').textContent=q.q;
  const letters=['A','B','C','D'];
  document.getElementById('q-options').innerHTML=q.opts.map((opt,i)=>`
    <div class="opt" id="opt-${i}" onclick="selectAnswer(${i})">
      <div class="opt-letter">${letters[i]}</div><div>${opt}</div>
    </div>`).join('');
  document.getElementById('q-explain').textContent=q.explain;
  document.getElementById('q-explain').classList.remove('show');
  const nextBtn=document.getElementById('q-next-btn');
  nextBtn.disabled=true;
  nextBtn.textContent=quizIndex===quizQuestions.length-1?'Finish ✓':'Next →';
}

function selectAnswer(i){
  if(quizAnswers[quizIndex]!==undefined)return;
  const q=quizQuestions[quizIndex]; quizAnswers[quizIndex]=i;
  document.querySelectorAll('.opt').forEach((el,idx)=>{
    if(idx===q.correct)el.classList.add('correct');
    else if(idx===i&&i!==q.correct)el.classList.add('wrong');
  });
  if(quizConfig.mode==='practice')document.getElementById('q-explain').classList.add('show');
  document.getElementById('q-next-btn').disabled=false;
}

function nextQuestion(){
  if(quizAnswers[quizIndex]===undefined){showToast('Please select an answer first');return;}
  quizIndex++; if(quizIndex>=quizQuestions.length){finishQuiz();return;} renderQuestion();
}

function endQuizEarly(){
  if(!confirm('End quiz early? Unanswered questions will be marked wrong.'))return;
  while(quizAnswers.length<quizQuestions.length)quizAnswers.push(-1); finishQuiz();
}

function finishQuiz(){
  clearInterval(quizTimer);
  const elapsed=Math.floor((Date.now()-quizStartTime)/1000);
  const timeStr=`${Math.floor(elapsed/60)}:${(elapsed%60).toString().padStart(2,'0')}`;
  let score=0; const breakdown={};
  const diffBreakdown={easy:{correct:0,total:0},medium:{correct:0,total:0},hard:{correct:0,total:0}};
  const wrongQs=[];
  quizQuestions.forEach((q,i)=>{
    const ans=quizAnswers[i]; const correct=ans===q.correct; if(correct)score++;
    if(!breakdown[q.topic])breakdown[q.topic]={correct:0,total:0};
    breakdown[q.topic].total++; if(correct)breakdown[q.topic].correct++;
    diffBreakdown[q.difficulty].total++; if(correct)diffBreakdown[q.difficulty].correct++;
    if(!correct)wrongQs.push({q,ans,i});
  });
  const pct=Math.round((score/quizQuestions.length)*100);
  const entry={id:Date.now(),date:new Date().toISOString(),topicLabel:quizConfig.topicLabel,
    difficulty:quizConfig.diff,score,total:quizQuestions.length,pct,time:timeStr,breakdown,diffBreakdown};
  const history=getHistory(); history.push(entry); saveHistory(history); updateStreak();

  document.getElementById('quiz-active').style.display='none';
  document.getElementById('quiz-results').style.display='block';
  const scoreColor=pct>=80?'var(--easy)':pct>=60?'var(--medium)':'var(--hard)';
  document.getElementById('res-score-num').textContent=pct+'%';
  document.getElementById('res-score-num').style.color=scoreColor;
  document.getElementById('res-score-label').textContent=`${score} / ${quizQuestions.length} correct · ${timeStr}`;
  const grade=pct>=80?'🎉 Excellent!':pct>=70?'👍 Good job':pct>=60?'📚 Keep studying':'💪 More practice needed';
  document.getElementById('res-badges').innerHTML=`<span class="badge" style="background:${scoreColor}22;color:${scoreColor};font-size:13px;padding:4px 14px">${grade}</span>`;

  const color2=p=>p>=70?'var(--easy)':p>=50?'var(--medium)':'var(--hard)';
  document.getElementById('res-by-topic').innerHTML=Object.entries(breakdown).map(([tid,d])=>{
    const p=Math.round((d.correct/d.total)*100),c=TOPICS[tid]?.color||'#6366f1';
    return `<div class="res-row"><div class="rr-name">${TOPICS[tid]?.name||tid}</div><div class="rr-count text-muted">${d.correct}/${d.total}</div>
      <div style="flex:1"><div class="prog-bg"><div class="prog-fill" style="width:${p}%;background:${c}"></div></div></div>
      <div style="font-size:12px;font-weight:700;width:36px;text-align:right;color:${color2(p)}">${p}%</div></div>`;
  }).join('')||'<p class="text-muted text-sm">No data</p>';

  const dc={easy:'var(--easy)',medium:'var(--medium)',hard:'var(--hard)'};
  document.getElementById('res-by-diff').innerHTML=['easy','medium','hard'].filter(d=>diffBreakdown[d].total>0).map(d=>{
    const dd=diffBreakdown[d],p=Math.round((dd.correct/dd.total)*100);
    return `<div class="res-row"><div class="rr-name">${d[0].toUpperCase()+d.slice(1)}</div><div class="rr-count text-muted">${dd.correct}/${dd.total}</div>
      <div style="flex:1"><div class="prog-bg"><div class="prog-fill" style="width:${p}%;background:${dc[d]}"></div></div></div>
      <div style="font-size:12px;font-weight:700;width:36px;text-align:right;color:${dc[d]}">${p}%</div></div>`;
  }).join('');

  document.getElementById('res-review').innerHTML=wrongQs.length===0
    ?'<p style="color:var(--easy);font-size:13px">🎉 Perfect score — nothing to review!</p>'
    :wrongQs.map(({q,ans})=>`<div style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid var(--border)">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px">${q.q}</div>
      <div style="font-size:12px;color:var(--hard);margin-bottom:4px">✗ Your answer: ${ans>=0?q.opts[ans]:'Skipped'}</div>
      <div style="font-size:12px;color:var(--easy);margin-bottom:6px">✓ Correct: ${q.opts[q.correct]}</div>
      <div style="font-size:12px;color:var(--muted);font-style:italic">${q.explain}</div>
    </div>`).join('');
}

function goToDashboard(){navigateTo('dashboard');}
function newQuiz(){document.getElementById('quiz-results').style.display='none';document.getElementById('quiz-config').style.display='block';}
function retryQuiz(){
  document.getElementById('quiz-results').style.display='none';
  if(lastQuizConfig.topic)document.getElementById('q-topic').value=lastQuizConfig.topic;
  if(lastQuizConfig.diff)document.getElementById('q-diff').value=lastQuizConfig.diff;
  startQuiz();
}
