function renderCheatSheet(){
  const c=document.getElementById('cheatsheet-container');
  if(!c)return;
  c.innerHTML=CHEAT_SHEET.map(section=>`
    <div class="cs-section">
      <div class="cs-section-title">${section.title}</div>
      <div class="cs-grid">
        ${section.cards.map(card=>renderCSCard(card)).join('')}
      </div>
    </div>
  `).join('');
}

function renderCSCard(card){
  let body='';
  if(card.type==='number'){
    body=`<span class="cs-num">${card.number}</span><div style="font-size:13px;color:var(--muted);white-space:pre-line">${card.detail}</div>`;
  } else if(card.type==='definition'){
    body=`<div style="font-size:14px;font-weight:700;color:var(--accent-light);margin-bottom:6px">${card.term}</div><div style="font-size:13px;color:var(--muted)">${card.detail}</div>`;
  } else if(card.type==='timeline'){
    body=card.rows.map(r=>`<div class="cs-row"><span class="cs-row-key">${r[0]}</span><span class="cs-row-val">${r[1]}</span></div>`).join('');
  } else if(card.type==='list'){
    body=card.items.map(i=>`<div style="font-size:12px;color:var(--muted);padding:3px 0;border-bottom:1px solid var(--border)">${i}</div>`).join('');
  } else if(card.type==='tags'){
    body=card.tags.map(t=>`<span class="cs-tag" style="background:${t.color}22;color:${t.color};border:1px solid ${t.color}44">${t.label}</span>`).join('');
  } else if(card.type==='compare'){
    body=`<table class="cs-compare"><thead><tr>${card.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${card.rows.map(r=>`<tr>${r.map((c,i)=>`<td style="${i===0?'color:var(--muted);font-size:11px':''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  } else if(card.type==='code'){
    const items=card.lines.map(l=>`<div style="margin-bottom:10px"><code style="display:block;font-size:11px;padding:5px 8px;background:var(--bg);border-radius:5px 5px ${l.output?'0 0':'5px 5px'};color:var(--easy);border:1px solid var(--border);word-break:break-all;font-family:'Courier New',monospace">${l.cmd}</code>${l.output?`<pre style="margin:0;font-size:10px;padding:5px 8px;background:#0a0f1c;border:1px solid var(--border);border-top:none;border-radius:0 0 5px 5px;color:var(--muted);overflow-x:auto;white-space:pre;font-family:'Courier New',monospace;line-height:1.5">${l.output}</pre>`:''}<div style="font-size:11px;color:var(--muted);margin-top:3px;padding-left:2px">${l.note}</div></div>`).join('');
    body=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:0 20px">${items}</div>`;
  }
  return`<div class="cs-card" style="${card.type==='code'?'grid-column:1/-1':''}"><div class="cs-card-title">${card.title}</div><div class="cs-card-body">${body}</div></div>`;
}
