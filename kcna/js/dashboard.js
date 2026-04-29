function renderDashboard() {
  const history = getHistory(); const streak = getStreak();
  document.getElementById('stat-total').textContent = history.length;
  document.getElementById('stat-streak').textContent = streak.count;
  if (history.length === 0) {
    document.getElementById('stat-avg').textContent = '—';
    document.getElementById('stat-best').textContent = '—';
  } else {
    const scores = history.map(h => h.pct);
    document.getElementById('stat-avg').textContent = Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) + '%';
    document.getElementById('stat-best').textContent = Math.max(...scores) + '%';
  }
  renderTrendChart(history); renderTopicBars(history);
  renderDiffBars(history); renderWeakAreas(history); renderHistoryTable(history);
}

function renderTrendChart(history) {
  const canvas = document.getElementById('trendChart');
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;
  canvas.width = wrap.clientWidth || 400; canvas.height = 180;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const recent = history.slice(-10);
  if (recent.length < 2) {
    ctx.fillStyle='#94a3b8'; ctx.font='13px system-ui'; ctx.textAlign='center';
    ctx.fillText('Take at least 2 quizzes to see your trend', canvas.width/2, 90); return;
  }
  const pad={top:20,right:20,bottom:30,left:36};
  const w=canvas.width-pad.left-pad.right, h=canvas.height-pad.top-pad.bottom;
  ctx.strokeStyle='#334155'; ctx.lineWidth=1;
  [0,25,50,75,100].forEach(pct => {
    const y=pad.top+h-(pct/100)*h;
    ctx.beginPath(); ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+w,y); ctx.stroke();
    ctx.fillStyle='#94a3b8'; ctx.font='10px system-ui'; ctx.textAlign='right';
    ctx.fillText(pct+'%', pad.left-4, y+3);
  });
  const pts=recent.map((r,i)=>({x:pad.left+(i/(recent.length-1))*w, y:pad.top+h-(r.pct/100)*h}));
  const grad=ctx.createLinearGradient(0,pad.top,0,pad.top+h);
  grad.addColorStop(0,'rgba(99,102,241,0.3)'); grad.addColorStop(1,'rgba(99,102,241,0)');
  ctx.beginPath(); ctx.moveTo(pts[0].x,pad.top+h);
  pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.lineTo(pts[pts.length-1].x,pad.top+h);
  ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
  ctx.beginPath(); ctx.strokeStyle='#818cf8'; ctx.lineWidth=2.5; ctx.lineJoin='round';
  pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
  pts.forEach((p,i)=>{
    ctx.beginPath(); ctx.arc(p.x,p.y,4,0,Math.PI*2); ctx.fillStyle='#818cf8'; ctx.fill();
    ctx.fillStyle='#f8fafc'; ctx.font='10px system-ui'; ctx.textAlign='center';
    ctx.fillText(recent[i].pct+'%',p.x,p.y-9);
  });
}

function getTopicStats(history) {
  const stats={};
  Object.keys(TOPICS).forEach(t=>stats[t]={correct:0,total:0});
  history.forEach(h=>{
    if(!h.breakdown) return;
    Object.entries(h.breakdown).forEach(([topic,d])=>{
      if(!stats[topic]) stats[topic]={correct:0,total:0};
      stats[topic].correct+=d.correct; stats[topic].total+=d.total;
    });
  }); return stats;
}

function getDiffStats(history) {
  const stats={easy:{correct:0,total:0},medium:{correct:0,total:0},hard:{correct:0,total:0}};
  history.forEach(h=>{
    if(!h.diffBreakdown) return;
    ['easy','medium','hard'].forEach(d=>{
      stats[d].correct+=(h.diffBreakdown[d]?.correct||0);
      stats[d].total+=(h.diffBreakdown[d]?.total||0);
    });
  }); return stats;
}

