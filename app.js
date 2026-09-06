const AUTO=[
{id:"a1",person:"boy",date:"2026-09-05",type:"in",amount:1500000,note:"Transfer gaji"},
{id:"a2",person:"boy",date:"2026-09-08",type:"in",amount:50000,note:"Cashback"},
{id:"a3",person:"boy",date:"2026-09-10",type:"out",amount:300000,note:"Transfer ke bersama"},
{id:"a4",person:"boy",date:"2026-09-14",type:"out",amount:150000,note:"Top up e-wallet"},
{id:"a5",person:"boy",date:"2026-09-18",type:"out",amount:200000,note:"Belanja makan"},
{id:"a6",person:"girl",date:"2026-09-06",type:"in",amount:1500000,note:"Transfer gaji"},
{id:"a7",person:"girl",date:"2026-09-09",type:"in",amount:300000,note:"Bonus freelance"},
{id:"a8",person:"girl",date:"2026-09-11",type:"out",amount:300000,note:"Transfer ke bersama"},
{id:"a9",person:"girl",date:"2026-09-15",type:"out",amount:250000,note:"Belanja skincare"},
{id:"a10",person:"girl",date:"2026-09-17",type:"out",amount:150000,note:"Makan siang"}];

const DEFAULT_MANUAL=[
{id:"m1",person:"boy",date:"2026-09-05",type:"in",amount:1500000,note:"Transfer gaji"},
{id:"m2",person:"boy",date:"2026-09-08",type:"in",amount:50000,note:"Cashback"},
{id:"m3",person:"boy",date:"2026-09-10",type:"out",amount:300000,note:"Transfer ke bersama"},
{id:"m4",person:"boy",date:"2026-09-14",type:"out",amount:150000,note:"Top up e-wallet"},
{id:"m5",person:"boy",date:"2026-09-18",type:"out",amount:200000,note:"Belanja makan"},
{id:"m6",person:"girl",date:"2026-09-06",type:"in",amount:1500000,note:"Transfer gaji"},
{id:"m7",person:"girl",date:"2026-09-09",type:"in",amount:300000,note:"Bonus freelance"},
{id:"m8",person:"girl",date:"2026-09-11",type:"out",amount:300000,note:"Transfer ke bersama"},
{id:"m9",person:"girl",date:"2026-09-15",type:"out",amount:200000,note:"Belanja skincare"},
{id:"m10",person:"girl",date:"2026-09-17",type:"out",amount:150000,note:"Makan siang"}];

