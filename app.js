const AUTO = [
 {id:"a1",person:"boy",date:"2026-09-06",type:"in",amount:500000,note:"Transfer masuk"},
 {id:"a2",person:"boy",date:"2026-09-07",type:"out",amount:100000,note:"Belanja"},
 {id:"a3",person:"boy",date:"2026-09-09",type:"in",amount:750000,note:"Transfer tambahan"},
 {id:"a4",person:"boy",date:"2026-09-12",type:"out",amount:250000,note:"Bayar tagihan"},
 {id:"a5",person:"girl",date:"2026-09-06",type:"in",amount:300000,note:"Setor tabungan"},
 {id:"a6",person:"girl",date:"2026-09-08",type:"out",amount:50000,note:"Kebutuhan"},
 {id:"a7",person:"girl",date:"2026-09-10",type:"in",amount:450000,note:"Transfer masuk"},
 {id:"a8",person:"girl",date:"2026-09-11",type:"out",amount:200000,note:"Makan di luar"}
];

const DEFAULT_MANUAL = [
 {id:"m1",person:"boy",date:"2026-09-06",type:"in",amount:500000,note:"Transfer masuk"},
 {id:"m2",person:"boy",date:"2026-09-07",type:"out",amount:150000,note:"Belanja"},
 {id:"m3",person:"boy",date:"2026-09-09",type:"in",amount:750000,note:"Transfer tambahan"},
 {id:"m4",person:"girl",date:"2026-09-06",type:"in",amount:300000,note:"Setor tabungan"},
 {id:"m5",person:"girl",date:"2026-09-08",type:"out",amount:50000,note:"Kebutuhan"},
 {id:"m6",person:"girl",date:"2026-09-10",type:"in",amount:450000,note:"Transfer masuk"},
 {id:"m7",person:"girl",date:"2026-09-11",type:"out",amount:200000,note:"Makan di luar"}
];

let manual = JSON.parse(localStorage.getItem("shared_savings_manual") || "null") || structuredClone(DEFAULT_MANUAL);

const rp=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
const dshort=d=>new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short"}).format(new Date(d+"T00:00:00"));
const sum=(rows,person,type)=>rows.filter(x=>(!person||x.person===person)&&(!type||x.type===type)).reduce((a,x)=>a+x.amount,0);
const balance=(rows,person)=>sum(rows,person,"in")-sum(rows,person,"out");
const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};

function typePill(type){return `<span class="pill ${type}">${type==="in"?"Masuk":"Keluar"}</span>`}
function row(x,source,actions=false){
 return `<tr><td>${dshort(x.date)}</td><td>${typePill(x.type)}</td><td>${rp(x.amount)}</td><td>${x.note}</td><td><span class="pill ${source}">${source==="auto"?"Otomatis":"Manual"}</span></td>${actions?`<td><button class="action edit" data-edit="${x.id}">Edit</button> <button class="action delete" data-delete="${x.id}">Hapus</button></td>`:""}</tr>`
}

function renderHome(){
 const ti=sum(AUTO,null,"in"),to=sum(AUTO,null,"out"),tb=balance(AUTO);
 set("total-in",rp(ti));set("total-out",rp(to));set("total-balance",rp(tb));set("total-saving",rp(tb));
 ["boy","girl"].forEach(p=>{
   set(`${p}-in`,rp(sum(AUTO,p,"in")));set(`${p}-out`,rp(sum(AUTO,p,"out")));set(`${p}-left`,rp(balance(AUTO,p)));
   document.getElementById(`${p}-auto`).innerHTML=AUTO.filter(x=>x.person===p).map(x=>row(x,"auto")).join("");
 });
 const ba=balance(AUTO,"boy"),ga=balance(AUTO,"girl"),bm=balance(manual,"boy"),gm=balance(manual,"girl");
 set("boy-auto-balance",rp(ba));set("boy-manual-balance",rp(bm));set("girl-auto-balance",rp(ga));set("girl-manual-balance",rp(gm));
 set("all-auto-balance",rp(ba+ga));set("all-manual-balance",rp(bm+gm));
 const bd=bm-ba,gd=gm-ga,ad=(bm+gm)-(ba+ga);
 set("boy-diff",rp(bd));set("girl-diff",rp(gd));set("all-diff",rp(ad));
 status("boy-status",bd);status("girl-status",gd);
 const denom=Math.max(1,Math.abs(bm)+Math.abs(gm)),bp=Math.round(Math.abs(bm)/denom*100),gp=100-bp;
 set("boy-pct",bp+"%");set("girl-pct",gp+"%");
 document.getElementById("boy-progress").style.width=bp+"%";document.getElementById("girl-progress").style.width=gp+"%";
}
function status(id,diff){const e=document.getElementById(id);e.textContent=diff===0?"✓ Sudah sesuai":"! Berbeda";e.className="status "+(diff===0?"ok":"bad")}

