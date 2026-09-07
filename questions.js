"use strict";
(() => {
  const L = s => {
    const p = s.split("|");
    if (p.length !== 2) throw new Error("Bilingual field: " + s);
    return {zh:p[0], en:p[1]};
  };
  const lines = s => s ? s.split(";").map(L) : [];
  const topics = {
    E:{
      chapter:"1.1", count:8,
      name:L("學習科學|Learning about science"),
      mission:L("證據偵探|Evidence detective"),
      objective:L("根據證據判斷科學知識及其應用|Judge evidence, scientific knowledge and its applications"),
      card:L("科學研究大自然，建基於證據；實驗是收集證據的常用方法，但不是唯一方法。新證據可能促使科學知識改變，現有知識也有其限制。科學、科技和數學可共同解決問題。|Science studies Nature and is based on evidence. Experiments are a common, but not the only, way to collect evidence. New evidence may change scientific knowledge, which has limitations. Science, technology and mathematics can work together."),
      trap:L("科學知識不是永遠不變；指定工作的分類不代表整個項目只涉及一個範疇。|Scientific knowledge is not unchangeable. Classifying one specified task does not put the whole project in only one field.")
    },
    F:{
      chapter:"1.2", count:12,
      name:L("公平測試與探究|Fair tests and investigations"),
      mission:L("公平測試工程師|Fair-test engineer"),
      objective:L("辨認變量並評估公平測試設計|Identify variables and evaluate fair-test designs"),
      card:L("自變量 Independent variable：刻意改變。因變量 Dependent variable：量度或觀察的結果。控制變量 Controlled variables：保持相同的相關條件。探究類型包括公平測試、尋找規律及分類。|Independent variable: deliberately changed. Dependent variable: measured or observed outcome. Controlled variables: relevant conditions kept the same. Investigations include fair testing, pattern seeking and classifying."),
      trap:L("公平不是所有條件都不變，而是只改變所探究的變量。不要同時換車、換地面和改斜坡高度。|A fair test does not keep everything unchanged: the variable under study changes. Do not change the car, floor and ramp height together.")
    },
    S:{
      chapter:"1.3", count:12,
      name:L("實驗室安全|Laboratory safety"),
      mission:L("安全巡查員|Safety inspector"),
      objective:L("辨認危害並選擇安全回應|Recognise hazards and choose safe responses"),
      card:L("遵守老師指示；保持通道暢通；加熱或混和時戴安全眼鏡；束髮和收好領帶。意外發生時保持鎮靜，立即報告老師並遵從指示。火三角包括燃料、足夠高的溫度及氧。|Follow the teacher's instructions, keep passages clear, wear safety spectacles when heating or mixing, and secure long hair and ties. In an accident, keep calm, report immediately and follow instructions. The fire triangle includes fuel, sufficiently high temperature and oxygen."),
      trap:L("虛擬安全題不是急救或自行滅火指南。不要品嚐實驗室化學品，也不要擅自嗅聞。|Virtual safety questions are not first-aid or firefighting instructions. Do not taste laboratory chemicals or smell them without instructions.")
    },
    A:{
      chapter:"1.4", count:10,
      name:L("儀器及裝置圖|Apparatus and diagrams"),
      mission:L("儀器補給站|Apparatus supply station"),
      objective:L("依指定功能選擇儀器及辨認裝置圖規則|Select apparatus for specified functions and recognise diagram rules"),
      card:L("試管／大試管、燒杯及錐形瓶可盛載物質；試劑瓶儲存液體。滴管移取數滴液體，刮勺移取少量固體，玻璃棒攪拌。試管架放置試管，試管夾加熱時夾持，試管刷清洗。裝置切面圖不加陰影、比例合理、直線用尺畫，並標示名稱。|Test/boiling tubes, beakers and conical flasks hold substances; reagent bottles store liquids. Droppers transfer drops, spatulas transfer small amounts of solids, and glass rods stir. Racks hold tubes, holders grip tubes during heating, and brushes clean them. Sectional diagrams use proportional, unshaded line drawings with labels and ruled straight lines."),
      trap:L("盛載液體的儀器不只一種。題目須按儲存、移取、夾持等指定用途選擇。|More than one apparatus can hold liquids. Choose according to the specified task, such as storage, transfer or support.")
    },
    T:{
      chapter:"1.4", count:8,
      name:L("移取溶液|Transferring solutions"),
      mission:L("溶液移取訓練|Solution-transfer training"),
      objective:L("按教材情境安排移取溶液操作|Arrange solution-transfer actions in the stated classroom context"),
      card:L("倒取：瓶塞倒轉放置；試管傾斜；慢慢倒至約三分之一滿；立即蓋好瓶塞並把試管放回架。滴管：先擠膠囊再浸入，慢慢放鬆吸液，按本教材示範輕觸原試管內壁移除多餘液滴，再移至另一試管滴出；最後用另一容器的水清洗。|Pouring: place the stopper upside down, tilt the test tube, pour slowly to about one-third full, then recap promptly and return the tube to its rack. Dropper: squeeze before immersion, release slowly to draw liquid, touch the original tube's inner wall as specified in these notes, transfer and dispense, then wash using water in another container."),
      trap:L("這是特定課堂示範，不是所有分析實驗通用的滴管程序。遊戲不要求真實混合或加熱。|This is a specific classroom procedure, not a universal analytical-laboratory protocol. No real mixing or heating is required.")
    },
    M:{
      chapter:"1.4", count:12,
      name:L("量度與讀數|Measurement and readings"),
      mission:L("量度解碼室|Measurement decoder"),
      objective:L("選擇量度工具、讀取刻度並使用去皮功能|Select measuring tools, read scales and use tare"),
      card:L("長度：尺／捲尺，km、m、cm、mm。體積：量筒，m³、cm³、L、mL。質量：天平，kg、g、mg。溫度：溫度計，°C。時間：秒錶，s、min、h。尺的視線與標度垂直；凹形彎液面讀底部，眼睛與底部同高。空容器上磅後去皮，再加入物質。|Length: ruler/tape, km, m, cm, mm. Volume: measuring cylinder, m³, cm³, L, mL. Mass: balance, kg, g, mg. Temperature: thermometer, °C. Time: stopwatch, s, min, h. View a ruler perpendicularly and a concave meniscus at eye level with its bottom. Tare the empty container before adding the substance."),
      trap:L("視線對齊不是把讀數改成較喜歡的數字。去皮後的顯示值不包括已去皮的空容器質量。|Correct viewing is not choosing a preferred reading. After taring, the display excludes the tared empty container.")
    },
    U:{
      chapter:"1.4", count:10,
      name:L("誤差、準確性與精密性|Errors, accuracy and precision"),
      mission:L("誤差調查局|Error investigation bureau"),
      objective:L("區分不確定度、讀錯、零位誤差、準確性及精密性|Distinguish uncertainty, mistakes, zero error, accuracy and precision"),
      card:L("讀數限制是最小相鄰刻度間隔。在題目指定的簡化刻度情境，可用其一半估算讀數不確定度；這不是量度值本身。視差來自不正確觀察角度。零位誤差是應顯示零時卻不為零。準確：接近真值；精密：重複讀數接近。|The reading limitation is the smallest adjacent scale interval. In the stated simplified scale context, half the interval estimates reading uncertainty; it is not the measured value. Parallax arises from an incorrect viewing angle. Zero error occurs when an instrument should indicate zero but does not. Accuracy concerns closeness to the true value; precision concerns agreement among repeated readings."),
      trap:L("讀數一致不保證準確；不確定性不等同粗心讀錯。比較平均值時，必須明確說是平均值。|Consistent readings are not necessarily accurate. Uncertainty is not a careless reading mistake. State explicitly when comparing means.")
    },
    B:{
      chapter:"1.4", count:8,
      name:L("本生燈與火焰|Bunsen burner and flames"),
      mission:L("本生燈觀察室|Bunsen observation room"),
      objective:L("比較氣孔狀態及本生焰並辨認安全加熱姿勢|Compare air-hole states and flames and recognise safe heating posture"),
      card:L("氣孔關閉：黃色光焰 luminous flame，形狀不規則，較安靜。氣孔打開：藍色無光焰 non-luminous flame，形狀規則，較響亮；通常用作加熱。用試管夾夾持大試管，稍微傾斜，管口不朝向人，按筆記描述輕輕移動。|Air hole closed: yellow luminous flame, irregular shape and quieter. Air hole open: blue non-luminous flame, regular shape and noisier; normally used for heating. Hold a boiling tube with a holder at a slight angle, point it away from people and move it gently as described in the notes."),
      trap:L("較明亮不代表較適合加熱。這裏不教授完整點火程序，也不要求操作真實本生燈。|A brighter flame is not necessarily the suitable heating flame. No complete lighting procedure or real burner operation is taught.")
    }
  };

  const Qs = [];
  function Q(id,type,prompt,optionText,answer,explanation,misconception,extra={}) {
    const topic=id[0], n=Number(id.slice(1));
    const options=lines(optionText).map((text,i)=>({id:String.fromCharCode(97+i),text}));
    let a=answer;
    const items=extra.items ? lines(extra.items).map((text,i)=>({id:"r"+i,text})) : [];
    if ((type==="match" || type==="classify") && Array.isArray(a)) {
      a=Object.fromEntries(a.map((v,i)=>["r"+i,v]));
    }
    const q={
      id,chapter:topics[topic].chapter,topic,
      learningObjective:topics[topic].objective,
      difficulty:(n-1)%5<2?"basic":(n-1)%5<4?"application":"integrated",
      type,prompt:L(prompt),options,items,answer:a,
      explanation:L(explanation),misconception:L(misconception),
      sourceNote:topics[topic].chapter+" — supplied Chapter 1 bilingual notes",
      reviewStatus:"approved",
      visualConfig:null,
      scoringRule:{mode:"all-or-nothing",maxScore:1},
      ...extra
    };
    q.items=items;
    Qs.push(q);
  }
  function N(id,prompt,visual,units,unit,explanation,misconception) {
    Q(id,"number",prompt,units,
      {value:visual.value,unit,tolerance:1e-9},
      explanation,misconception,
      {visualConfig:visual,scoringRule:{mode:"numeric-and-unit",maxScore:1,tolerance:1e-9}});
  }

  // 1.1: 8 independent questions
  Q("E01","single",
    "甚麼最能支持一項科學說法？|What best supports a scientific claim?",
    "可檢查的觀察或實驗證據|Checkable observational or experimental evidence;很多人轉發該說法|Many people sharing it;說話者很有自信|A confident speaker","a",
    "科學說法須有證據支持。受歡迎程度或自信不能代替證據。|Scientific claims require evidence. Popularity or confidence cannot replace it.",
    "多人相信不等於證據充分。|A popular belief is not necessarily well supported.");

  Q("E02","single",
    "可靠的新證據與原有結論不符，應怎樣做？|Reliable new evidence conflicts with an earlier conclusion. What should be done?",
    "隱藏新證據|Hide the new evidence;檢視證據並在有需要時修改結論|Examine the evidence and revise the conclusion if needed;因為舊結論較早出現而保留它|Keep the old conclusion because it came first","b",
    "科學知識可能隨新證據改變。應檢查證據，而非為保留結論而忽略它。|Scientific knowledge may change with new evidence. Evidence should be examined rather than ignored to protect a conclusion.",
    "修改有證據不足的結論不是科學失敗。|Revising an inadequately supported conclusion is not a failure of science.");

  Q("E03","multi",
    "選出所有符合科學性質的說法。|Select all statements that describe science correctly.",
    "科學研究大自然|Science studies Nature;現有科學知識能解答所有問題|Present science can answer every question;觀察也可提供證據|Observations can also provide evidence;科學知識有其限制|Scientific knowledge has limitations",
    ["a","c","d"],
    "科學研究自然並依靠證據。實驗不是唯一證據來源，而現有知識不能解答所有問題。|Science studies Nature and relies on evidence. Experiments are not the only source, and present knowledge cannot answer every question.",
    "不能把科學簡化為只做實驗。|Science is not limited to doing experiments.");

  Q("E04","single",
    "發現部分微生物會致病，最直接增加了哪方面的了解？|Discovering that some microorganisms cause disease most directly increased understanding of what?",
    "所有微生物都有害|All microorganisms are harmful;某些疾病的成因|The causes of some diseases;所有疾病的治療必定相同|All diseases need the same treatment","b",
    "這項發現有助解釋某些疾病的成因。『部分』不能推論成『所有』。|The discovery helps explain the causes of some diseases. 'Some' does not justify a claim about 'all'.",
    "不要把部分微生物的特徵推廣至全部。|Do not generalise a feature of some microorganisms to all.");

  Q("E05","classify",
    "把每項指定工作按主要範疇分類；整個項目仍可跨範疇。|Classify each specified task by its main field; the whole project may span fields.",
    "科學|Science;科技|Technology;數學|Mathematics",
    ["a","b","c"],
    "研究疾病成因主要運用科學。改良機器主要屬科技，而統計分析主要屬數學；三者可以合作。|Studying disease causes mainly uses science. Improving machinery mainly uses technology, while statistical analysis mainly uses mathematics; they can work together.",
    "分類的是指定工作，不是把整個抗疫項目放入單一範疇。|The classification concerns each task, not the whole disease-control project.",
    {items:"研究疾病成因|Study the cause of a disease;改良口罩生產機器|Improve mask-production machinery;統計比較新藥成效|Compare drug effectiveness statistically"});

  Q("E06","single",
    "開發其他能源以減少使用化石燃料，主要展示哪項應用？|Developing other energy sources to reduce fossil-fuel use mainly illustrates which application?",
    "明智管理自然資源|Managing natural resources wisely;證明自然資源無限|Proving natural resources are unlimited;停止使用所有科技|Stopping all technology use","a",
    "科學知識可協助管理自然資源的使用。發展其他能源並不表示資源無限。|Scientific knowledge can help manage natural-resource use. Developing other energy sources does not mean resources are unlimited.",
    "減少使用某種資源，不等於資源永不耗盡。|Reducing the use of a resource does not make it inexhaustible.");

  Q("E07","single",
    "微波的發現促進無線通訊，最符合哪個描述？|The discovery of microwaves helped wireless communication develop. Which description fits best?",
    "科學知識可促進科技發展|Scientific knowledge can promote technology;科技發展不需要知識|Technology develops without knowledge;每项發現只能用於一項發明|Each discovery can support only one invention","a",
    "科學發現可成為科技發展的基礎。這個例子並沒有把發現與應用限制為一對一。|Scientific discoveries can support technological development. This example does not limit discoveries and applications to a one-to-one relationship.",
    "發現自然現象與研製工具相關，但不是同一項工作。|Discovering a natural phenomenon and developing a tool are related but distinct tasks.");

  Q("E08","single",
    "某技術可改善生活，但也可能被濫用。哪個結論最合理？|A technology can improve life but can also be misused. Which conclusion is most reasonable?",
    "有好處便不可能有風險|Anything beneficial has no risks;應考慮用途及可能造成的傷害|Its uses and possible harms should be considered;所有科學應用都應停止|All applications of science should stop","b",
    "科學應用可以帶來好處。是否造成禍害也與使用方式有關。|Applications of science can bring benefits. Harm also depends on how they are used.",
    "有益和有風險並不互相排斥。|Benefits and risks can coexist.");

  // 1.2: 12 questions
  const car="同一玩具車從同一斜坡頂端標記靜止釋放，不施推力，在同一地面測試不同斜坡高度。";
  const carEn="The same toy car is released from rest at the same marked ramp-top position without a push, onto the same floor, at different ramp heights.";
  Q("F01","single",car+"自變量是甚麼？|"+carEn+" What is the independent variable?",
    "斜坡高度|Ramp height;行駛距離|Distance travelled;玩具車種類|Type of car","a",
    "刻意改變的是斜坡高度。其餘指定條件保持相同。|Ramp height is deliberately changed. The other specified conditions are kept the same.",
    "自變量不是最後讀取的結果。|The independent variable is not the final measured result.");

  Q("F02","single",car+"探究高度是否影響行駛距離，應量度甚麼？|"+carEn+" To investigate its effect on travel distance, what should be measured?",
    "車的顏色|Car colour;車離開斜坡後在地面行駛的距離|Distance travelled on the floor after leaving the ramp;學生的身高|Students' heights","b",
    "量度的因變量須對應研究問題。這裏的結果是在地面行駛的距離。|The dependent variable must match the question. Here, the outcome is distance travelled on the floor.",
    "方便量度的東西不一定是所需因變量。|An easy-to-measure quantity is not necessarily the required dependent variable.");

  Q("F03","multi",
    "研究斜坡高度對行駛距離的影響。選出所有應保持相同的條件。|Investigate how ramp height affects distance. Select all conditions that should be kept the same.",
    "玩具車|Toy car;斜坡頂端的釋放標記及不施推力|Marked ramp-top release position and no push;地面物料|Floor material;所測試的斜坡高度|Ramp height being tested",
    ["a","b","c"],
    "車、釋放方式及地面都可能影響結果，應控制。高度是所探究的變量，須刻意改變。|The car, release method and floor may affect the result and should be controlled. Height is the variable under study and must change.",
    "公平測試不代表自變量也不變。|A fair test does not keep the independent variable unchanged.");

  Q("F04","single",
    "甲用高斜坡和地氈，乙用低斜坡和木地板；同車、同釋放標記、不施推力。能單獨判斷高度的影響嗎？|A uses a high ramp and carpet; B uses a low ramp and wood flooring. The car, marked release position and no-push method are the same. Can height's effect be isolated?",
    "能，因為用了同一架車|Yes, because the same car is used;不能，地面也不同|No, the floor also differs;能，只要量尺相同|Yes, if the same ruler is used","b",
    "高度和地面同時改變。結果的差異不能只歸因於高度。|Both height and floor change. A difference in results cannot be attributed to height alone.",
    "控制一項條件不代表已控制所有相關條件。|Controlling one condition does not control all relevant conditions.");

  Q("F05","classify",
    "為高度公平測試設定條件：同一車、同一地面、同一斜坡頂端標記、不施推力。各設定應『改變』還是『保持相同』？|Configure a height fair test using the same car, floor, marked ramp-top position and no push. Should each setting change or stay the same?",
    "改變|Change;保持相同|Keep the same",["a","b","b"],
    "高度須有不同設定才能比較。車及釋放方法應保持相同，以減少其他因素的影響。|Different height settings allow comparison. The car and release method should remain the same to reduce other influences.",
    "不要為每次測試任意更換車或推力。|Do not arbitrarily change the car or pushing force between trials.",
    {items:"斜坡高度|Ramp height;玩具車|Toy car;釋放方式|Release method"});

  Q("F06","single",
    "只觀察並記錄每天同一位置的溫度，找出一週內的變化趨勢，主要是哪種探究？|Observing temperature at the same location each day to find its weekly trend is mainly which investigation?",
    "尋找規律|Pattern seeking;按外形分類|Classifying by shape;刻意改變溫度的公平測試|A fair test deliberately changing temperature","a",
    "這項工作找出觀察資料的變化規律。題目沒有刻意改變溫度。|The task seeks a pattern in observations. Temperature is not deliberately manipulated.",
    "有量度不一定就是公平測試。|An investigation with measurements is not necessarily a fair test.");

  Q("F07","single",
    "把儀器按『移取物質』及『支撐儀器』用途分組，主要是哪種探究？|Grouping apparatus by 'transferring substances' and 'supporting apparatus' is mainly which investigation?",
    "分類|Classifying;尋找每日變化|Seeking daily changes;測試高度影響|Testing a height effect","a",
    "這裏按共同用途分組。分類也是科學探究的一種類型。|The apparatus is grouped by shared functions. Classifying is a type of scientific investigation.",
    "科學探究不一定需要改變一個變量。|Not every scientific investigation changes a variable.");

  Q("F08","single",
    "學生想同時改車、地面及高度，以一次找出三者各自的影響。設計有甚麼問題？|A student changes the car, floor and height together to find each one's separate effect. What is the problem?",
    "無法分辨每項改變的獨立影響|The separate effects cannot be distinguished;量度距離便能自動排除問題|Measuring distance automatically fixes it;只要記錄很整齊就公平|Neat records make it fair","a",
    "同時改變多個相關因素會混淆比較。應按研究問題一次改變所探究的變量。|Changing several relevant factors together confounds the comparison. Change the variable under study according to the question.",
    "記錄整齊不會修正不公平的設計。|Neat records cannot repair an unfair design.");

  Q("F09","single",
    "為甚麼比較斜坡高度時要保持地面相同？|Why keep the floor the same when comparing ramp heights?",
    "避免地面差異影響距離比較|To avoid floor differences affecting the distance comparison;令所有距離必定相同|To force all distances to be identical;令自變量消失|To remove the independent variable","a",
    "控制條件是為了減少其他因素的影響。它不是為了迫使結果相同。|Conditions are controlled to reduce other influences. The aim is not to force identical results.",
    "公平測試容許因變量隨自變量而改變。|A dependent variable may change with the independent variable in a fair test.");

  Q("F10","single",
    "某測試的高度、車、地面和釋放方式全部相同，卻声稱比較了不同高度。最直接缺少甚麼？|A test keeps height, car, floor and release method identical but claims to compare different heights. What is missing?",
    "不同的高度設定|Different height settings;不同學生姓名|Different student names;不同顏色的記錄紙|Different paper colours","a",
    "比較高度的影響需要至少兩個不同高度設定。保持所有高度相同不能完成這個比較。|Comparing height effects needs at least two height settings. Identical heights cannot provide that comparison.",
    "『只改變一項』與『完全不改變』不同。|'Change only one factor' is not 'change nothing'.");

  Q("F11","single",
    "在控制條件相同的幾次測試中，較高斜坡的車行得較遠。哪個結論最有證據支持？|In several tests with the other conditions controlled, the car travelled farther from the higher ramp. Which conclusion is best supported?",
    "在這些測試條件下，較高斜坡對應較長距離|Under these test conditions, greater height corresponded to longer distance;所有車在所有地面必定如此|Every car on every floor must behave this way;車的顏色造成差異|The car's colour caused the difference","a",
    "結論應限於證據支持的條件。這些資料不能證明所有車和地面都必定相同。|A conclusion should stay within the conditions supported by evidence. These data do not establish the same outcome for every car and floor.",
    "有限測試不支持無條件的『永遠』結論。|Limited tests do not justify an unconditional 'always' claim.");

  Q("F12","single",
    "研究高度對行駛距離的影響；車、地面、頂端釋放標記及不施推力均相同。哪組記錄欄最切合問題？|Investigate height's effect on distance with car, floor, marked top release position and no push controlled. Which record columns best match the question?",
    "斜坡高度／行駛距離|Ramp height / distance travelled;學生姓名／車的顏色|Student name / car colour;日期／紙張大小|Date / paper size","a",
    "記錄須把每個自變量設定與其量度結果連結。高度和距離兩欄可直接用於比較。|Records should link each independent-variable setting to its measured outcome. Height and distance columns support the comparison directly.",
    "背景資料不能代替研究所需的數據。|Background details cannot replace the data needed for the investigation.");

  // 1.3: 12 questions
  Q("S01","image",
    "選出圖中所有需要改善的位置及正確改善方法。|Select all locations needing improvement and their correct actions.",
    "A：移走阻塞出口的書包|A: remove the bag blocking the exit;B：除去已戴好的安全眼鏡|B: remove the safety spectacles already being worn;C：把食物帶離實驗室|C: take the food out of the laboratory",
    ["a","c"],
    "出口和通道須保持暢通，實驗室內不可飲食。B 已戴安全眼鏡，不應因此要求除去。|Exits and passages must stay clear, and eating is not allowed in the laboratory. B is wearing safety spectacles and should not remove them for that reason.",
    "巡查須同時辨認危害及合適改善方法。|Inspection requires both recognising a hazard and choosing a suitable correction.",
    {visualConfig:{kind:"safety"}});

  Q("S02","single",
    "實驗室發生意外，學生首先應採取哪種回應？|An accident occurs in the laboratory. What response should a student take first?",
    "保持鎮靜，立即報告老師並遵從指示|Keep calm, report immediately and follow the teacher's instructions;隱瞞以免被責罵|Hide it to avoid being blamed;自行嘗試陌生處理方法|Try an unfamiliar treatment alone","a",
    "應立即求助並按老師指示處理。遊戲不要求學生自行進行急救或滅火。|Seek help immediately and follow the teacher's instructions. This game does not ask students to carry out first aid or firefighting independently.",
    "小意外也不應隱瞞。|Even a seemingly small accident should not be hidden.");

  Q("S03","multi",
    "老師准許進行加熱活動前，選出所有合適準備。|Before a teacher-authorised heating activity, select all appropriate preparations.",
    "戴安全眼鏡|Wear safety spectacles;束起長髮及收好領帶|Secure long hair and the tie;把書包放在出口|Put a bag at the exit;按老師指示檢查安排|Check arrangements as instructed by the teacher",
    ["a","b","d"],
    "眼睛、頭髮和衣物都須適當保護。通道仍須保持暢通。|Eyes, hair and clothing need appropriate protection. Passages must also remain clear.",
    "做好個人防護不代表可以阻塞出口。|Personal protection does not justify blocking an exit.");

  Q("S04","single",
    "同學加熱試管時管口朝向另一人，應指出哪項問題？|A student points a heated test tube at another person. What is the problem?",
    "管口不應朝向任何人|The opening must not point towards anyone;只要朝向別人而非自己就安全|It is safe if it points at someone else;戴眼鏡便可朝向人|Spectacles make pointing it at someone safe","a",
    "加熱時管口不能朝向自己或他人。安全眼鏡不能取代正確的管口方向。|During heating, the opening must face away from the user and others. Safety spectacles do not replace correct orientation.",
    "不同安全措施不能互相隨意取代。|One safety precaution does not automatically replace another.");

  Q("S05","classify",
    "按筆記把行為分類。|Classify the actions according to the notes.",
    "合適|Appropriate;不合適|Inappropriate",["b","b","a"],
    "濕手接觸電插頭及徒手摸熱物件都不合適。實驗後應清潔雙手。|Touching plugs with wet hands and touching hot objects with bare hands are inappropriate. Hands should be washed after experiments.",
    "看似乾淨或看不出熱，不代表沒有危害。|An object looking clean or not visibly hot does not mean it is safe.",
    {items:"用濕手摸電插頭|Touch a plug with wet hands;徒手摸剛加熱的物件|Touch a just-heated object with bare hands;實驗後清潔雙手|Wash hands after the experiment"});

  Q("S06","single",
    "使用一瓶化學品前，哪項資料必須留意？|Before using a chemical, which information must be checked?",
    "容器上的危險警告及老師指示|Hazard warnings on the container and the teacher's instructions;只看液體顏色|Only the liquid's colour;只看瓶子大小|Only the bottle's size","a",
    "應閱讀危險警告並採取相應安全措施。顏色或瓶子大小不能代替安全資料。|Read hazard warnings and take the corresponding precautions. Colour and bottle size cannot replace safety information.",
    "不能單憑外觀判斷化學品安全。|Appearance alone cannot establish chemical safety.");

  Q("S07","single",
    "按教材，易燃及助燃化學品應如何存放？|According to the notes, how should flammable and oxidizing chemicals be stored?",
    "分開存放，易燃物遠離火焰和火花|Store them separately, keeping flammables away from flames and sparks;放在一起比較方便|Keep them together for convenience;放近火焰方便使用|Keep them near flames for easy use","a",
    "易燃與助燃化學品應分開。易燃物也須遠離火焰及火花。|Flammable and oxidizing chemicals should be separated. Flammables must also be kept away from flames and sparks.",
    "方便取用不是忽略相容性及火源風險的理由。|Convenience does not justify ignoring compatibility and ignition risks.");

  Q("S08","single",
    "老師安排涉及有毒或刺激性氣體的實驗，應使用哪項適當設備？|For a teacher-arranged experiment involving toxic or irritating gases, which equipment is appropriate?",
    "通風櫥|Fume cupboard;試管架|Test tube rack;秒錶|Stopwatch","a",
    "這類實驗需要適當通風設備並遵從老師指示。試管架及秒錶不能處理氣體暴露問題。|Such experiments need appropriate ventilation equipment and teacher supervision. A rack or stopwatch does not address gas exposure.",
    "戴眼鏡不能代替所需通風。|Spectacles do not replace required ventilation.");

  Q("S09","multi",
    "選出火三角的所有必要條件；本題只考概念。|Select all necessary conditions in the fire triangle; this is a concept question only.",
    "燃料|Fuel;足夠高的溫度|Sufficiently high temperature;氧|Oxygen;聲音|Sound",
    ["a","b","c"],
    "火三角包括燃料、足夠高的溫度及氧。聲音不是其中一項必要條件。|The fire triangle consists of fuel, sufficiently high temperature and oxygen. Sound is not one of its necessary conditions.",
    "不要把燃燒時可能出現的現象當成必要條件。|Do not confuse a possible effect of fire with a necessary condition.");

  Q("S10","single",
    "只從火三角概念判斷，移除其中一項必要條件會怎樣？|Using only the fire-triangle concept, what happens if one necessary condition is removed?",
    "破壞持續燃燒所需的條件|A requirement for continued burning is disrupted;一定令火更旺|The fire must become stronger;三角形名稱改變但燃燒不受影響|Only the triangle's name changes","a",
    "持續燃燒需要三項條件同時存在。這是概念說明，不是要求學生自行處理火災。|Continued burning requires the three conditions together. This is a conceptual explanation, not an instruction to fight a fire.",
    "懂得原理不等於具備實際滅火訓練。|Knowing the principle is not the same as being trained to fight fires.");

  Q("S11","match",
    "配對設備名稱與用途類別，不涉及實際急救程序。|Match equipment to its role category, without performing a first-aid procedure.",
    "眼睛防護|Eye protection;存放急救用品|Holding first-aid supplies;覆蓋式消防設備|A covering-type fire-safety item",
    ["a","b","c"],
    "安全眼鏡用於眼睛防護，急救箱存放急救用品。滅火氈屬消防設備，但本題不教授其操作。|Safety spectacles protect the eyes and a first-aid box holds supplies. A fire blanket is fire-safety equipment, but its operation is not taught here.",
    "辨認設備名稱不等於獲准自行使用緊急設備。|Recognising equipment does not authorise independent emergency use.",
    {items:"安全眼鏡|Safety spectacles;急救箱|First aid box;滅火氈|Fire blanket"});

  Q("S12","single",
    "同學說『少量化學品可以嚐一下辨認』。最合適的回應是甚麼？|A student says, 'We can taste a little chemical to identify it.' What is the best response?",
    "不要品嚐，向老師查詢辨認方法|Do not taste it, and ask the teacher about identification;只嚐一滴便安全|One drop is safe;先嗅聞再決定是否品嚐|Smell it first and then decide whether to taste it","a",
    "不可用自行品嚐的方法辨認實驗室化學品。應遵從老師的安全指示。|Do not identify laboratory chemicals by tasting them. Follow the teacher's safety instructions.",
    "少量並不能保證安全。|A small amount is not necessarily safe.");

  // Apparatus: 10 questions
  Q("A01","match",
    "把原創線條圖 A–D 配對至儀器名稱。|Match original line drawings A–D to apparatus names.",
    "試管|Test tube;燒杯|Beaker;錐形瓶|Conical flask;漏斗|Filter funnel",
    ["a","b","c","d"],
    "試管有細長管身及圓底，燒杯有較寬杯身。錐形瓶有窄頸及較寬底部，漏斗有漏斗形上部和管柄。|A test tube has a narrow body and rounded bottom, while a beaker has a wider body. A conical flask has a narrow neck and broad base, while a funnel has a funnel-shaped upper part and stem.",
    "按外形配對，不要把所有能盛液體的器具視為同一種。|Match the shapes rather than treating all liquid-holding apparatus as identical.",
    {items:"A|A;B|B;C|C;D|D",visualConfig:{kind:"apparatus"}});

  Q("A02","match",
    "按指定工作配對最合適的工具。|Match each specified task to the most suitable tool.",
    "滴管|Dropper;刮勺|Spatula;玻璃棒|Glass rod",["b","a","c"],
    "刮勺移取少量固體，滴管移取數滴液體。玻璃棒用來攪拌液體。|A spatula transfers small amounts of solids and a dropper transfers a few drops of liquid. A glass rod stirs liquids.",
    "移取數滴與大量倒取是不同工作。|Transferring drops and pouring a large amount are different tasks.",
    {items:"移取少量固體|Transfer a small amount of solid;移取數滴液體|Transfer a few drops of liquid;攪拌液體|Stir a liquid"});

  Q("A03","match",
    "配對加熱裝置中各物件的主要功能。|Match each heating-set-up item to its main function.",
    "保護桌面避免過熱|Protect the bench from overheating;承托加熱中的儀器|Support apparatus during heating;支撐鐵絲網|Support wire gauze",
    ["a","b","c"],
    "隔熱墊保護桌面，鐵絲網承托儀器。三腳架支撐鐵絲網，三者用途不同。|An insulating mat protects the bench and wire gauze supports apparatus. A tripod supports the gauze, so the three roles differ.",
    "不要把保護桌面和支撐鐵絲網混為一談。|Bench protection and gauze support are different functions.",
    {items:"隔熱墊|Insulating mat;鐵絲網|Wire gauze;三腳架|Tripod"});

  Q("A04","match",
    "配對試管相關工具。|Match the test-tube tools.",
    "試管架|Test tube rack;試管夾|Test tube holder;試管刷|Test tube brush",["c","a","b"],
    "清洗用試管刷，放置用試管架。加熱時夾持試管用試管夾。|A brush cleans tubes and a rack holds them. A test-tube holder grips a tube during heating.",
    "試管架不能當作手持加熱用的試管夾。|A rack is not a handheld test-tube holder.",
    {items:"清洗試管|Clean a tube;把試管直立放置|Place tubes upright;加熱時夾持試管|Grip a tube during heating"});

  Q("A05","single",
    "按筆記，哪項儀器的指定主要用途是儲存液體？|According to the notes, which apparatus has the specified main role of storing liquids?",
    "試劑瓶|Reagent bottle;漏斗|Filter funnel;試管刷|Test tube brush","a",
    "試劑瓶用於儲存液體。漏斗和試管刷分別用於承托濾紙及清洗試管。|A reagent bottle stores liquids. A funnel supports filter paper, while a test-tube brush cleans tubes.",
    "短暫盛載與指定儲存用途不完全相同。|Temporary holding and designated storage are not identical roles.");

  Q("A06","multi",
    "選出所有符合裝置圖要求的做法。|Select all practices appropriate for apparatus diagrams.",
    "直線用直尺畫|Use a ruler for straight lines;加上濃密陰影|Add heavy shading;按比例繪畫|Keep parts in proportion;標示儀器名稱|Label the apparatus",
    ["a","c","d"],
    "裝置圖應清晰、按比例並標示名稱。按筆記不應加陰影。|Set-up diagrams should be clear, proportional and labelled. The notes specify no shading.",
    "科學裝置圖不是追求立體陰影的美術畫。|Scientific apparatus diagrams do not aim for artistic shading.");

  Q("A07","image",
    "這幅簡化裝置圖最明顯違反哪項筆記要求？|Which rule from the notes is most clearly violated by this simplified apparatus drawing?",
    "不應加陰影|Do not shade diagrams;每幅圖都必須畫火焰|Every diagram must include a flame;必須畫成立體透視|A 3D perspective is required","a",
    "圖中加入了陰影。筆記要求用清晰、不加陰影的裝置圖。|The drawing contains shading. The notes call for clear, unshaded apparatus diagrams.",
    "並非所有裝置圖都需要熱源。|Not every apparatus diagram needs a heat source.",
    {visualConfig:{kind:"shaded"}});

  Q("A08","multi",
    "只要求盛載液體或固體，不要求精確量度。選出所有符合筆記用途的儀器。|Only holding liquids or solids is required, not precise measurement. Select all suitable apparatus according to the notes.",
    "燒杯|Beaker;錐形瓶|Conical flask;試管刷|Test tube brush",
    ["a","b"],
    "燒杯和錐形瓶都可盛載液體或固體。題目没有要求只能選一種。|Both a beaker and a conical flask can hold liquids or solids. The task does not restrict the answer to one apparatus.",
    "多功能情境可能有多個合理答案。|A task may have more than one suitable apparatus.");

  Q("A09","single",
    "在筆記的試管及大試管比較中，要盛載較大量物質應選哪個？|In the notes' comparison of test tubes and boiling tubes, which holds a larger amount?",
    "大試管|Boiling tube;試管刷|Test tube brush;玻璃棒|Glass rod","a",
    "大試管用於盛載較大量液體或固體。這是教材中的相對用途比較。|A boiling tube holds a larger amount of liquid or solid. This is the relative comparison given in the notes.",
    "『大試管』是儀器名稱，不表示可任意裝滿加熱。|'Boiling tube' is an apparatus name, not permission to fill it completely for heating.");

  Q("A10","single",
    "要把儀器固定在指定高度和位置，最符合哪項用途？|Which apparatus best matches fixing equipment at a specified height and position?",
    "架和夾|Stand and clamp;刮勺|Spatula;洗眼瓶|Eye wash bottle","a",
    "架和夾用於固定儀器的位置。刮勺及洗眼瓶不是這項支撐工具。|A stand and clamp fixes apparatus in position. A spatula or eye wash bottle does not serve this support function.",
    "根據指定工作選工具，而不是只看是否常見。|Choose by the specified task, not merely by familiarity.");

  // Transfer: 8 questions
  Q("T01","sort",
    "按本教材，把從試劑瓶倒取溶液的步驟排序。|Order the reagent-bottle pouring steps given in these notes.",
    "取出瓶塞並倒轉放置|Remove the stopper and place it upside down;傾斜拿着試管|Hold the test tube at an angle;慢慢倒至約三分之一滿|Pour slowly to about one-third full;立即蓋好瓶塞，把試管放回架|Recap promptly and return the tube to its rack",
    ["a","b","c","d"],
    "先準備瓶塞和試管位置，再慢慢倒取。完成後立即蓋好試劑瓶及安放試管。|Prepare the stopper and tube position before pouring slowly. Recap the bottle promptly and put the tube away afterwards.",
    "不可先大量倒入才處理試管姿勢。|Do not pour a large amount before arranging the tube properly.");

  Q("T02","sort",
    "只按本教材的課堂滴管示範排序。|Order only the dropper procedure specified in these classroom notes.",
    "擠壓膠囊後，把尖端浸入液體|Squeeze the bulb, then immerse the tip;慢慢放鬆膠囊吸液|Release the bulb slowly to draw liquid;輕觸原試管內壁移除多餘液滴|Touch the original tube's inner wall to remove excess drops;移至另一試管，輕壓滴出|Move to the other tube and squeeze gently to dispense;用另一容器的水清洗|Wash using water in another container",
    ["a","b","c","d","e"],
    "吸液前先擠壓膠囊，浸入後才慢慢放鬆。移取完成後，按教材用另一容器的水清洗。|Squeeze before immersion and release slowly after immersion. After transfer, wash using water in another container as specified.",
    "這套次序不應無限制推廣至所有分析操作。|Do not generalise this sequence to every analytical procedure.");

  Q("T03","single",
    "按教材倒取溶液，學生把試管倒至九成滿。應如何改善？|A student fills a test tube to nine-tenths during the notes' pouring task. What should be improved?",
    "按示範只倒至約三分之一滿|Follow the demonstration and fill to about one-third;改為完全裝滿|Fill it completely;只換一個瓶塞便足夠|Only change the stopper","a",
    "教材指定約三分之一滿。九成滿不符合這個課堂操作要求。|The notes specify about one-third full. Nine-tenths does not meet this classroom requirement.",
    "本題的三分之一是指定操作條件，不是所有容器的通用上限。|One-third is the condition for this task, not a universal limit for every container.");

  Q("T04","single",
    "滴管尚在空氣中，學生已放鬆膠囊，之後才把尖端浸入液體。哪項改善符合教材？|A student releases the bulb in air and only then immerses the tip. Which correction follows the notes?",
    "保持擠壓至尖端浸入後才慢慢放鬆|Keep it squeezed until the tip is immersed, then release slowly;浸入後完全不放鬆|Never release it after immersion;先把滴管倒轉|Turn the dropper upside down first","a",
    "教材先擠壓並保持，再把尖端浸入。之後慢慢放鬆，讓液體進入滴管。|The bulb is squeezed and held before immersion. It is then released slowly to draw in liquid.",
    "放鬆膠囊的時機與尖端位置有關。|When the bulb is released matters relative to the tip's position.");

  Q("T05","single",
    "要從已吸液的滴管移取數滴到另一試管，應怎樣操作？|To dispense a few drops from a filled dropper into another tube, what should be done?",
    "輕輕擠壓膠囊|Gently squeeze the bulb;猛烈甩動滴管|Shake the dropper forcefully;把整支滴管扔入試管|Drop the whole dropper into the tube","a",
    "輕壓膠囊可按教材滴出少量液體。猛烈甩動不是指定移取方法。|Gently squeezing the bulb dispenses a small amount as described. Forceful shaking is not the specified transfer method.",
    "移取數滴不是一次排空所有液體。|Transferring a few drops is not the same as emptying all the liquid.");

  Q("T06","single",
    "只按這份筆記，吸液後如何移除尖端多餘液滴？|According only to these notes, how are excess drops removed after drawing liquid?",
    "尖端輕觸原試管內壁|Lightly touch the original tube's inner wall;尖端接觸桌面|Touch the tip to the bench;用手指擦尖端|Wipe the tip with a finger","a",
    "這份課堂示範指定輕觸原試管內壁。不要改成接觸桌面或手指。|This classroom demonstration specifies touching the original tube's inner wall. Do not replace this with contact with the bench or a finger.",
    "題目限定本教材示範，並非通用分析規程。|The question is limited to this demonstration, not a universal analytical protocol.");

  Q("T07","single",
    "完成滴管活動後，哪種清洗安排符合筆記？|Which washing arrangement follows the notes after the dropper activity?",
    "用另一容器中的水，數次擠壓及放鬆膠囊|Use water in another container and squeeze/release several times;把清洗水滴回原試劑瓶|Return washing water to the reagent bottle;只擦乾外面，不清洗內部|Only dry the outside","a",
    "筆記指定用另一容器的水清洗。擠壓及放鬆使水進出滴管。|The notes specify water in another container. Squeezing and releasing moves water through the dropper.",
    "清洗用水不應當作原試劑的一部分。|Washing water should not be treated as part of the original reagent.");

  Q("T08","single",
    "學生倒取後把試劑瓶開着，轉身做其他工作。應先做甚麼？|After pouring, a student leaves the reagent bottle open and turns to another task. What should be done first?",
    "立即蓋好瓶塞|Recap the bottle promptly;等整堂完結才蓋|Wait until the lesson ends;把瓶塞藏起|Hide the stopper","a",
    "使用後應立即蓋好試劑瓶。完成倒取不表示可以忽略收妥用品。|The reagent bottle should be recapped promptly after use. Finishing the pour does not remove the need to put equipment in order.",
    "收妥用品是操作的一部分。|Putting equipment in order is part of the procedure.");

  // Measurement: 12 questions
  N("M01",
    "尺上物件由 0 開始，到箭頭位置結束。輸入長度及圖上單位；箭頭正對刻度。|The object starts at 0 and ends at the arrow. Enter its length and the displayed unit; the arrow is exactly on a mark.",
    {kind:"ruler",min:0,max:10,step:1,major:5,value:6},
    "cm|cm;mm|mm","a",
    "物件起點在零，終點對應 6 cm。數值及單位都須與圖相符。|The object begins at zero and ends at 6 cm. Both the number and unit must match the diagram.",
    "不要把圖上的 cm 改成 mm 而保持同一數字。|Do not change cm to mm while keeping the same number.");

  N("M02",
    "讀取凹形彎液面底部的體積；底部正對刻度。輸入數值及單位。|Read the volume at the bottom of the concave meniscus, exactly on a mark. Enter the value and unit.",
    {kind:"cylinder",min:0,max:50,step:5,major:10,value:35},
    "mL|mL;g|g","a",
    "相鄰刻度相差 5 mL，彎液面底部在 35 mL。應讀底部而非兩側較高位置。|Adjacent marks differ by 5 mL, and the meniscus bottom is at 35 mL. Read the bottom, not the higher edges.",
    "量筒讀的是體積，不是質量。|A measuring cylinder reads volume, not mass.");

  N("M03",
    "讀取溫度計；液柱頂端正對刻度。輸入數值及單位。|Read the thermometer; the liquid-column top is exactly on a mark. Enter the value and unit.",
    {kind:"thermometer",min:0,max:50,step:1,major:10,value:27},
    "°C|°C;cm|cm","a",
    "每小格代表 1 °C，液柱頂端在 27 °C。不要只讀最近的十位主刻度。|Each small interval is 1 °C, and the column top is at 27 °C. Do not read only the nearest labelled tens mark.",
    "主刻度之間的小刻度也有量度意義。|Minor marks between labelled marks also carry measurement information.");

  Q("M04","image",
    "圖中最小相鄰刻度間隔，即本教材的讀數限制，是多少？|What is the smallest adjacent scale interval, called the reading limitation in these notes?",
    "1 cm|1 cm;5 cm|5 cm;0.5 cm|0.5 cm","a",
    "每兩條相鄰小刻度相差 1 cm。0.5 cm 是其一半，不是這幅圖的刻度間隔。|Adjacent minor marks differ by 1 cm. Half of that is 0.5 cm, not the interval itself.",
    "讀數限制與其一半不是同一數值。|The reading limitation and half of it are different values.",
    {visualConfig:{kind:"ruler",min:0,max:10,step:1,major:5,value:6}});

  Q("M05","image",
    "讀取凹形彎液面，哪個觀察位置合適？|Which viewing position is appropriate for a concave meniscus?",
    "A：高於底部|A: above the bottom;B：與底部同高|B: level with the bottom;C：低於底部|C: below the bottom","b",
    "眼睛應與彎液面底部同一水平。由上或由下看可能造成視差。|The eyes should be level with the bottom of the meniscus. Viewing from above or below can cause parallax.",
    "『看得見液面』不等於觀察角度正確。|Being able to see the surface does not make the angle correct.",
    {visualConfig:{kind:"eye"}});

  Q("M06","single",
    "兩支量筒都容得下待量液體；甲每格 10 mL，乙每格 1 mL。只比較分辨較小體積差異的能力，選哪支？|Both cylinders hold the liquid. A has 10 mL intervals and B has 1 mL intervals. Which better distinguishes smaller volume differences?",
    "乙|B;甲|A;刻度大小不影響分辨能力|Interval size never affects resolution","a",
    "乙的刻度間隔較小，能分辨較小的體積差異。這個比較沒有宣稱它在所有方面都沒有誤差。|B has smaller intervals and resolves smaller volume differences. This does not claim that it has no errors of any kind.",
    "較細刻度不等於所有測量都必定完全準確。|Finer marks do not guarantee perfect accuracy.");

  Q("M07","match",
    "把量度配對至正確單位。|Match each measurement to its unit.",
    "kg|kg;°C|°C;s|s;mL|mL",["a","d","b","c"],
    "kg 是質量單位，mL 是體積單位。°C 用於溫度，s 用於時間。|kg measures mass and mL measures volume. °C measures temperature and s measures time.",
    "量度類別和單位要互相配合。|The unit must match the measured quantity.",
    {items:"質量|Mass;體積|Volume;溫度|Temperature;時間|Time"});

  Q("M08","single",
    "要量度一袋固體粉末的質量，應使用哪個工具？|Which tool measures the mass of a bag of solid powder?",
    "電子天平|Electronic balance;溫度計|Thermometer;量筒|Measuring cylinder","a",
    "電子天平用來量度質量。溫度計及量筒分別量度溫度及液體體積。|An electronic balance measures mass. A thermometer measures temperature and a cylinder measures liquid volume.",
    "固體不是只能用尺量度。|A solid is not limited to being measured with a ruler.");

  Q("M09","single",
    "要量度玩具車從標記甲到標記乙所需時間，應選哪個工具？|Which tool measures how long a toy car takes to travel from mark A to mark B?",
    "秒錶|Stopwatch;試劑瓶|Reagent bottle;刮勺|Spatula","a",
    "秒錶量度一段時間。題目問時間而不是距離。|A stopwatch measures a time interval. The question asks for time, not distance.",
    "同一情境可以量度不同物理量，須看清題目。|Different quantities can be measured in the same situation; read the task carefully.");

  Q("M10","operation",
    "虛擬天平：量度需要容器盛載的液體。按合適次序完成操作，最後記錄讀數；可重設後再提交。|Virtual balance: measure a liquid that needs a container. Perform the actions in a suitable order and record the reading last; you may reset before submission.",
    "放上空容器|Place the empty container;按置零／去皮|Press zero/tare;加入液體|Add the liquid;記錄讀數|Record the reading",
    ["a","b","c","d"],
    "先放空容器再去皮，顯示歸零後加入液體。最後的顯示值不包括已去皮的容器。|Place the empty container and tare it before adding liquid. The final reading excludes the tared container.",
    "在加入液體後才去皮，會把所需液體讀數一併扣去。|Taring after adding the liquid also removes the liquid's contribution.",
    {visualConfig:{kind:"balance-operation",container:25,sample:12}});

  N("M11",
    "空容器已去皮，之後加入粉末。讀取屏幕所示粉末質量及單位。|The empty container was tared before powder was added. Read the displayed powder mass and unit.",
    {kind:"balance",value:12.4},
    "g|g;mL|mL","a",
    "去皮後加入粉末，12.4 g 是粉末的顯示質量。不能把它當作體積。|After taring and adding powder, 12.4 g is the displayed powder mass. It is not a volume.",
    "去皮後不要再次扣除空容器質量。|Do not subtract the empty container again after taring.");

  Q("M12","single",
    "要量度實驗所用液體的體積，而非只盛載它，按教材通常選甚麼？|To measure a liquid's volume rather than merely hold it, what is normally used according to the notes?",
    "量筒|Measuring cylinder;試管架|Test tube rack;電子天平|Electronic balance","a",
    "教材通常使用量筒量度液體體積。天平量度的是質量。|The notes normally use a measuring cylinder for liquid volume. A balance measures mass.",
    "可盛載物質不等於用來讀取其體積。|Holding a substance is not the same as measuring its volume.");

  // Errors: 10 questions
  Q("U01","single",
    "從斜角讀取尺的刻度，最直接可能造成哪種問題？|What problem can most directly result from reading a ruler at an oblique angle?",
    "視差|Parallax error;自動去皮|Automatic taring;讀數必定變成零|The reading must become zero","a",
    "不正確的觀察角度可造成視差。應使視線與尺的標度垂直。|An incorrect viewing angle can cause parallax. View the ruler scale perpendicularly.",
    "視差不是刻度本身突然改變。|Parallax does not mean the scale marks themselves change.");

  N("U02",
    "只在本題指定的簡化刻度估算中，最小間隔是 0.2 cm。用其一半估算讀數不確定度的大小。|Only for this stated simplified scale estimate, the smallest interval is 0.2 cm. Estimate the magnitude of reading uncertainty as half that interval.",
    {kind:"text",value:0.1},
    "cm|cm;g|g","a",
    "0.2 cm 的一半是 0.1 cm。這是本題的簡化不確定度估算，不是量度值本身，也不是所有儀器的通則。|Half of 0.2 cm is 0.1 cm. This is the question's simplified uncertainty estimate, not the measured value or a rule for all instruments.",
    "不能說物件長度本身必須少於半格。|The object's length itself does not have to be less than half an interval.");

  Q("U03","match",
    "配對三個描述。|Match the three descriptions.",
    "讀數限制|Reading limitation;簡化估算不確定度|Simplified estimated uncertainty;人為讀錯|Reading mistake",
    ["a","b","c"],
    "刻度間隔與其一半估算值不同。把清楚顯示的 8 抄成 3 是人為讀錯，不能用一般量度不確定性作解釋。|A scale interval differs from its half-interval estimate. Copying a clearly displayed 8 as 3 is a mistake, not ordinary measurement uncertainty.",
    "三種概念不可混用。|These three concepts are not interchangeable.",
    {items:"最小相鄰刻度間隔|Smallest adjacent scale interval;本題條件下取半格的估算|A half-interval estimate under stated conditions;把清楚顯示的 8 抄成 3|Copying a clearly displayed 8 as 3"});

  Q("U04","classify",
    "把情況分為量度不確定性或人為錯誤。|Classify each situation as measurement uncertainty or a human mistake.",
    "量度不確定性|Measurement uncertainty;人為錯誤|Human mistake",
    ["a","b"],
    "有限刻度使正確讀數仍有不確定性。抄錯清楚數字則是可避免的人為錯誤。|A finite scale leaves uncertainty even when read correctly. Copying a clear number incorrectly is an avoidable human mistake.",
    "不是所有讀數差異都應稱為粗心。|Not every difference in readings is carelessness.",
    {items:"正確觀察但有限刻度不能分辨更小差異|Correct viewing but finite marks cannot resolve smaller differences;把清楚的 15 抄成 51|Copying a clear 15 as 51"});

  Q("U05","single",
    "空天平按設計應顯示 0 g，但穩定後仍顯示 2 g。最符合哪項描述？|An empty balance should indicate 0 g by design, but after stabilising it shows 2 g. Which description fits?",
    "存在零位偏差，應按老師指示檢查|There is a zero offset that should be checked as instructed;所有未按去皮的量度都必定有同樣問題|Every untared measurement necessarily has this problem;這證明物件質量是 2 g|This proves an object's mass is 2 g","a",
    "應顯示零時卻不為零，是零位誤差的情境。沒有按去皮與儀器存在零位偏差並非所有情況都等同。|This is a zero-error situation because the display is nonzero when it should indicate zero. Not pressing tare and having an instrument zero offset are not equivalent in every situation.",
    "空容器的正常質量讀數不是天平故障的證據。|A normal empty-container mass reading is not evidence of a faulty balance.");

  Q("U06","single",
    "天平空載時顯示零；空容器 25 g，容器連物質 37 g，未使用去皮。物質質量是多少？|The empty balance reads zero. An empty container is 25 g and container plus substance is 37 g, without taring. What is the substance's mass?",
    "12 g|12 g;37 g|37 g;25 g|25 g","a",
    "37 g 減去容器的 25 g 得 12 g。沒有去皮仍可用這個差值求物質質量，並不自動表示有零位誤差。|Subtracting the container's 25 g from 37 g gives 12 g. The difference can be used without taring, which does not automatically imply zero error.",
    "總質量與物質本身的質量不同。|Total mass differs from the substance's own mass.");

  Q("U07","single",
    "真值是 10.0 g，重複讀數為 12.0、12.0、12.0 g。就個別讀數接近真值及彼此一致而言，哪項正確？|The true value is 10.0 g and repeated readings are 12.0, 12.0, 12.0 g. Considering closeness of individual readings to truth and to each other, which is correct?",
    "精密但不準確|Precise but inaccurate;準確且精密|Accurate and precise;完全不精密|Not precise at all","a",
    "讀數彼此一致，因此精密。每個讀數都偏離真值 2.0 g，因此不準確。|The readings agree with each other, so they are precise. Each is 2.0 g from the true value, so they are inaccurate.",
    "一致不能證明接近真值。|Agreement does not establish closeness to truth.");

  Q("U08","single",
    "真值 10 g。甲：9、10、11 g；乙：6、10、14 g。兩組平均值都為 10 g。只比較精密性，哪組較高？|True value: 10 g. A: 9, 10, 11 g; B: 6, 10, 14 g. Both means are 10 g. Comparing precision only, which is higher?",
    "甲|A;乙|B;因平均值相同所以精密性必定相同|Equal means necessarily mean equal precision","a",
    "甲的重複讀數較接近，故精密性較高。平均值相同不表示分散程度相同。|A's repeated readings are closer together, so A is more precise. Equal means do not imply equal spread.",
    "本題比較精密性，不是兩個平均值是否接近真值。|This compares precision, not the accuracy of the two means.");

  Q("U09","multi",
    "真值 10 g；讀數 8、10、12 g，平均值 10 g。選出所有有資料支持的說法。|True value: 10 g; readings: 8, 10, 12 g; mean: 10 g. Select all supported statements.",
    "平均值等於真值|The mean equals the true value;每個讀數都等於真值|Every reading equals the true value;讀數有分散|The readings are spread out;平均值正確便代表每次都正確|A correct mean makes every reading correct",
    ["a","c"],
    "平均值等於真值，但個別讀數仍有偏離。評價一組平均值和評價每次讀數是不同工作。|The mean equals the true value, but individual readings still deviate. Evaluating the mean differs from evaluating each reading.",
    "不要用平均值掩蓋個別讀數的分散。|Do not use the mean to hide the spread of individual readings.");

  Q("U10","single",
    "學生改用正確觀察角度，但尺的最小間隔沒有改變。哪個判斷合理？|A student corrects the viewing angle, but the ruler's smallest interval is unchanged. Which judgement is reasonable?",
    "可減少視差，但有限刻度的不確定性仍存在|Parallax can be reduced, but finite-scale uncertainty remains;所有不確定性都消失|All uncertainty disappears;尺自動變成更細刻度|The ruler automatically gains finer marks","a",
    "正確角度改善視差問題。它不會改變儀器原有刻度的分辨能力。|Correct viewing addresses parallax. It does not alter the resolution of the instrument's scale.",
    "改善一種問題不等於消除所有量度限制。|Correcting one problem does not remove every measurement limitation.");

  // Burner: 8 questions
  Q("B01","single",
    "按筆記，氣孔關閉時火焰主要是甚麼顏色及類型？|According to the notes, what colour and type of flame occurs with the air hole closed?",
    "黃色光焰|Yellow luminous flame;藍色無光焰|Blue non-luminous flame;綠色光焰|Green luminous flame","a",
    "氣孔關閉時是黃色光焰。氣孔打開時通常是藍色無光焰。|A closed air hole gives a yellow luminous flame. An open air hole normally gives a blue non-luminous flame.",
    "不要把兩種氣孔狀態的特徵對調。|Do not swap the features of the two air-hole states.");

  Q("B02","multi",
    "選出氣孔打開時，筆記列出的所有特徵。|Select all features listed in the notes for an open air hole.",
    "藍色|Blue;形狀規則|Regular shape;較響亮|Noisier;黃色且不規則|Yellow and irregular",
    ["a","b","c"],
    "氣孔打開時的無光焰為藍色、規則且較響亮。黃色不規則是關閉時的特徵。|With the hole open, the non-luminous flame is blue, regular and noisier. Yellow and irregular describes the closed-hole state.",
    "較響亮是教材中的相對比較，不是反應速度測試。|Noisier is a relative comparison in the notes, not a reaction-speed task.");

  Q("B03","match",
    "配對兩種火焰的名稱。|Match the two flame descriptions to their names.",
    "光焰|Luminous flame;無光焰|Non-luminous flame",["b","a"],
    "藍色規則火焰對應無光焰。黃色不規則火焰對應光焰。|The blue regular flame is non-luminous. The yellow irregular flame is luminous.",
    "名稱須與整組特徵配合。|Match the name to the complete feature set.",
    {items:"藍色、規則、較響亮|Blue, regular and noisier;黃色、不規則、較安靜|Yellow, irregular and quieter"});

  Q("B04","single",
    "學生因黃色火焰較顯眼便選它作通常的加熱火焰。哪項修正符合笔記？|A student chooses the more visible yellow flame for normal heating. Which correction follows the notes?",
    "通常使用無光焰加熱，不以顯眼程度決定|Normally use the non-luminous flame, not visibility as the criterion;所有顏色都表示相同用途|All colours indicate identical use;一定要選最明亮的火焰|Always choose the brightest flame","a",
    "筆記通常使用無光焰加熱。較顯眼不能代替教材指定的選擇準則。|The notes normally use a non-luminous flame for heating. Greater visibility does not replace the stated selection criterion.",
    "本題沒有教授真實點火程序。|This question does not teach a real lighting procedure.");

  Q("B05","multi",
    "只辨認安全姿勢：選出加熱大試管時所有合適安排。|Identify safe posture only: select all suitable arrangements for heating a boiling tube.",
    "使用試管夾|Use a test-tube holder;稍微傾斜|Hold it at a slight angle;管口朝向同學|Point the opening at a classmate;管口不朝向任何人|Point the opening away from everyone",
    ["a","b","d"],
    "大試管應以試管夾夾持並稍微傾斜。管口不能朝向任何人。|Grip the boiling tube with a holder and keep it slightly tilted. The opening must not point towards anyone.",
    "本題只判斷圖景或描述，不要求真實加熱。|This judges a described situation, not real heating.");

  Q("B06","single",
    "按提供的筆記，加熱時大試管在火焰上應怎樣移動？|According to the supplied notes, how should the boiling tube be moved over the flame during heating?",
    "按老師示範輕輕移動|Move it gently as demonstrated by the teacher;猛烈揮動並朝向他人|Swing it forcefully towards others;放下後離開不理|Put it down and leave it unattended","a",
    "筆記描述在火焰上輕輕移動大試管。任何真實活動仍須由老師指導。|The notes describe moving the tube gently over the flame. Any real activity still requires teacher supervision.",
    "輕輕移動不是猛烈搖晃。|Gentle movement does not mean vigorous shaking.");

  Q("B07","single",
    "記錄表寫『氣孔關閉：黃色、不規則、較安靜、无光焰』。哪一欄需修正？|A record says 'air hole closed: yellow, irregular, quieter, non-luminous'. Which entry needs correction?",
    "火焰類型應為光焰|The type should be luminous;顏色應為綠色|The colour should be green;聲音應寫完全無法比較|Sound should be declared incomparable","a",
    "前三項符合筆記的關閉狀態。火焰類型應為光焰。|The first three features match the closed state in the notes. The flame type should be luminous.",
    "檢查資料時要找出具體不一致欄位。|When checking records, identify the specific inconsistent entry.");

  Q("B08","operation",
    "虛擬觀察：把氣孔設為通常用於加熱的狀態，再記錄看到的顏色及形狀。本題沒有點火操作。|Virtual observation: set the air hole to the state normally used for heating, then record the observed colour and shape. There is no lighting procedure.",
    "",{hole:"open",color:"blue",shape:"regular"},
    "通常加熱使用氣孔打開時的無光焰。示意圖呈藍色及規則形狀。|Normal heating uses the non-luminous flame with the air hole open. The diagram shows a blue flame with a regular shape.",
    "這是虛擬比較，不是操作真實煤氣設備的指示。|This is a virtual comparison, not an instruction to operate real gas equipment.",
    {visualConfig:{kind:"burner-operation"}});

  const mockIds=[
    "E01","E02","E08",
    "F04","F06","F07","F12",
    "S01","S02","S07","S09",
    "A01","A06","T01",
    "M01","M03","M10",
    "U04","U08","B08"
  ];
  const review=[
    L("只使用已提供的 Chapter 1 文字；全部 SVG 是原創簡化示意，不是原筆記圖片。|Only the supplied Chapter 1 text is used. All SVGs are original simplified diagrams, not reproductions of the missing pictures."),
    L("未納入：固定科學探究步驟次序、缺失危險標記圖、混和溶液圖片細節、本生燈未核實部件名稱及完整點火程序。|Excluded: a fixed investigation-step sequence, missing hazard-symbol images, missing mixing details, unverified burner-part names and a complete lighting procedure."),
    L("Loading time／延遲時間未作正式計分名詞；讀數誤差的疑義原句不作答案。|Loading time is not assessed as a formal term. The doubtful original reading-error sentence is not used as an answer."),
    L("半格只用於 U02 指定簡化估算；零位誤差不等同所有未去皮情境。|Half an interval is used only for U02's stated simplified estimate. Zero error is not equated with every untared measurement."),
    L("不考詳細急救步驟、沖洗時長或自行滅火；不宣稱蒸餾水是唯一沖洗選擇。|No detailed first-aid steps, rinsing durations or independent firefighting are assessed. Distilled water is not claimed to be the only rinsing option."),
    L("approved 表示本版本範圍與編輯檢查狀態，並非學校教師簽核。正式使用前仍需教師審核語文及圖像。|approved denotes this version's scope/editorial status, not school-teacher sign-off. Teachers should still review language and diagrams before formal use.")
  ];
  window.SAA={L,topics,questions:Qs,mockIds,review};
})();