let manual=JSON.parse(localStorage.getItem("tbv3_manual")||"null")||structuredClone(DEFAULT_MANUAL);
const rp=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const ds=d=>new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short"}).format(new Date(d+"T00:00:00"));
const sum=(rows,p,t)=>rows.filter(x=>(!p||x.person===p)&&(!t||x.type===t)).reduce((s,x)=>s+x.amount,0);
const bal=(rows,p)=>sum(rows,p,"in")-sum(rows,p,"out");
const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
function autoRow(x){const neg=x.type==="out";return `<tr><td>${ds(x.date)}</td><td>${x.note}</td><td class="${neg?"amount-neg":""}">${neg?"- ":""}${rp(x.amount)}</td><td><span class="pill auto">Otomatis</span></td><td class="status-ok">✓</td></tr>`}
function manualRow(x){return `<tr><td>${ds(x.date)}</td><td><span class="pill ${x.type}">${x.type==="in"?"Masuk":"Keluar"}</span></td><td>${rp(x.amount)}</td><td>${x.note}</td><td><button class="action edit" data-edit="${x.id}">Edit</button> <button class="action delete" data-delete="${x.id}">Hapus</button></td></tr>`}
function renderHome(){
 const tin=sum(AUTO,null,"in"),tout=sum(AUTO,null,"out"),total=bal(AUTO);
 set("kpi-in",rp(tin));set("kpi-out",rp(tout));set("kpi-balance",rp(total));set("kpi-left",rp(total));
 ["boy","girl"].forEach(p=>{set(`${p}-in`,rp(sum(AUTO,p,"in")));set(`${p}-out`,rp(sum(AUTO,p,"out")));set(`${p}-left`,rp(bal(AUTO,p)));document.getElementById(`${p}-auto`).innerHTML=AUTO.filter(x=>x.person===p).map(autoRow).join("")});
 const bIn=sum(AUTO,"boy","in"),bOut=sum(AUTO,"boy","out"),gIn=sum(AUTO,"girl","in"),gOut=sum(AUTO,"girl","out");
 set("boy-total-in",rp(bIn));set("boy-total-out",rp(bOut));set("boy-sisa",rp(bIn-bOut));
 set("girl-total-in",rp(gIn));set("girl-total-out",rp(gOut));set("girl-sisa",rp(gIn-gOut));
 const bd=bal(manual,"boy")-bal(AUTO,"boy"),gd=bal(manual,"girl")-bal(AUTO,"girl");
 set("boy-match-diff",rp(bd));set("girl-match-diff",rp(gd));
 const bpill=document.getElementById("boy-pill"),gpill=document.getElementById("girl-pill");
 bpill.textContent=bd===0?"Sudah cocok! ♡":"Ada selisih";bpill.className=bd===0?"ok-pill":"warn-pill";
 gpill.textContent=gd===0?"Sudah cocok! ♡":"Ada selisih";gpill.className=gd===0?"ok-pill":"warn-pill";
 set("together-total",rp(total));set("together-in",rp(tin));set("together-out",rp(tout));
 const bb=Math.max(0,bal(AUTO,"boy")),gg=Math.max(0,bal(AUTO,"girl")),den=Math.max(1,bb+gg),bp=Math.round(bb/den*100),gp=100-bp;
 set("boy-pct",bp+"%");set("girl-pct",gp+"%");document.getElementById("boy-progress").style.width=bp+"%";document.getElementById("girl-progress").style.width=gp+"%";
}
function renderManual(){set("manual-count",manual.length);set("manual-in",rp(sum(manual,null,"in")));set("manual-out",rp(sum(manual,null,"out")));set("manual-left",rp(bal(manual)));document.getElementById("boy-manual").innerHTML=manual.filter(x=>x.person==="boy").map(manualRow).join("");document.getElementById("girl-manual").innerHTML=manual.filter(x=>x.person==="girl").map(manualRow).join("")}
function key(x){return `${x.date}|${x.person}|${x.type}`}
function compare(){const ks=[...new Set([...AUTO.map(key),...manual.map(key)])];return ks.map(k=>{const [date,person,type]=k.split("|");const a=AUTO.filter(x=>key(x)===k).reduce((s,x)=>s+x.amount,0),m=manual.filter(x=>key(x)===k).reduce((s,x)=>s+x.amount,0);const f=manual.find(x=>key(x)===k)||AUTO.find(x=>key(x)===k);return{date,person,type,auto:a,manual:m,diff:m-a,note:f?.note||"-"}})}
function renderMatch(){const all=compare(),bad=all.filter(x=>x.diff!==0),good=all.filter(x=>x.diff===0);document.getElementById("match-summary").innerHTML=`<div><small>Total Data Cocok</small><b>${good.length}</b></div><div><small>Perlu Dicek</small><b>${bad.length}</b></div><div><small>Selisih Nominal</small><b>${rp(bad.reduce((s,x)=>s+Math.abs(x.diff),0))}</b></div><div><small>Status Balance</small><b>${bad.length?"Perlu Dicek":"Sudah Cocok"}</b></div>`;document.getElementById("diff-table").innerHTML=bad.map(x=>`<tr class="diff-row"><td>${ds(x.date)}</td><td>${x.person==="boy"?"Cowok":"Cewek"}</td><td><span class="pill ${x.type}">${x.type==="in"?"Masuk":"Keluar"}</span></td><td>${rp(x.auto)}</td><td>${rp(x.manual)}</td><td style="color:#ef5f6f;font-weight:900">${rp(x.diff)}</td><td>${x.note}</td><td><span class="pill out">Perlu Dicek</span></td></tr>`).join("")||`<tr><td colspan="8"><span class="pill in">Semua data cocok ✓</span></td></tr>`}
function renderReport(){const a=bal(AUTO),m=bal(manual);set("report-auto",rp(a));set("report-manual",rp(m));set("report-diff",rp(m-a))}
function renderAll(){renderHome();renderManual();renderMatch();renderReport()}
function nav(id){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".menu-item").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelector(`.menu-item[data-page="${id}"]`)?.classList.add("active");window.scrollTo({top:0,behavior:"smooth"})}
document.querySelector(".menu").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)nav(b.dataset.page)});document.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)nav(b.dataset.go)});
const dlg=document.getElementById("manual-dialog"),form=document.getElementById("manual-form");
function openDialog(x=null){form.reset();set("dialog-title",x?"Edit Transaksi":"Catat Manual");document.getElementById("edit-id").value=x?.id||"";document.getElementById("form-person").value=x?.person||"boy";document.getElementById("form-date").value=x?.date||new Date().toISOString().slice(0,10);document.getElementById("form-type").value=x?.type||"in";document.getElementById("form-amount").value=x?.amount||"";document.getElementById("form-note").value=x?.note||"";dlg.showModal()}
document.getElementById("open-dialog").addEventListener("click",()=>openDialog());document.getElementById("close-dialog").addEventListener("click",()=>dlg.close());document.getElementById("cancel-dialog").addEventListener("click",()=>dlg.close());
form.addEventListener("submit",e=>{e.preventDefault();const id=document.getElementById("edit-id").value,item={id:id||"m"+Date.now(),person:document.getElementById("form-person").value,date:document.getElementById("form-date").value,type:document.getElementById("form-type").value,amount:Number(document.getElementById("form-amount").value),note:document.getElementById("form-note").value.trim()};manual=id?manual.map(x=>x.id===id?item:x):[...manual,item];localStorage.setItem("tbv3_manual",JSON.stringify(manual));dlg.close();renderAll()});
document.addEventListener("click",e=>{const ed=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(ed){const x=manual.find(i=>i.id===ed.dataset.edit);if(x)openDialog(x)}if(del&&confirm("Hapus transaksi ini?")){manual=manual.filter(i=>i.id!==del.dataset.delete);localStorage.setItem("tbv3_manual",JSON.stringify(manual));renderAll()}});
document.getElementById("reset-manual").addEventListener("click",()=>{if(confirm("Reset data manual?")){manual=structuredClone(DEFAULT_MANUAL);localStorage.setItem("tbv3_manual",JSON.stringify(manual));renderAll()}});
renderAll();