function renderManual(){
 set("manual-count",manual.length);set("manual-in",rp(sum(manual,null,"in")));set("manual-out",rp(sum(manual,null,"out")));set("manual-left",rp(balance(manual)));
 document.getElementById("boy-manual").innerHTML=manual.filter(x=>x.person==="boy").map(x=>row(x,"manual",true)).join("")||`<tr><td colspan="6">Belum ada data.</td></tr>`;
 document.getElementById("girl-manual").innerHTML=manual.filter(x=>x.person==="girl").map(x=>row(x,"manual",true)).join("")||`<tr><td colspan="6">Belum ada data.</td></tr>`;
}
function key(x){return `${x.date}|${x.person}|${x.type}`}
function compare(){
 const keys=[...new Set([...AUTO.map(key),...manual.map(key)])];
 return keys.map(k=>{const [date,person,type]=k.split("|");const aa=AUTO.filter(x=>key(x)===k).reduce((s,x)=>s+x.amount,0);const mm=manual.filter(x=>key(x)===k).reduce((s,x)=>s+x.amount,0);const found=manual.find(x=>key(x)===k)||AUTO.find(x=>key(x)===k);return{date,person,type,auto:aa,manual:mm,diff:mm-aa,note:found?.note||"-"}})
}
function renderMatch(){
 const rows=compare(),bad=rows.filter(x=>x.diff!==0),good=rows.filter(x=>x.diff===0);
 document.getElementById("match-summary").innerHTML=`
 <article class="kpi kpi-green"><div class="kpi-icon">✓</div><div><small>Total Data Cocok</small><strong>${good.length}</strong><span>Transaksi sudah sesuai</span></div></article>
 <article class="kpi kpi-pink"><div class="kpi-icon">!</div><div><small>Perlu Dicek</small><strong>${bad.length}</strong><span>Ada perbedaan data</span></div></article>
 <article class="kpi kpi-pink"><div class="kpi-icon">◎</div><div><small>Selisih Nominal</small><strong>${rp(bad.reduce((s,x)=>s+Math.abs(x.diff),0))}</strong><span>Total perbedaan</span></div></article>
 <article class="kpi kpi-purple"><div class="kpi-icon">◇</div><div><small>Status Balance</small><strong>${bad.length?"Perlu Dicek":"Sudah Cocok"}</strong><span>${bad.length?"Masih ada data berbeda":"Semua sudah sesuai"}</span></div></article>`;
 const bA=balance(AUTO,"boy"),bM=balance(manual,"boy"),gA=balance(AUTO,"girl"),gM=balance(manual,"girl");
 const cards=[
  ["👦🏻 Pihak Cowok",bA,bM],
  ["👧🏻 Pihak Cewek",gA,gM],
  ["🐱 Total Bersama",bA+gA,bM+gM]
 ];
 document.getElementById("match-balance").innerHTML=cards.map((c,i)=>{const diff=c[2]-c[1];return `<article class="balance-card ${i===0?"boy-balance":i===1?"girl-balance":"total-together"}"><h3>${c[0]}</h3><div class="line"><span>Saldo Otomatis</span><b>${rp(c[1])}</b></div><div class="line"><span>Saldo Manual</span><b>${rp(c[2])}</b></div><div class="line diff-line"><span>Selisih</span><b>${rp(diff)}</b></div><div class="status ${diff===0?"ok":"bad"}">${diff===0?"✓ Sudah sesuai":"! Perlu Dicek"}</div></article>`}).join("");
 document.getElementById("diff-table").innerHTML=bad.map(x=>`<tr class="diff-row"><td>${dshort(x.date)}</td><td>${x.person==="boy"?"Cowok":"Cewek"}</td><td>${typePill(x.type)}</td><td>${rp(x.auto)}</td><td>${rp(x.manual)}</td><td style="color:var(--red);font-weight:900">${rp(x.diff)}</td><td>${x.note}</td><td><span class="pill bad">Perlu Dicek</span></td></tr>`).join("")||`<tr><td colspan="8"><span class="pill in">Semua data sudah cocok ✓</span></td></tr>`;
}
function renderReport(){const a=balance(AUTO),m=balance(manual);set("report-auto",rp(a));set("report-manual",rp(m));set("report-diff",rp(m-a))}
function renderAll(){renderHome();renderManual();renderMatch();renderReport()}

