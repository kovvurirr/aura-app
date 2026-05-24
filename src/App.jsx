import { useState, useRef, useEffect, useCallback } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap";
document.head.appendChild(fontLink);

const style = document.createElement("style");
style.textContent = `
  :root {
    --bg:#0A0A0F;--bg1:#111118;--bg2:#18181F;--bg3:#1E1E28;
    --border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);
    --gold:#C9A84C;--gold2:#E8C96A;--gold-dim:rgba(201,168,76,0.15);--gold-glow:rgba(201,168,76,0.25);
    --text:#F0EFE8;--text2:#9996A8;--text3:#5E5C70;
    --accent:#7B6FD4;--accent2:#A99CF0;--red:#E05C5C;--green:#4ECBA4;
    --r:14px;--r2:20px;--r3:28px;
    --font-d:'Syne',sans-serif;--font-b:'DM Sans',sans-serif;
    --ease:cubic-bezier(0.23,1,0.32,1);--shadow:0 24px 64px rgba(0,0,0,0.6);
  }
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  body{background:var(--bg);color:var(--text);font-family:var(--font-b);overflow:hidden;height:100vh}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
  input,textarea{outline:none;font-family:var(--font-b)}button{cursor:pointer;border:none;font-family:var(--font-b)}
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

// ── Constants ──────────────────────────────────────────────────────────────────
const TOOLS=[{id:"email",icon:"✉",label:"Email",color:"#7B6FD4",desc:"Gmail & Outlook"},{id:"calendar",icon:"◫",label:"Calendar",color:"#4ECBA4",desc:"Google Calendar"},{id:"research",icon:"⊕",label:"Research",color:"#C9A84C",desc:"Web research"},{id:"deck",icon:"▦",label:"Presentation",color:"#E05C5C",desc:"Gamma AI decks"},{id:"linkedin",icon:"⬡",label:"LinkedIn",color:"#5B9BD5",desc:"Posts & messages"},{id:"crm",icon:"◈",label:"Apollo CRM",color:"#A99CF0",desc:"Prospects & outreach"}];
const QUICK_ACTIONS=["Summarise my inbox","Draft a follow-up to my last email","What meetings do I have today?","Research top pharma companies in Japan","Create a pitch deck for ALR Labs","Find procurement contacts at exhibitors"];
const SAMPLE_HISTORY=[{role:"assistant",text:"Good morning! I'm Aura, your AI chief of staff. Connect your **Gmail** in Connectors to unlock your real inbox, calendar, and email sending. What can I help with today?",time:"09:02"}];
const PROJECT_COLORS=["#C9A84C","#7B6FD4","#4ECBA4","#E05C5C","#5B9BD5","#F0A06A","#A99CF0","#EA4335"];
const PROJECT_ICONS=["◉","▦","◈","⊕","✦","◎","⬡","≡"];
const INIT_PROJECTS=[{id:"p1",name:"CPHI Japan 2026",icon:"◈",color:"#A99CF0",desc:"Pharma exhibitor contacts",chats:8},{id:"p2",name:"Sage n Silk Launch",icon:"✦",color:"#C9A84C",desc:"Ayurvedic brand strategy",chats:5},{id:"p3",name:"DCAT Outreach",icon:"⊕",color:"#4ECBA4",desc:"Member company contacts",chats:12}];
const INIT_CONNECTORS=[{id:"gmail",name:"Gmail",icon:"G",color:"#EA4335",bg:"rgba(234,67,53,0.12)",category:"Email",desc:"Read, send & manage Gmail",status:"disconnected"},{id:"outlook",name:"Outlook",icon:"O",color:"#0078D4",bg:"rgba(0,120,212,0.12)",category:"Email",desc:"Microsoft 365 mail & calendar",status:"disconnected"},{id:"gcal",name:"Google Calendar",icon:"◫",color:"#4ECBA4",bg:"rgba(78,203,164,0.12)",category:"Calendar",desc:"Auto-enabled with Gmail",status:"disconnected"},{id:"apollo",name:"Apollo.io",icon:"◈",color:"#A99CF0",bg:"rgba(169,156,240,0.12)",category:"CRM",desc:"Prospect enrichment & sequences",status:"connected"},{id:"gamma",name:"Gamma",icon:"▦",color:"#E05C5C",bg:"rgba(224,92,92,0.12)",category:"Presentations",desc:"AI-powered slide decks",status:"connected"},{id:"linkedin",name:"LinkedIn",icon:"⬡",color:"#5B9BD5",bg:"rgba(91,155,213,0.12)",category:"Social",desc:"Posts & messages",status:"needs_install"},{id:"slack",name:"Slack",icon:"#",color:"#E01E5A",bg:"rgba(224,30,90,0.12)",category:"Messaging",desc:"Team channels & DMs",status:"disconnected"},{id:"notion",name:"Notion",icon:"N",color:"#F0EFE8",bg:"rgba(240,239,232,0.08)",category:"Notes",desc:"Docs, wikis & databases",status:"disconnected"},{id:"hubspot",name:"HubSpot",icon:"H",color:"#FF7A59",bg:"rgba(255,122,89,0.12)",category:"CRM",desc:"Marketing & sales CRM",status:"disconnected"},{id:"zapier",name:"Zapier",icon:"Z",color:"#FF4A00",bg:"rgba(255,74,0,0.12)",category:"Automation",desc:"Connect 5000+ apps",status:"disconnected"},{id:"sheets",name:"Google Sheets",icon:"S",color:"#34A853",bg:"rgba(52,168,83,0.12)",category:"Data",desc:"Spreadsheets & data",status:"disconnected"},{id:"whatsapp",name:"WhatsApp",icon:"W",color:"#25D366",bg:"rgba(37,211,102,0.12)",category:"Messaging",desc:"Business messaging",status:"disconnected"}];

const fmt=s=>s.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>");

// ── Token Storage ──────────────────────────────────────────────────────────────
const storage={
  save:(key,data)=>{try{localStorage.setItem(key,JSON.stringify(data));}catch(e){}},
  get:(key)=>{try{const d=localStorage.getItem(key);return d?JSON.parse(d):null;}catch(e){return null;}},
  clear:(key)=>{try{localStorage.removeItem(key);}catch(e){}},
};

// ── Shared UI ──────────────────────────────────────────────────────────────────
const GoldOrb=()=>(<div style={{position:"absolute",top:"-120px",right:"-80px",width:"400px",height:"400px",background:"radial-gradient(circle at 40% 40%,rgba(201,168,76,0.12) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>);

function Modal({title,subtitle,onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"min(480px,94vw)",maxHeight:"90vh",overflowY:"auto",background:"var(--bg1)",borderRadius:"var(--r3)",border:"1px solid var(--border2)",boxShadow:"var(--shadow)",animation:"slideUp 0.3s var(--ease)"}}>
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"var(--bg1)",zIndex:1}}>
          <div><h3 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"16px"}}>{title}</h3>{subtitle&&<p style={{fontSize:"11px",color:"var(--text3)",marginTop:"3px"}}>{subtitle}</p>}</div>
          <button onClick={onClose} style={{width:"28px",height:"28px",borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"20px 24px 24px"}}>{children}</div>
      </div>
    </div>
  );
}

// ── Compose Modal ──────────────────────────────────────────────────────────────
function ComposeModal({gmailAccount,outlookAccount,prefill,onClose,onSent}){
  const [to,setTo]=useState(prefill?.to||"");
  const [subject,setSubject]=useState(prefill?.subject||"");
  const [body,setBody]=useState(prefill?.body||"");
  const [from,setFrom]=useState(gmailAccount?"gmail":outlookAccount?"outlook":"gmail");
  const [sending,setSending]=useState(false);
  const [sent,setSent]=useState(false);
  const [error,setError]=useState(null);
  const [drafting,setDrafting]=useState(false);

  const draftWithAI=async()=>{
    if(!to.trim()&&!subject.trim()){setError("Add a To or Subject first so Aura knows the context.");return;}
    setDrafting(true);
    try{
      const res=await fetch(`${API_URL}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:500,
          system:"You are Aura, an expert email drafter for a pharma exports business. Write professional, concise emails. Return only the email body, no subject line, no preamble.",
          messages:[{role:"user",content:`Draft a professional email to: ${to||"the recipient"}\nSubject: ${subject||"(no subject given)"}\nContext: ${prefill?.context||"Business email from VP of Global Exports at ALR Labs"}\nTone: Professional but warm`}]})});
      const data=await res.json();
      const draft=data.content?.[0]?.text||"";
      setBody(draft);
    }catch(e){setError("AI draft failed. Try again.");}
    setDrafting(false);
  };

  const handleSend=async()=>{
    if(!to.trim()||!subject.trim()||!body.trim()){setError("Please fill in To, Subject and Message.");return;}
    setSending(true);setError(null);
    try{
      const account=from==="gmail"?gmailAccount:outlookAccount;
      const endpoint=from==="gmail"?`${API_URL}/api/gmail?action=send`:`${API_URL}/api/outlook?action=send`;
      const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${account.token}`},
        body:JSON.stringify({to,subject,body,threadId:prefill?.threadId,fromEmail:account.email})});
      const data=await res.json();
      if(data.success){setSent(true);onSent?.();setTimeout(onClose,1500);}
      else setError(data.error||"Failed to send.");
    }catch(e){setError("Connection error. Try again.");}
    setSending(false);
  };

  const inp={width:"100%",padding:"10px 14px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px",transition:"border-color 0.2s"};
  const focus=e=>e.target.style.borderColor="rgba(201,168,76,0.4)";
  const blur=e=>e.target.style.borderColor="var(--border)";

  return(
    <Modal title={prefill?.replyTo?"Reply":"New email"} subtitle={prefill?.replyTo?`Re: ${prefill.subject}`:"Compose a new message"} onClose={onClose}>
      {sent?(
        <div style={{textAlign:"center",padding:"32px",color:"var(--green)",fontSize:"16px",fontWeight:"600"}}>✓ Email sent!</div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {gmailAccount&&outlookAccount&&(
            <div>
              <label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"5px"}}>From</label>
              <div style={{display:"flex",gap:"6px"}}>
                {[{id:"gmail",label:gmailAccount.email,color:"#EA4335"},{id:"outlook",label:outlookAccount.email,color:"#0078D4"}].map(acc=>(
                  <button key={acc.id} onClick={()=>setFrom(acc.id)} style={{flex:1,padding:"8px 10px",borderRadius:"var(--r)",background:from===acc.id?`${acc.color}18`:"var(--bg2)",border:`1px solid ${from===acc.id?acc.color+"55":"var(--border)"}`,color:from===acc.id?acc.color:"var(--text2)",fontSize:"11px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"all 0.15s"}}>{acc.label}</button>
                ))}
              </div>
            </div>
          )}
          <div><label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"5px"}}>To</label><input value={to} onChange={e=>setTo(e.target.value)} placeholder="recipient@example.com" style={inp} onFocus={focus} onBlur={blur}/></div>
          <div><label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"5px"}}>Subject</label><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" style={inp} onFocus={focus} onBlur={blur}/></div>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"5px"}}>
              <label style={{fontSize:"11px",color:"var(--text3)"}}>Message</label>
              <button onClick={draftWithAI} disabled={drafting} style={{padding:"3px 10px",borderRadius:"100px",background:"var(--gold-dim)",border:"1px solid rgba(201,168,76,0.3)",color:"var(--gold)",fontSize:"10px",fontWeight:"600",transition:"all 0.15s"}}>
                {drafting?"Drafting…":"✦ Draft with AI"}
              </button>
            </div>
            <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your message or click 'Draft with AI'…" rows={8} style={{...inp,resize:"vertical",lineHeight:"1.6"}} onFocus={focus} onBlur={blur}/>
          </div>
          {error&&<div style={{padding:"10px 14px",borderRadius:"var(--r)",background:"rgba(224,92,92,0.1)",border:"1px solid rgba(224,92,92,0.3)",color:"var(--red)",fontSize:"12px"}}>{error}</div>}
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:"13px"}}>Cancel</button>
            <button onClick={handleSend} disabled={sending} style={{flex:2,padding:"12px",borderRadius:"var(--r)",background:sending?"var(--bg3)":"var(--gold)",border:"none",color:sending?"var(--text3)":"#0A0A0F",fontSize:"14px",fontWeight:"700",fontFamily:"var(--font-d)",transition:"all 0.2s"}}>
              {sending?"Sending…":"Send →"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function Sidebar({active,onNav,user,collapsed,onToggle,projects,activeProject,onSelectProject,gmailAccount}){
  return(
    <aside style={{width:collapsed?"64px":"230px",minWidth:collapsed?"64px":"230px",background:"var(--bg1)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",transition:"width 0.3s var(--ease),min-width 0.3s var(--ease)",overflow:"hidden",position:"relative",zIndex:10}}>
      <div style={{padding:collapsed?"20px 0":"24px 20px",display:"flex",alignItems:"center",gap:"10px",borderBottom:"1px solid var(--border)",justifyContent:collapsed?"center":"flex-start"}}>
        <div style={{width:"32px",height:"32px",borderRadius:"10px",flexShrink:0,background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",fontWeight:"700",color:"#0A0A0F",animation:"glow 3s ease-in-out infinite"}}>A</div>
        {!collapsed&&<span style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px",color:"var(--gold)",letterSpacing:"-0.02em"}}>Aura</span>}
      </div>
      <nav style={{padding:"12px 8px 0",display:"flex",flexDirection:"column",gap:"2px"}}>
        {[{id:"chat",icon:"◉",label:"Chat"},{id:"email",icon:"✉",label:"Email"},{id:"calendar",icon:"◫",label:"Calendar"},{id:"research",icon:"⊕",label:"Research"},{id:"crm",icon:"◈",label:"CRM"},{id:"connectors",icon:"⊞",label:"Connectors"},{id:"settings",icon:"⊙",label:"Settings"}].map(item=>(
          <button key={item.id} onClick={()=>onNav(item.id)} style={{display:"flex",alignItems:"center",gap:"10px",padding:collapsed?"10px 0":"10px 12px",justifyContent:collapsed?"center":"flex-start",borderRadius:"var(--r)",background:active===item.id?"var(--gold-dim)":"transparent",border:active===item.id?"1px solid rgba(201,168,76,0.2)":"1px solid transparent",color:active===item.id?"var(--gold)":"var(--text2)",fontSize:"13px",fontWeight:"500",transition:"all 0.15s",position:"relative"}}>
            <span style={{fontSize:"16px",lineHeight:1}}>{item.icon}</span>
            {!collapsed&&<span>{item.label}</span>}
            {item.id==="connectors"&&!gmailAccount&&!collapsed&&<span style={{marginLeft:"auto",width:"6px",height:"6px",borderRadius:"50%",background:"var(--gold)",flexShrink:0}}/>}
          </button>
        ))}
      </nav>
      {!collapsed&&(
        <div style={{padding:"16px 8px 8px"}}>
          <div style={{padding:"0 4px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"10px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em"}}>Projects</span>
            <button onClick={()=>onNav("new_project")} style={{width:"18px",height:"18px",borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>
          {projects.map(p=>(
            <button key={p.id} onClick={()=>{onSelectProject(p.id);onNav("chat");}} style={{display:"flex",alignItems:"center",gap:"8px",padding:"8px 12px",borderRadius:"var(--r)",background:activeProject===p.id?"var(--bg3)":"transparent",border:"1px solid transparent",color:activeProject===p.id?"var(--text)":"var(--text2)",fontSize:"12px",textAlign:"left",transition:"all 0.15s",width:"100%"}}>
              <span style={{fontSize:"13px",color:p.color}}>{p.icon}</span>
              <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
              <span style={{fontSize:"10px",color:"var(--text3)",flexShrink:0}}>{p.chats}</span>
            </button>
          ))}
        </div>
      )}
      {!collapsed&&(
        <div style={{padding:"16px",borderTop:"1px solid var(--border)",marginTop:"auto",display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"32px",height:"32px",borderRadius:"50%",flexShrink:0,background:"linear-gradient(135deg,var(--accent) 0%,var(--gold) 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"700",color:"#fff"}}>{user.name[0]}</div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontSize:"12px",fontWeight:"600",color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
            <div style={{fontSize:"10px",color:"var(--text3)"}}>Free Plan ✦ Owner</div>
          </div>
        </div>
      )}
      <button onClick={onToggle} style={{position:"absolute",right:"-10px",top:"72px",width:"20px",height:"20px",borderRadius:"50%",background:"var(--bg2)",border:"1px solid var(--border2)",color:"var(--text2)",fontSize:"10px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>{collapsed?"›":"‹"}</button>
    </aside>
  );
}

// ── Message components ─────────────────────────────────────────────────────────
function Message({msg,isNew}){
  const isUser=msg.role==="user";
  return(
    <div style={{display:"flex",gap:"12px",flexDirection:isUser?"row-reverse":"row",animation:isNew?"fadeUp 0.3s var(--ease)":"none",alignItems:"flex-start",padding:"4px 0"}}>
      {!isUser&&<div style={{width:"30px",height:"30px",borderRadius:"10px",flexShrink:0,marginTop:"2px",background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",color:"#0A0A0F"}}>A</div>}
      <div style={{maxWidth:"76%",display:"flex",flexDirection:"column",gap:"4px",alignItems:isUser?"flex-end":"flex-start"}}>
        <div style={{padding:"12px 16px",borderRadius:isUser?"18px 18px 4px 18px":"18px 18px 18px 4px",background:isUser?"linear-gradient(135deg,var(--accent) 0%,#5C51B0 100%)":"var(--bg2)",border:isUser?"none":"1px solid var(--border)",fontSize:"14px",lineHeight:"1.65",color:"var(--text)",fontWeight:"300"}} dangerouslySetInnerHTML={{__html:fmt(msg.text)}}/>
        <span style={{fontSize:"10px",color:"var(--text3)",padding:"0 4px"}}>{msg.time}</span>
      </div>
    </div>
  );
}

function TypingIndicator(){
  return(
    <div style={{display:"flex",gap:"12px",alignItems:"flex-start",animation:"fadeUp 0.3s var(--ease)"}}>
      <div style={{width:"30px",height:"30px",borderRadius:"10px",flexShrink:0,background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",color:"#0A0A0F"}}>A</div>
      <div style={{padding:"14px 18px",borderRadius:"18px 18px 18px 4px",background:"var(--bg2)",border:"1px solid var(--border)",display:"flex",gap:"4px",alignItems:"center"}}>
        {[0,1,2].map(i=><span key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:"var(--text3)",display:"block",animation:`typeDot 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
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
      <div style={{display:"flex",alignItems:"flex-end",gap:"10px",background:"var(--bg2)",borderRadius:"var(--r2)",border:"1px solid var(--border2)",padding:"10px 10px 10px 16px",transition:"border-color 0.2s"}} onFocusCapture={e=>e.currentTarget.style.borderColor="rgba(201,168,76,0.4)"} onBlurCapture={e=>e.currentTarget.style.borderColor="var(--border2)"}>
        <textarea ref={taRef} value={val} onChange={onInput} onKeyDown={onKey} placeholder="Ask Aura anything…" rows={1} style={{flex:1,background:"transparent",border:"none",resize:"none",color:"var(--text)",fontSize:"14px",lineHeight:"1.5",fontFamily:"var(--font-b)",fontWeight:"300",maxHeight:"120px",overflowY:"auto"}}/>
        <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
          <button onClick={onVoice} style={{width:"36px",height:"36px",borderRadius:"50%",background:isListening?"var(--green)":"var(--bg3)",border:`1px solid ${isListening?"var(--green)":"var(--border)"}`,color:isListening?"#fff":"var(--text2)",fontSize:"16px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",animation:isListening?"pulse 1s ease-in-out infinite":"none"}}>◎</button>
          <button onClick={send} style={{width:"36px",height:"36px",borderRadius:"50%",background:val.trim()?"var(--gold)":"var(--bg3)",border:"none",color:val.trim()?"#0A0A0F":"var(--text3)",fontSize:"18px",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",fontWeight:"700"}}>›</button>
        </div>
      </div>
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
        <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)"}}>
          <div style={{width:"40px",height:"40px",borderRadius:"12px",flexShrink:0,background:`${color}22`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",color}}>{icon}</div>
          <div><div style={{fontSize:"14px",fontWeight:"600",color:"var(--text)"}}>{name||"Project name"}</div><div style={{fontSize:"11px",color:"var(--text3)",marginTop:"2px"}}>{desc||"No description"}</div></div>
        </div>
        {[["Project name",name,setName,"e.g. CPHI Japan 2026"],["Description",desc,setDesc,"What's this project about?"]].map(([lbl,val,set,ph])=>(
          <div key={lbl}><label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"5px"}}>{lbl}</label>
          <input value={val} onChange={e=>set(e.target.value)} placeholder={ph} style={{width:"100%",padding:"10px 14px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px"}} onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/></div>
        ))}
        <div><label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"8px"}}>Icon</label><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{PROJECT_ICONS.map(ic=>(<button key={ic} onClick={()=>setIcon(ic)} style={{width:"36px",height:"36px",borderRadius:"10px",fontSize:"18px",background:icon===ic?`${color}22`:"var(--bg2)",border:`1px solid ${icon===ic?color:"var(--border)"}`,color:icon===ic?color:"var(--text2)",transition:"all 0.15s"}}>{ic}</button>))}</div></div>
        <div><label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"8px"}}>Colour</label><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>{PROJECT_COLORS.map(c=>(<button key={c} onClick={()=>setColor(c)} style={{width:"24px",height:"24px",borderRadius:"50%",background:c,border:"none",outline:color===c?`2px solid ${c}`:"2px solid transparent",outlineOffset:"2px",transition:"all 0.15s"}}/>))}</div></div>
        <button onClick={()=>{if(name.trim())onSave({id:"p"+Date.now(),name:name.trim(),desc,icon,color,chats:0});onClose();}} style={{width:"100%",padding:"12px",borderRadius:"var(--r)",background:name.trim()?"var(--gold)":"var(--bg3)",border:"none",color:name.trim()?"#0A0A0F":"var(--text3)",fontSize:"14px",fontWeight:"700",fontFamily:"var(--font-d)",transition:"all 0.2s"}}>Create project →</button>
      </div>
    </Modal>
  );
}

