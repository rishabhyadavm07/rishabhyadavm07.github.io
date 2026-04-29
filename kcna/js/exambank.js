let EXAMBANK_DATA=null;
let qzExam=null;
let qzQuestions=[];
let qzIndex=0;
let qzAnswers=[];
let qzSubmitted=[];
let qzTimer=null;
let qzStartTime=0;
let qzFilter='all';
let qzLastExamCode=null;

const QZ_TYPE_CLASS={STUDY:'etb-study',PREP:'etb-prep',MOCK:'etb-mock'};
const QZ_TYPE_LABEL={STUDY:'Study',PREP:'Prep',MOCK:'Mock'};

function qzFmtDuration(s){const m=Math.floor(s/60);return s%60===0?`${m} min`:`${m}m ${s%60}s`;}

async function loadExamBankData(){
  const el=document.getElementById('exambank-cards');
  el.innerHTML='<div class="empty" style="grid-column:1/-1"><div class="empty-icon">⏳</div><p>Loading exams…</p></div>';
  try{
    const res=await fetch('./quiz/kcna_all_questions.json');
    if(!res.ok)throw new Error('HTTP '+res.status);
    EXAMBANK_DATA=await res.json();
    renderExamBankExams(qzFilter);
  }catch(e){
    el.innerHTML=`<div class="empty" style="grid-column:1/-1">
      <div class="empty-icon">⚠️</div>
      <p style="font-size:12px;margin-bottom:8px">Could not load quiz data.</p>
      <p style="font-size:11px;color:var(--muted)">Open this file via a local server (e.g. <code>npx serve .</code>) or use Chrome which permits local file fetching.</p>
    </div>`;
  }
}

function renderExamBankExams(filter){
  qzFilter=filter;
  document.querySelectorAll('.qz-tab').forEach(t=>{
    const tf=t.textContent.trim().toUpperCase();
    t.classList.toggle('active',filter==='all'?tf==='ALL':tf===filter);
  });
  if(!EXAMBANK_DATA){loadExamBankData();return;}
  let exams=EXAMBANK_DATA.exams;
  if(filter!=='all')exams=exams.filter(e=>e.exam_type===filter);
  const counts={STUDY:0,PREP:0,MOCK:0};
  EXAMBANK_DATA.exams.forEach(e=>counts[e.exam_type]=(counts[e.exam_type]||0)+1);
  // Update tab counts
  document.querySelectorAll('.qz-tab').forEach(t=>{
    const tf=t.textContent.trim().split(' ')[0].toUpperCase();
    if(tf==='ALL')t.textContent=`All (${EXAMBANK_DATA.exams.length})`;
    else if(counts[tf]!==undefined)t.textContent=`${QZ_TYPE_LABEL[tf]||tf} (${counts[tf]})`;
  });
  document.getElementById('exambank-cards').innerHTML=exams.map(e=>{
    const tc=QZ_TYPE_CLASS[e.exam_type]||'etb-study';
    const totalQs=e.questions.length;
    const multiQs=e.questions.filter(q=>q.type==='MULTIPLE_CHOICE').length;
    const essayQs=e.questions.filter(q=>q.type==='ESSAY').length;
    return `<div class="exam-card">
      <div class="exam-card-hdr">
        <div class="exam-card-title">${e.exam_title}</div>
        <span class="exam-type-badge ${tc}">${e.exam_type}</span>
      </div>
      <div class="exam-card-code">${e.exam_code}</div>
      <div class="exam-card-meta">
        <div class="exam-meta-item"><div class="exam-meta-label">Questions</div><div class="exam-meta-val">${totalQs}</div></div>
        <div class="exam-meta-item"><div class="exam-meta-label">Duration</div><div class="exam-meta-val">${qzFmtDuration(e.duration_seconds)}</div></div>
        <div class="exam-meta-item"><div class="exam-meta-label">Pass At</div><div class="exam-meta-val" style="color:var(--easy)">${e.passing_score}%</div></div>
        ${multiQs>0?`<div class="exam-meta-item"><div class="exam-meta-label">Multi-select</div><div class="exam-meta-val" style="color:var(--cyan)">${multiQs}q</div></div>`:''}
        ${essayQs>0?`<div class="exam-meta-item"><div class="exam-meta-label">Essay</div><div class="exam-meta-val" style="color:var(--muted)">${essayQs}q</div></div>`:''}
      </div>
      <button class="btn btn-primary btn-sm" onclick="startExamBankExam('${e.exam_code}')">▶ Start</button>
    </div>`;
  }).join('');
}

