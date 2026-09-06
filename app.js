const AUTO = [
  {id:"a1", person:"boy", date:"2026-09-06", type:"in", amount:500000, note:"Transfer masuk"},
  {id:"a2", person:"boy", date:"2026-09-07", type:"out", amount:100000, note:"Belanja"},
  {id:"a3", person:"boy", date:"2026-09-09", type:"in", amount:750000, note:"Transfer tambahan"},
  {id:"a4", person:"boy", date:"2026-09-12", type:"out", amount:250000, note:"Bayar tagihan"},
  {id:"a5", person:"girl", date:"2026-09-06", type:"in", amount:300000, note:"Setor tabungan"},
  {id:"a6", person:"girl", date:"2026-09-08", type:"out", amount:50000, note:"Kebutuhan"},
  {id:"a7", person:"girl", date:"2026-09-10", type:"in", amount:450000, note:"Transfer masuk"},
  {id:"a8", person:"girl", date:"2026-09-11", type:"out", amount:200000, note:"Makan di luar"},
];

const DEFAULT_MANUAL = [
  {id:"m1", person:"boy", date:"2026-09-06", type:"in", amount:500000, note:"Transfer masuk"},
  {id:"m2", person:"boy", date:"2026-09-07", type:"out", amount:150000, note:"Belanja"},
  {id:"m3", person:"boy", date:"2026-09-09", type:"in", amount:750000, note:"Transfer tambahan"},
  {id:"m4", person:"girl", date:"2026-09-06", type:"in", amount:300000, note:"Setor tabungan"},
  {id:"m5", person:"girl", date:"2026-09-08", type:"out", amount:50000, note:"Kebutuhan"},
  {id:"m6", person:"girl", date:"2026-09-10", type:"in", amount:450000, note:"Transfer masuk"},
  {id:"m7", person:"girl", date:"2026-09-11", type:"out", amount:200000, note:"Makan di luar"},
];

let manual = JSON.parse(localStorage.getItem("tb_manual") || "null") || DEFAULT_MANUAL;
let names = JSON.parse(localStorage.getItem("tb_names") || "null") || {boy:"Pihak Cowok", girl:"Pihak Cewek"};

const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const shortDate = d => new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short"}).format(new Date(d+"T00:00:00"));

function balance(rows, person=null){
  return rows
    .filter(x=>!person || x.person===person)
    .reduce((s,x)=>s + (x.type==="in" ? x.amount : -x.amount),0);
}
function totalIn(rows, person=null){
  return rows.filter(x=>(!person||x.person===person)&&x.type==="in").reduce((s,x)=>s+x.amount,0);
}
function totalOut(rows, person=null){
  return rows.filter(x=>(!person||x.person===person)&&x.type==="out").reduce((s,x)=>s+x.amount,0);
}

function typeBadge(type){
  return `<span class="badge ${type}">${type==="in"?"Masuk":"Keluar"}</span>`;
}
function sourceBadge(source){
  return `<span class="badge ${source}">${source==="auto"?"Otomatis":"Manual"}</span>`;
}
function rowHTML(x, source="auto", actions=false){
  return `<tr>
    <td>${shortDate(x.date)}</td>
    <td>${typeBadge(x.type)}</td>
    <td>${rupiah(x.amount)}</td>
    <td>${x.note}</td>
    <td>${sourceBadge(source)}</td>
    ${actions?`<td><button class="action-btn" data-edit="${x.id}">Edit</button><button class="action-btn delete" data-delete="${x.id}">Hapus</button></td>`:""}
  </tr>`;
}

function setText(id,val){ const el=document.getElementById(id); if(el) el.textContent=val; }

function renderHome(){
  const autoTotal = balance(AUTO);
  const autoIn = totalIn(AUTO);
  const autoOut = totalOut(AUTO);

  setText("home-total",rupiah(autoTotal));
  setText("home-in",rupiah(autoIn));
  setText("home-out",rupiah(autoOut));
  setText("home-saving",rupiah(autoTotal));

  ["boy","girl"].forEach(p=>{
    setText(`${p}-in`,rupiah(totalIn(AUTO,p)));
    setText(`${p}-out`,rupiah(totalOut(AUTO,p)));
    setText(`${p}-saving`,rupiah(balance(AUTO,p)));
    document.getElementById(`${p}-auto-table`).innerHTML = AUTO.filter(x=>x.person===p).map(x=>rowHTML(x)).join("");
  });

  const bA=balance(AUTO,"boy"), gA=balance(AUTO,"girl");
  const bM=balance(manual,"boy"), gM=balance(manual,"girl");
  const tA=bA+gA, tM=bM+gM;

  setText("boy-auto-balance",rupiah(bA));
  setText("boy-manual-balance",rupiah(bM));
  setText("girl-auto-balance",rupiah(gA));
  setText("girl-manual-balance",rupiah(gM));
  setText("total-auto-balance",rupiah(tA));
  setText("total-manual-balance",rupiah(tM));

  applyDiff("boy", bM-bA);
  applyDiff("girl", gM-gA);
  setText("total-diff",rupiah(tM-tA));

  const base=Math.max(1, Math.abs(bM)+Math.abs(gM));
  const bp=Math.round(Math.abs(bM)/base*100);
  const gp=100-bp;
  setText("boy-percent",bp+"%");
  setText("girl-percent",gp+"%");
  document.getElementById("boy-bar").style.width=bp+"%";
  document.getElementById("girl-bar").style.width=gp+"%";
}

