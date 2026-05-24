import { useState, useRef, useEffect, useCallback } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = `
  :root {
    --bg:#0A0A0F; --bg1:#111118; --bg2:#18181F; --bg3:#1E1E28; --surface:#23232E;
    --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
    --gold:#C9A84C; --gold2:#E8C96A; --gold-dim:rgba(201,168,76,0.15); --gold-glow:rgba(201,168,76,0.25);
    --text:#F0EFE8; --text2:#9996A8; --text3:#5E5C70;
    --accent:#7B6FD4; --accent2:#A99CF0; --red:#E05C5C; --green:#4ECBA4;
    --r:14px; --r2:20px; --r3:28px;
    --font-d:'Syne',sans-serif; --font-b:'DM Sans',sans-serif;
    --ease:cubic-bezier(0.23,1,0.32,1); --shadow:0 24px 64px rgba(0,0,0,0.6);
  }
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  body{background:var(--bg);color:var(--text);font-family:var(--font-b);overflow:hidden;height:100vh}
  ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
  input,textarea{outline:none;font-family:var(--font-b)} button{cursor:pointer;border:none;font-family:var(--font-b)}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes typeDot{0%,80%,100%{transform:scale(0);opacity:.3}40%{transform:scale(1);opacity:1}}
  @keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px var(--gold-glow)}50%{box-shadow:0 0 40px var(--gold-glow),0 0 80px rgba(201,168,76,.1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
`;
document.head.appendChild(style);

const API_URL = import.meta.env.VITE_API_URL || "https://aura-backend-sigma.vercel.app";

const TOOLS = [
  {id:"email",icon:"✉",label:"Email",color:"#7B6FD4",desc:"Gmail & Outlook"},
  {id:"calendar",icon:"◫",label:"Calendar",color:"#4ECBA4",desc:"Google Calendar"},
  {id:"research",icon:"⊕",label:"Research",color:"#C9A84C",desc:"Web & deep research"},
  {id:"deck",icon:"▦",label:"Presentation",color:"#E05C5C",desc:"Gamma AI decks"},
  {id:"linkedin",icon:"⬡",label:"LinkedIn",color:"#5B9BD5",desc:"Posts & messages"},
  {id:"crm",icon:"◈",label:"Apollo CRM",color:"#A99CF0",desc:"Prospects & outreach"},
];

const QUICK_ACTIONS = [
  "Summarise my inbox","Draft a follow-up to my last email",
  "What meetings do I have today?","Research top pharma companies in Japan",
  "Create a pitch deck for ALR Labs","Find procurement contacts at exhibitors",
];

const SAMPLE_HISTORY = [
  {role:"assistant",text:"Good morning! I'm Aura, your AI chief of staff. Connect your Gmail in the **Connectors** screen to get started with real email access. What can I help you with today?",time:"09:02"},
];

const PROVIDER_META = {
  gmail:{label:"Gmail",color:"#EA4335",bg:"rgba(234,67,53,0.12)",icon:"G"},
  outlook:{label:"Outlook",color:"#0078D4",bg:"rgba(0,120,212,0.12)",icon:"O"},
  yahoo:{label:"Yahoo Mail",color:"#6001D2",bg:"rgba(96,1,210,0.12)",icon:"Y"},
  imap:{label:"Custom/IMAP",color:"#4ECBA4",bg:"rgba(78,203,164,0.12)",icon:"@"},
};

const tagColor={urgent:"var(--red)",crm:"var(--accent)",docs:"var(--gold)"};

const INIT_CONNECTORS = [
  {id:"gmail",name:"Gmail",icon:"G",color:"#EA4335",bg:"rgba(234,67,53,0.12)",category:"Email",desc:"Read, send & manage Gmail",status:"disconnected"},
  {id:"outlook",name:"Outlook",icon:"O",color:"#0078D4",bg:"rgba(0,120,212,0.12)",category:"Email",desc:"Microsoft 365 mail & calendar",status:"disconnected"},
  {id:"gcal",name:"Google Calendar",icon:"◫",color:"#4ECBA4",bg:"rgba(78,203,164,0.12)",category:"Calendar",desc:"Events, meetings & scheduling",status:"disconnected"},
  {id:"apollo",name:"Apollo.io",icon:"◈",color:"#A99CF0",bg:"rgba(169,156,240,0.12)",category:"CRM",desc:"Prospect enrichment & sequences",status:"connected"},
  {id:"gamma",name:"Gamma",icon:"▦",color:"#E05C5C",bg:"rgba(224,92,92,0.12)",category:"Presentations",desc:"AI-powered slide decks",status:"connected"},
  {id:"linkedin",name:"LinkedIn",icon:"⬡",color:"#5B9BD5",bg:"rgba(91,155,213,0.12)",category:"Social",desc:"Posts, messages & network",status:"needs_install"},
  {id:"slack",name:"Slack",icon:"#",color:"#E01E5A",bg:"rgba(224,30,90,0.12)",category:"Messaging",desc:"Team channels & DMs",status:"disconnected"},
  {id:"notion",name:"Notion",icon:"N",color:"#F0EFE8",bg:"rgba(240,239,232,0.08)",category:"Notes",desc:"Docs, wikis & databases",status:"disconnected"},
  {id:"hubspot",name:"HubSpot",icon:"H",color:"#FF7A59",bg:"rgba(255,122,89,0.12)",category:"CRM",desc:"Marketing & sales CRM",status:"disconnected"},
  {id:"zapier",name:"Zapier",icon:"Z",color:"#FF4A00",bg:"rgba(255,74,0,0.12)",category:"Automation",desc:"Connect 5000+ apps",status:"disconnected"},
  {id:"sheets",name:"Google Sheets",icon:"S",color:"#34A853",bg:"rgba(52,168,83,0.12)",category:"Data",desc:"Spreadsheets & data",status:"disconnected"},
  {id:"whatsapp",name:"WhatsApp",icon:"W",color:"#25D366",bg:"rgba(37,211,102,0.12)",category:"Messaging",desc:"Business messaging",status:"disconnected"},
];

const PROJECT_COLORS = ["#C9A84C","#7B6FD4","#4ECBA4","#E05C5C","#5B9BD5","#F0A06A","#A99CF0","#EA4335"];
const PROJECT_ICONS  = ["◉","▦","◈","⊕","✦","◎","⬡","≡"];

const INIT_PROJECTS=[
  {id:"p1",name:"CPHI Japan 2026",icon:"◈",color:"#A99CF0",desc:"Pharma exhibitor contacts",chats:8,created:"Jan 2026"},
  {id:"p2",name:"Sage n Silk Launch",icon:"✦",color:"#C9A84C",desc:"Ayurvedic brand strategy",chats:5,created:"Feb 2026"},
  {id:"p3",name:"DCAT Outreach",icon:"⊕",color:"#4ECBA4",desc:"Member company contacts",chats:12,created:"Mar 2026"},
];