function startExamBankExam(examCode){
  if(!EXAMBANK_DATA)return;
  qzExam=EXAMBANK_DATA.exams.find(e=>e.exam_code===examCode);
  if(!qzExam){showToast('Exam not found');return;}
  qzLastExamCode=examCode;
  // Load ALL questions from the exam — essay questions are shown as read-only cards
  qzQuestions=[...qzExam.questions];
  qzIndex=0;
  qzAnswers=qzQuestions.map(()=>[]);
  qzSubmitted=new Array(qzQuestions.length).fill(false);
  qzStartTime=Date.now();
  clearInterval(qzTimer);
  const timerEl=document.getElementById('qz-timer');
  const maxSec=qzExam.duration_seconds;
  qzTimer=setInterval(()=>{
    const elapsed=Math.floor((Date.now()-qzStartTime)/1000);
    const rem=maxSec-elapsed;
    if(rem<=0){clearInterval(qzTimer);finishExamBankExam();return;}
    const m=Math.floor(rem/60),s=rem%60;
    timerEl.textContent=`⏱ ${m}:${s.toString().padStart(2,'0')}`;
    timerEl.style.color=rem<=60?'var(--hard)':'var(--muted)';
  },1000);
  document.getElementById('exambank-browser').style.display='none';
  document.getElementById('exambank-results').style.display='none';
  document.getElementById('exambank-active').style.display='block';
  document.getElementById('qz-exam-title').textContent=qzExam.exam_title;
  document.getElementById('qz-total').textContent=qzQuestions.length;
  renderExamBankQuestion();
}

function qzGetCorrectIndices(q){
  const opts=q.options||[];
  const ans=q.correct_answer;
  if(!ans)return [];
  if(Array.isArray(ans))return ans.map(a=>opts.indexOf(a)).filter(i=>i>=0);
  const idx=opts.indexOf(ans);
  return idx>=0?[idx]:[];
}