// ── Chat Screen ────────────────────────────────────────────────────────────────
function ChatScreen({user,projects,activeProject,onSelectProject,onNav,gmailAccount,outlookAccount}){
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
      const emailCtx=[gmailAccount&&`Gmail connected: ${gmailAccount.email}`,outlookAccount&&`Outlook connected: ${outlookAccount.email}`].filter(Boolean).join(", ")||"No email connected.";
      const res=await fetch(`${API_URL}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
          system:`You are Aura, an elite personal AI chief of staff for ${user.name}, ${user.role} at ${user.company}. ${projectCtx}Email accounts: ${emailCtx}. You are sharp, professional, warm. Help with email, calendar, research, presentations, CRM, LinkedIn. Use **bold** for key terms. You know about CPHI Japan 2026, Sage n Silk brand, DCAT prospecting, ALR Labs pharma exports. Act directly — don't just plan, do.`,
          messages:history})});
      const data=await res.json();
      setMsgs(m=>[...m,{role:"assistant",text:data.content?.[0]?.text||"Something went wrong.",time:now()}]);
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"Connection issue — please try again.",time:now()}]);}
    setLoading(false);
  },[msgs,user,activeProj,gmailAccount,outlookAccount]);

  const startVoice=()=>{
    if(!("webkitSpeechRecognition" in window||"SpeechRecognition" in window)){alert("Voice needs Chrome.");return;}
    if(isListening){recognitionRef.current?.stop();setIsListening(false);return;}
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const r=new SR();r.lang="en-IN";r.interimResults=false;
    r.onresult=e=>callAura(e.results[0][0].transcript);r.onend=()=>setIsListening(false);r.start();recognitionRef.current=r;setIsListening(true);
  };

  const statusItems=[
    {label:gmailAccount?`Gmail: ${gmailAccount.email}`:"Gmail — not connected",ok:!!gmailAccount},
    {label:outlookAccount?`Outlook: ${outlookAccount.email}`:"Outlook — not connected",ok:!!outlookAccount},
    {label:"Apollo",ok:true},{label:"Research",ok:true},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative",overflow:"hidden"}}>
      <GoldOrb/>
      <div style={{padding:"16px 24px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
        <div style={{flex:1,minWidth:0}}>
          <h1 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"19px",color:"var(--gold)",letterSpacing:"-0.02em"}}>Good morning, {user.name.split(" ")[0]} ✦</h1>
          <p style={{fontSize:"11px",color:"var(--text3)",marginTop:"2px"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric"})}</p>
        </div>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowProjectMenu(m=>!m)} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 12px",borderRadius:"100px",background:activeProj?`${activeProj.color}18`:"var(--bg2)",border:`1px solid ${activeProj?`${activeProj.color}44`:"var(--border)"}`,color:activeProj?activeProj.color:"var(--text2)",fontSize:"12px",fontWeight:"500",transition:"all 0.15s",whiteSpace:"nowrap"}}>
            <span>{activeProj?activeProj.icon:"◉"}</span>
            <span style={{maxWidth:"100px",overflow:"hidden",textOverflow:"ellipsis"}}>{activeProj?activeProj.name:"All chats"}</span>
            <span style={{fontSize:"10px"}}>▾</span>
          </button>
          {showProjectMenu&&(
            <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:50,background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:"var(--r2)",padding:"8px",minWidth:"180px",boxShadow:"var(--shadow)",animation:"fadeUp 0.2s var(--ease)"}}>
              <button onClick={()=>{onSelectProject(null);setShowProjectMenu(false);}} style={{display:"flex",alignItems:"center",gap:"8px",width:"100%",padding:"8px 10px",borderRadius:"var(--r)",background:!activeProject?"var(--gold-dim)":"transparent",border:"1px solid transparent",color:!activeProject?"var(--gold)":"var(--text2)",fontSize:"12px",transition:"all 0.15s",textAlign:"left"}}><span>◉</span><span>All chats</span></button>
              {projects.map(p=>(<button key={p.id} onClick={()=>{onSelectProject(p.id);setShowProjectMenu(false);}} style={{display:"flex",alignItems:"center",gap:"8px",width:"100%",padding:"8px 10px",borderRadius:"var(--r)",background:activeProject===p.id?`${p.color}18`:"transparent",border:"1px solid transparent",color:activeProject===p.id?p.color:"var(--text2)",fontSize:"12px",transition:"all 0.15s",textAlign:"left"}}><span style={{color:p.color}}>{p.icon}</span><span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span></button>))}
              <div style={{borderTop:"1px solid var(--border)",marginTop:"6px",paddingTop:"6px"}}>
                <button onClick={()=>{setShowProjectMenu(false);onNav("new_project");}} style={{display:"flex",alignItems:"center",gap:"8px",width:"100%",padding:"8px 10px",borderRadius:"var(--r)",background:"transparent",border:"1px dashed var(--border)",color:"var(--text3)",fontSize:"12px",transition:"all 0.15s",textAlign:"left"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text3)";}}>
                  <span>+</span><span>New project</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <div style={{padding:"5px 12px",borderRadius:"100px",background:"var(--gold-dim)",border:"1px solid rgba(201,168,76,0.25)",fontSize:"11px",color:"var(--gold)",fontWeight:"600",flexShrink:0}}>FREE</div>
      </div>
      {activeProj&&(<div style={{padding:"8px 24px",background:`${activeProj.color}0D`,borderBottom:`1px solid ${activeProj.color}22`,display:"flex",alignItems:"center",gap:"8px"}}><span style={{color:activeProj.color,fontSize:"14px"}}>{activeProj.icon}</span><span style={{fontSize:"12px",fontWeight:"600",color:activeProj.color}}>{activeProj.name}</span>{activeProj.desc&&<span style={{fontSize:"11px",color:"var(--text3)"}}>— {activeProj.desc}</span>}</div>)}
      <div style={{display:"flex",gap:"8px",padding:"10px 20px",borderBottom:"1px solid var(--border)",overflowX:"auto",scrollbarWidth:"none"}}>
        {statusItems.map((item,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:"6px",padding:"5px 12px",borderRadius:"100px",background:"var(--bg2)",border:"1px solid var(--border)",whiteSpace:"nowrap",flexShrink:0}}><span style={{width:"6px",height:"6px",borderRadius:"50%",background:item.ok?"var(--green)":"var(--text3)",flexShrink:0}}/><span style={{fontSize:"11px",color:"var(--text2)"}}>{item.label}</span></div>))}
      </div>
      <div style={{padding:"10px 20px 8px",display:"flex",gap:"8px",overflowX:"auto",scrollbarWidth:"none",borderBottom:"1px solid var(--border)"}}>
        {QUICK_ACTIONS.map((a,i)=>(<button key={i} onClick={()=>callAura(a)} style={{padding:"6px 14px",borderRadius:"100px",whiteSpace:"nowrap",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:"12px",flexShrink:0,transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)";}}>
          {a}
        </button>))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:"16px"}}>
        {!gmailAccount&&(<div style={{padding:"14px 16px",borderRadius:"var(--r)",background:"var(--gold-dim)",border:"1px solid rgba(201,168,76,0.3)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}><span style={{fontSize:"13px",color:"var(--gold)"}}>✦ Connect Gmail to unlock your real inbox & calendar</span><button onClick={()=>onNav("connectors")} style={{padding:"6px 14px",borderRadius:"100px",background:"var(--gold)",border:"none",color:"#0A0A0F",fontSize:"12px",fontWeight:"700",flexShrink:0}}>Connect</button></div>)}
        {msgs.map((m,i)=><Message key={i} msg={m} isNew={i===newIdx}/>)}
        {loading&&<TypingIndicator/>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"8px 20px 4px",display:"flex",gap:"6px",overflowX:"auto",scrollbarWidth:"none"}}>
        {TOOLS.map(t=>(<button key={t.id} onClick={()=>callAura(`Use ${t.label}: ${t.desc}`)} style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"6px 12px",borderRadius:"100px",background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:"12px",fontWeight:"500",transition:"all 0.15s",whiteSpace:"nowrap"}} onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.color=t.color;}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text2)";}}>
          <span style={{fontSize:"14px"}}>{t.icon}</span>{t.label}
        </button>))}
      </div>
      <ChatInput onSend={callAura} onVoice={startVoice} isListening={isListening}/>
    </div>
  );
}

