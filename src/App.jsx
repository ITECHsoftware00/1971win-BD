import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Hind+Siliguri:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#06080f;--bg2:#0c0f1a;--bg3:#111827;--hbg:#080b14;
  --accent:#00a550;--accent-d:#007a3a;--accent-l:#00d468;
  --red:#e8112d;--red-d:#b30d24;--gold:#f0b429;--gold-d:#c8911a;
  --cyan:#00c8ff;--text:#eef2ff;--text2:#7a8fad;--border:#161f35;
  --card:#0f1520;--card2:#141d30;
  --font-d:'Teko',sans-serif;--font-b:'Hind Siliguri',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-b);overflow-x:hidden}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
input,button,select,textarea{font-family:var(--font-b)}
button{cursor:pointer;border:none;outline:none}
input{outline:none}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes live-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
@keyframes glow-green{0%,100%{box-shadow:0 0 8px #00a55050}50%{box-shadow:0 0 20px #00a550,0 0 40px #00a55030}}
@keyframes mult-glow{0%,100%{text-shadow:0 0 30px #00c8ff80}50%{text-shadow:0 0 60px #00c8ff,0 0 100px #00c8ff40}}
@keyframes crash-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes crash-flash{0%{opacity:0.5}100%{opacity:0}}
@keyframes slide-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes drawer{from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes toast-in{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}
@keyframes float-win{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-60px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes shimmer{0%,100%{opacity:0.03}50%{opacity:0.08}}
@keyframes pop{0%{transform:scale(0.8)}60%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes curve-glow{0%,100%{filter:drop-shadow(0 0 4px #00a550)}50%{filter:drop-shadow(0 0 12px #00c8ff)}}
.page{animation:slide-up 0.3s ease forwards}
.odds-btn:active{transform:scale(0.94)}
`;

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const MOCK_USER = {
  id:"BD001971",name:"Abdulhalim",nameBn:"Abdulhalim",
  phone:"+880 1711-971971",email:"abdulhalim@1971win.bd",
  balance:15750.00,bonus:750.00,points:4200,tier:"Gold",
  tierProgress:72,nextTier:"Platinum",pointsToNext:1800,
  referralCode:"WIN71-ABD",referralCount:9,referralEarned:1800,
  kycStatus:"pending",joinDate:"March 2024",currency:"BDT",sym:"৳"
};

const MOCK_MATCHES = [
  {id:1,sport:"football",league:"Bangladesh Premier League",flag:"🇧🇩",home:"Abahani Ltd",away:"Sheikh Jamal",time:"Today 18:00",homeOdds:2.10,drawOdds:3.20,awayOdds:3.50,status:"upcoming"},
  {id:2,sport:"cricket",league:"BPL 2025",flag:"🇧🇩",home:"Dhaka Dominators",away:"Ctg Challengers",time:"Live",homeOdds:1.80,drawOdds:null,awayOdds:2.05,status:"live",minute:"34 Overs",homeScore:"142/4",awayScore:"Fielding"},
  {id:3,sport:"cricket",league:"International — Bangladesh",flag:"🇧🇩",home:"Bangladesh 🐯",away:"Pakistan",time:"Tomorrow 10:00",homeOdds:3.20,drawOdds:4.50,awayOdds:1.65,status:"upcoming"},
  {id:4,sport:"football",league:"Premier League",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",home:"Arsenal",away:"Chelsea",time:"Today 20:45",homeOdds:2.10,drawOdds:3.40,awayOdds:3.20,status:"upcoming"},
  {id:5,sport:"football",league:"La Liga",flag:"🇪🇸",home:"Real Madrid",away:"Barcelona",time:"Live",homeOdds:1.95,drawOdds:3.60,awayOdds:3.80,status:"live",minute:"67'",homeScore:1,awayScore:1},
  {id:6,sport:"cricket",league:"IPL 2025",flag:"🇮🇳",home:"Mumbai Indians",away:"CSK",time:"Tomorrow 19:30",homeOdds:1.75,drawOdds:null,awayOdds:2.10,status:"upcoming"},
  {id:7,sport:"basketball",league:"NBA",flag:"🇺🇸",home:"LA Lakers",away:"Golden State",time:"Tomorrow 02:00",homeOdds:2.30,drawOdds:null,awayOdds:1.65,status:"upcoming"},
  {id:8,sport:"football",league:"Champions League",flag:"🇪🇺",home:"Bayern Munich",away:"PSG",time:"Thu 21:00",homeOdds:1.80,drawOdds:3.90,awayOdds:4.10,status:"upcoming"},
  {id:9,sport:"kabaddi",league:"Bangladesh Kabaddi League",flag:"🇧🇩",home:"Dhaka Warriors",away:"Rajshahi Raiders",time:"Sat 15:00",homeOdds:1.90,drawOdds:null,awayOdds:1.95,status:"upcoming"},
  {id:10,sport:"football",league:"Bangladesh National League",flag:"🇧🇩",home:"Bashundhara Kings",away:"Mohammedan SC",time:"Sun 16:00",homeOdds:1.65,drawOdds:3.80,awayOdds:4.20,status:"upcoming"},
];

const MOCK_TRANSACTIONS = [
  {id:"TXN1971001",type:"deposit",method:"bKash",amount:2000,status:"Completed",date:"Today 10:23"},
  {id:"TXN1971002",type:"withdraw",method:"Bank Transfer",amount:1500,status:"Completed",date:"Yesterday 15:44"},
  {id:"TXN1971003",type:"bonus",method:"Welcome Bonus",amount:750,status:"Completed",date:"Jan 5"},
  {id:"TXN1971004",type:"deposit",method:"Nagad",amount:1000,status:"Pending",date:"Jan 4"},
  {id:"TXN1971005",type:"withdraw",method:"bKash",amount:800,status:"Failed",date:"Jan 3"},
  {id:"TXN1971006",type:"deposit",method:"Card",amount:5000,status:"Completed",date:"Jan 2"},
  {id:"TXN1971007",type:"bonus",method:"Referral Bonus",amount:200,status:"Completed",date:"Jan 1"},
  {id:"TXN1971008",type:"deposit",method:"USDT",amount:3000,status:"Completed",date:"Dec 30"},
  {id:"TXN1971009",type:"deposit",method:"Rocket",amount:500,status:"Completed",date:"Dec 28"},
  {id:"TXN1971010",type:"bonus",method:"Daily Reload",amount:400,status:"Completed",date:"Dec 27"},
];

const MOCK_BETS = [
  {id:"BET001",selections:[{match:"Arsenal vs Chelsea",pick:"1 Arsenal",odds:2.10}],stake:500,returns:1050,status:"won",date:"Today 18:30"},
  {id:"BET002",selections:[{match:"Real Madrid vs Barca",pick:"X Draw",odds:3.60},{match:"Lakers vs Warriors",pick:"2 Warriors",odds:1.65}],stake:300,returns:1782,status:"lost",date:"Yesterday"},
  {id:"BET003",selections:[{match:"MI vs CSK",pick:"1 MI",odds:1.75}],stake:1000,returns:1750,status:"pending",date:"Tomorrow"},
  {id:"BET004",selections:[{match:"Bayern vs PSG",pick:"1 Bayern",odds:1.80},{match:"Man City vs Liverpool",pick:"X Draw",odds:4.10}],stake:200,returns:1476,status:"pending",date:"Thu"},
  {id:"BET005",selections:[{match:"Dhaka vs Ctg",pick:"1 Dhaka",odds:1.80}],stake:2000,returns:3600,status:"won",date:"Jan 3"},
];

const MOCK_LIVE_PLAYERS = [
  {name:"Rahim***",bet:500,cashout:3.21,status:"won"},
  {name:"Shah***",bet:200,cashout:null,status:"playing"},
  {name:"Jami***",bet:1000,cashout:null,status:"playing"},
  {name:"Hoss***",bet:750,cashout:1.85,status:"won"},
  {name:"Nabi***",bet:300,cashout:null,status:"bust"},
  {name:"Kari***",bet:150,cashout:8.44,status:"won"},
  {name:"Rana***",bet:2000,cashout:null,status:"playing"},
  {name:"Moni***",bet:400,cashout:2.10,status:"won"},
  {name:"Bari***",bet:600,cashout:null,status:"playing"},
  {name:"Tonu***",bet:1200,cashout:null,status:"bust"},
];

const MOCK_CHAT = [
  {user:"Rahim***",msg:"LFG guys 🔥🔥",time:"Just now"},
  {user:"Shah***",msg:"cashed at 4.2x ez",time:"1 min"},
  {user:"Hoss***",msg:"next one 10x inshaAllah 🙏",time:"2 min"},
  {user:"Kari***",msg:"busted again 😭",time:"3 min"},
  {user:"Jami***",msg:"auto cashout 2x is the way",time:"4 min"},
  {user:"Moni***",msg:"1971WIN best platform 🇧🇩",time:"5 min"},
];

const NEW_CHAT_MSGS = [
  "next one big 🚀","bro how much bet ?","I got 1x crash 😂",
  "just deposited via bKash","cash out  All!","feeling a 10x coming",
  "GG everyone!","Today lucky day 🍀","Alhamdulillah won!",
];

const CRASH_HISTORY_INIT = [14.2,1.1,3.8,22.5,1.3,8.1,2.4,1.0,5.6,1.9,11.3,1.5,4.0,1.2,7.8,2.1,1.0,3.3,18.6,1.7];

const VIP_TIERS = [
  {name:"Bronze",nameBn:"Bronze",color:"#cd7f32",min:0,max:999,perks:["💰 2% Cashback","📞 Standard Support"]},
  {name:"Silver",nameBn:"Silver",color:"#c0c0c0",min:1000,max:4999,perks:["💰 4% Cashback","⚡ Fast Withdraw","🎂 Birthday Bonus"]},
  {name:"Gold",nameBn:"Gold",color:"#f0b429",min:5000,max:19999,perks:["💰 6% Cashback","👨‍💼 Dedicated Manager","🎁 Monthly Free Bet"]},
  {name:"Platinum",nameBn:"Platinum",color:"#00c8ff",min:20000,max:99999,perks:["💰 10% Cashback","🎪 VIP Event","📊 Custom Limit"]},
  {name:"Elite",nameBn:"Elite",color:"#e8112d",min:100000,max:Infinity,perks:["💰 12% Cashback","🏨 LuxuryAllWheel Gifts","🎯 Private Room"]},
];

const CASINO_GAMES = [
  {name:"Crash",nameBn:"Crash",provider:"1971WIN",badge:"HOT 🔥",gradient:"#00a550,#003d1f",iscrash:true},
  {name:"Sweet Bonanza",nameBn:"Sweet Bonanza",provider:"Pragmatic",badge:"HOT 🔥",gradient:"#ff6b6b,#ff8e53"},
  {name:"Gates of Olympus",nameBn:"Olympus Gates",provider:"Pragmatic",badge:"JACKPOT 💰",gradient:"#667eea,#764ba2"},
  {name:"Crazy Time",nameBn:"Crazy Time",provider:"Evolution",badge:"LIVE 🔴",gradient:"#f0b429,#e67e22"},
  {name:"Dragon Tiger",nameBn:"Dragon Tiger",provider:"Evolution",badge:"NEW ✨",gradient:"#e53935,#b71c1c"},
  {name:"Plinko",nameBn:"Plinko",provider:"Spribe",badge:"NEW ✨",gradient:"#11998e,#38ef7d"},
  {name:"Fortune Tiger",nameBn:"Fortune Tiger",provider:"PG Soft",badge:"HOT 🔥",gradient:"#f46b45,#eea849"},
  {name:"Aviator",nameBn:"Aviator",provider:"Spribe",badge:"POPULAR",gradient:"#1a1a2e,#16213e"},
  {name:"Mega Ball",nameBn:"Mega Ball",provider:"Evolution",badge:"JACKPOT 💰",gradient:"#fc4a1a,#f7b733"},
  {name:"Book of Dead",nameBn:"Book of Dead",provider:"Play'n GO",badge:null,gradient:"#373b44,#4286f4"},
  {name:"Monopoly Live",nameBn:"Monopoly Live",provider:"Evolution",badge:"LIVE 🔴",gradient:"#1db954,#006428"},
  {name:"Lightning Roulette",nameBn:"Lightning Roulette",provider:"Evolution",badge:"HOT 🔥",gradient:"#f7971e,#ffd200"},
];

const ADMIN_USERS = [
  {id:"BD001971",name:"Abdulhalim",phone:"01711-971971",balance:15750,tier:"Gold",status:"active"},
  {id:"BD002971",name:"Rafiqul Islam",phone:"01812-345678",balance:4200,tier:"Silver",status:"active"},
  {id:"BD003971",name:"Shah Jalal",phone:"01913-456789",balance:89000,tier:"Platinum",status:"active"},
  {id:"BD004971",name:"Hosain Mamun",phone:"01611-234567",balance:250,tier:"Bronze",status:"active"},
  {id:"BD005971",name:"Karimon Nesa",phone:"01711-345678",balance:0,tier:"Bronze",status:"suspended"},
  {id:"BD006971",name:"Jamil Uddin",phone:"01812-567890",balance:31000,tier:"Gold",status:"active"},
  {id:"BD007971",name:"Nabila Rahman",phone:"01913-678901",balance:1800,tier:"Silver",status:"active"},
  {id:"BD008971",name:"Tonushree Das",phone:"01611-789012",balance:6700,tier:"Gold",status:"active"},
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = n => "৳" + Number(n).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtN = n => Number(n).toLocaleString("en-IN");
const fmtOdds = n => Number(n).toFixed(2);
const tierColor = t => VIP_TIERS.find(v=>v.name===t)?.color || "#f0b429";

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({children,color="#00a550",bg,style={}}) => (
  <span style={{background:bg||color+"22",color,border:`1px solid ${color}44`,
    borderRadius:4,padding:"1px 6px",fontSize:10,fontWeight:600,
    fontFamily:"var(--font-d)",letterSpacing:0.5,...style}}>{children}</span>
);

const Pill = ({children,active,onClick,style={}}) => (
  <button onClick={onClick} style={{
    background:active?"var(--accent)":"var(--bg3)",
    color:active?"#fff":"var(--text2)",border:`1px solid ${active?"var(--accent)":"var(--border)"}`,
    borderRadius:999,padding:"4px 14px",fontSize:12,fontWeight:500,
    fontFamily:"var(--font-b)",transition:"all 0.2s",flexShrink:0,...style
  }}>{children}</button>
);

const Input = ({label,labelBn,type="text",value,onChange,placeholder,style={},inputStyle={},readOnly,suffix}) => (
  <div style={{marginBottom:12,...style}}>
    {label&&<div style={{fontSize:12,color:"var(--text2)",marginBottom:4,fontFamily:"var(--font-b)"}}>
      {label}{labelBn&&<span style={{marginLeft:4,color:"var(--text2)",fontSize:11}}>{labelBn}</span>}
    </div>}
    <div style={{position:"relative"}}>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
        style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,
          padding:"10px 14px",color:readOnly?"var(--text2)":"var(--text)",fontSize:14,
          fontFamily:"var(--font-b)",transition:"border 0.2s",...inputStyle}}
        onFocus={e=>!readOnly&&(e.target.style.borderColor="var(--accent)")}
        onBlur={e=>e.target.style.borderColor="var(--border)"}/>
      {suffix&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
        color:"var(--text2)",fontSize:13}}>{suffix}</span>}
    </div>
  </div>
);

const Btn = ({children,onClick,variant="primary",fullWidth,style={},disabled,small}) => {
  const variants = {
    primary:{background:"var(--accent)",color:"#fff"},
    danger:{background:"var(--red)",color:"#fff"},
    ghost:{background:"transparent",color:"var(--text2)",border:"1px solid var(--border)"},
    gold:{background:"var(--gold)",color:"#000"},
    outline:{background:"transparent",color:"var(--accent)",border:"1px solid var(--accent)"},
  };
  return <button onClick={onClick} disabled={disabled} style={{
    ...variants[variant],borderRadius:8,padding:small?"6px 14px":"11px 20px",
    fontSize:small?13:15,fontFamily:"var(--font-d)",fontWeight:600,letterSpacing:0.5,
    textTransform:"uppercase",transition:"all 0.2s",width:fullWidth?"100%":"auto",
    opacity:disabled?0.5:1,cursor:disabled?"not-allowed":"pointer",...style
  }}
    onMouseEnter={e=>{if(!disabled){if(variant==="primary")e.target.style.background="var(--accent-d)";if(variant==="danger")e.target.style.background="var(--red-d)";}}}
    onMouseLeave={e=>{if(!disabled){if(variant==="primary")e.target.style.background="var(--accent)";if(variant==="danger")e.target.style.background="var(--red)";}}}
  >{children}</button>;
};

const Card = ({children,style={},onClick}) => (
  <div onClick={onClick} style={{background:"var(--card)",border:"1px solid var(--border)",
    borderRadius:12,padding:16,...style,cursor:onClick?"pointer":"default"}}>{children}</div>
);

const SectionHeader = ({title,titleBn,action,onAction}) => (
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,marginTop:20}}>
    <div>
      <span style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,letterSpacing:0.5}}>{title}</span>
      {titleBn&&<span style={{fontSize:11,color:"var(--text2)",marginLeft:6}}>{titleBn}</span>}
    </div>
    {action&&<button onClick={onAction} style={{fontSize:12,color:"var(--accent)",background:"none",border:"none",
      fontFamily:"var(--font-b)",cursor:"pointer"}}>{action} →</button>}
  </div>
);

const LiveDot = () => (
  <span style={{display:"inline-block",width:6,height:6,background:"var(--red)",
    borderRadius:"50%",animation:"live-pulse 1s infinite",marginRight:4}}/>
);

const Spinner = () => (
  <div style={{width:20,height:20,border:"2px solid var(--border)",
    borderTop:"2px solid var(--accent)",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
);

// ─── TOAST SYSTEM ─────────────────────────────────────────────────────────────
const ToastContainer = ({toasts}) => (
  <div style={{position:"fixed",top:16,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:8}}>
    {toasts.map(t=>(
      <div key={t.id} style={{
        background:t.type==="success"?"#00a55022":t.type==="error"?"#e8112d22":t.type==="win"?"#f0b42922":"#1a2540",
        border:`1px solid ${t.type==="success"?"var(--accent)":t.type==="error"?"var(--red)":t.type==="win"?"var(--gold)":"var(--border)"}`,
        borderRadius:10,padding:"10px 16px",maxWidth:260,
        animation:"toast-in 0.3s ease forwards",fontFamily:"var(--font-b)",fontSize:13,color:"var(--text)"
      }}>
        {t.type==="win"&&<div style={{fontSize:18,marginBottom:2}}>🏆</div>}
        {t.msg}
      </div>
    ))}
  </div>
);

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header = ({user,nav,betSlip}) => (
  <header style={{background:"var(--hbg)",borderBottom:"1px solid var(--border)",
    position:"sticky",top:0,zIndex:200,height:56}}>
    <div style={{maxWidth:430,margin:"0 auto",height:"100%",display:"flex",
      alignItems:"center",justifyContent:"space-between",padding:"0 14px"}}>
      <div onClick={()=>nav("home")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:2}}>
        <span style={{fontFamily:"var(--font-d)",fontSize:26,fontWeight:700,color:"var(--accent)",letterSpacing:1}}>1971</span>
        <span style={{fontFamily:"var(--font-d)",fontSize:26,fontWeight:700,color:"var(--text)",letterSpacing:1}}>WIN</span>
        <span style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:600,color:"var(--gold)",marginLeft:2}}>BD</span>
        <span style={{marginLeft:4,fontSize:16}}>🇧🇩</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div onClick={()=>nav("wallet")} style={{background:"var(--bg3)",border:"1px solid var(--border)",
          borderRadius:8,padding:"4px 10px",cursor:"pointer"}}>
          <div style={{fontSize:10,color:"var(--text2)"}}>Balance</div>
          <div style={{fontFamily:"var(--font-d)",fontSize:15,color:"var(--accent)",fontWeight:600}}>{fmt(user.balance)}</div>
        </div>
        <Btn small onClick={()=>nav("wallet")} style={{padding:"6px 12px",fontSize:13}}>+ Deposit</Btn>
      </div>
    </div>
  </header>
);

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const BottomNav = ({view,nav,betSlip}) => {
  const tabs = [
    {id:"home",icon:"🏠",label:"Home",labelBn:"Home"},
    {id:"sports",icon:"⚽",label:"Sports",labelBn:"Sports"},
    {id:"crash",icon:"💥",label:"Games",labelBn:"Games"},
    {id:"wallet",icon:"💰",label:"Wallet",labelBn:"Wallet"},
    {id:"account",icon:"👤",label:"Account",labelBn:"Account"},
  ];
  return (
    <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:430,height:60,background:"var(--hbg)",
      borderTop:"1px solid var(--border)",display:"flex",zIndex:150,
      paddingBottom:"env(safe-area-inset-bottom,0)"}}>
      {tabs.map(t=>{
        const active = view===t.id||(t.id==="crash"&&view==="casino");
        return (
          <button key={t.id} onClick={()=>nav(t.id)} style={{
            flex:1,display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",background:"none",border:"none",
            color:active?"var(--accent)":"var(--text2)",gap:2,
            transition:"color 0.2s",position:"relative"
          }}>
            {t.id==="sports"&&betSlip.length>0&&(
              <span style={{position:"absolute",top:6,right:"50%",marginRight:-14,
                background:"var(--red)",color:"#fff",borderRadius:999,
                width:16,height:16,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"var(--font-d)",fontWeight:700,animation:"pop 0.3s ease"}}>{betSlip.length}</span>
            )}
            <span style={{fontSize:22,lineHeight:1}}>{t.icon}</span>
            <span style={{fontSize:9,fontFamily:"var(--font-b)",fontWeight:active?600:400}}>{t.labelBn}</span>
            {active&&<span style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
              width:20,height:2,background:"var(--accent)",borderRadius:1}}/>}
          </button>
        );
      })}
    </nav>
  );
};

// ─── TICKER ───────────────────────────────────────────────────────────────────
const Ticker = () => {
  const items = [
    "Shah*** won ৳4,200 — Crash ×8.2","Rahim*** won ৳1,800 — Football",
    "Jami*** cashed out ৳6,500 — ×13.0","Hoss*** won ৳900 — Cricket",
    "Kari*** cashed out ৳12,000 — ×24.0","Nabi*** won ৳3,600 — BPL",
    "Moni*** cashed out ৳2,100 — ×4.2","Bari*** won ৳5,250 — NBA",
  ];
  const all = [...items,...items];
  return (
    <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",
      height:30,overflow:"hidden",display:"flex",alignItems:"center",flexShrink:0}}>
      <div style={{background:"var(--red)",padding:"0 10px",height:"100%",
        display:"flex",alignItems:"center",flexShrink:0,zIndex:1}}>
        <LiveDot/><span style={{fontSize:10,fontWeight:600,color:"#fff",letterSpacing:0.5}}>Live Wins</span>
      </div>
      <div style={{overflow:"hidden",flex:1}}>
        <div style={{display:"flex",gap:32,animation:"ticker 35s linear infinite",
          whiteSpace:"nowrap",alignItems:"center",height:30}}>
          {all.map((item,i)=>(
            <span key={i} style={{fontSize:11,color:"var(--text2)",flexShrink:0}}>
              <span style={{color:"var(--gold)"}}>🏆 </span>{item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── BET SLIP DRAWER ──────────────────────────────────────────────────────────
const BetSlipDrawer = ({betSlip,setBetSlip,show,setShow,user,setUser,setBetHistory,addToast}) => {
  const [stake,setStake] = useState("");
  const [betType,setBetType] = useState("single");
  const totalOdds = betSlip.reduce((a,b)=>a*b.odds,1);
  const potential = stake ? (parseFloat(stake)*totalOdds).toFixed(2) : "0.00";
  const bonus = betSlip.length>=3 && stake ? (parseFloat(potential)*0.05).toFixed(2) : "0.00";
  const [confirming,setConfirming] = useState(false);

  if(!show) return null;
  return (
    <>
      <div onClick={()=>setShow(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:280}}/>
      <div style={{position:"fixed",bottom:60,left:"50%",transform:"translateX(-50%)",
        width:"100%",maxWidth:430,background:"var(--bg3)",borderRadius:"16px 16px 0 0",
        border:"1px solid var(--border)",zIndex:290,animation:"drawer 0.3s ease",
        maxHeight:"80vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"8px 0",display:"flex",justifyContent:"center"}}>
          <div style={{width:36,height:4,background:"var(--border)",borderRadius:2}}/>
        </div>
        <div style={{padding:"0 16px 8px",display:"flex",justifyContent:"space-between",alignItems:"center",
          borderBottom:"1px solid var(--border)"}}>
          <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700}}>
            Bet Slip <span style={{color:"var(--accent)",fontSize:14}}>({betSlip.length})</span>
          </div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button onClick={()=>setBetSlip([])} style={{fontSize:12,color:"var(--red)",background:"none",border:"none",cursor:"pointer"}}>Clear All</button>
            <button onClick={()=>setShow(false)} style={{fontSize:18,color:"var(--text2)",background:"none",border:"none",cursor:"pointer"}}>✕</button>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1,padding:16}}>
          {betSlip.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              background:"var(--bg2)",borderRadius:8,padding:"10px 12px",marginBottom:8,
              border:"1px solid var(--border)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"var(--text2)",marginBottom:2}}>{s.match}</div>
                <div style={{fontSize:13,fontWeight:500}}>{s.pick}</div>
              </div>
              <div style={{fontFamily:"var(--font-d)",fontSize:18,color:"var(--accent)",fontWeight:600,marginRight:12}}>{fmtOdds(s.odds)}</div>
              <button onClick={()=>setBetSlip(betSlip.filter((_,j)=>j!==i))}
                style={{color:"var(--text2)",background:"none",border:"none",cursor:"pointer",fontSize:16}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {["single","accumulator"].map(t=>(
              <button key={t} onClick={()=>setBetType(t)} style={{
                flex:1,padding:"8px",borderRadius:8,fontSize:13,fontFamily:"var(--font-b)",
                background:betType===t?"var(--accent)":"var(--bg2)",
                color:betType===t?"#fff":"var(--text2)",border:`1px solid ${betType===t?"var(--accent)":"var(--border)"}`,
                cursor:"pointer",transition:"all 0.2s"
              }}>{t==="single"?"Single":"Accumulator"}</button>
            ))}
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:12,color:"var(--text2)",marginBottom:4}}>Stake Amount (৳)</div>
            <input type="number" value={stake} onChange={e=>setStake(e.target.value)}
              placeholder="0" style={{width:"100%",background:"var(--bg2)",border:"1px solid var(--border)",
                borderRadius:8,padding:"12px 14px",color:"var(--text)",fontSize:22,fontFamily:"var(--font-d)",fontWeight:600}}
              onFocus={e=>e.target.style.borderColor="var(--accent)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            <div style={{display:"flex",gap:8,marginTop:8}}>
              {[100,500,1000,5000].map(q=>(
                <button key={q} onClick={()=>setStake(String((parseFloat(stake)||0)+q))}
                  style={{flex:1,padding:"6px",background:"var(--bg2)",border:"1px solid var(--border)",
                    borderRadius:6,color:"var(--text2)",fontSize:12,fontFamily:"var(--font-b)",cursor:"pointer"}}>+{fmtN(q)}</button>
              ))}
            </div>
          </div>
          <div style={{background:"var(--bg2)",borderRadius:10,padding:12,marginBottom:16,
            border:"1px solid var(--border)"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:13,color:"var(--text2)"}}>Total Odds</span>
              <span style={{fontFamily:"var(--font-d)",fontSize:16,color:"var(--text)",fontWeight:600}}>{fmtOdds(totalOdds)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:13,color:"var(--text2)"}}>Potential Win</span>
              <span style={{fontFamily:"var(--font-d)",fontSize:18,color:"var(--accent)",fontWeight:700}}>{fmt(potential)}</span>
            </div>
            {betSlip.length>=3&&<div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:"var(--gold)"}}>Bonus (+5%)</span>
              <span style={{fontFamily:"var(--font-d)",fontSize:14,color:"var(--gold)"}}>{fmt(bonus)}</span>
            </div>}
          </div>
          {!confirming ? (
            <Btn fullWidth onClick={()=>{if(!stake||parseFloat(stake)<=0){addToast("Enter stake amount","error");return;}setConfirming(true);}}>
              Place Bet / PLACE BET →
            </Btn>
          ) : (
            <div style={{background:"var(--bg2)",borderRadius:10,padding:16,border:"1px solid var(--accent)"}}>
              <div style={{fontFamily:"var(--font-d)",fontSize:16,marginBottom:8,textAlign:"center"}}>Confirm?</div>
              <div style={{fontSize:13,color:"var(--text2)",textAlign:"center",marginBottom:12}}>
                {betSlip.length} selections • {fmt(stake)} • Potential {fmt(potential)}
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="ghost" fullWidth onClick={()=>setConfirming(false)}>Cancel</Btn>
                <Btn fullWidth onClick={()=>{
                  const amt = parseFloat(stake);
                  if(amt > user.balance){addToast("Insufficient Balance","error");setConfirming(false);return;}
                  setUser(u=>({...u,balance:u.balance-amt}));
                  setBetHistory(h=>[{id:"BET"+Date.now(),selections:betSlip.map(s=>({match:s.match,pick:s.pick,odds:s.odds})),
                    stake:amt,returns:parseFloat(potential),status:"pending",date:"Just now"},...h]);
                  addToast("Bet placed! Good luck! 🙏","success");
                  setBetSlip([]);setStake("");setConfirming(false);setShow(false);
                }}>Confirm ✓</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
const AuthPage = ({onLogin}) => {
  const [tab,setTab] = useState("login");
  const [form,setForm] = useState({phone:"",email:"",password:"",name:"",confirm:"",ref:""});
  const [showPass,setShowPass] = useState(false);
  const [otp,setOtp] = useState("");
  const [otpSent,setOtpSent] = useState(false);
  const [otpTimer,setOtpTimer] = useState(0);
  const [agreed,setAgreed] = useState(false);

  useEffect(()=>{
    if(otpTimer>0){const t=setTimeout(()=>setOtpTimer(t=>t-1),1000);return()=>clearTimeout(t);}
  },[otpTimer]);

  const passStrength = p => {
    if(!p) return {label:"",color:"var(--border)",w:0};
    if(p.length<6) return {label:"Weak",color:"var(--red)",w:33};
    if(p.length<10||!/[A-Z]/.test(p)) return {label:"Fair",color:"var(--gold)",w:66};
    return {label:"Strong",color:"var(--accent)",w:100};
  };
  const ps = passStrength(form.password);

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",alignItems:"center",padding:"0 0 80px"}}>
      <div style={{width:"100%",maxWidth:430,padding:"40px 24px 0"}}>
        {/* Flag stripe pattern */}
        <div style={{position:"absolute",top:0,left:0,right:0,height:200,overflow:"hidden",zIndex:0,pointerEvents:"none"}}>
          {[...Array(8)].map((_,i)=>(
            <div key={i} style={{position:"absolute",top:0,left:`${i*14-10}%`,width:"12%",height:"100%",
              background:`${i%2===0?"var(--accent)":"var(--red)"}`,opacity:0.04,
              transform:"skewX(-20deg)",animation:"shimmer 3s ease infinite",animationDelay:`${i*0.3}s`}}/>
          ))}
        </div>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:8,position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:4}}>
            <span style={{fontFamily:"var(--font-d)",fontSize:52,fontWeight:700,color:"var(--accent)",lineHeight:1}}>1971</span>
            <div>
              <span style={{fontFamily:"var(--font-d)",fontSize:52,fontWeight:700,color:"var(--text)",lineHeight:1}}>WIN</span>
              <span style={{fontFamily:"var(--font-d)",fontSize:36,fontWeight:600,color:"var(--gold)",marginLeft:4,lineHeight:1}}>BD</span>
            </div>
            <span style={{fontSize:28}}>🇧🇩</span>
          </div>
          <div style={{fontFamily:"var(--font-b)",fontSize:14,color:"var(--accent)",marginBottom:2}}>Platform of the Victorious</div>
          <div style={{fontFamily:"var(--font-b)",fontSize:12,color:"var(--text2)"}}>Bet Bold. Win Big. Since '71.</div>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",background:"var(--bg3)",borderRadius:10,padding:4,marginBottom:20,position:"relative",zIndex:1}}>
          {[{id:"login",label:"Login",bn:"Login"},{id:"register",label:"Register",bn:"Register"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1,padding:"10px",borderRadius:8,fontFamily:"var(--font-d)",
              fontWeight:600,fontSize:16,border:"none",cursor:"pointer",transition:"all 0.2s",
              background:tab===t.id?"var(--accent)":"transparent",
              color:tab===t.id?"#fff":"var(--text2)"
            }}>{t.label} / {t.bn}</button>
          ))}
        </div>
        {tab==="login" ? (
          <div style={{position:"relative",zIndex:1}}>
            <Input label="Mobile Number or Email" placeholder="+880 or email" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
            <Input label="Password" type={showPass?"text":"password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} suffix={<span onClick={()=>setShowPass(!showPass)} style={{cursor:"pointer"}}>{showPass?"🙈":"👁"}</span>}/>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
              <button style={{fontSize:12,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>Forgot Password?</button>
            </div>
            <Btn fullWidth onClick={()=>onLogin()}>LOGIN →</Btn>
            <div style={{textAlign:"center",marginTop:16,fontSize:13,color:"var(--text2)"}}>
              New here? <button onClick={()=>setTab("register")} style={{color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-b)"}}>Create Account →</button>
            </div>
          </div>
        ) : (
          <div style={{position:"relative",zIndex:1}}>
            <Input label="Full Name" placeholder="Your Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
            <Input label="Mobile Number" placeholder="+880 XXXX-XXXXXX" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
            <Input label="Password" type={showPass?"text":"password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} suffix={<span onClick={()=>setShowPass(!showPass)} style={{cursor:"pointer"}}>{showPass?"🙈":"👁"}</span>}/>
            {form.password&&<div style={{marginBottom:12,marginTop:-8}}>
              <div style={{height:3,background:"var(--border)",borderRadius:2,marginBottom:4}}>
                <div style={{height:"100%",width:`${ps.w}%`,background:ps.color,borderRadius:2,transition:"width 0.3s"}}/>
              </div>
              <span style={{fontSize:11,color:ps.color}}>{ps.label}</span>
            </div>}
            <Input label="Password Confirm" type="password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} suffix={form.confirm&&<span style={{color:form.password===form.confirm?"var(--accent)":"var(--red)"}}>{form.password===form.confirm?"✓":"✗"}</span>}/>
            <Input label="Referral Code (Optional)" placeholder="WIN71-XXXXX" value={form.ref} onChange={e=>setForm({...form,ref:e.target.value})}/>
            {!otpSent ? (
              <Btn fullWidth variant="outline" onClick={()=>{setOtpSent(true);setOtpTimer(59);}}>Send OTP</Btn>
            ) : (
              <div style={{marginBottom:12}}>
                <div style={{fontSize:12,color:"var(--text2)",marginBottom:4}}>OTP Code</div>
                <div style={{display:"flex",gap:8}}>
                  <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="6-digit code"
                    style={{flex:1,background:"var(--bg3)",border:"1px solid var(--accent)",borderRadius:8,
                      padding:"10px 14px",color:"var(--text)",fontSize:18,fontFamily:"var(--font-d)",letterSpacing:4}}/>
                  <button onClick={()=>{if(otpTimer===0){setOtpTimer(59);}}} disabled={otpTimer>0}
                    style={{padding:"10px 12px",background:"var(--bg3)",border:"1px solid var(--border)",
                      borderRadius:8,color:otpTimer>0?"var(--text2)":"var(--accent)",cursor:"pointer",fontSize:12,fontFamily:"var(--font-b)"}}>
                    {otpTimer>0?`${otpTimer}s`:"Resend"}
                  </button>
                </div>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,marginTop:8}}>
              <div onClick={()=>setAgreed(!agreed)} style={{width:18,height:18,background:agreed?"var(--accent)":"var(--bg3)",
                border:`2px solid ${agreed?"var(--accent)":"var(--border)"}`,borderRadius:4,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {agreed&&<span style={{color:"#fff",fontSize:12}}>✓</span>}
              </div>
              <span style={{fontSize:12,color:"var(--text2)"}}>I am 18+ and agree to Terms</span>
            </div>
            <Btn fullWidth onClick={()=>onLogin()}>CREATE ACCOUNT →</Btn>
            <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"var(--text2)"}}>
              Already have an account? <button onClick={()=>setTab("login")} style={{color:"var(--accent)",background:"none",border:"none",cursor:"pointer",fontFamily:"var(--font-b)"}}>Login →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ─── HOME PAGE ────────────────────────────────────────────────────────────────
const HomePage = ({user,nav,setBetSlip,betSlip,addToast}) => {
  const [banner,setBanner] = useState(0);
  const [bigWins,setBigWins] = useState([
    {user:"Shah***",amt:8400,game:"Crash ×14.2",time:"2 min"},
    {user:"Rahim***",amt:3600,game:"Football",time:"5 min"},
    {user:"Jami***",amt:12000,game:"Crash ×24.0",time:"8 min"},
    {user:"Moni***",amt:2100,game:"BPL Cricket",time:"12 min"},
    {user:"Kari***",amt:5250,game:"NBA",time:"15 min"},
  ]);

  const BANNERS = [
    {title:"100% Welcome Bonus",sub:"Up to ৳5,000 on first deposit",badge:"New User",
     gradient:"135deg,#00a550 0%,#e8112d 100%",icon:"🎁"},
    {title:"20% Daily Reload",sub:"20% extra on every deposit today",badge:"Daily",
     gradient:"135deg,#007a3a 0%,#004d25 100%",icon:"🔄"},
    {title:"Refer Friends, Earn ৳200",sub:"Per active friend referred",badge:"Popular",
     gradient:"135deg,#c8911a 0%,#f0b429 100%",icon:"👥"},
  ];

  const SPORT_TABS = [
    {icon:"⚽",label:"Football",bn:"Football",view:"sports"},
    {icon:"🏏",label:"Cricket",bn:"Cricket",view:"sports"},
    {icon:"🏀",label:"Basketball",bn:"Basketball",view:"sports"},
    {icon:"💥",label:"Crash",bn:"Crash",view:"crash"},
    {icon:"🎰",label:"Casino",bn:"Casino",view:"casino"},
    {icon:"🤼",label:"Kabaddi",bn:"Kabaddi",view:"sports"},
  ];

  const QUICK_GAMES = [
    {icon:"💥",name:"Crash",nameBn:"Crash",gradient:"#00a550,#003d1f",hot:true,view:"crash"},
    {icon:"🎰",name:"Slots",nameBn:"Slots",gradient:"#667eea,#764ba2",hot:true,view:"casino"},
    {icon:"🎡",name:"Wheel",nameBn:"Wheel",gradient:"#f0b429,#c8911a",hot:false,view:"casino"},
    {icon:"🎲",name:"Dice",nameBn:"Dice",gradient:"#e53935,#b71c1c",hot:false,view:"casino"},
    {icon:"🃏",name:"Baccarat",nameBn:"Baccarat",gradient:"#11998e,#38ef7d",hot:false,view:"casino"},
    {icon:"🐟",name:"Fishing",nameBn:"Fishing",gradient:"#005c97,#363795",hot:false,view:"casino"},
  ];

  const livematches = MOCK_MATCHES.filter(m=>m.status==="live");
  const upcoming = MOCK_MATCHES.filter(m=>m.status==="upcoming").slice(0,4);

  const addToBetSlip = (match,pick,odds) => {
    const key = `${match.id}-${pick}`;
    if(betSlip.find(b=>b.key===key)) return;
    if(betSlip.find(b=>b.matchId===match.id)){
      setBetSlip(slip=>slip.map(b=>b.matchId===match.id?{...b,pick,odds,key}:b));
    } else {
      setBetSlip(slip=>[...slip,{key,matchId:match.id,match:`${match.home} vs ${match.away}`,pick,odds}]);
    }
    addToast(`${pick} added to slip 🎯`,"success",1500);
  };

  return (
    <div style={{paddingBottom:80}}>
      <Ticker/>
      {/* Banner carousel */}
      <div style={{padding:"12px 14px 0"}}>
        <div style={{position:"relative",overflow:"hidden",borderRadius:14}}>
          {BANNERS.map((b,i)=>(
            <div key={i} style={{display:banner===i?"block":"none",
              background:`linear-gradient(${b.gradient})`,
              borderRadius:14,padding:20,position:"relative",overflow:"hidden"}}>
              {[...Array(6)].map((_,j)=>(
                <div key={j} style={{position:"absolute",bottom:-20,left:`${j*20-10}%`,
                  width:"15%",height:"150%",background:"rgba(255,255,255,0.04)",
                  transform:"skewX(-15deg)"}}/>
              ))}
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontSize:40,marginBottom:4}}>{b.icon}</div>
                <Badge color="#fff" bg="rgba(255,255,255,0.2)" style={{marginBottom:8}}>{b.badge}</Badge>
                <div style={{fontFamily:"var(--font-d)",fontSize:28,fontWeight:700,color:"#fff",lineHeight:1.1,marginBottom:4}}>{b.title}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",marginBottom:12}}>{b.sub}</div>
                <Btn small onClick={()=>nav("promotions")} style={{background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.4)"}}>Claim Now →</Btn>
              </div>
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:8}}>
            {BANNERS.map((_,i)=>(
              <div key={i} onClick={()=>setBanner(i)} style={{width:i===banner?20:6,height:6,
                borderRadius:3,background:i===banner?"var(--accent)":"var(--border)",
                cursor:"pointer",transition:"all 0.3s"}}/>
            ))}
          </div>
        </div>
      </div>
      {/* Sport tabs */}
      <div style={{padding:"14px 0 0",overflowX:"auto",display:"flex",gap:0,paddingLeft:14,
        scrollbarWidth:"none",msOverflowStyle:"none"}}>
        {SPORT_TABS.map(t=>(
          <button key={t.label} onClick={()=>nav(t.view)} style={{
            display:"flex",flexDirection:"column",alignItems:"center",gap:4,
            padding:"8px 14px",background:"none",border:"none",cursor:"pointer",
            borderBottom:"2px solid transparent",flexShrink:0,transition:"all 0.2s"
          }}
            onMouseEnter={e=>{e.currentTarget.style.borderBottomColor="var(--accent)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderBottomColor="transparent"}}>
            <span style={{fontSize:22}}>{t.icon}</span>
            <span style={{fontSize:11,color:"var(--text2)",fontFamily:"var(--font-b)"}}>{t.bn}</span>
          </button>
        ))}
      </div>
      <div style={{padding:"0 14px"}}>
        {/* Live matches */}
        {livematches.length>0&&<>
          <SectionHeader title="🔴 Live Match" action="See All" onAction={()=>nav("sports")}/>
          <div style={{display:"flex",gap:10,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
            {livematches.map(m=>(
              <div key={m.id} style={{background:"var(--card)",border:"1px solid var(--border)",
                borderRadius:12,padding:12,flexShrink:0,width:200,animation:"glow-green 3s ease infinite"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <LiveDot/><span style={{fontSize:11,color:"var(--red)",fontWeight:600}}>LIVE</span>
                    <span style={{fontSize:11,color:"var(--text2)"}}>{m.minute}</span>
                  </div>
                  <span style={{fontSize:11}}>{m.flag}</span>
                </div>
                <div style={{fontFamily:"var(--font-b)",fontSize:13,marginBottom:4}}>{m.home}</div>
                <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:700,textAlign:"center",
                  margin:"4px 0",color:"var(--accent)"}}>{m.homeScore} - {m.awayScore}</div>
                <div style={{fontFamily:"var(--font-b)",fontSize:13,textAlign:"right"}}>{m.away}</div>
                <div style={{display:"flex",gap:4,marginTop:10}}>
                  {[{pick:`1 ${m.home.slice(0,6)}`,odds:m.homeOdds},{pick:`X Draw`,odds:m.drawOdds},{pick:`2 ${m.away.slice(0,6)}`,odds:m.awayOdds}].filter(o=>o.odds).map((o,i)=>(
                    <button key={i} onClick={()=>addToBetSlip(m,o.pick,o.odds)} style={{
                      flex:1,padding:"6px 4px",borderRadius:6,fontSize:13,
                      fontFamily:"var(--font-d)",fontWeight:600,cursor:"pointer",
                      background:betSlip.find(b=>b.key===`${m.id}-${o.pick}`)?"var(--accent)":"var(--bg3)",
                      color:"var(--text)",border:"1px solid var(--border)",transition:"all 0.15s"
                    }}>{fmtOdds(o.odds)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>}
        {/* Upcoming */}
        <SectionHeader title="📅 Upcoming Matches" titleBn="Upcoming" action="See All" onAction={()=>nav("sports")}/>
        {upcoming.map(m=>(
          <div key={m.id} style={{background:"var(--card)",border:"1px solid var(--border)",
            borderRadius:10,marginBottom:8,overflow:"hidden"}}>
            <div style={{background:"var(--bg2)",padding:"6px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"var(--text2)"}}>{m.flag} {m.league}</span>
              <span style={{fontSize:11,color:"var(--text2)"}}>{m.time}</span>
            </div>
            <div style={{padding:"10px 12px"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{flex:1,fontSize:13,fontFamily:"var(--font-b)",fontWeight:500}}>{m.home}</span>
                <span style={{fontSize:11,color:"var(--text2)"}}>vs</span>
                <span style={{flex:1,fontSize:13,fontFamily:"var(--font-b)",fontWeight:500,textAlign:"right"}}>{m.away}</span>
              </div>
              <div style={{display:"flex",gap:6,marginTop:8}}>
                {[{label:"1",pick:`1 ${m.home.slice(0,8)}`,odds:m.homeOdds},{label:"X",pick:"X Draw",odds:m.drawOdds},{label:"2",pick:`2 ${m.away.slice(0,8)}`,odds:m.awayOdds}].filter(o=>o.odds).map((o,i)=>(
                  <button key={i} onClick={()=>addToBetSlip(m,o.pick,o.odds)} style={{
                    flex:1,display:"flex",justifyContent:"space-between",alignItems:"center",
                    padding:"7px 10px",borderRadius:8,border:"1px solid var(--border)",
                    background:betSlip.find(b=>b.key===`${m.id}-${o.pick}`)?"var(--accent)":"var(--bg3)",
                    cursor:"pointer",transition:"all 0.15s"
                  }}>
                    <span style={{fontSize:10,color:"var(--text2)"}}>{o.label}</span>
                    <span style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:600,color:"var(--text)"}}>{fmtOdds(o.odds)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {/* Quick games */}
        <SectionHeader title="🎮 Popular Games" titleBn="Popular Games"/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
          {QUICK_GAMES.map(g=>(
            <div key={g.name} onClick={()=>{if(g.view==="crash")nav("crash");else nav("casino");}}
              style={{background:`linear-gradient(135deg,${g.gradient})`,borderRadius:12,
                padding:"16px 14px",cursor:"pointer",position:"relative",overflow:"hidden",
                border:"1px solid rgba(255,255,255,0.08)",transition:"transform 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(0.98)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
              {g.hot&&<div style={{position:"absolute",top:8,right:8,fontSize:11,background:"rgba(0,0,0,0.4)",
                borderRadius:4,padding:"2px 6px",color:"#fff"}}>HOT 🔥</div>}
              <div style={{fontSize:30,marginBottom:4}}>{g.icon}</div>
              <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,color:"#fff"}}>{g.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{g.nameBn}</div>
            </div>
          ))}
        </div>
        {/* Big wins */}
        <SectionHeader title="🏆 Big Wins" titleBn="Big Wins"/>
        <div style={{background:"var(--card)",borderRadius:12,border:"1px solid var(--border)",overflow:"hidden",marginBottom:16}}>
          {bigWins.map((w,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
              borderBottom:i<bigWins.length-1?"1px solid var(--border)":"none",
              animation:"slide-up 0.3s ease",animationDelay:`${i*0.05}s`}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:"var(--accent)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,color:"#fff",flexShrink:0}}>
                {w.user[0]}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500}}>{w.user}</div>
                <div style={{fontSize:11,color:"var(--accent)"}}>{w.game}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,color:"var(--gold)"}}>{fmt(w.amt)}</div>
                <div style={{fontSize:10,color:"var(--text2)"}}>{w.time} ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// ─── SPORTS PAGE ──────────────────────────────────────────────────────────────
const SportsPage = ({betSlip,setBetSlip,addToast,betHistory,nav}) => {
  const [sport,setSport] = useState("all");
  const [subTab,setSubTab] = useState("all");
  const [activeTab,setActiveTab] = useState("matches");
  const [favs,setFavs] = useState(new Set());

  const sports = [{id:"all",icon:"🏆",label:"All"},{id:"football",icon:"⚽",label:"Football"},
    {id:"cricket",icon:"🏏",label:"Cricket"},{id:"basketball",icon:"🏀",label:"Basketball"},
    {id:"tennis",icon:"🎾",label:"Tennis"},{id:"kabaddi",icon:"🤼",label:"Kabaddi"}];

  const filtered = MOCK_MATCHES.filter(m=>{
    if(sport!=="all"&&m.sport!==sport) return false;
    if(subTab==="live"&&m.status!=="live") return false;
    if(subTab==="upcoming"&&m.status!=="upcoming") return false;
    return true;
  });

  const addToBetSlip = (m,pick,odds) => {
    const key=`${m.id}-${pick}`;
    if(betSlip.find(b=>b.key===key)){setBetSlip(betSlip.filter(b=>b.key!==key));return;}
    if(betSlip.find(b=>b.matchId===m.id)){setBetSlip(betSlip.map(b=>b.matchId===m.id?{...b,pick,odds,key}:b));}
    else setBetSlip([...betSlip,{key,matchId:m.id,match:`${m.home} vs ${m.away}`,pick,odds}]);
    addToast(`${pick} → added to slip 🎯`,"success",1500);
  };

  const isSelected = (m,pick) => !!betSlip.find(b=>b.key===`${m.id}-${pick}`);

  const leagues = [...new Set(filtered.map(m=>m.league))];

  return (
    <div style={{paddingBottom:80}}>
      {/* Sport tabs */}
      <div style={{background:"var(--hbg)",borderBottom:"1px solid var(--border)",
        overflowX:"auto",display:"flex",scrollbarWidth:"none",padding:"0 4px"}}>
        {sports.map(s=>(
          <button key={s.id} onClick={()=>setSport(s.id)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"12px 14px",
            background:"none",border:"none",borderBottom:`2px solid ${sport===s.id?"var(--accent)":"transparent"}`,
            color:sport===s.id?"var(--accent)":"var(--text2)",cursor:"pointer",
            flexShrink:0,fontFamily:"var(--font-b)",fontSize:13,fontWeight:sport===s.id?600:400,
            transition:"all 0.2s",whiteSpace:"nowrap"
          }}>{s.icon} {s.label}</button>
        ))}
      </div>
      {/* Sub tabs */}
      <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--border)",background:"var(--bg2)",paddingLeft:14}}>
        {[{id:"all",label:"All"},{id:"live",label:"🔴 Live"},{id:"upcoming",label:"📅 Upcoming"}].map(t=>(
          <button key={t.id} onClick={()=>setSubTab(t.id)} style={{
            padding:"8px 16px",background:"none",border:"none",borderBottom:`2px solid ${subTab===t.id?"var(--accent)":"transparent"}`,
            color:subTab===t.id?"var(--text)":"var(--text2)",cursor:"pointer",
            fontSize:12,fontFamily:"var(--font-b)",transition:"all 0.2s"
          }}>{t.label}</button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex",background:"var(--bg3)",margin:"6px 14px 6px 0",borderRadius:6}}>
          {["matches","bets"].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{
              padding:"4px 12px",borderRadius:6,fontSize:11,fontFamily:"var(--font-b)",
              background:activeTab===t?"var(--accent)":"transparent",color:activeTab===t?"#fff":"var(--text2)",
              border:"none",cursor:"pointer",transition:"all 0.2s"
            }}>{t==="matches"?"Match":"My Bets"}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 0 0",overflowY:"auto"}}>
        {activeTab==="matches" ? (
          leagues.length===0 ? (
            <div style={{textAlign:"center",padding:40,color:"var(--text2)"}}>
              <div style={{fontSize:40,marginBottom:8}}>🏆</div>
              <div>No Match found </div>
            </div>
          ) : leagues.map(league=>{
            const matches = filtered.filter(m=>m.league===league);
            return (
              <div key={league}>
                <div style={{background:"var(--bg2)",padding:"8px 14px",display:"flex",
                  justifyContent:"space-between",alignItems:"center",
                  borderBottom:"1px solid var(--border)",borderTop:"1px solid var(--border)"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{matches[0].flag} {league}</span>
                  <span style={{fontSize:11,color:"var(--text2)"}}>{matches.length} Match</span>
                </div>
                {matches.map(m=>(
                  <div key={m.id} style={{borderBottom:"1px solid var(--border)"}}>
                    <div style={{padding:"10px 14px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        {m.status==="live"?<><LiveDot/><span style={{fontSize:11,color:"var(--red)",fontWeight:600}}>LIVE {m.minute}</span></>
                        :<span style={{fontSize:11,color:"var(--text2)"}}>{m.time}</span>}
                      </div>
                      <button onClick={()=>setFavs(f=>{const n=new Set(f);n.has(m.id)?n.delete(m.id):n.add(m.id);return n;})}
                        style={{background:"none",border:"none",cursor:"pointer",fontSize:16}}>
                        {favs.has(m.id)?"⭐":"☆"}
                      </button>
                    </div>
                    <div style={{padding:"6px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontFamily:"var(--font-b)",fontWeight:500,marginBottom:4}}>{m.home}</div>
                        <div style={{fontSize:14,fontFamily:"var(--font-b)",fontWeight:500}}>{m.away}</div>
                      </div>
                      {m.status==="live"&&(
                        <div style={{textAlign:"center",minWidth:44}}>
                          <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:700,color:"var(--accent)",lineHeight:1}}>{m.homeScore}</div>
                          <div style={{fontSize:10,color:"var(--text2)"}}>-</div>
                          <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:700,color:"var(--accent)",lineHeight:1}}>{m.awayScore}</div>
                        </div>
                      )}
                      <div style={{display:"flex",flexDirection:"column",gap:6,minWidth:130}}>
                        {[
                          {label:"1",pick:`1 ${m.home.slice(0,8)}`,odds:m.homeOdds},
                          m.drawOdds&&{label:"X",pick:"X Draw",odds:m.drawOdds},
                          {label:"2",pick:`2 ${m.away.slice(0,8)}`,odds:m.awayOdds}
                        ].filter(Boolean).map((o,i)=>(
                          <button key={i} onClick={()=>addToBetSlip(m,o.pick,o.odds)}
                            className="odds-btn" style={{
                              display:"flex",justifyContent:"space-between",alignItems:"center",
                              padding:"6px 10px",borderRadius:8,border:"1px solid",
                              borderColor:isSelected(m,o.pick)?"var(--accent)":"var(--border)",
                              background:isSelected(m,o.pick)?"var(--accent)":"var(--bg3)",
                              cursor:"pointer",transition:"all 0.15s"
                            }}>
                            <span style={{fontSize:10,color:isSelected(m,o.pick)?"rgba(255,255,255,0.7)":"var(--text2)"}}>{o.label}</span>
                            <span style={{fontFamily:"var(--font-d)",fontSize:17,fontWeight:700,
                              color:isSelected(m,o.pick)?"#fff":"var(--text)"}}>{isSelected(m,o.pick)?"✓ ":""}{fmtOdds(o.odds)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{height:6}}/>
                  </div>
                ))}
              </div>
            );
          })
        ) : (
          <div style={{padding:14}}>
            {betHistory.length===0 ? (
              <div style={{textAlign:"center",padding:40,color:"var(--text2)"}}>
                <div style={{fontSize:40,marginBottom:8}}>📋</div>
                <div>No bets placed yet</div>
              </div>
            ) : betHistory.map((b,i)=>(
              <div key={i} style={{background:"var(--card)",border:`1px solid ${b.status==="won"?"var(--accent)":b.status==="lost"?"var(--red)":"var(--border)"}`,
                borderRadius:12,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:11,color:"var(--text2)"}}>#{b.id} • {b.date}</span>
                  <Badge color={b.status==="won"?"var(--accent)":b.status==="lost"?"var(--red)":"var(--gold)"}>
                    {b.status==="won"?"WON ✓":b.status==="lost"?"LOST ✗":"PENDING ⏳"}
                  </Badge>
                </div>
                {b.selections.map((s,j)=>(
                  <div key={j} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                    <span style={{color:"var(--text2)",flex:1}}>{s.match}</span>
                    <span style={{color:"var(--text)",marginLeft:8}}>{s.pick}</span>
                    <span style={{color:"var(--accent)",marginLeft:8,fontFamily:"var(--font-d)",fontWeight:600}}>{fmtOdds(s.odds)}</span>
                  </div>
                ))}
                <div style={{borderTop:"1px solid var(--border)",marginTop:8,paddingTop:8,
                  display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,color:"var(--text2)"}}>Stake: {fmt(b.stake)}</span>
                  <span style={{fontSize:13,fontFamily:"var(--font-d)",fontWeight:700,
                    color:b.status==="won"?"var(--accent)":b.status==="lost"?"var(--red)":"var(--text)"}}>
                    {b.status==="won"?"+"+fmt(b.returns):b.status==="lost"?"-"+fmt(b.stake):fmt(b.returns)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// ─── CRASH PAGE ───────────────────────────────────────────────────────────────
const CrashPage = ({user,setUser,addToast}) => {
  const [state,setState] = useState("waiting");
  const [countdown,setCountdown] = useState(5);
  const [multiplier,setMultiplier] = useState(1.00);
  const [crashAt,setCrashAt] = useState(null);
  const [path,setPath] = useState("M 0 220");
  const [betA,setBetA] = useState({stake:"200",placed:false,cashedOut:false,profit:0,autoAt:"",autoOn:false});
  const [betB,setBetB] = useState({stake:"100",placed:false,cashedOut:false,profit:0,autoAt:"",autoOn:false});
  const [history,setHistory] = useState(CRASH_HISTORY_INIT);
  const [players,setPlayers] = useState(MOCK_LIVE_PLAYERS);
  const [chat,setChat] = useState(MOCK_CHAT);
  const [chatInput,setChatInput] = useState("");
  const [showChat,setShowChat] = useState(false);
  const [myHistory,setMyHistory] = useState([]);
  const [pTab,setPTab] = useState("players");
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const crashAtRef = useRef(null);
  const multiplierRef = useRef(1.00);
  const svgW = 380, svgH = 230;

  const genCrash = () => {
    const r = Math.random();
    return r < 0.01 ? 1.00 : Math.max(1.01, parseFloat((0.99/(1-r)).toFixed(2)));
  };

  const multToY = (m) => Math.max(10, svgH - (Math.log(m)*60));
  const multToX = (m,elapsed) => Math.min(svgW-10, elapsed*0.12);

  const startRound = useCallback(() => {
    const ca = genCrash();
    crashAtRef.current = ca;
    setCrashAt(ca);
    setMultiplier(1.00);
    multiplierRef.current = 1.00;
    setPath("M 0 220");
    setPlayers(MOCK_LIVE_PLAYERS.map(p=>({...p,cashout:null,status:Math.random()>0.3?"playing":"playing"})));
    setState("running");
    startTimeRef.current = Date.now();
    let pts = [[0,220]];

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const m = Math.max(1.00, 1 + elapsed * 0.001 * (1 + elapsed*0.0001));
      multiplierRef.current = m;
      setMultiplier(parseFloat(m.toFixed(2)));

      const x = Math.min(svgW-10, elapsed * 0.1);
      const y = Math.max(10, svgH - Math.log(m) * 55);
      pts.push([x,y]);
      if(pts.length > 3) {
        const d = "M " + pts.map(p=>p[0]+" "+p[1]).join(" L ");
        setPath(d);
      }

      // Auto cashout
      [setBetA,setBetB].forEach((setter,idx) => {
        const bet = idx===0?betA:betB;
        if(bet.placed && !bet.cashedOut && bet.autoOn && parseFloat(bet.autoAt)>0) {
          if(m >= parseFloat(bet.autoAt)) {
            const profit = parseFloat(bet.stake) * parseFloat(bet.autoAt);
            setter(b=>({...b,cashedOut:true,profit}));
            setUser(u=>({...u,balance:u.balance+profit}));
            addToast(`AUTO ✓ ${fmtOdds(parseFloat(bet.autoAt))}x — Win ${fmt(profit)} 🏆`,"win",5000);
          }
        }
      });

      // Mock players cash out
      if(Math.random()<0.04) {
        setPlayers(ps=>ps.map(p=>p.status==="playing"&&Math.random()<0.1?{...p,cashout:parseFloat(m.toFixed(2)),status:"won"}:p));
      }

      if(m >= crashAtRef.current) {
        setState("crashed");
        // Bust uncashed bets
        setBetA(b=>b.placed&&!b.cashedOut?{...b,status:"bust"}:b);
        setBetB(b=>b.placed&&!b.cashedOut?{...b,status:"bust"}:b);
        setPlayers(ps=>ps.map(p=>p.status==="playing"?{...p,status:"bust"}:p));
        setHistory(h=>[parseFloat(m.toFixed(2)),...h.slice(0,19)]);
        setMyHistory(h=>[{crash:parseFloat(m.toFixed(2)),betA:betA.placed,profit:betA.cashedOut?betA.profit-parseFloat(betA.stake):(betA.placed?-parseFloat(betA.stake):0)},...h.slice(0,9)]);
        // New chat message
        setChat(c=>[{user:"System",msg:`💥 Crash @ ${m.toFixed(2)}x!`,time:"Just now"},...c.slice(0,19)]);
        setTimeout(()=>{
          setCountdown(5);
          setBetA(b=>({...b,placed:false,cashedOut:false,profit:0}));
          setBetB(b=>({...b,placed:false,cashedOut:false,profit:0}));
          const cd = setInterval(()=>{
            setCountdown(c=>{if(c<=1){clearInterval(cd);startRound();return 5;}return c-1;});
          },1000);
          setState("waiting");
        },2500);
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  },[betA,betB]);

  useEffect(()=>{
    const cd = setInterval(()=>{
      setCountdown(c=>{if(c<=1){clearInterval(cd);startRound();return 5;}return c-1;});
    },1000);
    // Chat mock messages
    const chatInt = setInterval(()=>{
      const users=["Rahim***","Shah***","Jami***","Hoss***","Kari***","Moni***"];
      setChat(c=>[{user:users[Math.floor(Math.random()*users.length)],
        msg:NEW_CHAT_MSGS[Math.floor(Math.random()*NEW_CHAT_MSGS.length)],time:"Just now"},...c.slice(0,19)]);
    },4000);
    return()=>{clearInterval(cd);clearInterval(chatInt);if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[]);

  const cashOut = (bet,setBet) => {
    if(!bet.placed||bet.cashedOut) return;
    const m = multiplierRef.current;
    const profit = parseFloat(bet.stake)*m;
    setBet(b=>({...b,cashedOut:true,profit}));
    setUser(u=>({...u,balance:u.balance+profit}));
    addToast(`Cashout ${fmtOdds(m)}x — Win ${fmt(profit)} 🏆`,"win",5000);
  };

  const placeBet = (bet,setBet) => {
    if(state!=="waiting") return;
    if(!bet.stake||parseFloat(bet.stake)<=0){addToast("Enter stake amount","error");return;}
    const amt = parseFloat(bet.stake);
    if(amt>user.balance){addToast("Insufficient Balance","error");return;}
    setUser(u=>({...u,balance:u.balance-amt}));
    setBet(b=>({...b,placed:true,cashedOut:false,profit:0}));
    addToast(`Bet placed : ${fmt(amt)}`,"success",1500);
  };

  const chipColor = v => v>=10?"var(--gold)":v>=3?"var(--accent)":v>=2?"#00c8ff":v>=1.5?"var(--text2)":"var(--red)";

  const renderBetPanel = (bet,setBet,label) => (
    <div style={{flex:1,background:"var(--card)",borderRadius:12,padding:14,border:`1px solid ${bet.placed?"var(--accent)":"var(--border)"}`}}>
      <div style={{fontFamily:"var(--font-d)",fontSize:13,color:"var(--text2)",marginBottom:10,fontWeight:600}}>{label}</div>
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        <input type="number" value={bet.stake} onChange={e=>setBet(b=>({...b,stake:e.target.value}))}
          disabled={bet.placed} style={{flex:1,background:"var(--bg2)",border:"1px solid var(--border)",
            borderRadius:8,padding:"8px 10px",color:"var(--text)",fontSize:20,fontFamily:"var(--font-d)",fontWeight:700,
            opacity:bet.placed?0.5:1}}/>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:10}}>
        {[100,500,1000,2000].map(q=>(
          <button key={q} disabled={bet.placed} onClick={()=>setBet(b=>({...b,stake:String(q)}))}
            style={{flex:1,padding:"4px 2px",background:"var(--bg2)",border:"1px solid var(--border)",
              borderRadius:6,color:"var(--text2)",fontSize:10,cursor:"pointer",opacity:bet.placed?0.4:1}}>{fmtN(q)}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
        <div onClick={()=>setBet(b=>({...b,autoOn:!b.autoOn}))} style={{
          width:32,height:18,borderRadius:9,background:bet.autoOn?"var(--accent)":"var(--border)",
          position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
          <div style={{position:"absolute",top:2,left:bet.autoOn?14:2,width:14,height:14,
            background:"#fff",borderRadius:"50%",transition:"left 0.2s"}}/>
        </div>
        <span style={{fontSize:11,color:"var(--text2)"}}>Auto Cashout</span>
        {bet.autoOn&&<input type="number" placeholder="2.00" value={bet.autoAt}
          onChange={e=>setBet(b=>({...b,autoAt:e.target.value}))}
          style={{width:60,background:"var(--bg2)",border:"1px solid var(--accent)",borderRadius:6,
            padding:"4px 8px",color:"var(--accent)",fontSize:13,fontFamily:"var(--font-d)"}}/>}
        {bet.autoOn&&<span style={{fontSize:11,color:"var(--text2)"}}>x</span>}
      </div>
      {state==="waiting"&&!bet.placed&&<Btn fullWidth onClick={()=>placeBet(bet,setBet)}>Place Bet</Btn>}
      {state==="waiting"&&bet.placed&&<div style={{textAlign:"center",padding:"10px",background:"var(--accent)22",borderRadius:8,border:"1px solid var(--accent)",fontSize:13,color:"var(--accent)"}}>Next round ✓</div>}
      {state==="running"&&bet.placed&&!bet.cashedOut&&(
        <button onClick={()=>cashOut(bet,setBet)} style={{width:"100%",padding:"12px",borderRadius:10,
          background:"var(--accent)",color:"#fff",fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,
          border:"none",cursor:"pointer",animation:"glow-green 1s infinite"}}>
          Cash Out @ {fmtOdds(multiplier)}x
        </button>
      )}
      {state==="running"&&!bet.placed&&<div style={{textAlign:"center",padding:"10px",background:"var(--bg2)",borderRadius:8,fontSize:13,color:"var(--text2)",border:"1px solid var(--border)"}}>Betting closed ⏳</div>}
      {state==="crashed"&&bet.placed&&bet.cashedOut&&<div style={{textAlign:"center",padding:"10px",background:"var(--accent)22",borderRadius:8,fontSize:14,color:"var(--accent)",fontFamily:"var(--font-d)",fontWeight:700}}>✓ Win {fmt(bet.profit)}</div>}
      {state==="crashed"&&bet.placed&&!bet.cashedOut&&<div style={{textAlign:"center",padding:"10px",background:"var(--red)22",borderRadius:8,fontSize:14,color:"var(--red)",fontFamily:"var(--font-d)",fontWeight:700}}>✗ BUST</div>}
    </div>
  );

  return (
    <div style={{paddingBottom:80}}>
      {/* Round history */}
      <div style={{padding:"10px 14px 6px",overflowX:"auto",display:"flex",gap:6,scrollbarWidth:"none"}}>
        {history.map((v,i)=>(
          <div key={i} style={{background:chipColor(v)+"22",border:`1px solid ${chipColor(v)}`,
            borderRadius:6,padding:"3px 8px",flexShrink:0,
            fontFamily:"var(--font-d)",fontSize:13,fontWeight:700,color:chipColor(v)}}>{v.toFixed(2)}x</div>
        ))}
      </div>
      {/* Canvas */}
      <div style={{margin:"0 14px",background:"var(--bg2)",borderRadius:14,border:"1px solid var(--border)",
        overflow:"hidden",position:"relative",
        animation:state==="crashed"?"crash-shake 0.5s ease":"none"}}>
        {state==="crashed"&&<div style={{position:"absolute",inset:0,background:"rgba(232,17,45,0.2)",
          animation:"crash-flash 0.8s ease forwards",zIndex:2,borderRadius:14,pointerEvents:"none"}}/>}
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{display:"block",animation:"curve-glow 2s ease infinite"}}>
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#00a550"/>
              <stop offset="100%" stopColor="#00c8ff"/>
            </linearGradient>
            <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00a550" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#00a550" stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25,0.5,0.75].map(r=>(
            <line key={r} x1="0" y1={svgH*r} x2={svgW} y2={svgH*r} stroke="#1f2d4a" strokeWidth="1"/>
          ))}
          {[0.2,0.4,0.6,0.8].map(r=>(
            <line key={r} x1={svgW*r} y1="0" x2={svgW*r} y2={svgH} stroke="#1f2d4a" strokeWidth="1"/>
          ))}
          {/* Fill */}
          {state==="running"&&<path d={path+" L "+svgW+" "+svgH+" L 0 "+svgH+" Z"}
            fill="url(#fillGrad)"/>}
          {/* Curve */}
          <path d={path} fill="none" stroke={state==="crashed"?"var(--red)":"url(#curveGrad)"} strokeWidth="3" strokeLinecap="round"/>
          {/* Tip dot */}
          {state==="running"&&path.length>5&&(()=>{
            const pts=path.replace("M ","").split(" L ");
            const last=pts[pts.length-1]?.split(" ");
            if(!last||last.length<2) return null;
            return <circle cx={last[0]} cy={last[1]} r="5" fill="#fff" stroke="var(--cyan)" strokeWidth="2" style={{filter:"drop-shadow(0 0 6px #00c8ff)"}}/>;
          })()}
        </svg>
        {/* Multiplier overlay */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          textAlign:"center",pointerEvents:"none"}}>
          {state==="waiting"&&(
            <div>
              <div style={{fontFamily:"var(--font-d)",fontSize:48,fontWeight:700,color:"var(--text2)",lineHeight:1}}>{countdown}</div>
              <div style={{fontSize:12,color:"var(--text2)"}}>Starting...</div>
            </div>
          )}
          {state==="running"&&(
            <div>
              <div style={{fontFamily:"var(--font-d)",fontSize:72,fontWeight:700,lineHeight:1,
                animation:"mult-glow 1s ease infinite",color:"#fff"}}>{fmtOdds(multiplier)}x</div>
              <div style={{fontSize:12,color:"var(--text2)"}}>Current Multiplier</div>
            </div>
          )}
          {state==="crashed"&&(
            <div>
              <div style={{fontFamily:"var(--font-d)",fontSize:48,fontWeight:700,color:"var(--red)",lineHeight:1}}>CRASHED! 💥</div>
              <div style={{fontFamily:"var(--font-d)",fontSize:28,color:"var(--red)"}}>@ {fmtOdds(crashAt)}x</div>
            </div>
          )}
        </div>
      </div>
      {/* Bet panels */}
      <div style={{padding:"12px 14px",display:"flex",gap:10}}>
        {renderBetPanel(betA,setBetA,"Bet A")}
        {renderBetPanel(betB,setBetB,"Bet B")}
      </div>
      {/* Players + chat */}
      <div style={{padding:"0 14px"}}>
        <div style={{display:"flex",gap:0,marginBottom:10}}>
          {["players","history","chat"].map(t=>(
            <button key={t} onClick={()=>setPTab(t)} style={{
              padding:"8px 14px",background:"none",border:"none",
              borderBottom:`2px solid ${pTab===t?"var(--accent)":"transparent"}`,
              color:pTab===t?"var(--text)":"var(--text2)",cursor:"pointer",fontSize:12,fontFamily:"var(--font-b)"
            }}>{t==="players"?"👥 Players":t==="history"?"📊 My History":"💬 Chat"}</button>
          ))}
        </div>
        {pTab==="players"&&(
          <div style={{background:"var(--card)",borderRadius:12,border:"1px solid var(--border)",overflow:"hidden"}}>
            <div style={{display:"flex",padding:"8px 12px",background:"var(--bg2)",fontSize:11,color:"var(--text2)",fontWeight:600}}>
              <span style={{flex:1}}>Player</span><span style={{width:60,textAlign:"right"}}>Bet</span>
              <span style={{width:60,textAlign:"right"}}>Cashout</span><span style={{width:70,textAlign:"right"}}>Profit</span>
            </div>
            {players.map((p,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",padding:"8px 12px",
                borderTop:"1px solid var(--border)",
                background:p.status==="won"?"rgba(0,165,80,0.05)":p.status==="bust"?"rgba(232,17,45,0.05)":"transparent"}}>
                <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:26,height:26,borderRadius:"50%",background:"var(--bg3)",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,
                    border:`1px solid ${p.status==="won"?"var(--accent)":p.status==="bust"?"var(--red)":"var(--border)"}`}}>
                    {p.name[0]}
                  </div>
                  <span style={{fontSize:12,color:p.status==="bust"?"var(--text2)":"var(--text)",
                    textDecoration:p.status==="bust"?"line-through":"none"}}>{p.name}</span>
                </div>
                <span style={{width:60,textAlign:"right",fontSize:12,color:"var(--text2)"}}>{fmt(p.bet)}</span>
                <span style={{width:60,textAlign:"right",fontSize:12,
                  color:p.cashout?"var(--accent)":"var(--text2)",fontFamily:"var(--font-d)",fontWeight:p.cashout?700:400}}>
                  {p.cashout?fmtOdds(p.cashout)+"x":"—"}
                </span>
                <span style={{width:70,textAlign:"right",fontSize:12,fontFamily:"var(--font-d)",fontWeight:700,
                  color:p.status==="won"?"var(--accent)":p.status==="bust"?"var(--red)":"var(--text2)"}}>
                  {p.status==="won"?"+"+fmt(p.bet*(p.cashout-1)):p.status==="bust"?"-"+fmt(p.bet):"—"}
                </span>
              </div>
            ))}
          </div>
        )}
        {pTab==="history"&&(
          <div style={{background:"var(--card)",borderRadius:12,border:"1px solid var(--border)",overflow:"hidden"}}>
            <div style={{display:"flex",padding:"8px 12px",background:"var(--bg2)",fontSize:11,color:"var(--text2)",fontWeight:600}}>
              <span style={{flex:1}}>Crash</span><span style={{width:60,textAlign:"right"}}>Bet</span><span style={{width:70,textAlign:"right"}}>Profit/Loss</span>
            </div>
            {myHistory.length===0&&<div style={{textAlign:"center",padding:24,color:"var(--text2)",fontSize:13}}>No rounds played yet</div>}
            {myHistory.map((r,i)=>(
              <div key={i} style={{display:"flex",padding:"8px 12px",borderTop:"1px solid var(--border)",
                background:r.profit>0?"rgba(0,165,80,0.05)":"rgba(232,17,45,0.05)"}}>
                <span style={{flex:1,fontFamily:"var(--font-d)",fontWeight:700,
                  color:chipColor(r.crash)}}>{r.crash.toFixed(2)}x</span>
                <span style={{width:60,textAlign:"right",fontSize:12,color:"var(--text2)"}}>{r.betA?fmt(0):"—"}</span>
                <span style={{width:70,textAlign:"right",fontSize:12,fontFamily:"var(--font-d)",fontWeight:700,
                  color:r.profit>=0?"var(--accent)":"var(--red)"}}>
                  {r.profit>=0?"+":""}{fmt(r.profit)}
                </span>
              </div>
            ))}
          </div>
        )}
        {pTab==="chat"&&(
          <div style={{background:"var(--card)",borderRadius:12,border:"1px solid var(--border)"}}>
            <div style={{height:200,overflowY:"auto",padding:10,display:"flex",flexDirection:"column-reverse"}}>
              {chat.map((m,i)=>(
                <div key={i} style={{marginBottom:6,animation:"slide-up 0.2s ease"}}>
                  <span style={{fontSize:11,color:"var(--accent)",fontWeight:600}}>{m.user} </span>
                  <span style={{fontSize:12,color:"var(--text)"}}>{m.msg}</span>
                  <span style={{fontSize:10,color:"var(--text2)",marginLeft:6}}>{m.time}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:8,padding:"8px 10px",borderTop:"1px solid var(--border)"}}>
              <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                placeholder="Type a message..." onKeyDown={e=>{if(e.key==="Enter"&&chatInput.trim()){
                  setChat(c=>[{user:"You",msg:chatInput,time:"Just now"},...c.slice(0,19)]);setChatInput("");
                }}} style={{flex:1,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,
                  padding:"8px 12px",color:"var(--text)",fontSize:13,fontFamily:"var(--font-b)"}}/>
              <Btn small onClick={()=>{if(chatInput.trim()){setChat(c=>[{user:"You",msg:chatInput,time:"Just now"},...c.slice(0,19)]);setChatInput("");}}}>Send</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// ─── CASINO PAGE ──────────────────────────────────────────────────────────────
const CasinoPage = ({nav,addToast}) => {
  const [cat,setCat] = useState("all");
  const [search,setSearch] = useState("");
  const [modal,setModal] = useState(null);
  const cats = [{id:"all",label:"🔥 All"},{id:"slots",label:"🎰 Slots"},{id:"live",label:"🎡 Live"},{id:"table",label:"🃏 Table"},{id:"crash",label:"💥 Crash"},{id:"fishing",label:"🐟 Fishing"}];
  const filtered = CASINO_GAMES.filter(g=>{
    if(cat!=="all"&&!g.name.toLowerCase().includes(cat)&&!(g.provider.toLowerCase().includes(cat))){}
    if(search&&!g.name.toLowerCase().includes(search.toLowerCase())&&!g.nameBn.includes(search)) return false;
    return true;
  });
  return (
    <div style={{paddingBottom:80}}>
      <div style={{padding:"12px 14px 0"}}>
        <div style={{position:"relative",marginBottom:12}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search games..."
            style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,
              padding:"10px 14px 10px 38px",color:"var(--text)",fontSize:14,fontFamily:"var(--font-b)"}}
            onFocus={e=>e.target.style.borderColor="var(--accent)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}/>
        </div>
      </div>
      <div style={{overflowX:"auto",display:"flex",gap:8,padding:"0 14px 12px",scrollbarWidth:"none"}}>
        {cats.map(c=><Pill key={c.id} active={cat===c.id} onClick={()=>setCat(c.id)}>{c.label}</Pill>)}
      </div>
      {/* Featured */}
      <div style={{margin:"0 14px 16px",background:"linear-gradient(135deg,#00a550,#003d1f)",
        borderRadius:14,padding:20,position:"relative",overflow:"hidden"}}>
        {[...Array(5)].map((_,i)=><div key={i} style={{position:"absolute",top:-20,left:`${i*25}%`,
          width:"20%",height:"150%",background:"rgba(255,255,255,0.03)",transform:"skewX(-15deg)"}}/>)}
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
            <div>
              <Badge color="#f0b429" bg="#f0b42922" style={{marginBottom:8}}>1971WIN EXCLUSIVE 🇧🇩</Badge>
              <div style={{fontFamily:"var(--font-d)",fontSize:32,fontWeight:700,color:"#fff",lineHeight:1,marginBottom:4}}>CRASH GAME</div>
              <div style={{fontFamily:"var(--font-b)",fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:12}}>Top payout this week: ৳1,24,000</div>
              <Btn small onClick={()=>nav("crash")} style={{background:"rgba(255,255,255,0.2)",color:"#fff",border:"1px solid rgba(255,255,255,0.3)"}}>Just now Play →</Btn>
            </div>
            <div style={{fontSize:60}}>💥</div>
          </div>
        </div>
      </div>
      <div style={{padding:"0 14px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {filtered.map(g=>(
          <div key={g.name} onClick={()=>g.iscrash?nav("crash"):setModal(g)}
            style={{background:`linear-gradient(135deg,${g.gradient})`,borderRadius:12,
              overflow:"hidden",cursor:"pointer",position:"relative",
              border:"1px solid rgba(255,255,255,0.08)",transition:"transform 0.2s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(0.97)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <div style={{height:100,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:44,position:"relative"}}>
              {g.badge&&<div style={{position:"absolute",top:6,right:6,background:"rgba(0,0,0,0.5)",
                borderRadius:4,padding:"2px 6px",fontSize:10,color:"#fff",fontWeight:600}}>{g.badge}</div>}
              {["Crash","Aviator","Plinko"].includes(g.name)?"💥":
               ["Sweet Bonanza","Fortune Tiger","Book of Dead","Gates of Olympus"].includes(g.name)?"🎰":
               ["Crazy Time","Mega Ball","Monopoly Live"].includes(g.name)?"🎡":
               g.name.includes("Tiger")||g.name.includes("Dragon")?"🐯":"🃏"}
            </div>
            <div style={{background:"rgba(0,0,0,0.4)",padding:"8px 10px"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginBottom:2}}>{g.provider}</div>
              <div style={{fontFamily:"var(--font-d)",fontSize:15,fontWeight:700,color:"#fff",lineHeight:1.1}}>{g.name}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>{g.nameBn}</div>
            </div>
          </div>
        ))}
      </div>
      {modal&&(
        <>
          <div onClick={()=>setModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:"90%",maxWidth:360,background:"var(--bg3)",borderRadius:16,
            border:"1px solid var(--border)",zIndex:401,padding:24,textAlign:"center"}}>
            <div style={{background:`linear-gradient(135deg,${modal.gradient})`,borderRadius:12,
              height:120,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:56,marginBottom:16}}>🎰</div>
            <div style={{fontFamily:"var(--font-d)",fontSize:24,fontWeight:700,marginBottom:4}}>{modal.name}</div>
            <div style={{fontSize:13,color:"var(--text2)",marginBottom:6}}>{modal.nameBn} • {modal.provider}</div>
            <div style={{background:"var(--gold)22",border:"1px solid var(--gold)",borderRadius:10,
              padding:12,marginBottom:20}}>
              <div style={{fontSize:20,marginBottom:4}}>🔒</div>
              <div style={{fontFamily:"var(--font-d)",fontSize:16,color:"var(--gold)"}}>Demo Mode Only</div>
              <div style={{fontSize:12,color:"var(--text2)"}}>Real play coming soon</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" fullWidth onClick={()=>setModal(null)}>Close</Btn>
              <Btn fullWidth onClick={()=>{addToast("Coming Soon! 🚀","info");setModal(null);}}>Play Demo</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── WALLET PAGE ──────────────────────────────────────────────────────────────
const WalletPage = ({user,setUser,transactions,setTransactions,addToast}) => {
  const [tab,setTab] = useState("deposit");
  const [amount,setAmount] = useState("");
  const [method,setMethod] = useState("bkash");
  const [account,setAccount] = useState("");
  const [txFilter,setTxFilter] = useState("all");

  const methods = [
    {id:"bkash",icon:"💚",label:"bKash",color:"#e2136e"},
    {id:"nagad",icon:"🟠",label:"Nagad",color:"#f7941d"},
    {id:"rocket",icon:"🔵",label:"Rocket",color:"#8b2fc9"},
    {id:"bank",icon:"🏦",label:"Bank Transfer",color:"#00a550"},
    {id:"usdt",icon:"₿",label:"USDT/Crypto",color:"#f7931a"},
    {id:"card",icon:"💳",label:"Card",color:"#1a56db"},
  ];

  const methodDetails = {
    bkash:{ph:"Send: 01711-971971 | Type: Send Money | Referred: username"},
    nagad:{ph:"Send: 01711-971972 | Type: Cash Out"},
    rocket:{ph:"Send: 01711-971973 | Agent Banking"},
    bank:{ph:"DBBL | A/C: 1971000000 | Name: 1971WIN BD Ltd"},
    usdt:{ph:"TRC20: T1971WIN...BD | Min: $10 ≈ ৳1,100"},
    card:{ph:"Visa/Mastercard via SSLCommerz"},
  };

  const confirmDeposit = () => {
    const amt = parseFloat(amount);
    if(!amt||amt<500){addToast("Minimum Deposit ৳500","error");return;}
    setUser(u=>({...u,balance:u.balance+amt}));
    setTransactions(t=>[{id:"TXN"+Date.now(),type:"deposit",method:methods.find(m=>m.id===method)?.label,
      amount:amt,status:"Completed",date:"Just now"},...t]);
    addToast(`৳${fmtN(amt)} Deposit Successful! ✅`,"success");
    setAmount("");
  };

  const confirmWithdraw = () => {
    const amt = parseFloat(amount);
    if(!amt||amt<500){addToast("Minimum Withdraw ৳500","error");return;}
    if(amt>user.balance){addToast("Insufficient Balance","error");return;}
    setUser(u=>({...u,balance:u.balance-amt}));
    setTransactions(t=>[{id:"TXN"+Date.now(),type:"withdraw",method:methods.find(m=>m.id===method)?.label,
      amount:amt,status:"Pending",date:"Just now"},...t]);
    addToast(`Withdraw Request Submit ! ⏳`,"success");
    setAmount("");setAccount("");
  };

  const filtered = transactions.filter(t=>txFilter==="all"||t.type===txFilter);

  return (
    <div style={{paddingBottom:80}}>
      {/* Balance card */}
      <div style={{margin:14,background:"linear-gradient(135deg,var(--accent-d),#002d1a)",borderRadius:16,
        padding:20,border:"1px solid var(--accent)44"}}>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:4}}>Total Balance / Total Balance</div>
        <div style={{fontFamily:"var(--font-d)",fontSize:40,fontWeight:700,color:"#fff",lineHeight:1,marginBottom:4}}>
          {fmt(user.balance)}
        </div>
        <div style={{fontSize:13,color:"var(--gold)",marginBottom:16}}>Bonus: {fmt(user.bonus)}</div>
        <div style={{display:"flex",gap:10}}>
          <Btn fullWidth onClick={()=>setTab("deposit")} style={{flex:1}}>+ Deposit</Btn>
          <Btn fullWidth variant="outline" onClick={()=>setTab("withdraw")} style={{flex:1,color:"#fff",borderColor:"rgba(255,255,255,0.4)",background:"rgba(255,255,255,0.1)"}}>↑ Withdraw</Btn>
        </div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",background:"var(--bg2)",borderRadius:10,margin:"0 14px 16px",padding:4}}>
        {[{id:"deposit",label:"Deposit"},{id:"withdraw",label:"Withdraw"},{id:"history",label:"History"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:"9px",borderRadius:8,fontFamily:"var(--font-b)",fontSize:13,
            border:"none",cursor:"pointer",transition:"all 0.2s",
            background:tab===t.id?"var(--accent)":"transparent",color:tab===t.id?"#fff":"var(--text2)"
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{padding:"0 14px"}}>
        {(tab==="deposit"||tab==="withdraw")&&<>
          <div style={{fontFamily:"var(--font-b)",fontSize:12,color:"var(--text2)",marginBottom:6}}>
            Amount (৳)
          </div>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0"
            style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:10,
              padding:"14px",color:"var(--text)",fontSize:28,fontFamily:"var(--font-d)",fontWeight:700,marginBottom:10}}
            onFocus={e=>e.target.style.borderColor="var(--accent)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
            {[500,1000,2000,5000,10000].map(q=>(
              <button key={q} onClick={()=>setAmount(String(q))} style={{
                padding:"8px",background:amount===String(q)?"var(--accent)22":"var(--bg3)",
                border:`1px solid ${amount===String(q)?"var(--accent)":"var(--border)"}`,
                borderRadius:8,color:amount===String(q)?"var(--accent)":"var(--text2)",
                cursor:"pointer",fontSize:13,fontFamily:"var(--font-d)",fontWeight:600
              }}>৳{fmtN(q)}</button>
            ))}
            <button onClick={()=>setAmount("")} style={{padding:"8px",background:"var(--bg3)",
              border:"1px solid var(--border)",borderRadius:8,color:"var(--text2)",cursor:"pointer",fontSize:13}}>Custom</button>
          </div>
          <div style={{fontSize:12,color:"var(--text2)",marginBottom:8}}>Payment Method</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {methods.filter(m=>tab==="deposit"||!["usdt","card"].includes(m.id)).map(m=>(
              <button key={m.id} onClick={()=>setMethod(m.id)} style={{
                display:"flex",alignItems:"center",gap:10,padding:"12px",
                background:method===m.id?m.color+"22":"var(--bg3)",
                border:`1px solid ${method===m.id?m.color:"var(--border)"}`,
                borderRadius:10,cursor:"pointer",transition:"all 0.2s"
              }}>
                <span style={{fontSize:20}}>{m.icon}</span>
                <span style={{fontSize:13,color:"var(--text)",fontFamily:"var(--font-b)",fontWeight:500}}>{m.label}</span>
              </button>
            ))}
          </div>
          {method&&<div style={{background:"var(--bg3)",border:"1px solid var(--border)",
            borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:"var(--text2)",lineHeight:1.6}}>
            📋 {methodDetails[method]?.ph}
          </div>}
          {tab==="withdraw"&&<Input label="Account Number" placeholder={method==="bkash"||method==="nagad"||method==="rocket"?"01X-XXXXXXXX":method==="bank"?"Bank Account":"Wallet address"} value={account} onChange={e=>setAccount(e.target.value)}/>}
          {tab==="deposit"&&<div style={{background:"var(--accent)11",border:"1px solid var(--accent)33",
            borderRadius:10,padding:12,marginBottom:16,fontSize:13,color:"var(--accent)"}}>
            🎁 First Deposit 100% Bonus up to ৳5,000!
          </div>}
          {tab==="withdraw"&&<div style={{fontSize:12,color:"var(--text2)",marginBottom:12}}>
            ⏱ Processed within 24 hours • Minimum ৳500
          </div>}
          <Btn fullWidth onClick={tab==="deposit"?confirmDeposit:confirmWithdraw}>
            {tab==="deposit"?"Deposit Confirm ✓":"Withdraw Request  ↑"}
          </Btn>
        </>}
        {tab==="history"&&<>
          <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",scrollbarWidth:"none"}}>
            {[{id:"all",label:"All"},{id:"deposit",label:"Deposit"},{id:"withdraw",label:"Withdraw"},{id:"bonus",label:"Bonus"}].map(f=>(
              <Pill key={f.id} active={txFilter===f.id} onClick={()=>setTxFilter(f.id)}>{f.label}</Pill>
            ))}
          </div>
          {filtered.map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,
              background:"var(--card)",borderRadius:12,padding:"12px 14px",marginBottom:8,
              border:"1px solid var(--border)"}}>
              <div style={{width:38,height:38,borderRadius:"50%",flexShrink:0,
                background:t.type==="deposit"?"var(--accent)22":t.type==="withdraw"?"var(--red)22":"var(--gold)22",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
                {t.type==="deposit"?"⬇️":t.type==="withdraw"?"⬆️":"🎁"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>
                  {t.type==="deposit"?"Deposit":t.type==="withdraw"?"Withdraw":"Bonus"} — {t.method}
                </div>
                <div style={{fontSize:11,color:"var(--text2)"}}>{t.date}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,
                  color:t.type==="deposit"||t.type==="bonus"?"var(--accent)":"var(--red)"}}>
                  {t.type==="deposit"||t.type==="bonus"?"+":"-"}{fmt(t.amount)}
                </div>
                <Badge color={t.status==="Completed"?"var(--accent)":t.status==="Pending"?"var(--gold)":"var(--red)"}>
                  {t.status==="Completed"?"Completed":t.status==="Pending"?"Pending":"Failed"}
                </Badge>
              </div>
            </div>
          ))}
        </>}
      </div>
    </div>
  );
};


// ─── PROMOTIONS PAGE ──────────────────────────────────────────────────────────
const PromosPage = ({user,addToast}) => {
  const [tab,setTab] = useState("active");
  const [claimed,setClaimed] = useState(new Set());
  const [copied,setCopied] = useState(false);
  const [streak] = useState([true,true,true,true,false,false,false]);

  const claim = (id) => {
    if(claimed.has(id)){addToast("Already claimed","error");return;}
    setClaimed(c=>new Set([...c,id]));
    addToast("Bonus claimed! 🎉","win",4000);
  };

  const copyCode = () => {
    setCopied(true);setTimeout(()=>setCopied(false),2000);
    addToast("Code copied! 📋","success",2000);
  };

  return (
    <div style={{paddingBottom:80,padding:"14px 14px 80px"}}>
      <div style={{display:"flex",background:"var(--bg2)",borderRadius:10,padding:4,marginBottom:16}}>
        {[{id:"active",label:"Active"},{id:"claimed",label:"Claimed"},{id:"expired",label:"Expired"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px",borderRadius:8,
            fontFamily:"var(--font-b)",fontSize:13,border:"none",cursor:"pointer",
            background:tab===t.id?"var(--accent)":"transparent",color:tab===t.id?"#fff":"var(--text2)"}}>{t.label}</button>
        ))}
      </div>

      {/* Welcome Bonus */}
      <div style={{background:"linear-gradient(135deg,#00a550 0%,#e8112d 100%)",borderRadius:16,
        padding:20,marginBottom:12,position:"relative",overflow:"hidden"}}>
        {[...Array(5)].map((_,i)=><div key={i} style={{position:"absolute",top:-20,left:`${i*25}%`,
          width:"20%",height:"150%",background:"rgba(255,255,255,0.04)",transform:"skewX(-15deg)"}}/>)}
        <div style={{position:"relative"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
            <div>
              <Badge color="#fff" bg="rgba(255,255,255,0.2)" style={{marginBottom:8}}>New User only</Badge>
              <div style={{fontFamily:"var(--font-d)",fontSize:34,fontWeight:700,color:"#fff",lineHeight:1,marginBottom:4}}>100% Welcome Bonus</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",marginBottom:4}}>Up to ৳5,000 on first deposit</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:12}}>Expires: 7 days</div>
              <Btn small onClick={()=>claim("welcome")} style={{background:"rgba(255,255,255,0.25)",color:"#fff",border:"1px solid rgba(255,255,255,0.4)"}}>
                {claimed.has("welcome")?"✓ Claim  ":"Just now Claim Now →"}
              </Btn>
            </div>
            <div style={{fontSize:50}}>🎁</div>
          </div>
        </div>
      </div>

      {/* Daily streak */}
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:700}}>20% Daily Reload 🔄</div>
            <div style={{fontSize:12,color:"var(--text2)"}}>20% extra on every deposit today</div>
          </div>
          <Badge color="var(--accent)">Daily</Badge>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {streak.map((done,i)=>(
            <div key={i} style={{flex:1,height:40,borderRadius:8,display:"flex",flexDirection:"column",
              alignItems:"center",justifyContent:"center",
              background:done?"var(--accent)":i===streak.findIndex(s=>!s)?"var(--accent)22":"var(--bg3)",
              border:`1px solid ${done?"var(--accent)":i===streak.findIndex(s=>!s)?"var(--accent)":"var(--border)"}`}}>
              <div style={{fontSize:10,color:done?"#fff":"var(--text2)"}}>D{i+1}</div>
              <div style={{fontSize:14}}>{done?"✓":"○"}</div>
            </div>
          ))}
        </div>
        <Btn fullWidth onClick={()=>claim("daily")} variant={claimed.has("daily")?"ghost":"primary"}>
          {claimed.has("daily")?"✓ Today Claim  ":"Today Reward  →"}
        </Btn>
      </Card>

      {/* Referral */}
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:700}}>Refer Friends, Earn ৳200 👥</div>
            <div style={{fontSize:12,color:"var(--text2)"}}>Per active friend referred</div>
          </div>
          <Badge color="var(--gold)">Popular</Badge>
        </div>
        <div style={{background:"var(--bg2)",borderRadius:10,padding:12,marginBottom:10,border:"1px solid var(--border)"}}>
          <div style={{fontSize:11,color:"var(--text2)",marginBottom:4}}>Your Referral Code</div>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1,fontFamily:"var(--font-d)",fontSize:22,fontWeight:700,color:"var(--accent)",
              background:"var(--bg3)",borderRadius:8,padding:"8px 12px",letterSpacing:2}}>{user.referralCode}</div>
            <Btn small onClick={copyCode}>{copied?"✓ Copy":"📋 Copy"}</Btn>
          </div>
        </div>
        <div style={{display:"flex",gap:12,marginBottom:14}}>
          {[{label:"Referred",val:user.referralCount},{label:"Active",val:6},{label:"Earned",val:"৳"+fmtN(user.referralEarned)}].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",background:"var(--bg2)",borderRadius:8,padding:"8px 4px"}}>
              <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:700,color:"var(--gold)"}}>{s.val}</div>
              <div style={{fontSize:11,color:"var(--text2)"}}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid var(--border)",paddingTop:10}}>
          {[{n:"Rahim***",d:"Jan 3",e:200,done:true},{n:"Shah***",d:"Jan 1",e:200,done:true},{n:"Jami***",d:"Dec 28",e:200,done:true},{n:"Nabi***",d:"Dec 20",e:0,done:false}].map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",
              borderBottom:i<3?"1px solid var(--border)22":"none"}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:"var(--bg3)",
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,
                color:r.done?"var(--accent)":"var(--text2)"}}>{r.n[0]}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13}}>{r.n}</div>
                <div style={{fontSize:11,color:"var(--text2)"}}>Joined {r.d}</div>
              </div>
              <Badge color={r.done?"var(--accent)":"var(--gold)"}>{r.done?"৳"+fmtN(r.e)+" ✓":"Pending"}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Acca boost */}
      <Card style={{marginBottom:12}}>
        <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:700,marginBottom:4}}>Accumulator Boost ⚡</div>
        <div style={{fontSize:12,color:"var(--text2)",marginBottom:12}}>Multi-bet bonus — win more</div>
        <div style={{display:"flex",gap:6}}>
          {[{n:3,b:"+5%"},{n:5,b:"+10%"},{n:7,b:"+20%"}].map(r=>(
            <div key={r.n} style={{flex:1,background:"var(--bg2)",borderRadius:10,padding:"10px 6px",
              textAlign:"center",border:"1px solid var(--border)"}}>
              <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:700,color:"var(--cyan)"}}>{r.b}</div>
              <div style={{fontSize:11,color:"var(--text2)"}}>≥{r.n} selections</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── VIP PAGE ─────────────────────────────────────────────────────────────────
const VIPPage = ({user}) => {
  const currentIdx = VIP_TIERS.findIndex(t=>t.name===user.tier);
  return (
    <div style={{paddingBottom:80,padding:"14px 14px 80px"}}>
      {/* Hero card */}
      <div style={{background:`linear-gradient(135deg,${tierColor(user.tier)}33,${tierColor(user.tier)}11)`,
        border:`1px solid ${tierColor(user.tier)}66`,borderRadius:16,padding:20,marginBottom:20,
        textAlign:"center",animation:"glow-green 3s ease infinite"}}>
        <div style={{fontSize:48,marginBottom:4}}>👑</div>
        <div style={{fontFamily:"var(--font-d)",fontSize:28,fontWeight:700,color:tierColor(user.tier),
          letterSpacing:2,marginBottom:2}}>{user.tier.toUpperCase()} MEMBER</div>
        <div style={{fontFamily:"var(--font-b)",fontSize:14,color:"var(--text2)",marginBottom:8}}>{user.nameBn}</div>
        <div style={{fontFamily:"var(--font-d)",fontSize:24,fontWeight:700,color:"var(--gold)"}}>{fmtN(user.points)} Points</div>
      </div>
      {/* Progress */}
      <Card style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:13,fontWeight:600,color:tierColor(user.tier)}}>{user.tier}</span>
          <span style={{fontSize:13,fontWeight:600,color:"var(--text2)"}}>{user.nextTier} →</span>
        </div>
        <div style={{height:8,background:"var(--border)",borderRadius:4,marginBottom:8,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${user.tierProgress}%`,
            background:`linear-gradient(90deg,${tierColor(user.tier)},var(--cyan))`,
            borderRadius:4,transition:"width 1s ease"}}/>
        </div>
        <div style={{fontSize:12,color:"var(--text2)",textAlign:"center"}}>
          {fmtN(user.points)} / {user.nextTier==="Platinum"?"20,000":user.nextTier==="Elite"?"100,000":"5,000"} Points ({user.tierProgress}%)
        </div>
        <div style={{fontSize:11,color:"var(--accent)",textAlign:"center",marginTop:4}}>
          {fmtN(user.pointsToNext)} Points more needed
        </div>
      </Card>
      {/* Tier cards */}
      {VIP_TIERS.map((tier,i)=>(
        <div key={tier.name} style={{background:tier.name===user.tier?tier.color+"11":"var(--card)",
          border:`1px solid ${tier.name===user.tier?tier.color+"66":"var(--border)"}`,
          borderRadius:12,padding:"14px",marginBottom:10,
          animation:tier.name===user.tier?"glow-green 3s ease infinite":"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:tier.color+"22",
                border:`2px solid ${tier.color}`,display:"flex",alignItems:"center",
                justifyContent:"center",fontFamily:"var(--font-d)",fontSize:14,fontWeight:700,color:tier.color}}>
                {i+1}
              </div>
              <div>
                <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,color:tier.color}}>{tier.nameBn} / {tier.name}</div>
                <div style={{fontSize:11,color:"var(--text2)"}}>
                  {tier.max===Infinity?`${fmtN(tier.min)}+ pts`:`${fmtN(tier.min)} – ${fmtN(tier.max)} pts`}
                </div>
              </div>
            </div>
            {tier.name===user.tier ? <Badge color={tier.color}>Current ✓</Badge>:
             i>currentIdx ? <Badge color="var(--text2)">Locked 🔒</Badge>:
             <Badge color="var(--accent)">Achieved ✓</Badge>}
          </div>
          {tier.perks.map((p,j)=><div key={j} style={{fontSize:13,color:"var(--text2)",padding:"2px 0"}}>{p}</div>)}
        </div>
      ))}
      {/* Points history */}
      <SectionHeader title="📊 Points History" titleBn="Points History"/>
      <Card>
        {[
          {act:"Accumulator Bet",pts:150,date:"Today"},
          {act:"৳2,000 Deposit / Deposit",pts:200,date:"Yesterday"},
          {act:"Closed Referred / Referral",pts:500,date:"Jan 3"},
          {act:"7 day login streak",pts:100,date:"Jan 2"},
          {act:"Bet Win / Bet Won",pts:350,date:"Jan 1"},
          {act:"First Deposit / First Deposit",pts:1000,date:"Mar 2024"},
        ].map((p,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"10px 0",borderBottom:i<5?"1px solid var(--border)22":"none"}}>
            <div>
              <div style={{fontSize:13}}>{p.act}</div>
              <div style={{fontSize:11,color:"var(--text2)"}}>{p.date}</div>
            </div>
            <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,color:"var(--gold)"}}>+{p.pts}</div>
          </div>
        ))}
      </Card>
    </div>
  );
};