function renderExamBankQuestion(){
  const q=qzQuestions[qzIndex];
  const isEssay=q.type==='ESSAY';
  const isMulti=q.type==='MULTIPLE_CHOICE';
  const submitted=qzSubmitted[qzIndex];
  const selected=qzAnswers[qzIndex]||[];
  const correct=qzGetCorrectIndices(q);
  const letters=['A','B','C','D','E','F'];

  document.getElementById('qz-num').textContent=qzIndex+1;
  document.getElementById('qz-progress').style.width=((qzIndex/qzQuestions.length)*100)+'%';
  const hint=document.getElementById('qz-type-hint');
  if(isEssay){
    hint.textContent='Essay — Read & Continue';
    hint.className='qz-type-hint qz-type-single';
    hint.style.opacity='0.5';
  } else {
    hint.textContent=isMulti?'Multiple Choice — select all that apply':'Single Choice';
    hint.className='qz-type-hint '+(isMulti?'qz-type-multi':'qz-type-single');
    hint.style.opacity='1';
  }
  document.getElementById('qz-question').textContent=q.question;
  const explainEl=document.getElementById('qz-explain');
  explainEl.textContent=q.explanation||'';
  explainEl.classList.remove('show');

  const submitBtn=document.getElementById('qz-submit-btn');
  const nextBtn=document.getElementById('qz-next-btn');
  nextBtn.textContent=qzIndex===qzQuestions.length-1?'Finish ✓':'Next →';

  if(isEssay){
    // Essay: no options, explanation always visible, next always enabled
    submitBtn.style.display='none';
    nextBtn.disabled=false;
    qzSubmitted[qzIndex]=true; // auto-mark as "answered" so it doesn't block navigation
    document.getElementById('qz-options').innerHTML=
      `<div style="background:rgba(152,245,255,0.04);border:1px solid rgba(152,245,255,0.12);border-left:2px solid var(--cyan);border-radius:var(--radius);padding:12px 14px;font-size:11px;color:var(--muted);line-height:1.75">
        ${q.explanation||'<em>No explanation provided.</em>'}
      </div>`;
    explainEl.style.display='none'; // explanation shown inline above
    return;
  }

  explainEl.style.display='';
  if(submitted) explainEl.classList.add('show');
  submitBtn.style.display=(isMulti&&!submitted)?'inline-flex':'none';
  nextBtn.disabled=!submitted;

  const opts=q.options||[];
  if(isMulti){
    document.getElementById('qz-options').innerHTML=`<div class="multi-check">${
      opts.map((opt,i)=>{
        let cls='opt-check';
        if(submitted){
          const isCor=correct.includes(i),isSel=selected.includes(i);
          if(isCor&&isSel)cls+=' correct';
          else if(isSel&&!isCor)cls+=' wrong';
          else if(isCor&&!isSel)cls+=' missed';
        } else if(selected.includes(i)) cls+=' checked';
        const checkMark=submitted
          ?(correct.includes(i)?(selected.includes(i)?'✓':'○'):(selected.includes(i)?'✗':''))
          :(selected.includes(i)?'✓':'');
        const clickHandler=submitted?'':` onclick="toggleExamBankAnswer(${i})"`;
        return `<div class="${cls}"${clickHandler}>
          <div class="check-box">${checkMark}</div>
          <div>${letters[i]}. ${opt}</div>
        </div>`;
      }).join('')
    }</div>`;
  } else {
    document.getElementById('qz-options').innerHTML=`<div class="options">${
      opts.map((opt,i)=>{
        let cls='opt';
        if(submitted){
          if(correct.includes(i))cls+=' correct';
          else if(selected.includes(i))cls+=' wrong';
        } else if(selected.includes(i)) cls+=' selected';
        const clickHandler=submitted?'':` onclick="selectExamBankAnswer(${i})"`;
        return `<div class="${cls}"${clickHandler}>
          <div class="opt-letter">${letters[i]}</div><div>${opt}</div>
        </div>`;
      }).join('')
    }</div>`;
  }
}

function selectExamBankAnswer(i){
  if(qzSubmitted[qzIndex])return;
  qzAnswers[qzIndex]=[i];
  qzSubmitted[qzIndex]=true;
  renderExamBankQuestion();
}

function toggleExamBankAnswer(i){
  if(qzSubmitted[qzIndex])return;
  const arr=qzAnswers[qzIndex];
  const idx=arr.indexOf(i);
  if(idx>=0)arr.splice(idx,1);else arr.push(i);
  renderExamBankQuestion();
}

function submitExamBankAnswer(){
  if(qzSubmitted[qzIndex])return;
  if(!qzAnswers[qzIndex].length){showToast('Select at least one option first');return;}
  qzSubmitted[qzIndex]=true;
  renderExamBankQuestion();
}

function nextExamBankQuestion(){
  if(!qzSubmitted[qzIndex]){showToast('Please answer before continuing');return;}
  qzIndex++;
  if(qzIndex>=qzQuestions.length){finishExamBankExam();return;}
  renderExamBankQuestion();
}

function endExamBankEarly(){
  if(!confirm('End exam early? Unanswered questions count as wrong.'))return;
  finishExamBankExam();
}

