"use strict";
(() => {
  const {topics,questions,mockIds,review}=window.SAA;
  const bank=questions.filter(q=>q.reviewStatus==="approved");
  const byId=Object.fromEntries(bank.map(q=>[q.id,q]));
  const KEY="science-agent-academy-v1";
  const clone=x=>JSON.parse(JSON.stringify(x));
  const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const fresh=()=>({
    version:1,lang:"zh",sound:false,records:{},hints:{},later:[],
    recent:null,session:null
  });
  let db=fresh(),storageOK=true,storageMessage="";
  let view="home",filter="all",teacherType="all";
  let large=false,textAlternative=false;
  let testOutput="";
  const $=id=>document.getElementById(id);
  const tr=(zh,en)=>db.lang==="zh"?zh:en;
  const tx=x=>x ? x[db.lang] : "";
  const now=()=>Date.now();

  function validAnswer(q,a) {
    if(a===undefined || a===null) return true;
    const validOpt=x=>q.options.some(o=>o.id===x);
    if(q.type==="number") {
      return typeof a==="object" && !Array.isArray(a) &&
        Object.keys(a).every(k=>["value","unit","tolerance"].includes(k)) &&
        (typeof a.value==="number" && Number.isFinite(a.value) ||
         typeof a.value==="string" && a.value.length<30 && /^-?\d*(\.\d*)?$/.test(a.value)) &&
        (a.unit==="" || validOpt(a.unit));
    }
    if(q.type==="operation" && q.visualConfig.kind==="burner-operation") {
      return typeof a==="object" && !Array.isArray(a) &&
        Object.keys(a).every(k=>["hole","color","shape"].includes(k)) &&
        ["open","closed"].includes(a.hole) &&
        ["","blue","yellow"].includes(a.color) &&
        ["","regular","irregular"].includes(a.shape);
    }
    if(q.type==="match" || q.type==="classify") {
      return typeof a==="object" && !Array.isArray(a) &&
        Object.keys(a).every(k=>q.items.some(i=>i.id===k)) &&
        Object.values(a).every(v=>v==="" || validOpt(v));
    }
    if(Array.isArray(q.answer)) {
      if(!Array.isArray(a) || a.length>100 || !a.every(validOpt)) return false;
      if(q.type==="sort") return a.length===q.options.length && new Set(a).size===a.length;
      if(q.type!=="operation") return new Set(a).size===a.length;
      return true;
    }
    return typeof a==="string" && (a==="" || validOpt(a));
  }

  function validState(x) {
    if(!x || x.version!==1 || !["zh","en"].includes(x.lang) ||
       typeof x.sound!=="boolean" || !x.records || Array.isArray(x.records) ||
       !x.hints || Array.isArray(x.hints) || !Array.isArray(x.later)) return false;
    if(!x.later.every(id=>byId[id]) || new Set(x.later).size!==x.later.length) return false;
    for(const [id,r] of Object.entries(x.records)) {
      if(!byId[id] || !r || !validAnswer(byId[id],r.first) ||
         !validAnswer(byId[id],r.last) || typeof r.firstCorrect!=="boolean" ||
         typeof r.corrected!=="boolean" || !Number.isInteger(r.attempts) ||
         r.attempts<1 || !Number.isFinite(r.lastAt)) return false;
    }
    if(!Object.entries(x.hints).every(([id,n])=>byId[id] && Number.isInteger(n) && n>=0)) return false;
    const s=x.session;
    if(s) {
      if(!Array.isArray(s.ids) || !s.ids.length || s.ids.length>80 ||
         !s.ids.every(id=>byId[id]) || new Set(s.ids).size!==s.ids.length ||
         !["quick","chapter","weak","wrong","mock"].includes(s.mode) ||
         !["cards","run","result"].includes(s.stage) ||
         !Number.isInteger(s.index) || s.index<0 || s.index>=s.ids.length ||
         typeof s.done!=="boolean" || !s.answers || !s.submitted ||
         !s.touched || !s.hintShown || !Array.isArray(s.flags) ||
         !s.flags.every(id=>s.ids.includes(id)) ||
         !(s.deadline===null || Number.isFinite(s.deadline))) return false;
      for(const [id,a] of Object.entries(s.answers))
        if(!s.ids.includes(id) || !validAnswer(byId[id],a)) return false;
      for(const [id,r] of Object.entries(s.submitted))
        if(!s.ids.includes(id) || !r || typeof r.ok!=="boolean") return false;
      for(const field of ["touched","hintShown"])
        if(!Object.entries(s[field]).every(([id,b])=>s.ids.includes(id)&&typeof b==="boolean")) return false;
    }
    return true;
  }
  try {
    const raw=localStorage.getItem(KEY);
    if(raw) {
      const parsed=JSON.parse(raw);
      if(!validState(parsed)) throw new Error("Invalid saved data");
      db=parsed;
    }
  } catch(e) {
    storageOK=false;
    storageMessage="unavailable";
    db=fresh();
  }
  function save() {
    try {
      localStorage.setItem(KEY,JSON.stringify(db));
      storageOK=true;
    } catch(e) { storageOK=false;storageMessage="unavailable"; }
    const el=$("storage");
    if(el) {
      el.hidden=storageOK;
      el.textContent=tr(
        "本機儲存不可用或原資料損壞；本次仍可作答。關閉後紀錄可能不保留。",
        "Storage is unavailable or previous data was invalid. This session still works, but records may not survive closing."
      );
    }
  }

  function shuffled(xs) {
    const a = [...xs];

    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      const temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }

    return a;
  }
  function wrongRecord(id) {
    const r=db.records[id];
    return !!r && !r.firstCorrect && !r.corrected;
  }
  function topicStats(k) {
    const qs=bank.filter(q=>q.topic===k);
    const rs=qs.map(q=>db.records[q.id]).filter(Boolean);
    const correct=rs.filter(r=>r.firstCorrect).length;
    return {total:qs.length,n:rs.length,correct,
      rate:rs.length?correct/rs.length:null,
      wrong:qs.filter(q=>wrongRecord(q.id)).length};
  }
  function priority(q) {
    const r=db.records[q.id];
    if(!r) return 5;
    if(wrongRecord(q.id)) return 4;
    if(db.later.includes(q.id)) return 3;
    return r.firstCorrect?0:1;
  }
  function pick(pool,n) {
    const random=shuffled(pool);
    const reserve=Math.min(Math.max(1,Math.floor(n*.2)),random.length);
    const preferred=[...random].sort((a,b)=>priority(b)-priority(a));
    const chosen=preferred.slice(0,Math.max(0,n-reserve));
    const ids=new Set(chosen.map(q=>q.id));
    const others=shuffled(random.filter(q=>!ids.has(q.id)));
    return shuffled([...chosen,...others.slice(0,n-chosen.length)])
      .slice(0,n).map(q=>q.id);
  }
  function poolFor(f) {
    return bank.filter(q=>f==="all" || q.topic===f || q.chapter===f);
  }

  function complete(q,a) {
    if(a===undefined || a===null) return false;
    if(q.type==="number")
      return a.value!=="" && a.value!=="-" && Number.isFinite(Number(a.value)) &&
        q.options.some(o=>o.id===a.unit);
    if(q.type==="match" || q.type==="classify")
      return q.items.every(i=>q.options.some(o=>o.id===a[i.id]));
    if(q.type==="operation" && q.visualConfig.kind==="burner-operation")
      return !!a.color && !!a.shape;
    if(Array.isArray(q.answer)) return Array.isArray(a) && a.length>0;
    return typeof a==="string" && !!a;
  }
  function same(a,b) {
    if(Array.isArray(a)) return Array.isArray(b) && a.length===b.length && a.every((v,i)=>same(v,b[i]));
    if(a && typeof a==="object")
      return b && typeof b==="object" &&
        Object.keys(a).length===Object.keys(b).length &&
        Object.keys(a).every(k=>same(a[k],b[k]));
    return a===b;
  }
  function grade(q,a) {
    if(!complete(q,a)) return {ok:false,parts:0,total:1};
    if(q.type==="number") return {
      ok:Math.abs(Number(a.value)-q.answer.value)<=q.answer.tolerance && a.unit===q.answer.unit,
      parts:0,total:1
    };
    if(q.type==="match" || q.type==="classify") {
      const keys=Object.keys(q.answer);
      const parts=keys.filter(k=>a[k]===q.answer[k]).length;
      return {ok:parts===keys.length,parts,total:keys.length};
    }
    if(Array.isArray(q.answer)) {
      if(q.type==="sort" || q.type==="operation") {
        const parts=q.answer.filter((v,i)=>a[i]===v).length;
        return {ok:same(q.answer,a),parts,total:q.answer.length};
      }
      const correct=q.answer.filter(v=>a.includes(v)).length;
      const wrong=a.filter(v=>!q.answer.includes(v)).length;
      return {ok:correct===q.answer.length && wrong===0,
        parts:Math.max(0,correct-wrong),total:q.answer.length};
    }
    return {ok:same(q.answer,a),parts:0,total:1};
  }

  function recordInto(state,q,a,ok) {
    const r=state.records[q.id];
    if(!r) state.records[q.id]={
      first:clone(a??null),firstCorrect:ok,last:clone(a??null),
      attempts:1,corrected:false,lastAt:now()
    };
    else {
      r.last=clone(a??null);
      r.attempts++;
      r.lastAt=now();
      if(!r.firstCorrect && ok) r.corrected=true;
    }
    if(ok) state.later=state.later.filter(id=>id!==q.id);
    else if(!state.later.includes(q.id)) state.later.push(q.id);
    state.recent=now();
  }
  function optText(q,id) {
    return tx(q.options.find(o=>o.id===id)?.text)||String(id??"");
  }
  function fmt(q,a) {
    if(a===undefined || a===null || a==="") return tr("未作答","Unanswered");
    if(q.type==="number")
      return `${a.value??""} ${optText(q,a.unit)}`.trim();
    if(q.type==="operation" && q.visualConfig.kind==="burner-operation") {
      const labels={
        open:tr("打開","Open"),closed:tr("關閉","Closed"),
        blue:tr("藍色","Blue"),yellow:tr("黃色","Yellow"),
        regular:tr("規則","Regular"),irregular:tr("不規則","Irregular")
      };
      return ["hole","color","shape"].map(k=>labels[a[k]]||"—").join(" / ");
    }
    if(q.type==="match" || q.type==="classify")
      return q.items.map(i=>`${tx(i.text)} → ${optText(q,a[i.id])||"—"}`).join("； ");
    if(Array.isArray(a))
      return a.map(v=>optText(q,v)).join(q.type==="sort" || q.type==="operation"?" → ":"； ");
    return optText(q,a);
  }

  function button(label,action,extra="",cls="") {
    return `<button class="${cls}" data-action="${action}" ${extra}>${esc(label)}</button>`;
  }
  function topicOptions(selected="all",chapters=true) {
    let html=`<option value="all">${tr("全章","All Chapter 1")}</option>`;
    if(chapters) html+=["1.1","1.2","1.3","1.4"].map(c=>
      `<option value="${c}" ${selected===c?"selected":""}>${c}</option>`).join("");
    return html+Object.entries(topics).map(([k,t])=>
      `<option value="${k}" ${selected===k?"selected":""}>${t.chapter} ${esc(tx(t.name))}</option>`).join("");
  }
  const svg=(body,w=520,h=320,label="")=>
    `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label||tr("原創科學示意圖","Original science diagram"))}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const line=(x1,y1,x2,y2,color="#12344d",width=2)=>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
  const st=(x,y,t,size=16)=>
    `<text x="${x}" y="${y}" font-size="${size}" fill="#12344d" font-family="sans-serif">${esc(t)}</text>`;
  function apparatusShapes() {
    return [
      `<path d="M35 15V112Q60 155 85 112V15M30 15H90" fill="none" stroke="#12344d" stroke-width="3"/>`,
      `<path d="M25 25H85L96 18V135H25Z" fill="none" stroke="#12344d" stroke-width="3"/>`,
      `<path d="M48 15H72M50 15V52L20 135H100L70 52V15" fill="none" stroke="#12344d" stroke-width="3"/>`,
      `<path d="M15 25H105L68 80V135H52V80Z" fill="none" stroke="#12344d" stroke-width="3"/>`
    ];
  }
  function burner(hole) {
    const open=hole==="open";
    const flame=open ?
      `<path d="M205 210Q185 165 240 35Q295 165 275 210Z" fill="#167bc1"/>
       <path d="M225 210Q220 175 240 135Q260 175 255 210Z" fill="#b5e5ff"/>` :
      `<path d="M205 210Q175 165 215 115L205 70Q255 100 248 35Q295 95 268 130Q305 170 275 210Z" fill="#f3c347"/>`;
    return svg(flame+
      `<path d="M218 210H262V270H218Z" fill="#c9d2d8" stroke="#12344d" stroke-width="3"/>
       <ellipse cx="240" cy="280" rx="75" ry="12" fill="#d9e2e8" stroke="#12344d"/>
       <rect x="228" y="240" width="24" height="15" rx="6" fill="${open?"#12344d":"#c9d2d8"}" stroke="#12344d"/>`,
      480,305,tr("虛擬火焰觀察圖；沒有真實點火","Virtual flame observation; no real ignition"));
  }
  function scaleVisual(v) {
    if(v.kind==="ruler") {
      const x=n=>45+(n-v.min)/(v.max-v.min)*420;
      let b=`<rect x="35" y="90" width="445" height="80" fill="#fff" stroke="#12344d"/>`;
      for(let n=v.min;n<=v.max+1e-9;n+=v.step) {
        const major=Math.abs(n/v.major-Math.round(n/v.major))<1e-8;
        b+=line(x(n),90,x(n),major?124:110);
        if(major) b+=st(x(n)-7,148,Number(n.toFixed(4)));
      }
      b+=st(480,149,"cm");
      b+=line(x(v.min),58,x(v.value),58,"#087f80",6);
      b+=`<path d="M${x(v.value)-7} 68L${x(v.value)} 83L${x(v.value)+7} 68" fill="#087f80"/>`;
      return svg(b,540,210,tr("等距尺刻度，物件從零到箭頭；可開啟文字刻度版","Equally spaced ruler marks; object from zero to arrow. A text-scale alternative is available."));
    }
    const y=n=>275-(n-v.min)/(v.max-v.min)*230;
    let b="";
    const thermometer=v.kind==="thermometer";
    if(thermometer) {
      b+=`<rect x="155" y="25" width="28" height="255" rx="14" fill="white" stroke="#12344d"/>
        <rect x="164" y="${y(v.value)}" width="10" height="${280-y(v.value)}" fill="#b63333"/>
        <circle cx="169" cy="281" r="17" fill="#b63333" stroke="#12344d"/>`;
    } else {
      const py=y(v.value);
      b+=`<path d="M140 25V282H265V25" fill="none" stroke="#12344d" stroke-width="3"/>
        <path d="M142 ${py-12}Q202 ${py+12} 263 ${py-12}V280H142Z" fill="#cdeef3"/>
        <path d="M142 ${py-12}Q202 ${py+12} 263 ${py-12}" fill="none" stroke="#087f80" stroke-width="2"/>
        <rect x="122" y="282" width="160" height="10" fill="none" stroke="#12344d"/>`;
    }
    for(let n=v.min;n<=v.max+1e-9;n+=v.step) {
      const major=Math.abs(n/v.major-Math.round(n/v.major))<1e-8;
      const x=thermometer?190:270;
      b+=line(x,y(n),x+(major?25:13),y(n));
      if(major) b+=st(x+31,y(n)+5,Number(n.toFixed(4)),15);
    }
    b+=st(320,30,thermometer?"°C":"mL");
    return svg(b,440,320,tr("等距刻度圖；可放大或開啟文字刻度版","Equally spaced scale; enlargement and a text-scale alternative are available."));
  }
  function visual(q,a) {
    const v=q.visualConfig;
    if(!v || v.kind==="text" || v.kind.endsWith("-operation")) return "";
    let body="";
    if(["ruler","cylinder","thermometer"].includes(v.kind)) body=scaleVisual(v);
    if(v.kind==="apparatus") {
      const desc=[
        tr("細長、上方開口、圓底管身","Narrow open tube with a rounded bottom"),
        tr("較寬杯身及倒液口","Wide vessel with a pouring lip"),
        tr("窄頸、斜邊、寬底","Narrow neck, sloping sides and broad base"),
        tr("寬口逐漸收窄接長管柄","Wide opening narrowing into a long stem")
      ];
      body=`<div class="instrument-grid">${apparatusShapes().map((s,i)=>
        `<figure>${svg(s,120,155,desc[i])}<figcaption>${"ABCD"[i]}</figcaption></figure>`).join("")}</div>`;
    }
    if(v.kind==="safety") body=svg(
      `<rect x="15" y="30" width="105" height="170" fill="#eef6f7" stroke="#12344d"/>
       <rect x="35" y="150" width="85" height="70" rx="10" fill="#bd9874" stroke="#12344d"/>
       <circle cx="235" cy="105" r="36" fill="#f3d7b6" stroke="#12344d"/>
       <rect x="200" y="91" width="70" height="26" rx="8" fill="#d9f4fa" stroke="#12344d"/>
       <path d="M190 210V155Q235 135 280 155V210" fill="#dfe8ef" stroke="#12344d"/>
       <rect x="330" y="185" width="170" height="14" fill="#d3dde3" stroke="#12344d"/>
       <path d="M366 178L389 130L420 178Z" fill="#edc987" stroke="#12344d"/>
       ${st(45,55,"A")}${st(225,55,"B")}${st(389,95,"C")}`,
      520,250,tr("A：出口前有書包。B：學生戴安全眼鏡。C：桌上有食物。","A: a bag stands in front of an exit. B: a student wears safety spectacles. C: food is on a bench."));
    if(v.kind==="eye") body=svg(
      `<path d="M120 30V255H260V30" fill="none" stroke="#12344d" stroke-width="3"/>
       <path d="M122 137Q190 163 258 137V253H122Z" fill="#cdeef3"/>
       <path d="M122 137Q190 163 258 137" fill="none" stroke="#087f80" stroke-width="3"/>
       ${line(190,150,375,75)}${line(190,150,375,150)}${line(190,150,375,225)}
       ${st(390,80,"A")}${st(390,155,"B")}${st(390,230,"C")}`,
      480,285,tr("A 高於彎液面底部；B 與底部同高；C 低於底部。","A is above the meniscus bottom; B is level with it; C is below it."));
    if(v.kind==="shaded") body=svg(
      `<path d="M130 40H285L300 30V235H130Z" fill="#b6c4cf" stroke="#12344d" stroke-width="3"/>
       ${line(300,100,385,65)}${st(355,55,tr("燒杯","Beaker"))}`,480,265,
      tr("燒杯線條圖內有灰色陰影及名稱標示。","A labelled beaker line drawing with grey shading."));
    if(v.kind==="balance") body=svg(
      `<rect x="90" y="60" width="320" height="150" rx="15" fill="#e0e8ed" stroke="#12344d"/>
       <rect x="135" y="95" width="235" height="75" fill="white" stroke="#12344d"/>
       ${st(185,145,v.value+" g",32)}`,500,255,
      tr("電子天平顯示屏；可開啟文字顯示版","Electronic balance display; a text-display alternative is available."));
    let alt="";
    if(textAlternative) {
      if(["ruler","cylinder","thermometer"].includes(v.kind)) {
        const count=Math.round((v.value-v.min)/v.step);
        const unit=v.kind==="ruler"?"cm":v.kind==="cylinder"?"mL":"°C";
        alt=`<p class="note">${esc(tr(
          `文字刻度替代版：由 ${v.min} ${unit} 開始，每格 ${v.step} ${unit}；讀數位置在起始刻度往數值增加方向第 ${count} 格。`,
          `Text-scale alternative: start at ${v.min} ${unit}; each interval is ${v.step} ${unit}. The reading position is ${count} intervals in the increasing direction from the start.`
        ))}</p>`;
      } else if(v.kind==="balance") {
        alt=`<p class="note">${esc(tr("文字顯示替代版：","Text-display alternative: ")+v.value+" g")}</p>`;
      }
    }
    return `<div class="visual ${large?"large":""}">${body}</div>${alt}`;
  }

  function header() {
    return `<header><h1>${tr("科學特工學院：考前衝刺","Science Agent Academy: Exam Revision")}</h1>
      <nav aria-label="${tr("主要導覽","Main navigation")}">
      ${button(tr("首頁","Home"),"nav-home")}
      ${button(tr("章節","Chapters"),"nav-chapters")}
      ${button(db.lang==="zh"?"English":"繁體中文","language")}
      ${button(tr("音效：","Sound: ")+(db.sound?tr("開","On"):tr("關","Off")),"sound")}
      ${button(tr("進度","Progress"),"nav-report")}
      ${button(tr("說明","Help"),"nav-help")}
      </nav></header>`;
  }
  function home() {
    const active=db.session && !db.session.done;
    return `<h2>${tr("選擇溫習方式","Choose a revision mode")}</h2>
      <p>${tr("只涵蓋 Chapter 1。所有主題已開放，不扣生命值。","Chapter 1 only. All topics are open; there are no lives to lose.")}</p>
      ${active?`<div class="note">${tr("有未完成活動。","An activity is in progress.")}
        ${button(tr("繼續","Resume"),"resume","",'primary')}
        ${button(tr("放棄這次活動","Abandon this activity"),"abandon")}
        ${db.session.mode==="mock"?`<span id="clock"></span>`:""}
      </div>`:""}
      <div class="grid">
        <section class="card"><h3>A. ${tr("10 分鐘快溫","10-minute review")}</h3>
          <p>${tr("預計時間，不強制倒數。最多 3 張可跳過卡及 8–10 題。","Estimated time, not a countdown. Up to 3 skippable cards and 8–10 questions.")}</p>
          <label>${tr("範圍","Scope")} <select id="quick-scope">${topicOptions()}</select></label>
          <div class="actions">${button(tr("開始快溫","Start review"),"quick","",'primary')}</div>
        </section>
        <section class="card"><h3>B. ${tr("分章溫習","Chapter review")}</h3>
          <p>${tr("八個任務區；直接選擇弱項。","Eight mission areas; choose a topic directly.")}</p>
          ${button(tr("選擇章節","Choose chapter"),"nav-chapters")}
        </section>
        <section class="card"><h3>C. ${tr("弱項加強","Targeted practice")}</h3>
          <p>${tr("以未答及未訂正題優先，保留少量其他題；不是 AI 診斷。","Prioritises unseen and uncorrected questions with some other questions; not AI diagnosis.")}</p>
          ${button(tr("開始 10 題","Start 10 questions"),"weak")}
        </section>
        <section class="card"><h3>D. ${tr("模擬測驗","Mock test")}</h3>
          <label>${tr("時間","Timing")} <select id="mock-time">
            <option value="0">${tr("不計時","Untimed")}</option>
            <option value="20">${tr("20 分鐘","20 minutes")}</option>
          </select></label>
          <p>${tr("20 題，每題 1 分；交卷前無答案或提示。","20 questions, 1 mark each; no answers or hints before submission.")}</p>
          ${button(tr("開始模擬卷","Start mock"),"mock","",'primary')}
        </section>
        <section class="card"><h3>E. ${tr("錯題重練","Mistake review")}</h3>
          <p>${tr("首次錯誤永久保留；答對後標示已訂正。","First errors are retained; successful retries are marked corrected.")}</p>
          ${button(tr("開啟錯題簿","Open mistake book"),"nav-wrong")}
        </section>
        <section class="card"><h3>F. ${tr("考前一頁通","Revision sheet")}</h3>
          <p>${tr("精簡、雙語模式、適合列印。","Compact, available in either language and printable.")}</p>
          ${button(tr("查看重點","Open sheet"),"nav-sheet")}
        </section>
      </div>
      ${button(tr("教師／答案檢視","Teacher / answer view"),"nav-teacher")}
      <p class="small">${tr("模擬卷依據提供的筆記製作，並非學校正式試卷；不預測考題或保證成績。","The mock is based on the supplied notes, not an official school paper. It does not predict questions or guarantee results.")}</p>`;
  }
  function cardHTML(k) {
    const t=topics[k];
    return `<section class="card"><h3>${t.chapter} ${esc(tx(t.name))}</h3>
      <p>${esc(tx(t.card))}</p>
      <p class="note"><strong>${tr("易混淆：","Common confusion: ")}</strong>${esc(tx(t.trap))}</p></section>`;
  }
  function chapters() {
    return `<h2>${tr("分章溫習／八個任務區","Chapter review / eight mission areas")}</h2>
      <p>${tr("直接按練習可跳過精讀卡。","Select Practice to skip reading cards.")}</p>
      ${["1.1","1.2","1.3","1.4"].map(c=>`<h3>${c}</h3><div class="grid">${
        Object.entries(topics).filter(([,t])=>t.chapter===c).map(([k,t])=>{
          const s=topicStats(k);
          return `<section class="card"><h3>${esc(tx(t.mission))}</h3>
            <p>${esc(tx(t.name))} · ${t.count} ${tr("題","questions")}</p>
            <p>${s.n<3?tr("資料不足","Insufficient data"):tr("首次正確率：","First-attempt accuracy: ")+Math.round(s.rate*100)+"%"}</p>
            <div class="actions">
              ${button(tr("重點卡","Cards"),"topic-cards",`data-topic="${k}"`)}
              ${button(tr("練習","Practice"),"topic-run",`data-topic="${k}"`,"primary")}
              ${button(tr("錯題","Mistakes"),"topic-wrong",`data-topic="${k}"`)}
            </div></section>`;
        }).join("")}</div>`).join("")}`;
  }

  function start(mode,ids,cards=false,minutes=0) {
    if(!ids.length) { alert(tr("目前沒有符合條件的題目。","No matching questions."));return; }
    if(db.session && !db.session.done &&
       !confirm(tr("將放棄目前未完成活動，開始新活動？","Abandon the current unfinished activity and start a new one?"))) return;
    db.session={
      mode,ids,index:0,answers:{},submitted:{},touched:{},flags:[],
      hintShown:{},stage:cards?"cards":"run",done:false,
      deadline:minutes?now()+minutes*60000:null
    };
    db.recent=now();view="session";save();render();
  }
  function defaultAnswer(q) {
    if(q.type==="sort") {
      let a=shuffled(q.options.map(o=>o.id));
      if(same(a,q.answer)) a=[...a.slice(1),a[0]];
      return a;
    }
    if(q.type==="number") return {value:"",unit:""};
    if(q.type==="match" || q.type==="classify") return {};
    if(q.type==="operation") return q.visualConfig.kind==="burner-operation"?
      {hole:"closed",color:"",shape:""}:[];
    return Array.isArray(q.answer)?[]:"";
  }
  function ensureDraft(q) {
    const s=db.session;
    if(!Object.prototype.hasOwnProperty.call(s.answers,q.id)) {
      s.answers[q.id]=defaultAnswer(q);save();
    }
    return s.answers[q.id];
  }
  function optionsHTML(q,selected,blank=true) {
    return (blank?`<option value="">${tr("請選擇","Choose")}</option>`:"")+
      q.options.map(o=>`<option value="${o.id}" ${selected===o.id?"selected":""}>${esc(tx(o.text))}</option>`).join("");
  }
  function balanceModel(q,actions) {
    let container=false,sample=false,tare=0;
    const mass=()=> (container?q.visualConfig.container:0)+(sample?q.visualConfig.sample:0);
    for(const a of actions) {
      if(a==="a") container=true;
      if(a==="b") tare=mass();
      if(a==="c") sample=true;
    }
    return {container,sample,value:mass()-tare};
  }
  function controls(q,a,locked) {
    const disabled=locked?"disabled":"";
    if(q.type==="number") return `<label>${tr("數值","Value")}
      <input id="numeric-value" data-field="number" type="text" inputmode="decimal"
        value="${esc(a.value)}" ${disabled} autocomplete="off"></label>
      <label>${tr("單位","Unit")} <select id="numeric-unit" data-field="unit" ${disabled}>
      ${optionsHTML(q,a.unit)}</select></label>
      <p class="small">${tr("本題讀數正對刻度或顯示屏；輸入該數值，數值與單位均須正確。等值小數可接受。","The reading is exactly on a mark or display. Enter that value; both value and unit must be correct. Equivalent decimal forms are accepted.")}</p>`;
    if(q.type==="match" || q.type==="classify") return q.items.map(i=>
      `<div class="mapping"><label for="map-${i.id}">${esc(tx(i.text))}</label>
       <select id="map-${i.id}" data-field="map" data-row="${i.id}" ${disabled}>
       ${optionsHTML(q,a[i.id])}</select></div>`).join("");
    if(q.type==="sort") return `<p>${tr("用上移／下移排序；無須拖曳。","Use Up/Down to order the steps; dragging is unnecessary.")}</p>`+
      a.map((id,i)=>`<div class="sort-row"><span>${i+1}. ${esc(optText(q,id))}</span>
      ${button(tr("上移","Up"),"move",`id="up-${id}" data-index="${i}" data-delta="-1" ${disabled} ${i===0?"disabled":""}`)}
      ${button(tr("下移","Down"),"move",`id="down-${id}" data-index="${i}" data-delta="1" ${disabled} ${i===a.length-1?"disabled":""}`)}
      </div>`).join("");
    if(q.type==="operation") {
      if(q.visualConfig.kind==="balance-operation") {
        const m=balanceModel(q,a);
        return `<div class="panel"><h3>${tr("虛擬天平","Virtual balance")}</h3>
          <p>${tr("秤盤：","Pan: ")}${m.container?tr("容器","Container"):tr("沒有容器","No container")}
          ${m.sample?" + "+tr("物質","Substance"):""}</p>
          <p class="badge">${m.value.toFixed(1)} g</p>
          <div class="actions">${q.options.map(o=>button(tx(o.text),"balance",
            `data-value="${o.id}" ${disabled}`)).join("")}
          ${button(tr("重設操作","Reset actions"),"reset-operation",disabled)}</div>
          <p>${esc(fmt(q,a))}</p>
          <p class="small">${tr("判分按完整操作次序，不只看最後數字。","Scoring checks the complete action sequence, not only the final number.")}</p></div>`;
      }
      const selector=(field,values)=>`<select id="burner-${field}" data-field="${field}" ${disabled}>
        <option value="">${tr("請選擇","Choose")}</option>${values.map(([v,z,e])=>
          `<option value="${v}" ${a[field]===v?"selected":""}>${tr(z,e)}</option>`).join("")}</select>`;
      return `<div class="panel">
        <p>${tr("虛擬氣孔","Virtual air hole")}</p>
        <div class="actions">
          ${button(tr("關閉","Closed"),"hole",`data-value="closed" aria-pressed="${a.hole==="closed"}" ${disabled}`)}
          ${button(tr("打開","Open"),"hole",`data-value="open" aria-pressed="${a.hole==="open"}" ${disabled}`)}
        </div>
        <div class="visual">${burner(a.hole)}</div>
        <p class="small">${tr("圖像觀察替代描述：","Equivalent observation description: ")}${
          a.hole==="open"?tr("藍色，輪廓規則。","Blue with a regular outline."):tr("黃色，輪廓不規則。","Yellow with an irregular outline.")
        }</p>
        <label>${tr("觀察顏色","Observed colour")} ${selector("color",[["blue","藍色","Blue"],["yellow","黃色","Yellow"]])}</label>
        <label>${tr("觀察形狀","Observed shape")} ${selector("shape",[["regular","規則","Regular"],["irregular","不規則","Irregular"]])}</label>
      </div>`;
    }
    const multi=Array.isArray(q.answer);
    return `<fieldset><legend>${multi?tr("選出所有正確答案","Select all correct answers"):tr("選擇一項","Select one answer")}</legend>
      ${q.options.map(o=>`<label class="option"><input id="choice-${o.id}" data-field="choice"
        type="${multi?"checkbox":"radio"}" name="answer" value="${o.id}"
        ${(multi?a.includes(o.id):a===o.id)?"checked":""} ${disabled}>
        <span>${esc(tx(o.text))}</span></label>`).join("")}</fieldset>`;
  }
  function feedback(q,a,g) {
    return `<section class="feedback ${g.ok?"good":"bad"}" aria-label="${tr("作答回饋","Answer feedback")}">
      <h3>${g.ok?tr("✓ 正確","✓ Correct"):tr("△ 尚未正確","△ Not yet correct")}</h3>
      <p><strong>${tr("你的答案：","Your answer: ")}</strong>${esc(fmt(q,a))}</p>
      <p><strong>${tr("正確答案：","Correct answer: ")}</strong>${esc(fmt(q,q.answer))}</p>
      <p>${esc(tx(q.explanation))}</p>
      <p><strong>${tr("易錯提醒：","Misconception: ")}</strong>${esc(tx(q.misconception))}</p>
      ${g.total>1?`<p>${tr("練習細項：","Practice components: ")}${g.parts}/${g.total} · ${tr("整題全對才得 1 分","1 mark only for a fully correct answer")}</p>`:""}
      <p class="small">${esc(q.sourceNote)} · ${q.id}</p></section>`;
  }
  function sessionHTML() {
    const s=db.session;
    if(!s) return home();
    if(s.stage==="result") return results();
    if(s.stage==="cards") {
      const keys=[...new Set(s.ids.map(id=>byId[id].topic))].slice(0,3);
      return `<h2>${tr("可跳過的重點卡","Skippable revision cards")}</h2>
        ${button(tr("跳過／開始作答","Skip / start questions"),"skip-cards","",'primary')}
        ${keys.map(cardHTML).join("")}`;
    }
    const q=byId[s.ids[s.index]],a=ensureDraft(q);
    const locked=!!s.submitted[q.id];
    const mock=s.mode==="mock";
    return `<div class="row"><span class="badge">${q.chapter} · ${esc(tx(topics[q.topic].mission))}</span>
      <span>${s.index+1}/${s.ids.length}</span>${mock?`<span id="clock"></span>`:""}</div>
      <progress value="${s.index+1}" max="${s.ids.length}" aria-label="${tr("題目位置，不是掌握程度","Question position, not mastery")}"></progress>
      <section class="panel"><h2 id="question-title">${esc(tx(q.prompt))}</h2>
      <p class="small">${q.id} · ${tr("每題 1 分；多選、配對及排序須整題全對。首次提交才計入首次正確率。","1 mark per question; multi-select, matching and ordering require full correctness. Only the first submission counts towards first-attempt accuracy.")}</p>
      ${q.visualConfig?`<div class="actions">
        ${button(tr("放大圖像","Enlarge diagram"),"zoom",`aria-pressed="${large}"`)}
        ${button(tr("文字刻度替代版","Text-scale alternative"),"alternative",`aria-pressed="${textAlternative}"`)}
      </div>`:""}
      ${visual(q,a)}
      ${controls(q,a,locked)}
      <div class="actions">
      ${!mock && !locked?button(tr("提交答案","Submit answer"),"submit-practice","",'primary'):""}
      ${!mock?button(tr("查看精讀卡（記錄提示）","View card (counts as hint)"),"hint"):""}
      ${button(tr("稍後再練","Practise later"),"later")}
      </div>
      ${!mock && s.hintShown[q.id]?cardHTML(q.topic):""}
      ${locked && !mock?feedback(q,a,s.submitted[q.id]):""}
      </section>
      <div class="actions">
        ${button(tr("上一題","Previous"),"previous",s.index===0?"disabled":"")}
        ${button(tr("下一題","Next"),"next",s.index===s.ids.length-1?"disabled":"")}
        ${mock?button(s.flags.includes(q.id)?tr("取消標記","Unflag"):tr("稍後檢查","Flag for review"),"flag"):""}
        ${mock?button(tr("交卷","Submit test"),"submit-mock","",'primary'):
          button(tr("結束／查看報告","Finish / report"),"finish-practice")}
      </div>
      ${mock?`<p>${tr("已標記：","Flagged: ")}${s.flags.map(id=>s.ids.indexOf(id)+1).join(", ")||"—"}</p>
        <div class="actions">${s.ids.map((id,i)=>button(
          `${i+1}${s.flags.includes(id)?" ★":""}${s.touched[id]&&complete(byId[id],s.answers[id])?" ✓":""}`,
          "jump",`data-index="${i}" aria-label="${tr("前往第","Go to question ")}${i+1}${tr("題","")}"`)).join("")}</div>`:""}`;
  }

  function setAnswer(field,value,row) {
    const s=db.session;
    if(!s || s.done) return;
    const q=byId[s.ids[s.index]];
    if(s.submitted[q.id]) return;
    const a=ensureDraft(q);
    if(field==="choice") {
      if(Array.isArray(q.answer)) {
        const input=$("choice-"+value);
        if(input.checked && !a.includes(value)) a.push(value);
        if(!input.checked) s.answers[q.id]=a.filter(x=>x!==value);
      } else s.answers[q.id]=value;
    } else if(field==="number") {
      if(!/^-?\d*(\.\d*)?$/.test(value) || value.length>=30) return;
      a.value=value;
    } else if(field==="unit") a.unit=value;
    else if(field==="map") a[row]=value;
    else a[field]=value;
    s.touched[q.id]=true;save();
  }
  function submitPractice() {
    const s=db.session,q=byId[s.ids[s.index]],a=s.answers[q.id];
    if(s.submitted[q.id]) return;
    if(!complete(q,a)) {alert(tr("請先完成答案。","Please complete the answer first."));return;}
    const g=grade(q,a);
    s.submitted[q.id]=g;s.touched[q.id]=true;
    recordInto(db,q,a,g.ok);
    save();beep(g.ok);render();
    $("question-title")?.focus();
  }
  function endMock(automatic=false) {
    const s=db.session;
    if(!s || s.mode!=="mock" || s.done) return;
    const missing=s.ids.filter(id=>!s.touched[id] || !complete(byId[id],s.answers[id])).length;
    if(!automatic && !confirm(tr(
      `尚有 ${missing} 題未完成。確定交卷？`,
      `${missing} questions are incomplete. Submit the test?`
    ))) return;
    s.done=true;s.stage="result";
    for(const id of s.ids) {
      const q=byId[id],a=s.answers[id];
      const g=s.touched[id]?grade(q,a):{ok:false,parts:0,total:1};
      s.submitted[id]=g;
      if(s.touched[id]) recordInto(db,q,a,g.ok);
      else if(!db.later.includes(id)) db.later.push(id);
    }
    s.autoSubmitted=automatic;
    save();view="session";render();
  }
  function results() {
    const s=db.session;
    const attempted=Object.keys(s.submitted).length;
    const score=Object.values(s.submitted).filter(g=>g.ok).length;
    const wrong=s.ids.filter(id=>!s.submitted[id]?.ok);
    const keys=[...new Set(wrong.map(id=>byId[id].topic))];
    return `<h2>${tr("活動報告","Activity report")}</h2>
      <p>${s.mode==="mock"?tr("模擬卷分數","Mock score"):tr("本次練習答對","Correct in this activity")}：
      <strong>${score}/${s.mode==="mock"?s.ids.length:attempted}</strong></p>
      ${s.autoSubmitted?`<p class="note">${tr("時間已到；本卷已自動交卷一次。","Time expired; this test was submitted automatically once.")}</p>`:""}
      <p>${tr("未提交／跳過：","Not submitted / skipped: ")}${
        s.ids.filter(id=>!s.touched[id] || !s.submitted[id]).length}</p>
      <p>${tr("建議再溫習：","Suggested review: ")}${keys.map(k=>esc(tx(topics[k].name))).join("、")||tr("可稍後用不同題目再檢查，不能據此宣稱完全掌握。","Check again later with other questions; this does not establish complete mastery.")}</p>
      <div class="actions">
        ${wrong.length?button(tr("一鍵重練本次錯題／未答題","Retry incorrect / skipped questions"),"retry-result","",'primary'):""}
        ${button(tr("查看整體進度","Overall progress"),"nav-report")}
      </div>
      ${s.mode==="mock"?`<p class="note">${tr("本測驗依據提供筆記製作，並非學校正式試卷。","This test is based on the supplied notes, not an official school paper.")}</p>`:""}
      ${s.ids.map((id,i)=>{
        const q=byId[id];
        const r=s.submitted[id]||{ok:false,parts:0,total:1};
        return `<details><summary>${i+1}. ${id} ${r.ok?"✓":"△"} ${esc(tx(q.prompt))}</summary>
          ${visual(q,s.answers[id])}${feedback(q,s.touched[id]?s.answers[id]:null,r)}
          ${button(tr("稍後再練","Practise later"),"later-id",`data-id="${id}"`)}</details>`;
      }).join("")}`;
  }

  function wrongBook() {
    const qs=poolFor(filter).filter(q=>
      (db.records[q.id]&&!db.records[q.id].firstCorrect)||db.later.includes(q.id));
    return `<h2>${tr("錯題簿及稍後再練","Mistake book and practice queue")}</h2>
      <label>${tr("範圍","Scope")} <select id="wrong-filter">${topicOptions(filter)}</select></label>
      <div class="actions">${button(tr("重練未訂正／待練題","Retry uncorrected / queued questions"),"retry-wrong","",'primary')}</div>
      <p>${tr("答案預設收起。已訂正不會刪除首次錯誤；未作答但排入待練的題目沒有首次答案。","Answers are hidden by default. Corrections do not erase first errors; queued unseen questions have no first answer.")}</p>
      ${qs.length?qs.map(q=>{
        const r=db.records[q.id];
        return `<section class="card"><h3>${q.id} ${esc(tx(q.prompt))}</h3>
          <p>${r?(r.corrected?tr("✓ 已訂正","✓ Corrected"):tr("△ 未訂正","△ Uncorrected")):tr("稍後再練／未有首次紀錄","Queued / no first record")}</p>
          ${button(tr("重答此題","Retry this question"),"retry-id",`data-id="${q.id}"`)}
          <details><summary>${tr("展開首次答案及解說","Reveal first answer and explanation")}</summary>
            ${feedback(q,r?.first,r?{ok:r.firstCorrect,parts:0,total:1}:{ok:false,parts:0,total:1})}
          </details></section>`;
      }).join(""):`<p>${tr("目前沒有符合範圍的錯題或待練題。","No matching mistakes or queued questions.")}</p>`}`;
  }
  function report() {
    const rs=Object.values(db.records);
    const n=rs.length,correct=rs.filter(r=>r.firstCorrect).length;
    const corrected=rs.filter(r=>!r.firstCorrect&&r.corrected).length;
    const hints=Object.values(db.hints).reduce((a,b)=>a+b,0);
    const next=Object.keys(topics).sort((a,b)=>{
      const x=topicStats(a),y=topicStats(b);
      return (x.n===0?-1:x.rate)-(y.n===0?-1:y.rate);
    })[0];
    return `<h2>${tr("本機學習報告","Local learning report")}</h2>
      <div class="grid">
        <div class="card">${tr("首次正確率","First-attempt accuracy")}<h3>${n?Math.round(correct/n*100)+"%":"—"}</h3></div>
        <div class="card">${tr("已提交獨立題目","Distinct submitted questions")}<h3>${n}/80</h3></div>
        <div class="card">${tr("已訂正錯題","Corrected first errors")}<h3>${corrected}</h3></div>
        <div class="card">${tr("提示使用次數","Hint uses")}<h3>${hints}</h3></div>
      </div>
      <p class="note">${tr("這些是本機練習紀錄，不是考試掌握程度。少於 3 道獨立題目的主題顯示資料不足；首次正確率可能包含使用提示的作答。","These are local practice records, not exam mastery. Topics with fewer than 3 distinct questions have insufficient data; first-attempt accuracy can include hinted responses.")}</p>
      <div class="table-wrap"><table><thead><tr>
        <th>${tr("主題","Topic")}</th><th>${tr("已答","Submitted")}</th><th>${tr("首次表現","First-attempt performance")}</th><th>${tr("未訂正","Uncorrected")}</th>
      </tr></thead><tbody>${Object.entries(topics).map(([k,t])=>{
        const s=topicStats(k);
        return `<tr><td>${t.chapter} ${esc(tx(t.name))}</td><td>${s.n}/${s.total}</td>
          <td>${s.n<3?tr("資料不足","Insufficient data"):Math.round(s.rate*100)+"%"}</td><td>${s.wrong}</td></tr>`;
      }).join("")}</tbody></table></div>
      <h3>${tr("各章節","By chapter")}</h3>
      ${["1.1","1.2","1.3","1.4"].map(c=>{
        const r=bank.filter(q=>q.chapter===c).map(q=>db.records[q.id]).filter(Boolean);
        return `<p>${c}: ${r.filter(x=>x.firstCorrect).length}/${r.length} ${tr("首次答對／已提交","first correct / submitted")}</p>`;
      }).join("")}
      <p>${tr("未作答主題：","Unseen topics: ")}${Object.keys(topics).filter(k=>!topicStats(k).n).map(k=>esc(tx(topics[k].name))).join("、")||"—"}</p>
      <p>${tr("建議下一步：","Suggested next step: ")}${esc(tx(topics[next].name))}</p>
      <p>${tr("最近溫習：","Last activity: ")}${db.recent?esc(new Date(db.recent).toLocaleString(db.lang==="zh"?"zh-HK":"en-GB")):"—"}</p>
      <div class="actions">
        ${button(tr("開始弱項加強","Start targeted practice"),"weak","",'primary')}
        ${button(tr("匯出本機摘要 JSON","Export local summary JSON"),"export")}
        ${button(tr("清除本機紀錄","Clear local records"),"clear","","danger")}
      </div>`;
  }
  function sheet() {
    return `<h2>${tr("考前一頁通","Revision sheet")}</h2>
      <p class="no-print">${tr("列印建議：A4、直向、縮放至一頁；實際頁數受瀏覽器和字體影響。","Print suggestion: A4 portrait, fit to one page; actual pagination depends on the browser and fonts.")}</p>
      <div class="no-print actions">${button(tr("列印","Print"),"print")}</div>
      <article class="sheet">
        ${Object.entries(topics).map(([k,t])=>`<section><h3>${t.chapter} ${esc(tx(t.name))}</h3><p>${esc(tx(t.card))}</p></section>`).join("")}
        <section><h3>${tr("其他儀器用途","Other apparatus functions")}</h3>
          <p>${tr(
            "本生燈：加熱；隔熱墊：保護桌面；鐵絲網：承托加熱儀器；三腳架：支撐鐵絲網；漏斗：承托濾紙；架和夾：固定儀器。",
            "Bunsen burner: heating; insulating mat: bench protection; wire gauze: supporting heated apparatus; tripod: supporting gauze; filter funnel: supporting filter paper; stand and clamp: fixing apparatus."
          )}</p></section>
        <section><h3>${tr("重要提醒","Important reminder")}</h3><p>${tr(
          "只限 Chapter 1。不是急救指南、實際實驗指引或學校正式試卷。量度圖與操作為原創虛擬示意。",
          "Chapter 1 only. Not a first-aid guide, real-experiment instruction or official school paper. Diagrams and operations are original virtual representations."
        )}</p></section>
      </article>`;
  }

  function teacher() {
    const qs=poolFor(filter).filter(q=>teacherType==="all" || q.type===teacherType);
    return `<h2>${tr("教師／答案檢視","Teacher / answer view")}</h2>
      <p class="note">${tr("沒有密碼或權限保護。前端答案不是秘密；這不是正式考試平台。","There is no password or access control. Front-end answers are not secret; this is not a secure examination platform.")}</p>
      <label>${tr("範圍","Scope")} <select id="teacher-filter">${topicOptions(filter)}</select></label>
      <label>${tr("題型","Type")} <select id="teacher-type"><option value="all">${tr("全部","All")}</option>
        ${[...new Set(bank.map(q=>q.type))].map(t=>`<option value="${t}" ${teacherType===t?"selected":""}>${t}</option>`).join("")}</select></label>
      <div class="actions">
        ${button(tr("列印重點","Print revision sheet"),"nav-sheet")}
        ${button(tr("匯出學習摘要","Export learning summary"),"export")}
        ${button(tr("執行內建自檢","Run built-in checks"),"tests")}
      </div>
      ${testOutput?`<pre aria-live="polite">${esc(testOutput)}</pre>`:""}
      <h3>${tr("教材審核及待核實事項","Content review and pending issues")}</h3>
      <ul>${review.map(r=>`<li>${esc(tx(r))}</li>`).join("")}</ul>
      <h3>${tr("教材覆蓋表","Coverage table")}</h3>
      <table><tbody>${Object.entries(topics).map(([k,t])=>
        `<tr><td>${t.chapter} ${esc(tx(t.name))}</td><td>${bank.filter(q=>q.topic===k).map(q=>q.id).join(", ")}</td><td>${t.count}</td></tr>`).join("")}</tbody></table>
      <p>${tr("目前顯示","Showing")} ${qs.length} ${tr("題","questions")}</p>
      ${qs.map(q=>`<details><summary>${q.id} [${q.type}] ${esc(tx(q.prompt))}</summary>
        <p>${esc(tx(q.learningObjective))}</p>
        ${visual(q,q.answer)}
        <ul>${q.options.map(o=>`<li>${o.id}: ${esc(tx(o.text))}</li>`).join("")}</ul>
        ${q.items.length?`<p>${q.items.map(i=>esc(tx(i.text))).join("； ")}</p>`:""}
        <p><strong>${tr("答案：","Answer: ")}</strong>${esc(fmt(q,q.answer))}</p>
        <p>${esc(tx(q.explanation))}</p><p>${esc(tx(q.misconception))}</p>
        <p>${esc(q.sourceNote)} · ${q.reviewStatus} · ${q.difficulty}</p>
      </details>`).join("")}`;
  }
  function help() {
    return `<h2>${tr("說明與私隱","Help and privacy")}</h2>
      <ul>
        <li>${tr("預設不計時；模擬卷可選 20 分鐘。倒數在離開頁面期間仍繼續，恢復時以時間戳計算。","Untimed by default; mocks optionally last 20 minutes. The countdown continues while away and is restored using a timestamp.")}</li>
        <li>${tr("單選、多選、配對、分類、排序、圖像、數值及虛擬操作均可用鍵盤完成。","Single choice, multi-select, matching, classification, ordering, images, numbers and virtual operations support keyboard use.")}</li>
        <li>${tr("多選、配對、排序及操作須整題正確才得分；重做不提高首次正確率。","Multi-select, matching, ordering and operations need full correctness for a mark; retries do not increase first-attempt accuracy.")}</li>
        <li>${tr("弱項抽題約八成位置優先未答、未訂正及待練題，其餘由其他題補入；題目不足時使用可用題目。沒有 AI 診斷。","About 80% of targeted slots prioritise unseen, uncorrected and queued questions; remaining slots use other questions where available. There is no AI diagnosis.")}</li>
        <li>${tr("模擬卷採固定 20 題藍圖並打亂次序，比例為 3／4／4／9；不是無限生成試卷。","Mocks use a fixed 20-question blueprint in shuffled order, with a 3/4/4/9 chapter split; papers are not generated without limit.")}</li>
        <li>${tr("進行模擬卷時，須先交卷或放棄，才能開啟其他答案、精讀及教師頁。這是介面限制，不是防作弊保安。","During an active mock, submit or abandon before opening revision or answer views. This is an interface restriction, not anti-cheating security.")}</li>
        <li>${tr("不收集姓名、學號或電郵；沒有廣告、追蹤或資料上傳。紀錄只在目前瀏覽器／裝置，不會自動同步。","No names, student numbers or email addresses are collected. There are no ads, tracking or uploads. Records stay in this browser/device and do not sync automatically.")}</li>
        <li>${tr("資料含版本號；讀寫失敗仍可當次作答。匯出只提供摘要，不提供匯入不可信資料的功能。","Data has a version number; read/write failure does not prevent the current session. Export provides a summary; importing untrusted data is not supported.")}</li>
        <li>${tr("請用單一分頁使用，以免不同分頁互相覆寫本機紀錄。","Use one tab at a time to avoid tabs overwriting local records.")}</li>
        <li>${tr("這是虛擬溫習工具，不要按遊戲進行真實加熱、混合化學品、點火或自行急救。","This is a virtual revision tool. Do not use it to perform real heating, chemical mixing, ignition or independent first aid.")}</li>
      </ul>`;
  }
  function activeMock() {
    return db.session?.mode==="mock" && !db.session.done;
  }
  function navigate(to) {
    if(activeMock() && !["home","help","session"].includes(to)) {
      alert(tr("模擬卷進行中。請先交卷或放棄，才開啟溫習／答案頁。","A mock is active. Submit or abandon it before opening revision or answer views."));
      return;
    }
    view=to;render();
  }
  function render() {
    const old=document.activeElement?.id;
    const sel=document.activeElement?.selectionStart;
    document.documentElement.lang=db.lang==="zh"?"zh-Hant":"en";
    document.title=tr("科學特工學院：考前衝刺","Science Agent Academy: Exam Revision");
    const pages={home,chapters,session:sessionHTML,wrong:wrongBook,report,sheet,teacher,help};
    $("app").innerHTML=header()+`<main id="main" tabindex="-1">
      <p id="storage" class="note" ${storageOK?"hidden":""}>${tr(
        "本機儲存不可用或原資料損壞；本次仍可作答。關閉後紀錄可能不保留。",
        "Storage is unavailable or previous data was invalid. This session still works, but may not survive closing."
      )}</p>${(pages[view]||home)()}
      <footer>${tr("Chapter 1 專用 · 原創虛擬圖示 · 無追蹤 · 不代表考試掌握程度","Chapter 1 only · original virtual diagrams · no tracking · not a measure of exam mastery")}</footer>
      </main>`;
    if(old && $(old)) {
      $(old).focus();
      try {if(typeof sel==="number") $(old).setSelectionRange(sel,sel);} catch(e){}
    }
    updateClock();
  }
  function updateClock() {
    const s=db.session;
    if(!s || s.mode!=="mock" || s.done) return;
    if(s.deadline && now()>=s.deadline) {endMock(true);return;}
    const e=$("clock");
    if(e) {
      const seconds=s.deadline?Math.max(0,Math.ceil((s.deadline-now())/1000)):null;
      e.textContent=seconds===null?tr("不計時","Untimed"):
        `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`;
    }
  }
  function beep(ok) {
    if(!db.sound) return;
    try {
      const C=window.AudioContext||window.webkitAudioContext;
      const ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=ok?660:330;
      g.gain.value=.025;o.connect(g);g.connect(ctx.destination);
      o.start();o.stop(ctx.currentTime+.09);o.onended=()=>ctx.close();
    } catch(e){}
  }
  function exportSummary() {
    const data={
      version:1,exportedAt:new Date().toISOString(),
      distinctSubmitted:Object.keys(db.records).length,
      firstCorrect:Object.values(db.records).filter(r=>r.firstCorrect).length,
      corrected:Object.values(db.records).filter(r=>r.corrected).length,
      hints:db.hints,
      topics:Object.fromEntries(Object.keys(topics).map(k=>[k,topicStats(k)])),
      records:db.records,
      notice:"Local revision data, not an exam-mastery score. No personal identity fields."
    };
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="science-learning-summary.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.addEventListener("input",e=>{
    if(e.target.dataset.field==="number") setAnswer("number",e.target.value);
  });
  document.addEventListener("change",e=>{
    const t=e.target;
    if(t.dataset.field && t.dataset.field!=="number")
      setAnswer(t.dataset.field,t.value,t.dataset.row);
    if(t.id==="wrong-filter" || t.id==="teacher-filter") {filter=t.value;render();}
    if(t.id==="teacher-type") {teacherType=t.value;render();}
  });
  document.addEventListener("click",e=>{
    const b=e.target.closest("button[data-action]");
    if(!b || b.disabled) return;
    const act=b.dataset.action;
    if(act.startsWith("nav-")) {navigate(act.slice(4));return;}
    if(act==="language") {db.lang=db.lang==="zh"?"en":"zh";save();render();return;}
    if(act==="sound") {db.sound=!db.sound;save();render();return;}
    if(act==="quick") {
      const pool=poolFor($("quick-scope").value);
      start("quick",pick(pool,Math.min(10,pool.length)),true);return;
    }
    if(act==="weak") {start("weak",pick(bank,10));return;}
    if(act==="mock") {start("mock",shuffled(mockIds),false,Number($("mock-time").value));return;}
    if(act==="topic-cards" || act==="topic-run") {
      start("chapter",pick(poolFor(b.dataset.topic),topics[b.dataset.topic].count),act==="topic-cards");return;
    }
    if(act==="topic-wrong") {filter=b.dataset.topic;navigate("wrong");return;}
    if(act==="resume") {navigate("session");return;}
    if(act==="abandon") {
      if(confirm(tr("確定放棄未完成活動？已提交的練習紀錄仍保留。","Abandon the unfinished activity? Submitted practice records will remain."))) {
        db.session=null;save();navigate("home");
      } return;
    }
    if(act==="retry-id") {start("wrong",[b.dataset.id]);return;}
    if(act==="retry-wrong") {
      const ids=poolFor(filter).filter(q=>wrongRecord(q.id)||db.later.includes(q.id)).map(q=>q.id);
      start("wrong",ids);return;
    }
    if(act==="retry-result") {
      start("wrong",db.session.ids.filter(id=>!db.session.submitted[id]?.ok));return;
    }
    if(act==="export") {exportSummary();return;}
    if(act==="clear") {
      if(confirm(tr("永久清除這個瀏覽器的全部本機紀錄及進行中活動？","Permanently clear all local records and the current activity in this browser?"))) {
        db=fresh();
        try {localStorage.removeItem(KEY);storageOK=true;} catch(e){storageOK=false;}
        view="home";save();render();
      }return;
    }
    if(act==="print") {window.print();return;}
    if(act==="tests") {
      testOutput=window.SAA.runTests?window.SAA.runTests():tr("tests.js 尚未載入。","tests.js is not loaded.");
      render();return;
    }
    if(act==="zoom") {large=!large;render();return;}
    if(act==="alternative") {textAlternative=!textAlternative;render();return;}
    if(act==="later-id") {
      if(!db.later.includes(b.dataset.id)) db.later.push(b.dataset.id);
      save();b.textContent=tr("已加入","Queued");return;
    }

    const s=db.session;
    if(!s || s.done && !["later"].includes(act)) return;
    const q=byId[s.ids[s.index]],a=s.answers[q.id];
    if(act==="skip-cards") {s.stage="run";save();render();return;}
    if(act==="submit-practice") {submitPractice();return;}
    if(act==="submit-mock") {endMock(false);return;}
    if(act==="finish-practice") {
      const left=s.ids.filter(id=>!s.submitted[id]).length;
      if(left && !confirm(tr(`仍有 ${left} 題未提交。結束本次練習？`,`${left} questions are not submitted. Finish this practice?`))) return;
      s.done=true;s.stage="result";save();render();return;
    }
    if(act==="previous" || act==="next" || act==="jump") {
      s.index=act==="jump"?Number(b.dataset.index):
        Math.max(0,Math.min(s.ids.length-1,s.index+(act==="next"?1:-1)));
      save();render();$("question-title")?.scrollIntoView({block:"start"});return;
    }
    if(act==="flag") {
      s.flags=s.flags.includes(q.id)?s.flags.filter(id=>id!==q.id):[...s.flags,q.id];
      save();render();return;
    }
    if(act==="later") {
      if(!db.later.includes(q.id)) db.later.push(q.id);
      save();b.textContent=tr("已加入待練","Queued");return;
    }
    if(act==="hint") {
      if(s.mode==="mock") return;
      if(!s.hintShown[q.id]) {
        db.hints[q.id]=(db.hints[q.id]||0)+1;
        s.hintShown[q.id]=true;
      } else s.hintShown[q.id]=false;
      save();render();return;
    }
    if(s.submitted[q.id]) return;
    if(act==="move") {
      const i=Number(b.dataset.index),j=i+Number(b.dataset.delta);
      if(j>=0 && j<a.length) [a[i],a[j]]=[a[j],a[i]];
    } else if(act==="balance") {
      if(a.length>=100) return;
      a.push(b.dataset.value);
    } else if(act==="reset-operation") s.answers[q.id]=defaultAnswer(q);
    else if(act==="hole") a.hole=b.dataset.value;
    else return;
    s.touched[q.id]=true;save();render();
  });

  window.SAA.engine={grade,complete,validAnswer,validState,fresh,recordInto,byId};
  window.addEventListener("pagehide",save);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)updateClock();});
  setInterval(updateClock,1000);
  render();
})();