const fmt = s => s.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");

// ── Gmail Token Storage ────────────────────────────────────────────────────────
const gmailStorage = {
  save:(token,email,name)=>{
    try{
      sessionStorage.setItem("gmail_token",token);
      sessionStorage.setItem("gmail_email",email);
      sessionStorage.setItem("gmail_name",name);
    }catch(e){}
  },
  get:()=>{
    try{
      const token=sessionStorage.getItem("gmail_token");
      const email=sessionStorage.getItem("gmail_email");
      const name=sessionStorage.getItem("gmail_name");
      return token?{token,email,name}:null;
    }catch(e){return null;}
  },
  clear:()=>{
    try{
      sessionStorage.removeItem("gmail_token");
      sessionStorage.removeItem("gmail_email");
      sessionStorage.removeItem("gmail_name");
    }catch(e){}
  },
};

// ── Shared UI ──────────────────────────────────────────────────────────────────
const GoldOrb = () => (
  <div style={{position:"absolute",top:"-120px",right:"-80px",width:"400px",height:"400px",
    background:"radial-gradient(circle at 40% 40%,rgba(201,168,76,0.12) 0%,transparent 70%)",
    borderRadius:"50%",pointerEvents:"none"}}/>
);

function Modal({title,subtitle,onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.75)",
      display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"min(440px,94vw)",maxHeight:"85vh",overflowY:"auto",
        background:"var(--bg1)",borderRadius:"var(--r3)",border:"1px solid var(--border2)",
        boxShadow:"var(--shadow)",animation:"slideUp 0.3s var(--ease)"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          position:"sticky",top:0,background:"var(--bg1)",zIndex:1}}>
          <div>
            <h3 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"16px"}}>{title}</h3>
            {subtitle&&<p style={{fontSize:"11px",color:"var(--text3)",marginTop:"3px"}}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{width:"28px",height:"28px",borderRadius:"50%",
            background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--text2)",
            fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"20px 24px 24px"}}>{children}</div>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({active,onNav,user,collapsed,onToggle,projects,activeProject,onSelectProject,gmailConnected}){
  return(
    <aside style={{width:collapsed?"64px":"230px",minWidth:collapsed?"64px":"230px",
      background:"var(--bg1)",borderRight:"1px solid var(--border)",
      display:"flex",flexDirection:"column",
      transition:"width 0.3s var(--ease),min-width 0.3s var(--ease)",
      overflow:"hidden",position:"relative",zIndex:10}}>
      <div style={{padding:collapsed?"20px 0":"24px 20px",display:"flex",alignItems:"center",gap:"10px",
        borderBottom:"1px solid var(--border)",justifyContent:collapsed?"center":"flex-start"}}>
        <div style={{width:"32px",height:"32px",borderRadius:"10px",flexShrink:0,
          background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"16px",fontWeight:"700",color:"#0A0A0F",animation:"glow 3s ease-in-out infinite"}}>A</div>
        {!collapsed&&<span style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px",color:"var(--gold)",letterSpacing:"-0.02em"}}>Aura</span>}
      </div>
      <nav style={{padding:"12px 8px 0",display:"flex",flexDirection:"column",gap:"2px"}}>
        {[{id:"chat",icon:"◉",label:"Chat"},{id:"email",icon:"✉",label:"Email"},
          {id:"calendar",icon:"◫",label:"Calendar"},{id:"research",icon:"⊕",label:"Research"},
          {id:"crm",icon:"◈",label:"CRM"},{id:"connectors",icon:"⊞",label:"Connectors"},
          {id:"settings",icon:"⊙",label:"Settings"}].map(item=>(
          <button key={item.id} onClick={()=>onNav(item.id)} style={{
            display:"flex",alignItems:"center",gap:"10px",
            padding:collapsed?"10px 0":"10px 12px",justifyContent:collapsed?"center":"flex-start",
            borderRadius:"var(--r)",
            background:active===item.id?"var(--gold-dim)":"transparent",
            border:active===item.id?"1px solid rgba(201,168,76,0.2)":"1px solid transparent",
            color:active===item.id?"var(--gold)":"var(--text2)",fontSize:"13px",fontWeight:"500",
            transition:"all 0.15s",position:"relative"}}>
            <span style={{fontSize:"16px",lineHeight:1}}>{item.icon}</span>
            {!collapsed&&<span>{item.label}</span>}
            {item.id==="connectors"&&!gmailConnected&&!collapsed&&(
              <span style={{marginLeft:"auto",width:"6px",height:"6px",borderRadius:"50%",
                background:"var(--gold)",flexShrink:0}}/>
            )}
          </button>
        ))}
      </nav>
      {!collapsed&&(
        <div style={{padding:"16px 8px 8px"}}>
          <div style={{padding:"0 4px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"10px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em"}}>Projects</span>
            <button onClick={()=>onNav("new_project")} style={{width:"18px",height:"18px",borderRadius:"50%",
              background:"var(--bg3)",border:"1px solid var(--border)",
              color:"var(--text3)",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"1px"}}>
            {projects.map(p=>(
              <button key={p.id} onClick={()=>{onSelectProject(p.id);onNav("chat");}} style={{
                display:"flex",alignItems:"center",gap:"8px",padding:"8px 12px",borderRadius:"var(--r)",
                background:activeProject===p.id?"var(--bg3)":"transparent",
                border:"1px solid transparent",
                color:activeProject===p.id?"var(--text)":"var(--text2)",
                fontSize:"12px",textAlign:"left",transition:"all 0.15s",width:"100%"}}>
                <span style={{fontSize:"13px",color:p.color}}>{p.icon}</span>
                <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                <span style={{fontSize:"10px",color:"var(--text3)",flexShrink:0}}>{p.chats}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {!collapsed&&(
        <div style={{padding:"16px",borderTop:"1px solid var(--border)",marginTop:"auto",
          display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"32px",height:"32px",borderRadius:"50%",flexShrink:0,
            background:"linear-gradient(135deg,var(--accent) 0%,var(--gold) 100%)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"13px",fontWeight:"700",color:"#fff"}}>{user.name[0]}</div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontSize:"12px",fontWeight:"600",color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
            <div style={{fontSize:"10px",color:"var(--text3)"}}>Free Plan ✦ Owner</div>
          </div>
        </div>
      )}
      <button onClick={onToggle} style={{position:"absolute",right:"-10px",top:"72px",
        width:"20px",height:"20px",borderRadius:"50%",background:"var(--bg2)",
        border:"1px solid var(--border2)",color:"var(--text2)",fontSize:"10px",
        display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
        {collapsed?"›":"‹"}
      </button>
    </aside>
  );
}

// ── Message components ─────────────────────────────────────────────────────────
function Message({msg,isNew}){
  const isUser=msg.role==="user";
  return(
    <div style={{display:"flex",gap:"12px",flexDirection:isUser?"row-reverse":"row",
      animation:isNew?"fadeUp 0.3s var(--ease)":"none",alignItems:"flex-start",padding:"4px 0"}}>
      {!isUser&&<div style={{width:"30px",height:"30px",borderRadius:"10px",flexShrink:0,marginTop:"2px",
        background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",color:"#0A0A0F"}}>A</div>}
      <div style={{maxWidth:"76%",display:"flex",flexDirection:"column",gap:"4px",alignItems:isUser?"flex-end":"flex-start"}}>
        <div style={{padding:"12px 16px",borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px",
          background:isUser?"linear-gradient(135deg,var(--accent) 0%,#5C51B0 100%)":"var(--bg2)",
          border:isUser?"none":"1px solid var(--border)",fontSize:"14px",lineHeight:"1.65",
          color:"var(--text)",fontWeight:"300"}} dangerouslySetInnerHTML={{__html:fmt(msg.text)}}/>
        <span style={{fontSize:"10px",color:"var(--text3)",padding:"0 4px"}}>{msg.time}</span>
      </div>
    </div>
  );
}

function TypingIndicator(){
  return(
    <div style={{display:"flex",gap:"12px",alignItems:"flex-start",animation:"fadeUp 0.3s var(--ease)"}}>
      <div style={{width:"30px",height:"30px",borderRadius:"10px",flexShrink:0,
        background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",color:"#0A0A0F"}}>A</div>
      <div style={{padding:"14px 18px",borderRadius:"18px 18px 18px 4px",
        background:"var(--bg2)",border:"1px solid var(--border)",display:"flex",gap:"4px",alignItems:"center"}}>
        {[0,1,2].map(i=><span key={i} style={{width:"6px",height:"6px",borderRadius:"50%",
          background:"var(--text3)",display:"block",animation:`typeDot 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  );
}

function ChatInput({onSend,onVoice,isListening}){
  const [val,setVal]=useState("");const taRef=useRef();
  const send=()=>{if(!val.trim())return;onSend(val.trim());setVal("");if(taRef.current)taRef.current.style.height="auto";};
  const onKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};
  const onInput=e=>{setVal(e.target.value);e.target.style.height="auto";e.target.style.height=Math.min(e.target.scrollHeight,120)+"px";};
  return(
    <div style={{padding:"16px 20px 20px",background:"linear-gradient(to top,var(--bg) 80%,transparent)"}}>
      <div style={{display:"flex",alignItems:"flex-end",gap:"10px",background:"var(--bg2)",
        borderRadius:"var(--r2)",border:"1px solid var(--border2)",padding:"10px 10px 10px 16px",transition:"border-color 0.2s"}}
        onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(201,168,76,0.4)"}
        onBlurCapture={e=>e.currentTarget.style.borderColor="var(--border2)"}>
        <textarea ref={taRef} value={val} onChange={onInput} onKeyDown={onKey}
          placeholder="Ask Aura anything…" rows={1}
          style={{flex:1,background:"transparent",border:"none",resize:"none",color:"var(--text)",
            fontSize:"14px",lineHeight:"1.5",fontFamily:"var(--font-b)",fontWeight:"300",maxHeight:"120px",overflowY:"auto"}}/>
        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
          <button onClick={onVoice} style={{width:"36px",height:"36px",borderRadius:"50%",
            background:isListening?"var(--green)":"var(--bg3)",
            border:`1px solid ${isListening?"var(--green)":"var(--border)"}`,
            color:isListening?"#fff":"var(--text2)",fontSize:"16px",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",
            animation:isListening?"pulse 1s ease-in-out infinite":"none"}}>◎</button>
          <button onClick={send} style={{width:"36px",height:"36px",borderRadius:"50%",
            background:val.trim()?"var(--gold)":"var(--bg3)",border:"none",
            color:val.trim()?"#0A0A0F":"var(--text3)",fontSize:"18px",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",fontWeight:"700"}}>›</button>
        </div>
      </div>
    </div>
  );
}

function StatusBar({items}){
  return(
    <div style={{display:"flex",gap:"8px",padding:"10px 20px",borderBottom:"1px solid var(--border)",overflowX:"auto",scrollbarWidth:"none"}}>
      {items.map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:"6px",padding:"5px 12px",
          borderRadius:"100px",background:"var(--bg2)",border:"1px solid var(--border)",whiteSpace:"nowrap",flexShrink:0}}>
          <span style={{width:"6px",height:"6px",borderRadius:"50%",background:item.ok?"var(--green)":"var(--text3)",flexShrink:0}}/>
          <span style={{fontSize:"11px",color:"var(--text2)"}}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── New Project Modal ──────────────────────────────────────────────────────────
function NewProjectModal({onSave,onClose}){
  const [name,setName]=useState("");const [color,setColor]=useState(PROJECT_COLORS[0]);
  const [icon,setIcon]=useState(PROJECT_ICONS[0]);const [desc,setDesc]=useState("");
  return(
    <Modal title="New project" subtitle="Organise related chats & context together" onClose={onClose}>
      <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",
          borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)"}}>
          <div style={{width:"40px",height:"40px",borderRadius:"12px",flexShrink:0,
            background:`${color}22`,border:`1px solid ${color}44`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",color}}>
            {icon}
          </div>
          <div>
            <div style={{fontSize:"14px",fontWeight:"600",color:"var(--text)"}}>{name||"Project name"}</div>
            <div style={{fontSize:"11px",color:"var(--text3)",marginTop:"2px"}}>{desc||"No description"}</div>
          </div>
        </div>
        <div>
          <label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"5px"}}>Project name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. CPHI Japan 2026"
            style={{width:"100%",padding:"10px 14px",borderRadius:"var(--r)",background:"var(--bg2)",
              border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px"}}
            onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}/>
        </div>
        <div>
          <label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"5px"}}>Description</label>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What's this project about?"
            style={{width:"100%",padding:"10px 14px",borderRadius:"var(--r)",background:"var(--bg2)",
              border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px"}}
            onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"}
            onBlur={e=>e.target.style.borderColor="var(--border)"}/>
        </div>
        <div>
          <label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"8px"}}>Icon</label>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {PROJECT_ICONS.map(ic=>(
              <button key={ic} onClick={()=>setIcon(ic)} style={{width:"36px",height:"36px",borderRadius:"10px",fontSize:"18px",
                background:icon===ic?`${color}22`:"var(--bg2)",border:`1px solid ${icon===ic?color:"var(--border)"}`,
                color:icon===ic?color:"var(--text2)",transition:"all 0.15s"}}>{ic}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"8px"}}>Colour</label>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
            {PROJECT_COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)} style={{width:"24px",height:"24px",borderRadius:"50%",background:c,border:"none",
                outline:color===c?`2px solid ${c}`:"2px solid transparent",outlineOffset:"2px",transition:"all 0.15s"}}/>
            ))}
          </div>
        </div>
        <button onClick={()=>{if(name.trim())onSave({id:"p"+Date.now(),name:name.trim(),desc,icon,color,chats:0,created:new Date().toLocaleDateString()});onClose();}}
          style={{width:"100%",padding:"12px",borderRadius:"var(--r)",
            background:name.trim()?"var(--gold)":"var(--bg3)",border:"none",
            color:name.trim()?"#0A0A0F":"var(--text3)",fontSize:"14px",fontWeight:"700",
            fontFamily:"var(--font-d)",transition:"all 0.2s"}}>
          Create project →
        </button>
      </div>
    </Modal>
  );
}

// ── Chat Screen ────────────────────────────────────────────────────────────────
function ChatScreen({user,projects,activeProject,onSelectProject,onNav,gmailAccount}){
  const [msgs,setMsgs]=useState(SAMPLE_HISTORY);
  const [loading,setLoading]=useState(false);
  const [isListening,setIsListening]=useState(false);
  const [newIdx,setNewIdx]=useState(null);
  const [showProjectMenu,setShowProjectMenu]=useState(false);
  const endRef=useRef();const recognitionRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[msgs,loading]);
  const now=()=>new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  const activeProj=projects.find(p=>p.id===activeProject)||null;

  const callAura=useCallback(async(userText)=>{
    const userMsg={role:"user",text:userText,time:now()};
    setMsgs(m=>[...m,userMsg]);setNewIdx(msgs.length);setLoading(true);
    try{
      const history=[...msgs,userMsg].map(m=>({role:m.role==="user"?"user":"assistant",content:m.text}));
      const projectCtx=activeProj?`Current project: "${activeProj.name}" — ${activeProj.desc||""}. `:"";
      const gmailCtx=gmailAccount?`Gmail connected: ${gmailAccount.email}. You can reference their real inbox. `:"Gmail not connected yet. ";
      const res=await fetch(`${API_URL}/api/chat`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
          system:`You are Aura, an elite personal AI chief of staff for ${user.name}, who is ${user.role} at ${user.company}. ${projectCtx}${gmailCtx}You are sharp, professional, warm, and concise. You help with email management, calendar, web research, presentations, LinkedIn, Apollo CRM, and business development. Use **bold** for key terms. Keep replies focused and action-oriented. You know about their pharma exports business, CPHI Japan 2026 project, Sage n Silk brand, and DCAT prospecting work. When asked to do something — do it directly.`,
          messages:history})});
      const data=await res.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.[0]?.text||"Something went wrong.",time:now()}]);
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"Connection issue — please try again.",time:now()}]);}
    setLoading(false);
  },[msgs,user,activeProj,gmailAccount]);

  const startVoice=()=>{
    if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){alert("Voice needs Chrome.");return;}
    if(isListening){recognitionRef.current?.stop();setIsListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    const r=new SR();r.lang="en-IN";r.interimResults=false;
    r.onresult=e=>callAura(e.results[0][0].transcript);
    r.onend=()=>setIsListening(false);r.start();recognitionRef.current=r;setIsListening(true);
  };

  const statusItems=[
    {label:gmailAccount?`Gmail: ${gmailAccount.email}`:"Gmail — not connected",ok:!!gmailAccount},
    {label:"Apollo",ok:true},{label:"Research",ok:true},{label:"Gamma",ok:true},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative",overflow:"hidden"}}>
      <GoldOrb/>
      <div style={{padding:"16px 24px 12px",borderBottom:"1px solid var(--border)",
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
        <div style={{flex:1,minWidth:0}}>
          <h1 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"19px",color:"var(--gold)",letterSpacing:"-0.02em"}}>
            Good morning, {user.name.split(" ")[0]} ✦
          </h1>
          <p style={{fontSize:"11px",color:"var(--text3)",marginTop:"2px"}}>
            {new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}
          </p>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowProjectMenu(m=>!m)} style={{
            display:"flex",alignItems:"center",gap:"7px",padding:"7px 12px",borderRadius:"100px",
            background:activeProj?`${activeProj.color}18`:"var(--bg2)",
            border:`1px solid ${activeProj?`${activeProj.color}44`:"var(--border)"}`,
            color:activeProj?activeProj.color:"var(--text2)",fontSize:"12px",fontWeight:"500",
            transition:"all 0.15s",whiteSpace:"nowrap"}}>
            <span>{activeProj?activeProj.icon:"◉"}</span>
            <span style={{maxWidth:"100px",overflow:"hidden",textOverflow:"ellipsis"}}>
              {activeProj?activeProj.name:"All chats"}
            </span>
            <span style={{fontSize:"10px"}}>▾</span>
          </button>
          {showProjectMenu&&(
            <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:50,
              background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",
              padding:"8px",minWidth:"180px",boxShadow:"var(--shadow)",animation:"fadeUp 0.2s var(--ease)"}}>
              <button onClick={()=>{onSelectProject(null);setShowProjectMenu(false);}} style={{
                display:"flex",alignItems:"center",gap:"8px",width:"100%",padding:"8px 10px",
                borderRadius:"var(--r)",background:!activeProject?"var(--gold-dim)":"transparent",
                border:"1px solid transparent",color:!activeProject?"var(--gold)":"var(--text2)",
                fontSize:"12px",transition:"all 0.15s",textAlign:"left"}}>
                <span>◉</span><span>All chats</span>
              </button>
              {projects.map(p=>(
                <button key={p.id} onClick={()=>{onSelectProject(p.id);setShowProjectMenu(false);}} style={{
                  display:"flex",alignItems:"center",gap:"8px",width:"100%",padding:"8px 10px",
                  borderRadius:"var(--r)",background:activeProject===p.id?`${p.color}18`:"transparent",
                  border:"1px solid transparent",color:activeProject===p.id?p.color:"var(--text2)",
                  fontSize:"12px",transition:"all 0.15s",textAlign:"left"}}>
                  <span style={{color:p.color}}>{p.icon}</span>
                  <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                </button>
              ))}
              <div style={{borderTop:"1px solid var(--border)",marginTop:"6px",paddingTop:"6px"}}>
                <button onClick={()=>{setShowProjectMenu(false);onNav("new_project");}} style={{
                  display:"flex",alignItems:"center",gap:"8px",width:"100%",padding:"8px 10px",
                  borderRadius:"var(--r)",background:"transparent",border:"1px dashed var(--border)",
                  color:"var(--text3)",fontSize:"12px",transition:"all 0.15s",textAlign:"left"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text3)";}}>
                  <span>+</span><span>New project</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"5px 12px",borderRadius:"100px",background:"var(--gold-dim)",
          border:"1px solid rgba(201,168,76,0.25)",fontSize:"11px",color:"var(--gold)",fontWeight:"600",flexShrink:0}}>FREE</div>
      </div>

      {activeProj&&(
        <div style={{padding:"8px 24px",background:`${activeProj.color}0D`,
          borderBottom:`1px solid ${activeProj.color}22`,display:"flex",alignItems:"center",gap:"8px"}}>
          <span style={{color:activeProj.color,fontSize:"14px"}}>{activeProj.icon}</span>
          <span style={{fontSize:"12px",fontWeight:"600",color:activeProj.color}}>{activeProj.name}</span>
          {activeProj.desc&&<span style={{fontSize:"11px",color:"var(--text3)"}}>— {activeProj.desc}</span>}
        </div>
      )}

      <StatusBar items={statusItems}/>

      <div style={{padding:"10px 20px 8px",display:"flex",gap:"8px",overflowX:"auto",
        scrollbarWidth:"none",borderBottom:"1px solid var(--border)"}}>
        {QUICK_ACTIONS.map((a,i)=>(
          <button key={i} onClick={()=>callAura(a)} style={{
            padding:"6px 14px",borderRadius:"100px",whiteSpace:"nowrap",
            background:"var(--bg2)",border:"1px solid var(--border)",
            color:"var(--text2)",fontSize:"12px",flexShrink:0,transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)";}}>
            {a}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"16px"}}>
        {!gmailAccount&&(
          <div style={{padding:"14px 16px",borderRadius:"var(--r)",
            background:"var(--gold-dim)",border:"1px solid rgba(201,168,76,0.3)",
            display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
            <span style={{fontSize:"13px",color:"var(--gold)"}}>✦ Connect Gmail to unlock your real inbox</span>
            <button onClick={()=>onNav("connectors")} style={{
              padding:"6px 14px",borderRadius:"100px",background:"var(--gold)",border:"none",
              color:"#0A0A0F",fontSize:"12px",fontWeight:"700",flexShrink:0}}>Connect</button>
          </div>
        )}
        {msgs.map((m,i)=><Message key={i} msg={m} isNew={i===newIdx}/>)}
        {loading&&<TypingIndicator/>}
        <div ref={endRef}/>
      </div>

      <div style={{padding:"8px 20px 4px",display:"flex",gap:"6px",overflowX:"auto",scrollbarWidth:"none"}}>
        {TOOLS.map(t=>(
          <button key={t.id} onClick={()=>callAura(`Use ${t.label}: ${t.desc}`)} style={{
            display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 12px",borderRadius:"100px",
            background:"var(--bg3)",border:"1px solid var(--border)",
            color:"var(--text2)",fontSize:"12px",fontWeight:"500",transition:"all 0.15s",whiteSpace:"nowrap"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.color=t.color;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)";}}>
            <span style={{fontSize:"14px"}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      <ChatInput onSend={callAura} onVoice={startVoice} isListening={isListening}/>
    </div>
  );
}

// ── Email Screen ───────────────────────────────────────────────────────────────
function EmailScreen({gmailAccount,onNav}){
  const [emails,setEmails]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);

  useEffect(()=>{
    if(gmailAccount?.token){
      setLoading(true);
      fetch(`${API_URL}/api/gmail?action=inbox`,{
        headers:{Authorization:`Bearer ${gmailAccount.token}`}
      })
      .then(r=>r.json())
      .then(data=>{
        if(data.messages)setEmails(data.messages);
        else setError(data.error||"Failed to load inbox");
      })
      .catch(()=>setError("Connection error"))
      .finally(()=>setLoading(false));
    }
  },[gmailAccount]);

  if(!gmailAccount){
    return(
      <div style={{display:"flex",flexDirection:"column",height:"100%",alignItems:"center",justifyContent:"center",gap:"16px",padding:"32px"}}>
        <div style={{fontSize:"32px"}}>✉</div>
        <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"20px"}}>Connect your Gmail</h2>
        <p style={{fontSize:"14px",color:"var(--text2)",textAlign:"center",maxWidth:"320px",lineHeight:"1.6"}}>
          Connect your Gmail account to read, summarise, and reply to real emails with Aura.
        </p>
        <button onClick={()=>onNav("connectors")} style={{
          padding:"12px 28px",borderRadius:"100px",background:"var(--gold)",border:"none",
          color:"#0A0A0F",fontSize:"14px",fontWeight:"700",fontFamily:"var(--font-d)"}}>
          Connect Gmail →
        </button>
      </div>
    );
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"18px 24px 14px",borderBottom:"1px solid var(--border)",
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>Inbox</h2>
          <p style={{fontSize:"12px",color:"var(--text3)",marginTop:"2px"}}>
            {gmailAccount.email} · {loading?"Loading…":`${emails.filter(e=>e.unread).length} unread`}
          </p>
        </div>
        <button onClick={()=>{setLoading(true);fetch(`${API_URL}/api/gmail?action=inbox`,{headers:{Authorization:`Bearer ${gmailAccount.token}`}}).then(r=>r.json()).then(d=>{if(d.messages)setEmails(d.messages);}).finally(()=>setLoading(false));}} style={{
          padding:"8px 16px",borderRadius:"100px",background:"var(--bg2)",
          border:"1px solid var(--border)",color:"var(--text2)",fontSize:"12px"}}>
          ↻ Refresh
        </button>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {loading&&(
          <div style={{padding:"48px",textAlign:"center",color:"var(--text3)",fontSize:"13px"}}>
            Loading your inbox…
          </div>
        )}
        {error&&(
          <div style={{padding:"24px",margin:"16px",borderRadius:"var(--r)",
            background:"rgba(224,92,92,0.08)",border:"1px solid rgba(224,92,92,0.2)",
            fontSize:"13px",color:"var(--red)"}}>
            {error}
          </div>
        )}
        {!loading&&emails.map(e=>{
          const fromName=e.from?.replace(/<.*>/,"").trim()||e.from;
          const fromEmail=e.from?.match(/<(.+)>/)?.[1]||"";
          const date=new Date(e.date).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
          return(
            <div key={e.id} style={{padding:"14px 24px",borderBottom:"1px solid var(--border)",
              display:"flex",gap:"12px",alignItems:"flex-start",
              background:e.unread?"rgba(201,168,76,0.03)":"transparent",
              cursor:"pointer",transition:"background 0.15s"}}
              onMouseEnter={el=>el.currentTarget.style.background="var(--bg2)"}
              onMouseLeave={el=>el.currentTarget.style.background=e.unread?"rgba(201,168,76,0.03)":"transparent"}>
              <div style={{width:"36px",height:"36px",borderRadius:"50%",flexShrink:0,
                background:"var(--bg3)",border:"1px solid var(--border)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"14px",fontWeight:"600",color:"var(--text2)"}}>
                {fromName[0]?.toUpperCase()||"?"}
              </div>
              <div style={{flex:1,overflow:"hidden"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2px"}}>
                  <span style={{fontSize:"13px",fontWeight:e.unread?"600":"400",color:"var(--text)"}}>{fromName}</span>
                  <span style={{fontSize:"11px",color:"var(--text3)",marginLeft:"8px",flexShrink:0}}>{date}</span>
                </div>
                {fromEmail&&<div style={{fontSize:"11px",color:"var(--text3)",marginBottom:"3px"}}>{fromEmail}</div>}
                <div style={{fontSize:"13px",fontWeight:e.unread?"500":"400",color:e.unread?"var(--text)":"var(--text2)",
                  marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.subject}</div>
                <div style={{fontSize:"12px",color:"var(--text3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.snippet}</div>
              </div>
              {e.unread&&<div style={{width:"7px",height:"7px",borderRadius:"50%",background:"var(--gold)",flexShrink:0,marginTop:"5px"}}/>}
            </div>
          );
        })}
        {!loading&&emails.length===0&&!error&&(
          <div style={{padding:"48px",textAlign:"center",color:"var(--text3)",fontSize:"13px"}}>Inbox is empty.</div>
        )}
      </div>
    </div>
  );
}

// ── Connectors Screen ──────────────────────────────────────────────────────────
function ConnectorsScreen({gmailAccount,onGmailConnect,onGmailDisconnect}){
  const [connectors,setConnectors]=useState(()=>
    INIT_CONNECTORS.map(c=>c.id==="gmail"?{...c,status:gmailAccount?"connected":"disconnected"}:c)
  );
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [connecting,setConnecting]=useState(null);
  const categories=["All",...[...new Set(INIT_CONNECTORS.map(c=>c.category))]];

  const statusColor={connected:"var(--green)",needs_install:"var(--gold)",disconnected:"var(--text3)"};

  const handleConnect=async(c)=>{
    if(c.id==="gmail"){
      if(c.status==="connected"){
        onGmailDisconnect();
        setConnectors(cs=>cs.map(x=>x.id==="gmail"?{...x,status:"disconnected"}:x));
        return;
      }
      setConnecting("gmail");
      try{
        const res=await fetch(`${API_URL}/api/gmail?action=auth`);
        const data=await res.json();
        if(data.url)window.location.href=data.url;
      }catch(e){alert("Failed to start Gmail auth. Check backend.");}
      setConnecting(null);
      return;
    }
    setConnectors(cs=>cs.map(x=>{
      if(x.id!==c.id)return x;
      return{...x,status:x.status==="connected"?"disconnected":"connected"};
    }));
  };

  const visible=connectors.filter(c=>{
    const matchCat=filter==="All"||c.category===filter;
    const matchSearch=!search||c.name.toLowerCase().includes(search.toLowerCase());
    return matchCat&&matchSearch;
  });

  const connected=connectors.filter(c=>c.status==="connected").length;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"18px 24px 14px",borderBottom:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
          <div>
            <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>Connectors</h2>
            <p style={{fontSize:"12px",color:"var(--text3)",marginTop:"2px"}}>{connected} of {connectors.length} connected</p>
          </div>
          <div style={{display:"flex",gap:"6px"}}>
            <div style={{padding:"5px 12px",borderRadius:"100px",background:"rgba(78,203,164,0.12)",
              border:"1px solid var(--border)",fontSize:"11px",color:"var(--green)",fontWeight:"600"}}>{connected} active</div>
          </div>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search connectors…"
          style={{width:"100%",padding:"9px 14px",borderRadius:"var(--r)",background:"var(--bg2)",
            border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px",marginBottom:"10px"}}
          onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"}
          onBlur={e=>e.target.style.borderColor="var(--border)"}/>
        <div style={{display:"flex",gap:"6px",overflowX:"auto",scrollbarWidth:"none"}}>
          {categories.map(cat=>(
            <button key={cat} onClick={()=>setFilter(cat)} style={{
              padding:"5px 14px",borderRadius:"100px",whiteSpace:"nowrap",
              background:filter===cat?"var(--gold-dim)":"var(--bg2)",
              border:filter===cat?"1px solid rgba(201,168,76,0.3)":"1px solid var(--border)",
              color:filter===cat?"var(--gold)":"var(--text2)",fontSize:"12px",flexShrink:0,transition:"all 0.15s"}}>
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"10px"}}>
          {visible.map(c=>(
            <div key={c.id} style={{padding:"16px",borderRadius:"var(--r2)",background:"var(--bg2)",
              border:`1px solid ${c.status==="connected"?"var(--border2)":"var(--border)"}`,
              transition:"all 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=c.color+"66"}
              onMouseLeave={e=>e.currentTarget.style.borderColor=c.status==="connected"?"var(--border2)":"var(--border)"}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"10px"}}>
                <div style={{width:"40px",height:"40px",borderRadius:"12px",background:c.bg,
                  border:`1px solid ${c.color}33`,display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"18px",fontWeight:"700",color:c.color}}>{c.icon}</div>
                <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                  <div style={{width:"7px",height:"7px",borderRadius:"50%",
                    background:statusColor[c.status],
                    boxShadow:c.status==="connected"?"0 0 6px var(--green)":"none"}}/>
                  <span style={{fontSize:"10px",color:statusColor[c.status],fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em"}}>
                    {c.status==="connected"?"Live":c.status==="needs_install"?"Setup":"Off"}
                  </span>
                </div>
              </div>
              <div style={{fontSize:"13px",fontWeight:"600",color:"var(--text)",marginBottom:"3px"}}>{c.name}</div>
              {c.id==="gmail"&&gmailAccount&&(
                <div style={{fontSize:"11px",color:"var(--green)",marginBottom:"3px"}}>{gmailAccount.email}</div>
              )}
              <div style={{fontSize:"11px",color:"var(--text3)",marginBottom:"12px",lineHeight:"1.4"}}>{c.desc}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{padding:"3px 8px",borderRadius:"100px",background:"var(--bg3)",
                  border:"1px solid var(--border)",fontSize:"10px",color:"var(--text3)"}}>{c.category}</span>
                <button onClick={()=>handleConnect(c)}
                  disabled={connecting===c.id}
                  style={{padding:"6px 14px",borderRadius:"100px",fontSize:"11px",fontWeight:"600",
                    background:c.status==="connected"?`${c.color}18`:c.status==="needs_install"?"var(--gold-dim)":"var(--bg3)",
                    border:`1px solid ${c.status==="connected"?c.color+"44":c.status==="needs_install"?"rgba(201,168,76,0.3)":"var(--border)"}`,
                    color:statusColor[c.status],transition:"all 0.15s",
                    opacity:connecting===c.id?0.6:1}}>
                  {connecting===c.id?"Connecting…":c.status==="connected"?"Disconnect":c.status==="needs_install"?"Install":"Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CRM Screen ─────────────────────────────────────────────────────────────────
function CRMScreen(){
  const contacts=[
    {name:"Tanaka Hiroshi",co:"Daiichi Sankyo",role:"Head of Procurement",status:"hot",score:92},
    {name:"Yuki Matsumoto",co:"Takeda Pharmaceutical",role:"Supply Chain Director",status:"warm",score:74},
    {name:"Kenji Watanabe",co:"Astellas Pharma",role:"VP Procurement",status:"warm",score:68},
    {name:"Priya Nair",co:"Sun Pharma",role:"Global Sourcing Manager",status:"hot",score:88},
    {name:"Marco Bianchi",co:"Recordati S.p.A.",role:"Procurement Director",status:"cold",score:41},
  ];
  const statusColor={hot:"var(--red)",warm:"var(--gold)",cold:"var(--text3)"};
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>CRM — Apollo Contacts</h2>
          <p style={{fontSize:"12px",color:"var(--text3)",marginTop:"2px"}}>CPHI Japan 2026 · 5 leads</p></div>
        <button style={{padding:"8px 16px",borderRadius:"100px",background:"var(--accent)",
          border:"none",color:"#fff",fontSize:"12px",fontWeight:"600"}}>Enrich More</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {contacts.map((c,i)=>(
          <div key={i} style={{padding:"14px 16px",borderRadius:"var(--r)",background:"var(--bg2)",
            border:"1px solid var(--border)",marginBottom:"8px",display:"flex",alignItems:"center",gap:"12px",
            cursor:"pointer",transition:"border-color 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border2)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{width:"38px",height:"38px",borderRadius:"50%",flexShrink:0,
              background:"var(--bg3)",border:"1px solid var(--border)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:"15px",fontWeight:"600",color:"var(--text2)"}}>{c.name[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:"13px",fontWeight:"600",color:"var(--text)",marginBottom:"2px"}}>{c.name}</div>
              <div style={{fontSize:"11px",color:"var(--text3)"}}>{c.role} · {c.co}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"16px",fontWeight:"700",color:statusColor[c.status],marginBottom:"2px"}}>{c.score}</div>
              <div style={{fontSize:"10px",color:statusColor[c.status],textTransform:"uppercase",fontWeight:"600"}}>{c.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings Screen ────────────────────────────────────────────────────────────
function SettingsScreen({user,gmailAccount,onGmailDisconnect}){
  const plans=[
    {id:"free",label:"Free",price:"₹0",desc:"Owner only · All tools",color:"var(--green)",current:true},
    {id:"starter",label:"Starter",price:"₹999",desc:"1 user · Email + Chat",color:"var(--text2)"},
    {id:"pro",label:"Pro",price:"₹2,499",desc:"All tools · Voice · CRM",color:"var(--gold)"},
    {id:"team",label:"Team",price:"₹7,999",desc:"5 seats · White-label",color:"var(--accent)"},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflowY:"auto"}}>
      <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)"}}>
        <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>Settings</h2>
      </div>
      <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:"24px"}}>
        <section>
          <h3 style={{fontSize:"12px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Profile</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[["Full Name",user.name],["Role",user.role],["Company",user.company],["Email",user.email]].map(([label,val])=>(
              <div key={label}>
                <label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"4px"}}>{label}</label>
                <input defaultValue={val} style={{width:"100%",padding:"10px 14px",borderRadius:"var(--r)",
                  background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px"}}/>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3 style={{fontSize:"12px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Connected accounts</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",
              borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)"}}>
              <div style={{width:"32px",height:"32px",borderRadius:"9px",background:"rgba(234,67,53,0.12)",
                border:"1px solid #EA433544",display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"13px",fontWeight:"800",color:"#EA4335",flexShrink:0}}>G</div>
              <div style={{flex:1}}>
                <div style={{fontSize:"12px",fontWeight:"600",color:"var(--text)"}}>Gmail</div>
                <div style={{fontSize:"11px",color:"var(--text3)"}}>{gmailAccount?gmailAccount.email:"Not connected"}</div>
              </div>
              <span style={{fontSize:"11px",fontWeight:"600",
                color:gmailAccount?"var(--green)":"var(--text3)",
                padding:"3px 10px",borderRadius:"100px",
                background:gmailAccount?"rgba(78,203,164,0.12)":"var(--bg3)",flexShrink:0}}>
                {gmailAccount?"Connected":"Disconnected"}
              </span>
            </div>
          </div>
        </section>
        <section>
          <h3 style={{fontSize:"12px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Subscription plans</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {plans.map(p=>(
              <div key={p.id} style={{padding:"16px",borderRadius:"var(--r)",
                background:p.current?"var(--gold-dim)":"var(--bg2)",
                border:`1px solid ${p.current?"rgba(201,168,76,0.3)":"var(--border)"}`,
                display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:"14px",fontWeight:"600",color:p.color}}>{p.label}</div>
                  <div style={{fontSize:"11px",color:"var(--text3)",marginTop:"2px"}}>{p.desc}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"16px",fontWeight:"700",color:"var(--text)",fontFamily:"var(--font-d)"}}>
                    {p.price}<span style={{fontSize:"10px",color:"var(--text3)",fontFamily:"var(--font-b)"}}>/mo</span></div>
                  {p.current&&<div style={{fontSize:"10px",color:"var(--gold)",marginTop:"2px"}}>Your plan</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Onboarding ─────────────────────────────────────────────────────────────────
function OnboardingScreen({onComplete}){
  const [step,setStep]=useState(0);const [form,setForm]=useState({name:"",role:"",company:"",email:""});
  const steps=[
    {title:"Meet Aura.",sub:"Your AI chief of staff. Handles email, research, deals, and more — so you can focus on what matters.",cta:"Get Started",field:null},
    {title:"What's your name?",sub:"Aura will personalise everything for you.",cta:"Continue",field:"name",placeholder:"Rama Reddy"},
    {title:"Your role?",sub:"Helps Aura understand your context.",cta:"Continue",field:"role",placeholder:"VP of Global Exports"},
    {title:"Your company?",sub:"For personalised business intelligence.",cta:"Continue",field:"company",placeholder:"ALR Labs Pvt. Ltd."},
    {title:"Work email?",sub:"To connect Gmail or Outlook.",cta:"Launch Aura →",field:"email",placeholder:"rama@alrlabs.com"},
  ];
  const cur=steps[step];const canNext=!cur.field||form[cur.field]?.trim();
  return(
    <div style={{height:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",
      position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",
        width:"600px",height:"600px",
        background:"radial-gradient(circle at center,rgba(201,168,76,0.08) 0%,transparent 65%)",pointerEvents:"none"}}/>
      <div style={{width:"min(420px,92vw)",padding:"48px 40px",background:"var(--bg1)",borderRadius:"var(--r3)",
        border:"1px solid var(--border2)",boxShadow:"var(--shadow)",animation:"fadeUp 0.5s var(--ease)",textAlign:"center"}}>
        <div style={{width:"52px",height:"52px",borderRadius:"16px",
          background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",
          display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",fontWeight:"800",
          color:"#0A0A0F",margin:"0 auto 28px",animation:"glow 3s ease-in-out infinite"}}>A</div>
        <div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"32px"}}>
          {steps.map((_,i)=>(
            <div key={i} style={{width:i===step?"20px":"6px",height:"6px",borderRadius:"3px",
              background:i<=step?"var(--gold)":"var(--bg3)",transition:"all 0.3s var(--ease)"}}/>
          ))}
        </div>
        <h1 style={{fontFamily:"var(--font-d)",fontWeight:"800",fontSize:"26px",color:"var(--text)",
          marginBottom:"10px",letterSpacing:"-0.03em"}}>{cur.title}</h1>
        <p style={{fontSize:"14px",color:"var(--text2)",lineHeight:"1.6",marginBottom:"32px"}}>{cur.sub}</p>
        {cur.field&&(
          <input value={form[cur.field]} onChange={e=>setForm(f=>({...f,[cur.field]:e.target.value}))}
            placeholder={cur.placeholder}
            onKeyDown={e=>e.key==="Enter"&&canNext&&(step<steps.length-1?setStep(s=>s+1):onComplete(form))}
            autoFocus style={{width:"100%",padding:"14px 18px",borderRadius:"var(--r)",
              background:"var(--bg2)",border:"1px solid var(--border2)",color:"var(--text)",
              fontSize:"15px",marginBottom:"16px",textAlign:"center",fontFamily:"var(--font-b)",transition:"border-color 0.2s"}}
            onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.5)"}
            onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
        )}
        <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onComplete(form)} disabled={!canNext}
          style={{width:"100%",padding:"14px",borderRadius:"var(--r)",
            background:canNext?"var(--gold)":"var(--bg3)",border:"none",
            color:canNext?"#0A0A0F":"var(--text3)",fontSize:"15px",fontWeight:"700",
            fontFamily:"var(--font-d)",transition:"all 0.2s"}}>{cur.cta}</button>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",
          color:"var(--text3)",fontSize:"12px",marginTop:"16px",display:"block",margin:"16px auto 0"}}>← Back</button>}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function AuraApp(){
  const [authed,setAuthed]=useState(false);
  const [user,setUser]=useState({name:"Rama Reddy",role:"VP of Global Exports",company:"ALR Labs Pvt. Ltd.",email:"rama@alrlabs.com"});
  const [screen,setScreen]=useState("chat");
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [projects,setProjects]=useState(INIT_PROJECTS);
  const [activeProject,setActiveProject]=useState(null);
  const [showNewProject,setShowNewProject]=useState(false);
  const [gmailAccount,setGmailAccount]=useState(null);

  // Handle OAuth callback — reads token from URL params
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("gmail_connected")==="true"){
      const token=params.get("access_token");
      const email=params.get("email");
      const name=params.get("name");
      if(token&&email){
        const account={token,email,name};
        setGmailAccount(account);
        gmailStorage.save(token,email,name||email);
        setAuthed(true);
        setScreen("email");
      }
      window.history.replaceState({},"",window.location.pathname);
    } else {
      const saved=gmailStorage.get();
      if(saved)setGmailAccount(saved);
    }
  },[]);

  const handleOnboard=form=>{if(form.name)setUser({...user,...form});setAuthed(true);};
  const handleNav=id=>{if(id==="new_project"){setShowNewProject(true);}else{setScreen(id);}};
  const handleGmailDisconnect=()=>{setGmailAccount(null);gmailStorage.clear();};

  if(!authed)return<OnboardingScreen onComplete={handleOnboard}/>;

  const screenMap={
    chat:<ChatScreen user={user} projects={projects} activeProject={activeProject}
      onSelectProject={setActiveProject} onNav={handleNav} gmailAccount={gmailAccount}/>,
    email:<EmailScreen gmailAccount={gmailAccount} onNav={handleNav}/>,
    crm:<CRMScreen/>,
    connectors:<ConnectorsScreen gmailAccount={gmailAccount}
      onGmailConnect={setGmailAccount} onGmailDisconnect={handleGmailDisconnect}/>,
    settings:<SettingsScreen user={user} gmailAccount={gmailAccount} onGmailDisconnect={handleGmailDisconnect}/>,
    calendar:<div style={{padding:"32px",color:"var(--text2)",fontSize:"14px"}}>📅 Calendar — Phase 3.</div>,
    research:<div style={{padding:"32px",color:"var(--text2)",fontSize:"14px"}}>🔍 Research — Phase 3.</div>,
  };

  return(
    <div style={{height:"100vh",background:"var(--bg)",display:"flex",fontFamily:"var(--font-b)"}}>
      {showNewProject&&<NewProjectModal
        onSave={p=>{setProjects(ps=>[...ps,p]);setActiveProject(p.id);setScreen("chat");}}
        onClose={()=>setShowNewProject(false)}/>}
      <Sidebar active={screen} onNav={handleNav} user={user}
        collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(c=>!c)}
        projects={projects} activeProject={activeProject} onSelectProject={setActiveProject}
        gmailConnected={!!gmailAccount}/>
      <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",position:"relative"}}>
        {screenMap[screen]||screenMap.chat}
      </main>
    </div>
  );
}