// ── Email Screen ───────────────────────────────────────────────────────────────
function EmailScreen({gmailAccount,outlookAccount,onNav}){
  const [emails,setEmails]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [activeAcc,setActiveAcc]=useState(gmailAccount?"gmail":outlookAccount?"outlook":null);
  const [showCompose,setShowCompose]=useState(false);
  const [replyTo,setReplyTo]=useState(null);

  const loadInbox=async(acc=activeAcc)=>{
    const account=acc==="gmail"?gmailAccount:outlookAccount;
    if(!account)return;
    setLoading(true);setError(null);
    try{
      const endpoint=acc==="gmail"?`${API_URL}/api/gmail?action=inbox`:`${API_URL}/api/outlook?action=inbox`;
      const res=await fetch(endpoint,{headers:{Authorization:`Bearer ${account.token}`,"x-refresh-token":account.refreshToken||""}});
      const data=await res.json();
      if(data.messages)setEmails(data.messages);
      else setError(data.error||"Failed to load inbox");
    }catch(){setError("Connection error");}
    setLoading(false);
  };

  useEffect(()=>{if(activeAcc)loadInbox();},[gmailAccount,outlookAccount,activeAcc]);

  if(!gmailAccount&&!outlookAccount){
    return(<div style={{display:"flex",flexDirection:"column",height:"100%",alignItems:"center",justifyContent:"center",gap:"16px",padding:"32px"}}>
      <div style={{fontSize:"32px"}}>✉</div>
      <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"20px"}}>Connect your email</h2>
      <p style={{fontSize:"14px",color:"var(--text2)",textAlign:"center",maxWidth:"320px",lineHeight:"1.6"}}>Connect Gmail or Outlook to read, summarise, and reply to real emails with Aura.</p>
      <button onClick={()=>onNav("connectors")} style={{padding:"12px 28px",borderRadius:"100px",background:"var(--gold)",border:"none",color:"#0A0A0F",fontSize:"14px",fontWeight:"700",fontFamily:"var(--font-d)"}}>Connect email →</button>
    </div>);
  }

  const currentAccount=activeAcc==="gmail"?gmailAccount:outlookAccount;

  return(
    <>
      {showCompose&&<ComposeModal gmailAccount={gmailAccount} outlookAccount={outlookAccount} prefill={replyTo} onClose={()=>{setShowCompose(false);setReplyTo(null);}} onSent={()=>setTimeout(()=>loadInbox(),2000)}/>}
      <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <div style={{padding:"16px 24px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
          <div>
            <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>Inbox</h2>
            <p style={{fontSize:"12px",color:"var(--text3)",marginTop:"2px"}}>{loading?"Loading…":`${emails.filter(e=>e.unread).length} unread`}</p>
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>loadInbox()} style={{padding:"8px 14px",borderRadius:"100px",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:"12px"}}>↻</button>
            <button onClick={()=>{setReplyTo(null);setShowCompose(true);}} style={{padding:"8px 16px",borderRadius:"100px",background:"var(--gold)",border:"none",color:"#0A0A0F",fontSize:"12px",fontWeight:"600"}}>+ Compose</button>
          </div>
        </div>
        {/* Account tabs */}
        {(gmailAccount||outlookAccount)&&(
          <div style={{padding:"10px 16px",borderBottom:"1px solid var(--border)",display:"flex",gap:"6px",overflowX:"auto",scrollbarWidth:"none"}}>
            {[gmailAccount&&{id:"gmail",label:gmailAccount.email,color:"#EA4335"},outlookAccount&&{id:"outlook",label:outlookAccount.email,color:"#0078D4"}].filter(Boolean).map(acc=>(
              <button key={acc.id} onClick={()=>{setActiveAcc(acc.id);loadInbox(acc.id);}} style={{display:"flex",alignItems:"center",gap:"7px",padding:"7px 14px",borderRadius:"100px",flexShrink:0,background:activeAcc===acc.id?`${acc.color}1A`:"var(--bg2)",border:activeAcc===acc.id?`1px solid ${acc.color}55`:"1px solid var(--border)",color:activeAcc===acc.id?acc.color:"var(--text2)",fontSize:"12px",fontWeight:"500",transition:"all 0.15s"}}>
                <span style={{fontSize:"13px",fontWeight:"700"}}>{acc.id==="gmail"?"G":"O"}</span>
                <span style={{maxWidth:"140px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{acc.label}</span>
              </button>
            ))}
          </div>
        )}
        <div style={{flex:1,overflowY:"auto"}}>
          {loading&&<div style={{padding:"48px",textAlign:"center",color:"var(--text3)",fontSize:"13px"}}>Loading…</div>}
          {error&&<div style={{padding:"16px",margin:"16px",borderRadius:"var(--r)",background:"rgba(224,92,92,0.08)",border:"1px solid rgba(224,92,92,0.2)",color:"var(--red)",fontSize:"13px"}}>{error}</div>}
          {!loading&&emails.map(e=>{
            const fromName=e.from?.replace(/<.*>/,"").trim().replace(/"/g,"")||e.from;
            const date=new Date(e.date);
            const timeStr=date.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
            return(
              <div key={e.id} style={{padding:"14px 24px",borderBottom:"1px solid var(--border)",display:"flex",gap:"12px",alignItems:"flex-start",background:e.unread?"rgba(201,168,76,0.03)":"transparent",cursor:"pointer",transition:"background 0.15s"}}
                onMouseEnter={el=>el.currentTarget.style.background="var(--bg2)"}
                onMouseLeave={el=>el.currentTarget.style.background=e.unread?"rgba(201,168,76,0.03)":"transparent"}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",flexShrink:0,background:"var(--bg3)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"600",color:"var(--text2)"}}>{fromName[0]?.toUpperCase()||"?"}</div>
                <div style={{flex:1,overflow:"hidden"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"2px"}}>
                    <span style={{fontSize:"13px",fontWeight:e.unread?"600":"400",color:"var(--text)"}}>{fromName}</span>
                    <span style={{fontSize:"11px",color:"var(--text3)",marginLeft:"8px",flexShrink:0}}>{timeStr}</span>
                  </div>
                  <div style={{fontSize:"13px",fontWeight:e.unread?"500":"400",color:e.unread?"var(--text)":"var(--text2)",marginBottom:"3px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.subject}</div>
                  <div style={{fontSize:"12px",color:"var(--text3)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.snippet}</div>
                  <button onClick={ev=>{ev.stopPropagation();setReplyTo({replyTo:true,to:e.from,subject:`Re: ${e.subject}`,threadId:e.threadId,body:`\n\n---\nOn ${date.toLocaleString()}, ${fromName} wrote:\n> ${e.snippet}`});setShowCompose(true);}} style={{marginTop:"6px",padding:"3px 10px",borderRadius:"100px",background:"var(--bg3)",border:"1px solid var(--border)",color:"var(--text3)",fontSize:"11px",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text3)";}}>↩ Reply</button>
                </div>
                {e.unread&&<div style={{width:"7px",height:"7px",borderRadius:"50%",background:"var(--gold)",flexShrink:0,marginTop:"5px"}}/>}
              </div>
            );
          })}
          {!loading&&emails.length===0&&!error&&<div style={{padding:"48px",textAlign:"center",color:"var(--text3)",fontSize:"13px"}}>Inbox is empty.</div>}
        </div>
      </div>
    </>
  );
}

// ── Calendar Screen ────────────────────────────────────────────────────────────
function CalendarScreen({gmailAccount}){
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [view,setView]=useState("today");

  const loadEvents=async(v=view)=>{
    if(!gmailAccount?.token)return;
    setLoading(true);setError(null);
    try{
      const res=await fetch(`${API_URL}/api/calendar?action=${v}`,{headers:{Authorization:`Bearer ${gmailAccount.token}`,"x-refresh-token":gmailAccount.refreshToken||""}});
      const data=await res.json();
      if(data.events)setEvents(data.events);else setError(data.error||"Failed to load");
    }catch(){setError("Connection error");}
    setLoading(false);
  };

  useEffect(()=>{if(gmailAccount)loadEvents();},[gmailAccount,view]);

  const fmtTime=s=>{if(!s)return"";const d=new Date(s);return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});};
  const fmtDate=s=>{if(!s)return"";const d=new Date(s);return d.toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric"});};

  if(!gmailAccount){
    return(<div style={{display:"flex",flexDirection:"column",height:"100%",alignItems:"center",justifyContent:"center",gap:"16px",padding:"32px"}}>
      <div style={{fontSize:"32px"}}>◫</div>
      <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"20px"}}>Connect Gmail first</h2>
      <p style={{fontSize:"14px",color:"var(--text2)",textAlign:"center",maxWidth:"320px",lineHeight:"1.6"}}>Calendar uses your Google account — connect Gmail in Connectors.</p>
    </div>);
  }

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"16px 24px 12px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>Calendar</h2>
          <p style={{fontSize:"12px",color:"var(--text3)",marginTop:"2px"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</p>
        </div>
        <div style={{display:"flex",gap:"6px"}}>
          {["today","upcoming"].map(v=>(<button key={v} onClick={()=>{setView(v);loadEvents(v);}} style={{padding:"7px 14px",borderRadius:"100px",background:view===v?"var(--gold-dim)":"var(--bg2)",border:view===v?"1px solid rgba(201,168,76,0.3)":"1px solid var(--border)",color:view===v?"var(--gold)":"var(--text2)",fontSize:"12px",fontWeight:"500",transition:"all 0.15s",textTransform:"capitalize"}}>{v}</button>))}
          <button onClick={()=>loadEvents()} style={{padding:"7px 12px",borderRadius:"100px",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text2)",fontSize:"12px"}}>↻</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        {loading&&<div style={{textAlign:"center",padding:"48px",color:"var(--text3)",fontSize:"13px"}}>Loading events…</div>}
        {error&&<div style={{padding:"16px",borderRadius:"var(--r)",background:"rgba(224,92,92,0.08)",border:"1px solid rgba(224,92,92,0.2)",color:"var(--red)",fontSize:"13px",marginBottom:"8px"}}>{error}</div>}
        {!loading&&events.length===0&&!error&&<div style={{textAlign:"center",padding:"48px",color:"var(--text3)",fontSize:"13px"}}>No events {view==="today"?"today":"in the next 7 days"} 🎉</div>}
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {events.map(e=>(
            <div key={e.id} style={{padding:"16px",borderRadius:"var(--r2)",background:"var(--bg2)",border:"1px solid var(--border)",transition:"border-color 0.15s"}} onMouseEnter={el=>el.currentTarget.style.borderColor="var(--border2)"} onMouseLeave={el=>el.currentTarget.style.borderColor="var(--border)"}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                <div style={{flex:1,minWidth:0,marginRight:"12px"}}>
                  <div style={{fontSize:"14px",fontWeight:"600",color:"var(--text)",marginBottom:"4px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.title}</div>
                  <div style={{fontSize:"12px",color:"var(--text3)"}}>{e.allDay?"All day":`${fmtTime(e.start)} — ${fmtTime(e.end)}`}{view==="upcoming"&&` · ${fmtDate(e.start)}`}</div>
                </div>
                {e.meetLink&&<a href={e.meetLink} target="_blank" rel="noreferrer" style={{padding:"5px 12px",borderRadius:"100px",background:"rgba(78,203,164,0.12)",border:"1px solid rgba(78,203,164,0.3)",color:"var(--green)",fontSize:"11px",fontWeight:"600",textDecoration:"none",flexShrink:0}}>Join Meet</a>}
              </div>
              {e.location&&<div style={{fontSize:"12px",color:"var(--text2)",marginBottom:"6px"}}>📍 {e.location}</div>}
              {e.attendees?.length>0&&<div style={{display:"flex",gap:"4px",flexWrap:"wrap"}}>{e.attendees.slice(0,4).map((a,i)=>(<span key={i} style={{padding:"2px 8px",borderRadius:"100px",background:"var(--bg3)",border:"1px solid var(--border)",fontSize:"10px",color:"var(--text2)"}}>{a}</span>))}{e.attendees.length>4&&<span style={{fontSize:"10px",color:"var(--text3)",padding:"2px 8px"}}>+{e.attendees.length-4} more</span>}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Connectors Screen ──────────────────────────────────────────────────────────
function ConnectorsScreen({gmailAccount,outlookAccount,onGmailConnect,onOutlookConnect,onGmailDisconnect,onOutlookDisconnect}){
  const [connectors,setConnectors]=useState(()=>INIT_CONNECTORS.map(c=>{
    if(c.id==="gmail")return{...c,status:gmailAccount?"connected":"disconnected"};
    if(c.id==="outlook")return{...c,status:outlookAccount?"connected":"disconnected"};
    if(c.id==="gcal")return{...c,status:gmailAccount?"connected":"disconnected"};
    return c;
  }));
  const [filter,setFilter]=useState("All");
  const [search,setSearch]=useState("");
  const [connecting,setConnecting]=useState(null);
  const categories=["All",...[...new Set(INIT_CONNECTORS.map(c=>c.category))]];
  const statusColor={connected:"var(--green)",needs_install:"var(--gold)",disconnected:"var(--text3)"};

  const handleConnect=async(c)=>{
    if(c.id==="gmail"){
      if(c.status==="connected"){onGmailDisconnect();setConnectors(cs=>cs.map(x=>["gmail","gcal"].includes(x.id)?{...x,status:"disconnected"}:x));return;}
      setConnecting("gmail");
      try{const res=await fetch(`${API_URL}/api/gmail?action=auth`);const data=await res.json();if(data.url)window.location.href=data.url;}catch(e){alert("Failed to start Gmail auth.");}
      setConnecting(null);return;
    }
    if(c.id==="outlook"){
      if(c.status==="connected"){onOutlookDisconnect();setConnectors(cs=>cs.map(x=>x.id==="outlook"?{...x,status:"disconnected"}:x));return;}
      setConnecting("outlook");
      try{const res=await fetch(`${API_URL}/api/outlook?action=auth`);const data=await res.json();if(data.url)window.location.href=data.url;}catch(e){alert("Failed to start Outlook auth.");}
      setConnecting(null);return;
    }
    setConnectors(cs=>cs.map(x=>x.id!==c.id?x:{...x,status:x.status==="connected"?"disconnected":"connected"}));
  };

  const visible=connectors.filter(c=>(filter==="All"||c.category===filter)&&(!search||c.name.toLowerCase().includes(search.toLowerCase())));
  const connected=connectors.filter(c=>c.status==="connected").length;

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"18px 24px 14px",borderBottom:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"12px"}}>
          <div><h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>Connectors</h2><p style={{fontSize:"12px",color:"var(--text3)",marginTop:"2px"}}>{connected} of {connectors.length} connected</p></div>
          <div style={{display:"flex",gap:"6px"}}><div style={{padding:"5px 12px",borderRadius:"100px",background:"rgba(78,203,164,0.12)",border:"1px solid var(--border)",fontSize:"11px",color:"var(--green)",fontWeight:"600"}}>{connected} active</div></div>
        </div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search connectors…" style={{width:"100%",padding:"9px 14px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px",marginBottom:"10px"}} onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.4)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
        <div style={{display:"flex",gap:"6px",overflowX:"auto",scrollbarWidth:"none"}}>
          {categories.map(cat=>(<button key={cat} onClick={()=>setFilter(cat)} style={{padding:"5px 14px",borderRadius:"100px",whiteSpace:"nowrap",background:filter===cat?"var(--gold-dim)":"var(--bg2)",border:filter===cat?"1px solid rgba(201,168,76,0.3)":"1px solid var(--border)",color:filter===cat?"var(--gold)":"var(--text2)",fontSize:"12px",flexShrink:0,transition:"all 0.15s"}}>{cat}</button>))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"10px"}}>
          {visible.map(c=>(
            <div key={c.id} style={{padding:"16px",borderRadius:"var(--r2)",background:"var(--bg2)",border:`1px solid ${c.status==="connected"?"var(--border2)":"var(--border)"}`,transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=c.color+"66"} onMouseLeave={e=>e.currentTarget.style.borderColor=c.status==="connected"?"var(--border2)":"var(--border)"}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"10px"}}>
                <div style={{width:"40px",height:"40px",borderRadius:"12px",background:c.bg,border:`1px solid ${c.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",fontWeight:"700",color:c.color}}>{c.icon}</div>
                <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                  <div style={{width:"7px",height:"7px",borderRadius:"50%",background:statusColor[c.status],boxShadow:c.status==="connected"?"0 0 6px var(--green)":"none"}}/>
                  <span style={{fontSize:"10px",color:statusColor[c.status],fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em"}}>{c.status==="connected"?"Live":c.status==="needs_install"?"Setup":"Off"}</span>
                </div>
              </div>
              <div style={{fontSize:"13px",fontWeight:"600",color:"var(--text)",marginBottom:"3px"}}>{c.name}</div>
              {c.id==="gmail"&&gmailAccount&&<div style={{fontSize:"11px",color:"var(--green)",marginBottom:"3px"}}>{gmailAccount.email}</div>}
              {c.id==="outlook"&&outlookAccount&&<div style={{fontSize:"11px",color:"#0078D4",marginBottom:"3px"}}>{outlookAccount.email}</div>}
              <div style={{fontSize:"11px",color:"var(--text3)",marginBottom:"12px",lineHeight:"1.4"}}>{c.desc}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{padding:"3px 8px",borderRadius:"100px",background:"var(--bg3)",border:"1px solid var(--border)",fontSize:"10px",color:"var(--text3)"}}>{c.category}</span>
                <button onClick={()=>handleConnect(c)} disabled={connecting===c.id||c.id==="gcal"} style={{padding:"6px 14px",borderRadius:"100px",fontSize:"11px",fontWeight:"600",background:c.status==="connected"?`${c.color}18`:c.status==="needs_install"?"var(--gold-dim)":"var(--bg3)",border:`1px solid ${c.status==="connected"?c.color+"44":c.status==="needs_install"?"rgba(201,168,76,0.3)":"var(--border)"}`,color:statusColor[c.status],transition:"all 0.15s",opacity:(connecting===c.id||c.id==="gcal")?0.6:1}}>
                  {connecting===c.id?"Connecting…":c.id==="gcal"?"Via Gmail":c.status==="connected"?"Disconnect":c.status==="needs_install"?"Install":"Connect"}
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
  const contacts=[{name:"Tanaka Hiroshi",co:"Daiichi Sankyo",role:"Head of Procurement",status:"hot",score:92},{name:"Yuki Matsumoto",co:"Takeda Pharmaceutical",role:"Supply Chain Director",status:"warm",score:74},{name:"Kenji Watanabe",co:"Astellas Pharma",role:"VP Procurement",status:"warm",score:68},{name:"Priya Nair",co:"Sun Pharma",role:"Global Sourcing Manager",status:"hot",score:88},{name:"Marco Bianchi",co:"Recordati S.p.A.",role:"Procurement Director",status:"cold",score:41}];
  const statusColor={hot:"var(--red)",warm:"var(--gold)",cold:"var(--text3)"};
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div><h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>CRM — Apollo Contacts</h2><p style={{fontSize:"12px",color:"var(--text3)",marginTop:"2px"}}>CPHI Japan 2026 · 5 leads</p></div>
        <button style={{padding:"8px 16px",borderRadius:"100px",background:"var(--accent)",border:"none",color:"#fff",fontSize:"12px",fontWeight:"600"}}>Enrich More</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
        {contacts.map((c,i)=>(<div key={i} style={{padding:"14px 16px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)",marginBottom:"8px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border2)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
          <div style={{width:"38px",height:"38px",borderRadius:"50%",flexShrink:0,background:"var(--bg3)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px",fontWeight:"600",color:"var(--text2)"}}>{c.name[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:"13px",fontWeight:"600",color:"var(--text)",marginBottom:"2px"}}>{c.name}</div><div style={{fontSize:"11px",color:"var(--text3)"}}>{c.role} · {c.co}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:"16px",fontWeight:"700",color:statusColor[c.status],marginBottom:"2px"}}>{c.score}</div><div style={{fontSize:"10px",color:statusColor[c.status],textTransform:"uppercase",fontWeight:"600"}}>{c.status}</div></div>
        </div>))}
      </div>
    </div>
  );
}

// ── Settings Screen ────────────────────────────────────────────────────────────
function SettingsScreen({user,gmailAccount,outlookAccount}){
  const plans=[{id:"free",label:"Free",price:"₹0",desc:"Owner only · All tools",color:"var(--green)",current:true},{id:"starter",label:"Starter",price:"₹999",desc:"1 user · Email + Chat",color:"var(--text2)"},{id:"pro",label:"Pro",price:"₹2,499",desc:"All tools · Voice · CRM",color:"var(--gold)"},{id:"team",label:"Team",price:"₹7,999",desc:"5 seats · White-label",color:"var(--accent)"}];
  const accounts=[{label:"Gmail",account:gmailAccount,color:"#EA4335",icon:"G"},{label:"Outlook",account:outlookAccount,color:"#0078D4",icon:"O"}];
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflowY:"auto"}}>
      <div style={{padding:"20px 24px 16px",borderBottom:"1px solid var(--border)"}}><h2 style={{fontFamily:"var(--font-d)",fontWeight:"700",fontSize:"18px"}}>Settings</h2></div>
      <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:"24px"}}>
        <section>
          <h3 style={{fontSize:"12px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Profile</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[["Full Name",user.name],["Role",user.role],["Company",user.company],["Email",user.email]].map(([label,val])=>(<div key={label}><label style={{fontSize:"11px",color:"var(--text3)",display:"block",marginBottom:"4px"}}>{label}</label><input defaultValue={val} style={{width:"100%",padding:"10px 14px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)",color:"var(--text)",fontSize:"13px"}}/></div>))}
          </div>
        </section>
        <section>
          <h3 style={{fontSize:"12px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Connected accounts</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {accounts.map(({label,account,color,icon})=>(<div key={label} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border)"}}>
              <div style={{width:"32px",height:"32px",borderRadius:"9px",background:`${color}1A`,border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"13px",fontWeight:"800",color,flexShrink:0}}>{icon}</div>
              <div style={{flex:1}}><div style={{fontSize:"12px",fontWeight:"600",color:"var(--text)"}}>{label}</div><div style={{fontSize:"11px",color:"var(--text3)"}}>{account?account.email:"Not connected"}</div></div>
              <span style={{fontSize:"11px",fontWeight:"600",color:account?"var(--green)":"var(--text3)",padding:"3px 10px",borderRadius:"100px",background:account?"rgba(78,203,164,0.12)":"var(--bg3)",flexShrink:0}}>{account?"Connected":"Disconnected"}</span>
            </div>))}
          </div>
        </section>
        <section>
          <h3 style={{fontSize:"12px",color:"var(--text3)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}}>Subscription plans</h3>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {plans.map(p=>(<div key={p.id} style={{padding:"16px",borderRadius:"var(--r)",background:p.current?"var(--gold-dim)":"var(--bg2)",border:`1px solid ${p.current?"rgba(201,168,76,0.3)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:"14px",fontWeight:"600",color:p.color}}>{p.label}</div><div style={{fontSize:"11px",color:"var(--text3)",marginTop:"2px"}}>{p.desc}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:"16px",fontWeight:"700",color:"var(--text)",fontFamily:"var(--font-d)"}}>{p.price}<span style={{fontSize:"10px",color:"var(--text3)",fontFamily:"var(--font-b)"}}>/mo</span></div>{p.current&&<div style={{fontSize:"10px",color:"var(--gold)",marginTop:"2px"}}>Your plan</div>}</div>
            </div>))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Onboarding ─────────────────────────────────────────────────────────────────
function OnboardingScreen({onComplete}){
  const [step,setStep]=useState(0);const [form,setForm]=useState({name:"",role:"",company:"",email:""});
  const steps=[{title:"Meet Aura.",sub:"Your AI chief of staff. Handles email, research, deals, and more.",cta:"Get Started",field:null},{title:"What's your name?",sub:"Aura will personalise everything for you.",cta:"Continue",field:"name",placeholder:"Rama Reddy"},{title:"Your role?",sub:"Helps Aura understand your context.",cta:"Continue",field:"role",placeholder:"VP of Global Exports"},{title:"Your company?",sub:"For personalised business intelligence.",cta:"Continue",field:"company",placeholder:"ALR Labs Pvt. Ltd."},{title:"Work email?",sub:"To connect Gmail or Outlook.",cta:"Launch Aura →",field:"email",placeholder:"rama@alrlabs.com"}];
  const cur=steps[step];const canNext=!cur.field||form[cur.field]?.trim();
  return(
    <div style={{height:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:"600px",height:"600px",background:"radial-gradient(circle at center,rgba(201,168,76,0.08) 0%,transparent 65%)",pointerEvents:"none"}}/>
      <div style={{width:"min(420px,92vw)",padding:"48px 40px",background:"var(--bg1)",borderRadius:"var(--r3)",border:"1px solid var(--border2)",boxShadow:"var(--shadow)",animation:"fadeUp 0.5s var(--ease)",textAlign:"center"}}>
        <div style={{width:"52px",height:"52px",borderRadius:"16px",background:"linear-gradient(135deg,var(--gold) 0%,#8B6914 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"24px",fontWeight:"800",color:"#0A0A0F",margin:"0 auto 28px",animation:"glow 3s ease-in-out infinite"}}>A</div>
        <div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"32px"}}>{steps.map((_,i)=>(<div key={i} style={{width:i===step?"20px":"6px",height:"6px",borderRadius:"3px",background:i<=step?"var(--gold)":"var(--bg3)",transition:"all 0.3s var(--ease)"}}/>))}</div>
        <h1 style={{fontFamily:"var(--font-d)",fontWeight:"800",fontSize:"26px",color:"var(--text)",marginBottom:"10px",letterSpacing:"-0.03em"}}>{cur.title}</h1>
        <p style={{fontSize:"14px",color:"var(--text2)",lineHeight:"1.6",marginBottom:"32px"}}>{cur.sub}</p>
        {cur.field&&(<input value={form[cur.field]} onChange={e=>setForm(f=>({...f,[cur.field]:e.target.value}))} placeholder={cur.placeholder} onKeyDown={e=>e.key==="Enter"&&canNext&&(step<steps.length-1?setStep(s=>s+1):onComplete(form))} autoFocus style={{width:"100%",padding:"14px 18px",borderRadius:"var(--r)",background:"var(--bg2)",border:"1px solid var(--border2)",color:"var(--text)",fontSize:"15px",marginBottom:"16px",textAlign:"center",fontFamily:"var(--font-b)",transition:"border-color 0.2s"}} onFocus={e=>e.target.style.borderColor="rgba(201,168,76,0.5)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>)}
        <button onClick={()=>step<steps.length-1?setStep(s=>s+1):onComplete(form)} disabled={!canNext} style={{width:"100%",padding:"14px",borderRadius:"var(--r)",background:canNext?"var(--gold)":"var(--bg3)",border:"none",color:canNext?"#0A0A0F":"var(--text3)",fontSize:"15px",fontWeight:"700",fontFamily:"var(--font-d)",transition:"all 0.2s"}}>{cur.cta}</button>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:"none",color:"var(--text3)",fontSize:"12px",marginTop:"16px",display:"block",margin:"16px auto 0"}}>← Back</button>}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function AuraApp(){
  const [authed,setAuthed]=useState(()=>{try{return !!localStorage.getItem("aura_user");}catch(e){return false;}});
  const [user,setUser]=useState(()=>{try{const u=localStorage.getItem("aura_user");return u?JSON.parse(u):{name:"",role:"",company:"",email:""};}catch(e){return {name:"",role:"",company:"",email:""};}} );
  const [screen,setScreen]=useState("chat");
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const [projects,setProjects]=useState(INIT_PROJECTS);
  const [activeProject,setActiveProject]=useState(null);
  const [showNewProject,setShowNewProject]=useState(false);
  const [gmailAccount,setGmailAccount]=useState(null);
  const [outlookAccount,setOutlookAccount]=useState(null);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    // Gmail callback
    if(params.get("gmail_connected")==="true"){
      const token=params.get("access_token");const email=params.get("email");const name=params.get("name");
      if(token&&email){const acc={token,email,name:name||email,refreshToken:params.get("refresh_token")||""};setGmailAccount(acc);storage.save("gmail_account",acc);setAuthed(true);setScreen("email");}
      window.history.replaceState({},"",window.location.pathname);
    }
    // Outlook callback
    else if(params.get("outlook_connected")==="true"){
      const token=params.get("access_token");const email=params.get("email");const name=params.get("name");
      if(token&&email){const acc={token,email,name:name||email,refreshToken:params.get("refresh_token")||""};setOutlookAccount(acc);storage.save("outlook_account",acc);setAuthed(true);setScreen("email");}
      window.history.replaceState({},"",window.location.pathname);
    }
    else{
      const g=storage.get("gmail_account");if(g)setGmailAccount(g);
      const o=storage.get("outlook_account");if(o)setOutlookAccount(o);
    }
  },[]);

  const handleOnboard=form=>{const u={...user,...form};if(form.name){setUser(u);try{localStorage.setItem("aura_user",JSON.stringify(u));}catch(e){}}setAuthed(true);};
  const handleNav=id=>{if(id==="new_project"){setShowNewProject(true);}else{setScreen(id);}};

  if(!authed)return<OnboardingScreen onComplete={handleOnboard}/>;

  const screenMap={
    chat:<ChatScreen user={user} projects={projects} activeProject={activeProject} onSelectProject={setActiveProject} onNav={handleNav} gmailAccount={gmailAccount} outlookAccount={outlookAccount}/>,
    email:<EmailScreen gmailAccount={gmailAccount} outlookAccount={outlookAccount} onNav={handleNav}/>,
    calendar:<CalendarScreen gmailAccount={gmailAccount}/>,
    crm:<CRMScreen/>,
    connectors:<ConnectorsScreen gmailAccount={gmailAccount} outlookAccount={outlookAccount}
      onGmailConnect={acc=>{setGmailAccount(acc);storage.save("gmail_account",acc);}}
      onOutlookConnect={acc=>{setOutlookAccount(acc);storage.save("outlook_account",acc);}}
      onGmailDisconnect={()=>{setGmailAccount(null);storage.clear("gmail_account");}}
      onOutlookDisconnect={()=>{setOutlookAccount(null);storage.clear("outlook_account");}}/>,
    settings:<SettingsScreen user={user} gmailAccount={gmailAccount} outlookAccount={outlookAccount}/>,
    research:<div style={{padding:"32px",color:"var(--text2)",fontSize:"14px"}}>🔍 Research — Tavily API integration. Phase 4.</div>,
  };

  return(
    <div style={{height:"100vh",background:"var(--bg)",display:"flex",fontFamily:"var(--font-b)"}}>
      {showNewProject&&<NewProjectModal onSave={p=>{setProjects(ps=>[...ps,p]);setActiveProject(p.id);setScreen("chat");}} onClose={()=>setShowNewProject(false)}/>}
      <Sidebar active={screen} onNav={handleNav} user={user} collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(c=>!c)} projects={projects} activeProject={activeProject} onSelectProject={setActiveProject} gmailAccount={gmailAccount}/>
      <main style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column",position:"relative"}}>{screenMap[screen]||screenMap.chat}</main>
    </div>
  );
}