function finishExamBankExam(){
  clearInterval(qzTimer);
  const elapsed=Math.floor((Date.now()-qzStartTime)/1000);
  const timeStr=`${Math.floor(elapsed/60)}:${(elapsed%60).toString().padStart(2,'0')}`;
  let score=0;const wrongQs=[];
  const letters=['A','B','C','D','E','F'];
  // Only score answerable questions (SINGLE_CHOICE and MULTIPLE_CHOICE)
  const scorableQs=qzQuestions.filter(q=>q.type!=='ESSAY');
  qzQuestions.forEach((q,i)=>{
    if(q.type==='ESSAY')return; // essays are read-only, not scored
    const correct=qzGetCorrectIndices(q);
    const selected=qzAnswers[i]||[];
    const isCorrect=correct.length>0&&correct.length===selected.length&&correct.every(c=>selected.includes(c));
    if(isCorrect)score++;
    else wrongQs.push({q,selected,correct});
  });
  const total=scorableQs.length;
  const pct=total>0?Math.round((score/total)*100):0;
  const passing=qzExam.passing_score||70;
  const passed=pct>=passing;

  document.getElementById('exambank-active').style.display='none';
  document.getElementById('exambank-results').style.display='block';

  const scoreColor=passed?'var(--easy)':pct>=(passing-15)?'var(--medium)':'var(--hard)';
  document.getElementById('qz-res-score').textContent=pct+'%';
  document.getElementById('qz-res-score').style.color=scoreColor;
  const essayCount=qzQuestions.length-total;
  const essayNote=essayCount>0?` · ${essayCount} essay (unscored)`:'';
  document.getElementById('qz-res-label').textContent=`${score} / ${total} correct · ${timeStr} · pass mark ${passing}%${essayNote}`;

  const banner=document.getElementById('qz-pass-banner');
  if(passed){
    banner.className='pass-banner';
    banner.innerHTML=`<div style="font-size:20px;font-weight:800;color:var(--easy)">✓ PASSED</div><div style="color:var(--muted);font-size:11px;margin-top:4px">${qzExam.exam_title}</div>`;
  }else{
    banner.className='fail-banner';
    banner.innerHTML=`<div style="font-size:20px;font-weight:800;color:var(--accent-light)">✗ FAILED</div><div style="color:var(--muted);font-size:11px;margin-top:4px">${qzExam.exam_title} — required ${passing}%</div>`;
  }

  document.getElementById('qz-res-review').innerHTML=wrongQs.length===0
    ?'<p style="color:var(--easy);font-size:13px">🎉 Perfect score — nothing to review!</p>'
    :wrongQs.map(({q,selected,correct})=>`
      <div style="margin-bottom:18px;padding-bottom:18px;border-bottom:1px solid var(--border)">
        <div style="font-size:13px;font-weight:600;margin-bottom:8px;line-height:1.6">${q.question}</div>
        ${selected.length
          ?`<div style="font-size:12px;color:var(--hard);margin-bottom:4px">✗ Your: ${selected.map(i=>letters[i]+'. '+((q.options||[])[i]||'')).join(' / ')}</div>`
          :'<div style="font-size:12px;color:var(--hard);margin-bottom:4px">✗ Not answered</div>'}
        <div style="font-size:12px;color:var(--easy);margin-bottom:6px">✓ Correct: ${correct.map(i=>letters[i]+'. '+((q.options||[])[i]||'')).join(' / ')}</div>
        ${q.explanation?`<div style="font-size:12px;color:var(--muted);font-style:italic;line-height:1.65">${q.explanation}</div>`:''}
      </div>`).join('');
}

function backToExamBankExams(){
  clearInterval(qzTimer);
  document.getElementById('exambank-results').style.display='none';
  document.getElementById('exambank-active').style.display='none';
  document.getElementById('exambank-browser').style.display='block';
}

function retryExamBankExam(){if(qzLastExamCode)startExamBankExam(qzLastExamCode);}
