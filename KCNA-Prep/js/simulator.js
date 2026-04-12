let simState={pool:[],answers:{},current:0,timerInterval:null,secondsLeft:0};

function startSimulator(){
  // Build pool: 60 Qs, weighted by topic
  let pool=[...QUESTIONS].sort(()=>Math.random()-0.5).slice(0,60);
  if(pool.length<10){showToast('Not enough questions in bank');return;}
  simState={pool,answers:{},current:0,timerInterval:null,secondsLeft:90*60};
  document.getElementById('sim-ready').style.display='none';
  document.getElementById('sim-results').style.display='none';
  document.getElementById('sim-active').style.display='block';
  buildSimNavGrid();
  renderSimQuestion();
  startSimTimer();
}

function buildSimNavGrid(){
  const g=document.getElementById('sim-nav-grid');
  g.innerHTML=simState.pool.map((_,i)=>`<button class="sim-nav-btn${i===0?' current':''}" id="snb-${i}" onclick="simJump(${i})">${i+1}</button>`).join('');
}

function renderSimQuestion(){
  const {pool,answers,current}=simState;
  const q=pool[current];
  document.getElementById('sim-num').textContent=current+1;
  document.getElementById('sim-progress').style.width=`${((current+1)/pool.length)*100}%`;
  const topicName=TOPICS[q.topic]?.name||q.topic;
  document.getElementById('sim-topic-badge').textContent=topicName;
  document.getElementById('sim-topic-badge').className=`badge`;
  document.getElementById('sim-diff-badge').textContent=q.difficulty;
  document.getElementById('sim-diff-badge').className=`badge badge-${q.difficulty}`;
  document.getElementById('sim-question').textContent=q.q;
  const opts=document.getElementById('sim-options');
  const letters=['A','B','C','D'];
  opts.innerHTML=q.opts.map((o,i)=>`
    <div class="opt${answers[current]===i?' selected':''}" onclick="simSelect(${i})">
      <div class="opt-letter">${letters[i]}</div>
      <div>${o}</div>
    </div>`).join('');
  updateSimNav();
  const answered=Object.keys(answers).length;
  document.getElementById('sim-answered-count').textContent=`${answered}/${pool.length} answered`;
  document.getElementById('sim-prev-btn').disabled=current===0;
  document.getElementById('sim-next-btn').textContent=current===pool.length-1?'Review':'Next →';
}

function simSelect(i){
  simState.answers[simState.current]=i;
  renderSimQuestion();
}

function simNext(){
  if(simState.current<simState.pool.length-1){simState.current++;renderSimQuestion();}
  else submitSimulator();
}

function simPrev(){
  if(simState.current>0){simState.current--;renderSimQuestion();}
}

function simJump(i){
  simState.current=i;
  renderSimQuestion();
}

function updateSimNav(){
  const {pool,answers,current}=simState;
  pool.forEach((_,i)=>{
    const btn=document.getElementById(`snb-${i}`);
    if(!btn)return;
    btn.className='sim-nav-btn'+(answers[i]!==undefined?' answered':'')+(i===current?' current':'');
  });
}

function startSimTimer(){
  clearInterval(simState.timerInterval);
  simState.timerInterval=setInterval(()=>{
    simState.secondsLeft--;
    const m=Math.floor(simState.secondsLeft/60);
    const s=simState.secondsLeft%60;
    const el=document.getElementById('sim-timer');
    if(el){
      el.textContent=`${m}:${s.toString().padStart(2,'0')}`;
      el.style.color=simState.secondsLeft<300?'var(--hard)':simState.secondsLeft<600?'var(--medium)':'var(--medium)';
    }
    if(simState.secondsLeft<=0){clearInterval(simState.timerInterval);submitSimulator(true);}
  },1000);
}

