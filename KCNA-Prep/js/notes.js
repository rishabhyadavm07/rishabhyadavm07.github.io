function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function renderNotes(filter){
  const container=document.getElementById('notes-container');
  const query=(filter||'').toLowerCase();
  container.innerHTML=NOTES.map(topic=>{
    const matchesTopic=!query||topic.title.toLowerCase().includes(query)||topic.overview.toLowerCase().includes(query)||
      topic.sections.some(s=>s.title.toLowerCase().includes(query)||(s.items||[]).some(item=>item.text.toLowerCase().includes(query)));
    if(!matchesTopic)return '';
    const color=TOPICS[topic.id]?.color||'#6366f1';
    const sectionsHtml=topic.sections.map(s=>renderSection(s)).join('');
    const qrHtml=topic.quickReview.map(r=>`<div class="qr-item">${r}</div>`).join('');
    const topicDiags=DIAGRAMS[topic.id];
    const diagHtml=topicDiags?`<div class="ns"><div class="ns-title">-- Architecture Diagrams --</div>${topicDiags.map(d=>`<div class="note-diagram"><span class="dg-label">${d.label}</span><pre>${escHtml(d.ascii)}</pre></div>`).join('')}</div>`:'';
    return `<div class="topic-acc">
      <div class="acc-hdr" onclick="toggleAcc(this)">
        <div class="hdr-left"><div class="t-dot" style="background:${color}"></div><div class="t-title">${topic.title}</div></div>
        <div class="acc-chevron">▼</div>
      </div>
      <div class="acc-body">
        <div class="ns"><p style="font-size:13px;color:var(--muted);line-height:1.65">${topic.overview}</p></div>
        ${sectionsHtml}
        ${diagHtml}
        <div class="qr-box"><h4>📋 Quick Review — Exam Essentials</h4>${qrHtml}</div>
      </div>
    </div>`;
  }).join('');
}

function renderSection(s){
  let html=`<div class="ns"><div class="ns-title">${s.title}</div>`;
  if(s.items)html+=s.items.map(item=>{
    switch(item.type){
      case 'critical':return`<div class="note-critical"><span>🔴</span><span>${item.text}</span></div>`;
      case 'tip':return`<div class="note-tip"><span>📝</span><span>${item.text}</span></div>`;
      case 'trap':return`<div class="note-trap"><span>⚠️</span><span>${item.text}</span></div>`;
      case 'insight':return`<div class="note-insight"><span>💡</span><span>${item.text}</span></div>`;
      default:return`<div class="ni">${item.text}</div>`;
    }
  }).join('');
  if(s.table)html+=`<table class="nt"><thead><tr>${s.table.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${s.table.rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return html+'</div>';
}

function toggleAcc(hdr){const body=hdr.nextElementSibling;const open=body.classList.toggle('open');hdr.classList.toggle('open',open);}

function searchNotes(){
  const q=document.getElementById('notes-search').value;
  renderNotes(q);
  if(q){document.querySelectorAll('.acc-hdr').forEach(hdr=>{
    const body=hdr.nextElementSibling;
    if(body&&body.textContent.toLowerCase().includes(q.toLowerCase())){body.classList.add('open');hdr.classList.add('open');}
  });}
}