function renderMatchCards(){
  const bA=bal(AUTO,"boy"), bM=bal(manual,"boy"), gA=bal(AUTO,"girl"), gM=bal(manual,"girl");
  const totalA=bA+gA,totalM=bM+gM;
  const cards=[
    {cls:"blue-soft",title:"👦🏻 Pihak Cowok",a:bA,m:bM},
    {cls:"pink-soft",title:"👧🏻 Pihak Cewek",a:gA,m:gM},
    {cls:"together",title:"♡ Total Bersama",a:totalA,m:totalM}
  ];
  const host=document.getElementById("match-cards");
  if(!host) return;
  host.innerHTML=cards.map(c=>{
    const d=c.m-c.a;
    return `<article class="match-overview ${c.cls}">
      <h3>${c.title}</h3>
      <div class="row"><span>Saldo Otomatis</span><b>${rp(c.a)}</b></div>
      <div class="row"><span>Saldo Manual</span><b>${rp(c.m)}</b></div>
      <div class="row mismatch"><span>Selisih</span><b>${rp(d)}</b></div>
      <div class="${d===0?"ok-pill":"warn-pill"}">${d===0?"✓ Sudah sesuai":"! Perlu Dicek"}</div>
    </article>`;
  }).join("");
}

function renderReportExtra(){
  const bi=sum(AUTO,"boy","in"),bo=sum(AUTO,"boy","out"),gi=sum(AUTO,"girl","in"),go=sum(AUTO,"girl","out");
  const bl=bi-bo,gl=gi-go,total=Math.max(1,Math.abs(bl)+Math.abs(gl));
  const bp=Math.round(Math.abs(bl)/total*100),gp=100-bp;
  set("report-boy-in",rp(bi));set("report-boy-out",rp(bo));set("report-boy-left",rp(bl));
  set("report-girl-in",rp(gi));set("report-girl-out",rp(go));set("report-girl-left",rp(gl));
  set("report-boy-pct",bp+"%");set("report-girl-pct",gp+"%");
  const bb=document.getElementById("report-boy-bar"),gb=document.getElementById("report-girl-bar");
  if(bb) bb.style.width=bp+"%"; if(gb) gb.style.width=gp+"%";
  const target=Number(localStorage.getItem("tbv5_target")||10000000);
  const pct=Math.min(100,Math.round(Math.max(0,bal(AUTO))/Math.max(1,target)*100));
  const goal=document.getElementById("goal-bar"); if(goal)goal.style.width=pct+"%";
  set("goal-text",`${pct}% tercapai dari ${rp(target)}`);
  const t=document.getElementById("target-saving"); if(t)t.value=target;
}

function renderV5(){
  renderMatchCards();
  renderReportExtra();
}
const originalRenderAllV5=renderAll;
renderAll=function(){ originalRenderAllV5(); renderV5(); };

document.addEventListener("click",e=>{
  const b=e.target.closest("[data-add-person]");
  if(b){
    openDialog();
    document.getElementById("form-person").value=b.dataset.addPerson;
  }
});

const saveSettingsBtn=document.getElementById("save-settings");
if(saveSettingsBtn){
  saveSettingsBtn.addEventListener("click",()=>{
    const target=Number(document.getElementById("target-saving").value||0);
    localStorage.setItem("tbv5_target",String(target));
    alert("Pengaturan disimpan ♡");
    renderV5();
  });
}
renderAll();