// ─── ACCOUNT PAGE ─────────────────────────────────────────────────────────────
const AccountPage = ({user,setUser,nav,onLogout,addToast,setAdminAuthed}) => {
  const [secOpen,setSecOpen] = useState(false);
  const [kycOpen,setKycOpen] = useState(false);
  const [adminModal,setAdminModal] = useState(false);
  const [adminPass,setAdminPass] = useState("");
  const [twoFA,setTwoFA] = useState(false);
  const [notif,setNotif] = useState({email:true,sms:true,push:false});
  const [editName,setEditName] = useState(user.name);

  return (
    <div style={{paddingBottom:80}}>
      {/* Profile header */}
      <div style={{background:"linear-gradient(135deg,var(--accent-d),#001a0d)",padding:"24px 14px 20px",
        position:"relative",overflow:"hidden"}}>
        {[...Array(4)].map((_,i)=><div key={i} style={{position:"absolute",top:-10,left:`${i*30}%`,
          width:"25%",height:"150%",background:"rgba(255,255,255,0.03)",transform:"skewX(-15deg)"}}/>)}
        <div style={{display:"flex",alignItems:"center",gap:16,position:"relative"}}>
          <div style={{position:"relative"}}>
            <div style={{width:72,height:72,borderRadius:"50%",
              background:"linear-gradient(135deg,var(--accent),var(--red))",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"var(--font-d)",fontSize:32,fontWeight:700,color:"#fff",
              border:"3px solid rgba(255,255,255,0.3)"}}>
              {user.name[0]}
            </div>
            <button onClick={()=>addToast("Coming Soon 🚀","info")}
              style={{position:"absolute",bottom:0,right:0,width:22,height:22,borderRadius:"50%",
                background:"var(--bg3)",border:"2px solid var(--border)",
                display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11}}>📷</button>
          </div>
          <div>
            <div style={{fontFamily:"var(--font-d)",fontSize:24,fontWeight:700,color:"#fff"}}>{user.name}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginBottom:4}}>{user.nameBn}</div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <Badge color={tierColor(user.tier)}>👑 {user.tier}</Badge>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{user.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"14px 14px 0"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          {[{label:"Balance",val:fmt(user.balance),icon:"💰",color:"var(--accent)"},
            {label:"Points",val:fmtN(user.points),icon:"⭐",color:"var(--gold)"},
            {label:"Referred",val:user.referralCount,icon:"👥",color:"var(--cyan)"},
            {label:"Member Since",val:user.joinDate,icon:"📅",color:"var(--text2)"}].map(s=>(
            <div key={s.label} style={{background:"var(--card)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)"}}>
              <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
              <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:700,color:s.color}}>{s.val}</div>
              <div style={{fontSize:11,color:"var(--text2)"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Edit profile */}
        <Card style={{marginBottom:12}}>
          <div style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,marginBottom:12}}>✏️ Edit Profile</div>
          <Input label="Full Name" value={editName} onChange={e=>setEditName(e.target.value)}/>
          <Input label="Email" value={user.email} onChange={()=>{}}/>
          <Input label="Mobile Number" value={user.phone} readOnly suffix={<span style={{fontSize:11}}>🔒</span>}/>
          <Btn fullWidth onClick={()=>{setUser(u=>({...u,name:editName}));addToast("Profile updated ✅","success");}}>Save Changes</Btn>
        </Card>

        {/* Security */}
        <div style={{background:"var(--card)",borderRadius:12,border:"1px solid var(--border)",marginBottom:12,overflow:"hidden"}}>
          <button onClick={()=>setSecOpen(!secOpen)} style={{width:"100%",display:"flex",justifyContent:"space-between",
            alignItems:"center",padding:"14px 16px",background:"none",border:"none",cursor:"pointer"}}>
            <span style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,color:"var(--text)"}}>🔒 Security</span>
            <span style={{color:"var(--text2)"}}>{secOpen?"▲":"▼"}</span>
          </button>
          {secOpen&&<div style={{padding:"0 16px 16px",borderTop:"1px solid var(--border)"}}>
            <Input label="Current Password" type="password" placeholder="••••••••" value="" onChange={()=>{}}/>
            <Input label="New Password" type="password" placeholder="••••••••" value="" onChange={()=>{}}/>
            <Input label="Confirm" type="password" placeholder="••••••••" value="" onChange={()=>{}}/>
            <Btn fullWidth onClick={()=>addToast("Password Update  ✅","success")} style={{marginBottom:16}}>Update</Btn>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Two-Factor Authentication</div>
                <div style={{fontSize:11,color:"var(--text2)"}}>Two-Factor Authentication</div>
              </div>
              <div onClick={()=>{setTwoFA(!twoFA);addToast("Coming Soon 🚀","info");}}
                style={{width:40,height:22,borderRadius:11,background:twoFA?"var(--accent)":"var(--border)",
                  position:"relative",cursor:"pointer",transition:"background 0.2s"}}>
                <div style={{position:"absolute",top:3,left:twoFA?20:3,width:16,height:16,
                  background:"#fff",borderRadius:"50%",transition:"left 0.2s"}}/>
              </div>
            </div>
            <div style={{background:"var(--bg2)",borderRadius:10,padding:12}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Active Session</div>
              {[{d:"📱 Android — Dhaka, BD",t:"Now Active",current:true},{d:"💻 Chrome — Dhaka, BD",t:"2  hours ago",current:false}].map((s,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0"}}>
                  <div>
                    <div style={{fontSize:12}}>{s.d}</div>
                    <div style={{fontSize:11,color:"var(--text2)"}}>{s.t}</div>
                  </div>
                  {s.current?<Badge color="var(--accent)">Current</Badge>:
                  <Btn small variant="danger" onClick={()=>addToast("Session Cancel ","success")}>Cancel</Btn>}
                </div>
              ))}
            </div>
          </div>}
        </div>

        {/* KYC */}
        <div style={{background:"var(--card)",borderRadius:12,border:"1px solid var(--border)",marginBottom:12,overflow:"hidden"}}>
          <button onClick={()=>setKycOpen(!kycOpen)} style={{width:"100%",display:"flex",justifyContent:"space-between",
            alignItems:"center",padding:"14px 16px",background:"none",border:"none",cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,color:"var(--text)"}}>🪪 Identity Verification / KYC</span>
              <Badge color="var(--gold)">Not Verified</Badge>
            </div>
            <span style={{color:"var(--text2)"}}>{kycOpen?"▲":"▼"}</span>
          </button>
          {kycOpen&&<div style={{padding:"0 16px 16px",borderTop:"1px solid var(--border)"}}>
            <div style={{fontSize:13,color:"var(--text2)",marginBottom:12}}>Unlimited Withdraw for Verify </div>
            {["📄 National ID Card — Front","📄 National ID Card — Back","🤳 Selfie + ID Card"].map((d,i)=>(
              <div key={i} onClick={()=>addToast("File upload coming soon 🚀","info")}
                style={{background:"var(--bg2)",border:"2px dashed var(--border)",borderRadius:10,
                  padding:"16px",textAlign:"center",marginBottom:10,cursor:"pointer",
                  transition:"border-color 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
                onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                <div style={{fontSize:13,color:"var(--text2)"}}>{d}</div>
                <div style={{fontSize:11,color:"var(--accent)",marginTop:4}}>Tap to upload</div>
              </div>
            ))}
            <Btn fullWidth onClick={()=>addToast("Verification request submitted ✅","success")}>Submit for Verification</Btn>
          </div>}
        </div>

        {/* Notifications */}
        <Card style={{marginBottom:12}}>
          <div style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,marginBottom:12}}>🔔 Notification Settings</div>
          {[{id:"email",label:"Email"},{id:"sms",label:"SMS"},{id:"push",label:"Push"}].map(n=>(
            <div key={n.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0"}}>
              <span style={{fontSize:13}}>{n.label}</span>
              <div onClick={()=>setNotif(prev=>({...prev,[n.id]:!prev[n.id]}))}
                style={{width:36,height:20,borderRadius:10,background:notif[n.id]?"var(--accent)":"var(--border)",
                  position:"relative",cursor:"pointer",transition:"background 0.2s"}}>
                <div style={{position:"absolute",top:2,left:notif[n.id]?18:2,width:16,height:16,
                  background:"#fff",borderRadius:"50%",transition:"left 0.2s"}}/>
              </div>
            </div>
          ))}
        </Card>

        {/* Footer links */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[["📞","Support"],["📋","Terms"],["🔒","Privacy"],["🆘","Help"]].map(([ic,label])=>(
            <button key={label} onClick={()=>addToast("Coming Soon 🚀","info")}
              style={{display:"flex",alignItems:"center",gap:8,padding:"12px",background:"var(--card)",
                border:"1px solid var(--border)",borderRadius:10,cursor:"pointer",color:"var(--text2)",
                fontSize:13,fontFamily:"var(--font-b)"}}>
              <span>{ic}</span>{label}
            </button>
          ))}
        </div>

        <button onClick={()=>setAdminModal(true)} style={{background:"none",border:"none",
          color:"var(--border)",fontSize:11,cursor:"pointer",fontFamily:"var(--font-b)",marginBottom:16,
          display:"block",width:"100%",textAlign:"center"}}>⚙️ Admin Access</button>

        <Btn fullWidth variant="danger" onClick={onLogout} style={{marginBottom:8}}>LOGOUT →</Btn>
        <div style={{textAlign:"center",fontSize:11,color:"var(--text2)",marginBottom:16}}>v1.0.0 — 1971WIN BD 🇧🇩</div>
      </div>
      {/* Admin modal */}
      {adminModal&&(
        <>
          <div onClick={()=>setAdminModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:"85%",maxWidth:340,background:"var(--bg3)",borderRadius:16,border:"1px solid var(--border)",
            zIndex:401,padding:24}}>
            <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:700,marginBottom:16,textAlign:"center"}}>⚙️ Admin Access</div>
            <Input label="Password" type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="••••••••"/>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <Btn variant="ghost" fullWidth onClick={()=>setAdminModal(false)}>Cancel</Btn>
              <Btn fullWidth onClick={()=>{
                if(adminPass==="admin1971"){setAdminAuthed(true);nav("admin");setAdminModal(false);}
                else{addToast("Wrong Password","error");}
              }}>Enter</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
const AdminPage = ({nav,transactions,setTransactions,addToast}) => {
  const [tab,setTab] = useState("dashboard");
  const [users,setUsers] = useState(ADMIN_USERS);
  const [matches,setMatches] = useState(MOCK_MATCHES);
  const [settleModal,setSettleModal] = useState(null);

  const barData = [284500,312000,198000,425000,367000,290000,445000];
  const maxBar = Math.max(...barData);

  return (
    <div style={{paddingBottom:80}}>
      <div style={{background:"var(--red)",padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:700,color:"#fff"}}>⚙️ 1971WIN — Admin</div>
        <Btn small variant="ghost" onClick={()=>nav("account")} style={{color:"#fff",borderColor:"rgba(255,255,255,0.3)"}}>Exit ✕</Btn>
      </div>
      {/* Tabs */}
      <div style={{overflowX:"auto",display:"flex",background:"var(--hbg)",borderBottom:"1px solid var(--border)",scrollbarWidth:"none"}}>
        {[{id:"dashboard",label:"📊 Dashboard"},{id:"matches",label:"⚽ Match"},{id:"users",label:"👥 Users"},
          {id:"transactions",label:"💰 Transactions"},{id:"promotions",label:"🎁 Promotions"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            padding:"10px 14px",background:"none",border:"none",flexShrink:0,
            borderBottom:`2px solid ${tab===t.id?"var(--red)":"transparent"}`,
            color:tab===t.id?"var(--text)":"var(--text2)",cursor:"pointer",
            fontSize:12,fontFamily:"var(--font-b)",whiteSpace:"nowrap"}}>{t.label}</button>
        ))}
      </div>
      <div style={{padding:14}}>
        {tab==="dashboard"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {label:"Total Users",val:"48,971",sub:"+321 Today",color:"var(--accent)"},
                {label:"Now Active",val:"1,971",sub:"Online 🟢",color:"var(--cyan)"},
                {label:"Today Bet",val:"৳8.45L",sub:"Total",color:"var(--gold)"},
                {label:"Pending Withdraw",val:"45",sub:"৳92,500",color:"var(--red)"},
                {label:"House Edge Today",val:"৳34,200",sub:"+12.4%",color:"var(--accent)"},
                {label:"Status",val:"🟢 Online",sub:"All System Active",color:"var(--accent)"},
              ].map(s=>(
                <div key={s.label} style={{background:"var(--card)",borderRadius:12,padding:"12px 14px",border:"1px solid var(--border)"}}>
                  <div style={{fontFamily:"var(--font-d)",fontSize:22,fontWeight:700,color:s.color,marginBottom:2}}>{s.val}</div>
                  <div style={{fontSize:12,fontWeight:500,marginBottom:2}}>{s.label}</div>
                  <div style={{fontSize:11,color:"var(--text2)"}}>{s.sub}</div>
                </div>
              ))}
            </div>
            <Card>
              <div style={{fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,marginBottom:12}}>📈 Weekly Bet Volume</div>
              <div style={{display:"flex",gap:6,alignItems:"flex-end",height:80}}>
                {barData.map((v,i)=>(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:"100%",background:`linear-gradient(180deg,var(--accent),var(--accent-d))`,
                      height:`${(v/maxBar)*70}px`,borderRadius:"4px 4px 0 0",minHeight:6}}/>
                    <span style={{fontSize:9,color:"var(--text2)"}}>D{i+1}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
        {tab==="matches"&&(
          <>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
              <Btn small onClick={()=>addToast("Match Add  Feature Soon","info")}>+ New Match</Btn>
            </div>
            {matches.map(m=>(
              <div key={m.id} style={{background:"var(--card)",borderRadius:10,padding:"12px 14px",
                marginBottom:10,border:"1px solid var(--border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:12,color:"var(--text2)",marginBottom:2}}>{m.flag} {m.league}</div>
                    <div style={{fontSize:14,fontWeight:600}}>{m.home} vs {m.away}</div>
                    <div style={{fontSize:11,color:"var(--text2)"}}>{m.time}</div>
                  </div>
                  <Badge color={m.status==="live"?"var(--red)":"var(--accent)"}>
                    {m.status==="live"?"🔴 LIVE":"📅 Upcoming"}
                  </Badge>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <div style={{display:"flex",gap:4,flex:1}}>
                    {[m.homeOdds,m.drawOdds,m.awayOdds].filter(Boolean).map((o,i)=>(
                      <div key={i} style={{background:"var(--bg2)",borderRadius:6,padding:"4px 8px",
                        fontFamily:"var(--font-d)",fontSize:14,color:"var(--accent)"}}>
                        {["1","X","2"][i]}: {fmtOdds(o)}
                      </div>
                    ))}
                  </div>
                  <Btn small onClick={()=>setSettleModal(m)}>Settle</Btn>
                </div>
              </div>
            ))}
          </>
        )}
        {tab==="users"&&(
          <>
            <input placeholder="Search by name or phone..."
              style={{width:"100%",background:"var(--bg3)",border:"1px solid var(--border)",
                borderRadius:10,padding:"10px 14px",color:"var(--text)",fontSize:14,
                fontFamily:"var(--font-b)",marginBottom:12}}
              onFocus={e=>e.target.style.borderColor="var(--accent)"}
              onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            {users.map(u=>(
              <div key={u.id} style={{background:"var(--card)",borderRadius:10,padding:"12px 14px",
                marginBottom:8,border:`1px solid ${u.status==="suspended"?"var(--red)33":"var(--border)"}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:8}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",
                      background:`linear-gradient(135deg,${tierColor(u.tier)},${tierColor(u.tier)}88)`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontFamily:"var(--font-d)",fontSize:16,fontWeight:700,color:"#fff"}}>{u.name[0]}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{u.name}</div>
                      <div style={{fontSize:11,color:"var(--text2)"}}>{u.phone}</div>
                    </div>
                  </div>
                  <Badge color={u.status==="active"?"var(--accent)":"var(--red)"}>
                    {u.status==="active"?"Active":"Suspended"}
                  </Badge>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:8}}>
                    <Badge color={tierColor(u.tier)}>{u.tier}</Badge>
                    <span style={{fontFamily:"var(--font-d)",fontSize:15,color:"var(--accent)",fontWeight:700}}>{fmt(u.balance)}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <Btn small variant="ghost" onClick={()=>addToast(`${u.name} — Balance Edit coming soon`,"info")}>+Balance</Btn>
                    <Btn small variant={u.status==="active"?"danger":"primary"}
                      onClick={()=>setUsers(us=>us.map(x=>x.id===u.id?{...x,status:x.status==="active"?"suspended":"active"}:x))}>
                      {u.status==="active"?"Suspended":"Resend"}
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
        {tab==="transactions"&&(
          <>
            <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",scrollbarWidth:"none"}}>
              {[{id:"all",label:"All"},{id:"deposit",label:"Deposit"},{id:"withdraw",label:"Withdraw"}].map(f=>(
                <Pill key={f.id} active={false} onClick={()=>{}}>{f.label}</Pill>
              ))}
            </div>
            {transactions.slice(0,15).map((t,i)=>(
              <div key={i} style={{background:"var(--card)",borderRadius:10,padding:"12px 14px",
                marginBottom:8,border:"1px solid var(--border)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:6}}>
                  <div>
                    <div style={{fontSize:12,color:"var(--text2)",marginBottom:2}}>{t.id}</div>
                    <div style={{fontSize:13,fontWeight:500}}>
                      {t.type==="deposit"?"Deposit":t.type==="withdraw"?"Withdraw":"Bonus"} — {t.method}
                    </div>
                    <div style={{fontSize:11,color:"var(--text2)"}}>{t.date}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:700,
                      color:t.type!=="withdraw"?"var(--accent)":"var(--red)"}}>{fmt(t.amount)}</div>
                    <Badge color={t.status==="Completed"?"var(--accent)":t.status==="Pending"?"var(--gold)":"var(--red)"}>
                      {t.status==="Completed"?"Completed":t.status==="Pending"?"Pending":"Failed"}
                    </Badge>
                  </div>
                </div>
                {t.status==="Pending"&&(
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <Btn small fullWidth onClick={()=>{setTransactions(ts=>ts.map((x,j)=>j===i?{...x,status:"Completed"}:x));addToast("Approved ✅","success");}}>✓ Approve</Btn>
                    <Btn small variant="danger" fullWidth onClick={()=>{setTransactions(ts=>ts.map((x,j)=>j===i?{...x,status:"Failed"}:x));addToast("Rejected","error");}}>✗ Reject</Btn>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {tab==="promotions"&&(
          <div>
            {["Welcome Bonus — 100% up to ৳5,000","Daily Reload — 20%","Referral Bonus — ৳200","Accumulator Boost — 5-20%"].map((promo,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                background:"var(--card)",borderRadius:10,padding:"14px",marginBottom:10,border:"1px solid var(--border)"}}>
                <div style={{fontSize:13,fontWeight:500,flex:1}}>{promo}</div>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:36,height:20,borderRadius:10,background:"var(--accent)",
                    position:"relative",cursor:"pointer"}}>
                    <div style={{position:"absolute",top:3,right:3,width:14,height:14,background:"#fff",borderRadius:"50%"}}/>
                  </div>
                  <Btn small variant="ghost" onClick={()=>addToast("Edit coming soon","info")}>Edit</Btn>
                </div>
              </div>
            ))}
            <Btn fullWidth onClick={()=>addToast("New Promotions Soon","info")}>+ New Promotions</Btn>
          </div>
        )}
      </div>
      {/* Settle modal */}
      {settleModal&&(
        <>
          <div onClick={()=>setSettleModal(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:400}}/>
          <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            width:"85%",maxWidth:340,background:"var(--bg3)",borderRadius:16,border:"1px solid var(--border)",
            zIndex:401,padding:24}}>
            <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:700,marginBottom:4}}>Match Settle </div>
            <div style={{fontSize:13,color:"var(--text2)",marginBottom:16}}>{settleModal.home} vs {settleModal.away}</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {[{label:`1 — ${settleModal.home} Win`,color:"var(--accent)"},
                {label:"X — Draw",color:"var(--gold)"},
                {label:`2 — ${settleModal.away} Win`,color:"var(--red)"}].map((o,i)=>(
                <Btn key={i} fullWidth onClick={()=>{addToast(`Settle: ${o.label} ✅`,"success");setSettleModal(null);}}
                  style={{background:o.color+"22",color:o.color,border:`1px solid ${o.color}`,fontFamily:"var(--font-b)",fontWeight:500,textTransform:"none"}}>
                  {o.label}
                </Btn>
              ))}
            </div>
            <Btn variant="ghost" fullWidth onClick={()=>setSettleModal(null)}>Cancel</Btn>
          </div>
        </>
      )}
    </div>
  );
};


// ─── FONT LINK ────────────────────────────────────────────────────────────────
const FontLink = () => null; // Fonts loaded via GLOBAL_CSS @import

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("auth");
  const [user, setUser] = useState(null);
  const [betSlip, setBetSlip] = useState([]);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [betHistory, setBetHistory] = useState(MOCK_BETS);
  const [adminAuthed, setAdminAuthed] = useState(false);

  // Inject global CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Auto-show bet slip when items added
  useEffect(() => {
    if (betSlip.length > 0) setShowBetSlip(true);
  }, [betSlip.length]);

  const addToast = useCallback((msg, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const nav = useCallback((destination) => {
    setView(destination);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const handleLogin = () => {
    setUser(MOCK_USER);
    nav("home");
    setTimeout(() => addToast("Welcome, Abdulhalim! 🇧🇩 Welcome to 1971WIN BD 🏆", "win", 4000), 500);
  };

  const handleLogout = () => {
    setUser(null);
    setBetSlip([]);
    setShowBetSlip(false);
    nav("auth");
  };

  // Common props
  const commonProps = { user, setUser, nav, addToast };

  if (!user) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh" }}>
        <FontLink />
        <AuthPage onLogin={handleLogin} />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh",
      background: "var(--bg)", position: "relative" }}>
      <FontLink />

      {/* Sticky header (not on admin) */}
      {view !== "admin" && <Header user={user} nav={nav} betSlip={betSlip} />}

      {/* Page content */}
      <div className="page" key={view} style={{ minHeight: "calc(100vh - 116px)" }}>
        {view === "home" && <HomePage {...commonProps} setBetSlip={setBetSlip} betSlip={betSlip} />}
        {view === "sports" && <SportsPage betSlip={betSlip} setBetSlip={setBetSlip} addToast={addToast} betHistory={betHistory} nav={nav} />}
        {view === "crash" && <CrashPage {...commonProps} />}
        {view === "casino" && <CasinoPage nav={nav} addToast={addToast} />}
        {view === "wallet" && <WalletPage {...commonProps} transactions={transactions} setTransactions={setTransactions} />}
        {view === "promotions" && <PromosPage user={user} addToast={addToast} />}
        {view === "vip" && <VIPPage user={user} />}
        {view === "account" && <AccountPage {...commonProps} onLogout={handleLogout} setAdminAuthed={setAdminAuthed} />}
        {view === "admin" && adminAuthed && <AdminPage nav={nav} transactions={transactions} setTransactions={setTransactions} addToast={addToast} />}
      </div>

      {/* Bottom nav */}
      {view !== "admin" && <BottomNav view={view} nav={nav} betSlip={betSlip} />}

      {/* Bet slip drawer */}
      <BetSlipDrawer
        betSlip={betSlip} setBetSlip={setBetSlip}
        show={showBetSlip} setShow={setShowBetSlip}
        user={user} setUser={setUser}
        setBetHistory={setBetHistory} addToast={addToast}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} />

      {/* Demo footer */}
      <div style={{ position: "fixed", bottom: 60, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: "rgba(6,8,15,0.9)", borderTop: "1px solid var(--border)",
        padding: "3px 14px", textAlign: "center", zIndex: 140 }}>
        <span style={{ fontSize: 9, color: "var(--text2)", fontFamily: "var(--font-b)" }}>
          ⚠️ Demo Mode — No Real Money • 18+ Only • For Presentation Purposes Only
        </span>
      </div>
    </div>
  );
}