function applyDiff(prefix,diff){
  setText(prefix+"-diff",rupiah(diff));
  const st=document.getElementById(prefix+"-status");
  const ok=diff===0;
  st.textContent=ok?"✓ Sesuai":"! Berbeda";
  st.style.background=ok?"var(--green-soft)":"var(--red-soft)";
  st.style.color=ok?"#4f9b78":"#d34f5c";
}

function renderManual(){
  document.getElementById("boy-manual-table").innerHTML = manual.filter(x=>x.person==="boy").map(x=>rowHTML(x,"manual",true)).join("") || `<tr><td colspan="6">Belum ada transaksi manual.</td></tr>`;
  document.getElementById("girl-manual-table").innerHTML = manual.filter(x=>x.person==="girl").map(x=>rowHTML(x,"manual",true)).join("") || `<tr><td colspan="6">Belum ada transaksi manual.</td></tr>`;

  const sum=document.getElementById("manual-summary");
  sum.innerHTML = `
    <div class="stat-box"><span>Total Catatan Manual</span><strong>${manual.length}</strong></div>
    <div class="stat-box"><span>Masuk Manual</span><strong>${rupiah(totalIn(manual))}</strong></div>
    <div class="stat-box"><span>Keluar Manual</span><strong>${rupiah(totalOut(manual))}</strong></div>
    <div class="stat-box"><span>Sisa Manual</span><strong>${rupiah(balance(manual))}</strong></div>
  `;
}

function keyOf(x){ return `${x.date}|${x.person}|${x.type}`; }

function mismatches(){
  const keys=[...new Set([...AUTO.map(keyOf),...manual.map(keyOf)])];
  return keys.map(k=>{
    const [date,person,type]=k.split("|");
    const a=AUTO.filter(x=>keyOf(x)===k).reduce((s,x)=>s+x.amount,0);
    const m=manual.filter(x=>keyOf(x)===k).reduce((s,x)=>s+x.amount,0);
    const note=(manual.find(x=>keyOf(x)===k)||AUTO.find(x=>keyOf(x)===k)||{}).note||"-";
    return {date,person,type,auto:a,manual:m,diff:m-a,note};
  });
}

function renderMatch(){
  const items=mismatches();
  const bad=items.filter(x=>x.diff!==0);
  const good=items.filter(x=>x.diff===0);

  document.getElementById("match-summary").innerHTML=`
    <div class="stat-box"><span>Total Data Cocok</span><strong>${good.length}</strong></div>
    <div class="stat-box"><span>Perlu Dicek</span><strong style="color:var(--red)">${bad.length}</strong></div>
    <div class="stat-box"><span>Selisih Nominal</span><strong>${rupiah(bad.reduce((s,x)=>s+Math.abs(x.diff),0))}</strong></div>
    <div class="stat-box"><span>Status Balance</span><strong>${bad.length?"Perlu Dicek":"Sudah Cocok"}</strong></div>
  `;

  const cards = [
    ["match-boy-card","👦🏻 Pihak Cowok","boy"],
    ["match-girl-card","👧🏻 Pihak Cewek","girl"],
  ];
  cards.forEach(([id,title,p])=>{
    const a=balance(AUTO,p), m=balance(manual,p), d=m-a;
    document.getElementById(id).innerHTML=`
      <h4>${title}</h4>
      <p>Saldo Otomatis <strong>${rupiah(a)}</strong></p>
      <p>Saldo Manual <strong>${rupiah(m)}</strong></p>
      <p class="difference-row">Selisih <strong>${rupiah(d)}</strong></p>
      <span class="status-pill" style="background:${d===0?"var(--green-soft)":"var(--red-soft)"};color:${d===0?"#4f9b78":"#d34f5c"}">${d===0?"✓ Sudah Sesuai":"! Perlu Dicek"}</span>
    `;
  });

  const ta=balance(AUTO), tm=balance(manual), td=tm-ta;
  const bm=balance(manual,"boy"), gm=balance(manual,"girl");
  const denom=Math.max(1,Math.abs(bm)+Math.abs(gm));
  const bp=Math.round(Math.abs(bm)/denom*100), gp=100-bp;

  document.getElementById("match-total-card").innerHTML=`
    <h4>♡ Total Bersama</h4>
    <p>Saldo Otomatis <strong>${rupiah(ta)}</strong></p>
    <p>Saldo Manual <strong>${rupiah(tm)}</strong></p>
    <p class="difference-row">Selisih <strong>${rupiah(td)}</strong></p>
    <div class="contrib">
      <div class="contrib-label"><span>💙 Sumbangsih Cowok</span><strong>${bp}%</strong></div>
      <div class="bar"><i style="width:${bp}%"></i></div>
      <div class="contrib-label"><span>🩷 Sumbangsih Cewek</span><strong>${gp}%</strong></div>
      <div class="bar pinkbar"><i style="width:${gp}%"></i></div>
    </div>
  `;

  document.getElementById("mismatch-table").innerHTML = bad.map(x=>`
    <tr class="mismatch-row">
      <td>${shortDate(x.date)}</td>
      <td>${x.person==="boy"?"Cowok":"Cewek"}</td>
      <td>${typeBadge(x.type)}</td>
      <td>${rupiah(x.auto)}</td>
      <td>${rupiah(x.manual)}</td>
      <td style="color:var(--red);font-weight:800">${rupiah(x.diff)}</td>
      <td>${x.note}</td>
      <td><span class="badge bad">Perlu Dicek</span></td>
    </tr>
  `).join("") || `<tr><td colspan="8"><span class="badge good">Semua data sudah cocok ✓</span></td></tr>`;
}