function submitSimulator(timedOut=false){
  clearInterval(simState.timerInterval);
  const {pool,answers}=simState;
  let correct=0;
  const breakdown={};const diffBreakdown={easy:{c:0,t:0},medium:{c:0,t:0},hard:{c:0,t:0}};
  pool.forEach((q,i)=>{
    if(!breakdown[q.topic])breakdown[q.topic]={c:0,t:0};
    breakdown[q.topic].t++;
    diffBreakdown[q.difficulty].t++;
    if(answers[i]===q.correct){correct++;breakdown[q.topic].c++;diffBreakdown[q.difficulty].c++;}
  });
  const pct=Math.round((correct/pool.length)*100);
  const passed=pct>=75;
  // Save to history
  const entry={id:Date.now(),date:new Date().toLocaleDateString(),topicLabel:'Exam Simulator (All Topics)',
    difficulty:'mixed',score:correct,total:pool.length,pct,time:Math.round((90*60-simState.secondsLeft)/60),
    breakdown,diffBreakdown};
  const hist=JSON.parse(localStorage.getItem('kcna_history')||'[]');
  hist.push(entry);localStorage.setItem('kcna_history',JSON.stringify(hist));
  // Show results
  document.getElementById('sim-active').style.display='none';
  document.getElementById('sim-results').style.display='block';
  const cls=passed?'pass-banner':'fail-banner';
  const icon=passed?'🎉':'📚';
  document.getElementById('sim-score-card').innerHTML=`
    <div class="${cls}">
      <div style="font-size:48px">${icon}</div>
      <div style="font-size:52px;font-weight:800;letter-spacing:-2px;color:${passed?'var(--easy)':'var(--hard)'}">${pct}%</div>
      <div style="font-size:18px;font-weight:700;margin-top:4px">${passed?'PASSED':'FAILED'}</div>
      <div style="color:var(--muted);font-size:13px;margin-top:6px">${correct} / ${pool.length} correct${timedOut?' · Time expired':''}</div>
      <div style="color:var(--muted);font-size:12px;margin-top:4px">Pass mark: 75% (45/60)</div>
    </div>`;
  // By topic
  const topicEl=document.getElementById('sim-res-topic');
  topicEl.innerHTML=Object.entries(breakdown).map(([t,v])=>{
    const p=Math.round((v.c/v.t)*100);
    return`<div class="res-row"><span class="rr-name">${TOPICS[t]?.name||t}</span><span class="rr-count">${v.c}/${v.t}</span>
      <div class="prog-bg" style="flex:1"><div class="prog-fill" style="width:${p}%;background:${p>=75?'var(--easy)':p>=50?'var(--medium)':'var(--hard)'}"></div></div></div>`;
  }).join('');
  // By diff
  const diffEl=document.getElementById('sim-res-diff');
  diffEl.innerHTML=['easy','medium','hard'].map(d=>{
    const v=diffBreakdown[d];if(!v.t)return'';
    const p=Math.round((v.c/v.t)*100);
    return`<div class="res-row"><span class="rr-name" style="text-transform:capitalize">${d}</span><span class="rr-count">${v.c}/${v.t}</span>
      <div class="prog-bg" style="flex:1"><div class="prog-fill" style="width:${p}%;background:${p>=75?'var(--easy)':p>=50?'var(--medium)':'var(--hard)'}"></div></div></div>`;
  }).join('');
  // Review wrong answers
  const revEl=document.getElementById('sim-res-review');
  const wrong=pool.filter((q,i)=>answers[i]!==q.correct);
  if(wrong.length===0){revEl.innerHTML='<div class="empty"><p>Perfect score! Nothing to review.</p></div>';return;}
  revEl.innerHTML=wrong.slice(0,15).map(q=>`
    <div style="padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:13px;font-weight:600;margin-bottom:6px">${q.q}</div>
      <div style="font-size:12px;color:var(--easy)">✓ ${q.opts[q.correct]}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px">${q.explain}</div>
    </div>`).join('')+(wrong.length>15?`<div style="font-size:12px;color:var(--muted);padding:10px 0">...and ${wrong.length-15} more</div>`:'');
}

function retrySimulator(){
  document.getElementById('sim-results').style.display='none';
  document.getElementById('sim-ready').style.display='block';
}

function resetSimulator(){
  clearInterval(simState.timerInterval);
  document.getElementById('sim-results').style.display='none';
  document.getElementById('sim-active').style.display='none';
  document.getElementById('sim-ready').style.display='block';
}

function initSimulator(){
  const el=document.getElementById('sim-pool-count');
  if(el)el.textContent=`${QUESTIONS.length} questions in bank`;
}