function nav(page){
 document.querySelectorAll(".view").forEach(x=>x.classList.remove("active"));
 document.querySelectorAll(".nav-btn").forEach(x=>x.classList.remove("active"));
 document.getElementById("view-"+page).classList.add("active");
 document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add("active");
 window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelector(".nav").addEventListener("click",e=>{const b=e.target.closest("[data-page]");if(b)nav(b.dataset.page)});
document.addEventListener("click",e=>{const b=e.target.closest("[data-go]");if(b)nav(b.dataset.go)});

const dialog=document.getElementById("manual-dialog"),form=document.getElementById("manual-form");
function openDialog(x=null){
 form.reset();set("dialog-title",x?"Edit Transaksi":"Catat Manual");document.getElementById("edit-id").value=x?.id||"";
 document.getElementById("form-person").value=x?.person||"boy";document.getElementById("form-date").value=x?.date||new Date().toISOString().slice(0,10);document.getElementById("form-type").value=x?.type||"in";document.getElementById("form-amount").value=x?.amount||"";document.getElementById("form-note").value=x?.note||"";dialog.showModal()
}
document.getElementById("add-manual").addEventListener("click",()=>openDialog());
document.getElementById("close-dialog").addEventListener("click",()=>dialog.close());document.getElementById("cancel-dialog").addEventListener("click",()=>dialog.close());
form.addEventListener("submit",e=>{e.preventDefault();const id=document.getElementById("edit-id").value;const item={id:id||"m"+Date.now(),person:document.getElementById("form-person").value,date:document.getElementById("form-date").value,type:document.getElementById("form-type").value,amount:Number(document.getElementById("form-amount").value),note:document.getElementById("form-note").value.trim()};manual=id?manual.map(x=>x.id===id?item:x):[...manual,item];localStorage.setItem("shared_savings_manual",JSON.stringify(manual));dialog.close();renderAll()});
document.addEventListener("click",e=>{const ed=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(ed){const x=manual.find(i=>i.id===ed.dataset.edit);if(x)openDialog(x)}if(del&&confirm("Hapus transaksi ini?")){manual=manual.filter(i=>i.id!==del.dataset.delete);localStorage.setItem("shared_savings_manual",JSON.stringify(manual));renderAll()}});
document.getElementById("save-settings").addEventListener("click",()=>alert("Pengaturan tersimpan ♡"));
document.getElementById("reset-manual").addEventListener("click",()=>{if(confirm("Reset data manual ke contoh awal?")){manual=structuredClone(DEFAULT_MANUAL);localStorage.setItem("shared_savings_manual",JSON.stringify(manual));renderAll()}});
renderAll();