function renderReport(){
  const a=balance(AUTO), m=balance(manual);
  setText("report-auto",rupiah(a));
  setText("report-manual",rupiah(m));
  setText("report-diff",rupiah(m-a));
}

function renderAll(){
  renderHome();
  renderManual();
  renderMatch();
  renderReport();
  document.getElementById("boy-name").value=names.boy;
  document.getElementById("girl-name").value=names.girl;
}

function navigate(page){
  document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));
  document.getElementById("page-"+page).classList.add("active");
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

document.getElementById("nav").addEventListener("click",e=>{
  const btn=e.target.closest("[data-page]");
  if(btn) navigate(btn.dataset.page);
});
document.addEventListener("click",e=>{
  const go=e.target.closest("[data-go]");
  if(go) navigate(go.dataset.go);
});

const modal=document.getElementById("manual-modal");
document.getElementById("open-add-modal").addEventListener("click",()=>{
  document.getElementById("manual-form").reset();
  document.getElementById("edit-id").value="";
  document.getElementById("modal-title").textContent="Catat Manual";
  document.getElementById("manual-date").value=new Date().toISOString().slice(0,10);
  modal.showModal();
});

document.getElementById("manual-form").addEventListener("submit",e=>{
  e.preventDefault();
  const editId=document.getElementById("edit-id").value;
  const item={
    id:editId||("m"+Date.now()),
    person:document.getElementById("manual-person").value,
    date:document.getElementById("manual-date").value,
    type:document.getElementById("manual-type").value,
    amount:Number(document.getElementById("manual-amount").value),
    note:document.getElementById("manual-note").value.trim()
  };
  if(editId) manual=manual.map(x=>x.id===editId?item:x);
  else manual.push(item);
  localStorage.setItem("tb_manual",JSON.stringify(manual));
  modal.close();
  renderAll();
});

document.addEventListener("click",e=>{
  const edit=e.target.closest("[data-edit]");
  const del=e.target.closest("[data-delete]");
  if(edit){
    const x=manual.find(i=>i.id===edit.dataset.edit);
    if(!x) return;
    document.getElementById("edit-id").value=x.id;
    document.getElementById("manual-person").value=x.person;
    document.getElementById("manual-date").value=x.date;
    document.getElementById("manual-type").value=x.type;
    document.getElementById("manual-amount").value=x.amount;
    document.getElementById("manual-note").value=x.note;
    document.getElementById("modal-title").textContent="Edit Transaksi";
    modal.showModal();
  }
  if(del){
    if(confirm("Hapus transaksi manual ini?")){
      manual=manual.filter(i=>i.id!==del.dataset.delete);
      localStorage.setItem("tb_manual",JSON.stringify(manual));
      renderAll();
    }
  }
});

document.getElementById("save-settings").addEventListener("click",()=>{
  names={
    boy:document.getElementById("boy-name").value.trim()||"Pihak Cowok",
    girl:document.getElementById("girl-name").value.trim()||"Pihak Cewek",
  };
  localStorage.setItem("tb_names",JSON.stringify(names));
  alert("Pengaturan disimpan ♡");
});

document.getElementById("reset-data").addEventListener("click",()=>{
  if(confirm("Reset semua data manual ke contoh awal?")){
    manual=structuredClone(DEFAULT_MANUAL);
    localStorage.setItem("tb_manual",JSON.stringify(manual));
    renderAll();
  }
});

renderAll();