function renderTopicBars(history) {
  const el=document.getElementById('topic-bars'); const stats=getTopicStats(history);
  const rows=Object.entries(TOPICS).map(([id,t])=>{
    const s=stats[id]||{correct:0,total:0};
    const pct=s.total>0?Math.round((s.correct/s.total)*100):null;
    return {id,name:t.name,color:t.color,pct,total:s.total};
  }).filter(r=>r.total>0);
  if(rows.length===0){el.innerHTML='<div class="empty"><p style="font-size:13px">No data yet — take a quiz!</p></div>';return;}
  el.innerHTML=rows.map(r=>`<div class="topic-bar-row">
    <div class="topic-bar-name">${r.name}</div>
    <div style="flex:1"><div class="prog-bg"><div class="prog-fill" style="width:${r.pct}%;background:${r.color}"></div></div></div>
    <div class="topic-bar-score" style="color:${r.pct>=70?'var(--easy)':r.pct>=50?'var(--medium)':'var(--hard)'}">${r.pct}%</div>
  </div>`).join('');
}

function renderDiffBars(history) {
  const el=document.getElementById('diff-bars'); const stats=getDiffStats(history);
  const diffs=[{key:'easy',label:'Easy',color:'var(--easy)'},{key:'medium',label:'Medium',color:'var(--medium)'},{key:'hard',label:'Hard',color:'var(--hard)'}];
  const rows=diffs.filter(d=>stats[d.key].total>0).map(d=>{
    const s=stats[d.key]; const pct=Math.round((s.correct/s.total)*100);
    return {...d,pct,correct:s.correct,total:s.total};
  });
  if(rows.length===0){el.innerHTML='<div class="empty"><p style="font-size:13px">No data yet — take a quiz!</p></div>';return;}
  el.innerHTML=rows.map(r=>`<div class="topic-bar-row">
    <div class="topic-bar-name">${r.label} <span class="text-muted text-sm">(${r.correct}/${r.total})</span></div>
    <div style="flex:1"><div class="prog-bg"><div class="prog-fill" style="width:${r.pct}%;background:${r.color}"></div></div></div>
    <div class="topic-bar-score" style="color:${r.color}">${r.pct}%</div>
  </div>`).join('');
}

function renderWeakAreas(history) {
  const el=document.getElementById('weak-areas'); const stats=getTopicStats(history);
  const weak=Object.entries(TOPICS).map(([id,t])=>{
    const s=stats[id]||{correct:0,total:0}; if(s.total===0)return null;
    return {id,name:t.name,pct:Math.round((s.correct/s.total)*100)};
  }).filter(Boolean).sort((a,b)=>a.pct-b.pct).slice(0,4);
  if(weak.length===0){el.innerHTML='<div class="empty"><div class="empty-icon">🎯</div><p>Take a quiz to see your weak areas</p></div>';return;}
  el.innerHTML=weak.map(w=>`<div class="weak-item">
    <div>
      <div style="font-size:13px;font-weight:600">${w.name}</div>
      <div class="text-muted text-sm">${w.pct<50?'Needs significant work':w.pct<70?'Needs more practice':'Getting there'}</div>
    </div>
    <div style="font-size:14px;font-weight:700;color:${w.pct<50?'var(--hard)':w.pct<70?'var(--medium)':'var(--easy)'}">${w.pct}%</div>
  </div>`).join('');
}

function renderHistoryTable(history) {
  const el=document.getElementById('quiz-history');
  if(history.length===0){el.innerHTML='<div class="empty"><div class="empty-icon">📝</div><p>No quizzes taken yet</p></div>';return;}
  const recent=[...history].reverse().slice(0,10);
  const color=p=>p>=80?'var(--easy)':p>=60?'var(--medium)':'var(--hard)';
  const bg=p=>p>=80?'rgba(34,197,94,0.1)':p>=60?'rgba(245,158,11,0.1)':'rgba(239,68,68,0.1)';
  el.innerHTML=`<table class="hist-table">
    <thead><tr><th>Date</th><th>Topic</th><th>Difficulty</th><th>Score</th><th>Time</th></tr></thead>
    <tbody>${recent.map(h=>`<tr>
      <td class="text-muted">${new Date(h.date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</td>
      <td>${h.topicLabel}</td>
      <td><span class="badge badge-${h.difficulty}">${h.difficulty}</span></td>
      <td><span class="score-pill" style="background:${bg(h.pct)};color:${color(h.pct)}">${h.score}/${h.total} — ${h.pct}%</span></td>
      <td class="text-muted">${h.time||'—'}</td>
    </tr>`).join('')}</tbody></table>`;
}
