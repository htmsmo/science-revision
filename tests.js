"use strict";
(() => {
  const S=window.SAA;
  S.runTests=()=>{
    const out=[];
    let pass=0,fail=0;
    const check=(name,fn)=>{
      try {
        if(!fn()) throw new Error("assertion returned false");
        pass++;out.push("PASS — "+name);
      } catch(e) {
        fail++;out.push("FAIL — "+name+" — "+e.message);
      }
    };
    const qs=S.questions,e=S.engine;
    check("Exactly 80 independent question IDs",()=>qs.length===80);
    check("No duplicate IDs",()=>new Set(qs.map(q=>q.id)).size===80);
    check("Topic counts",()=>Object.entries(S.topics).every(([k,t])=>
      qs.filter(q=>q.topic===k).length===t.count));
    check("Chapter counts: 8 / 12 / 12 / 48",()=>
      ["1.1","1.2","1.3","1.4"].map(c=>qs.filter(q=>q.chapter===c).length).join(",")==="8,12,12,48");
    check("All required bilingual fields",()=>qs.every(q=>
      ["prompt","explanation","misconception","learningObjective"].every(k=>
        typeof q[k]?.zh==="string" && q[k].zh.trim() &&
        typeof q[k]?.en==="string" && q[k].en.trim()) &&
      q.options.every(o=>o.text.zh&&o.text.en) &&
      q.items.every(i=>i.text.zh&&i.text.en)));
    check("All formal questions approved and sourced",()=>qs.every(q=>
      q.reviewStatus==="approved" && q.sourceNote && q.scoringRule.maxScore===1));
    check("Eight required question types",()=>[
      "single","multi","match","classify","sort","image","number","operation"
    ].every(t=>qs.some(q=>q.type===t)));
    check("Every answer has a valid structure and option IDs",()=>
      qs.every(q=>e.validAnswer(q,q.answer)));
    check("Every canonical answer scores correctly",()=>qs.every(q=>e.grade(q,q.answer).ok));
    check("Blank answers do not score",()=>qs.every(q=>!e.grade(q,null).ok));
    check("Numeric values share diagram configuration",()=>qs
      .filter(q=>q.type==="number").every(q=>q.answer.value===q.visualConfig.value));
    check("Scale values lie on equal-interval marks",()=>qs
      .filter(q=>["ruler","cylinder","thermometer"].includes(q.visualConfig?.kind))
      .every(q=>{
        const v=q.visualConfig,n=(v.value-v.min)/v.step;
        return v.step>0 && v.max>v.min && v.value>=v.min && v.value<=v.max &&
          Math.abs(n-Math.round(n))<1e-8;
      }));
    check("Numeric wrong unit rejected",()=>{
      const q=e.byId.M01;
      return !e.grade(q,{value:q.answer.value,unit:"b"}).ok;
    });
    check("Numeric off-mark value rejected",()=>{
      const q=e.byId.M01;
      return !e.grade(q,{value:6.1,unit:"a"}).ok;
    });
    check("Multi-select missing or extra choice rejected",()=>{
      const q=e.byId.S09;
      return !e.grade(q,["a","b"]).ok && !e.grade(q,["a","b","c","d"]).ok;
    });
    check("Multi-select order does not matter",()=>e.grade(e.byId.S09,["c","a","b"]).ok);
    check("Wrong sorting order rejected",()=>!e.grade(e.byId.T01,["b","a","c","d"]).ok);
    check("Incomplete match rejected",()=>!e.grade(e.byId.A01,{r0:"a"}).ok);
    check("Wrong balance sequence rejected",()=>!e.grade(e.byId.M10,["b","a","c","d"]).ok);
    check("Wrong burner setting rejected",()=>!e.grade(e.byId.B08,{
      hole:"closed",color:"yellow",shape:"irregular"
    }).ok);
    check("First answer retained after correction",()=>{
      const d=e.fresh(),q=e.byId.E01;
      e.recordInto(d,q,"b",false);
      e.recordInto(d,q,"a",true);
      return d.records.E01.first==="b" && d.records.E01.firstCorrect===false &&
        d.records.E01.corrected===true && d.records.E01.attempts===2 &&
        !d.later.includes("E01");
    });
    check("Correct-first retry does not create another independent record",()=>{
      const d=e.fresh(),q=e.byId.E01;
      e.recordInto(d,q,"a",true);
      e.recordInto(d,q,"a",true);
      return Object.keys(d.records).length===1 && d.records.E01.firstCorrect;
    });
    check("State JSON round trip",()=>{
      const d=e.fresh();
      e.recordInto(d,e.byId.E01,"a",true);
      return e.validState(JSON.parse(JSON.stringify(d)));
    });
    check("Malformed stored records rejected",()=>{
      const d=e.fresh();d.records.E01={first:"a"};
      return !e.validState(d);
    });
    check("Unsupported saved-data version rejected",()=>{
      const d=e.fresh();d.version=999;return !e.validState(d);
    });
    check("Mock has 20 unique approved questions",()=>
      S.mockIds.length===20 && new Set(S.mockIds).size===20 &&
      S.mockIds.every(id=>e.byId[id]?.reviewStatus==="approved"));
    check("Mock chapter split 3 / 4 / 4 / 9",()=>
      ["1.1","1.2","1.3","1.4"].map(c=>
        S.mockIds.filter(id=>e.byId[id].chapter===c).length).join(",")==="3,4,4,9");
    const diff=Object.fromEntries(["basic","application","integrated"].map(d=>[
      d,qs.filter(q=>q.difficulty===d).length
    ]));
    out.push("Difficulty labels: "+JSON.stringify(diff));
    out.push("");
    out.push(`RESULT: ${pass} passed, ${fail} failed.`);
    out.push("These are data/pure-function checks run in this browser.");
    out.push("They do NOT establish mobile layout, printing, keyboard usability,");
    out.push("storage-failure recovery, timer end-to-end behaviour or offline packaging.");
    return out.join("\n");
  };
})();