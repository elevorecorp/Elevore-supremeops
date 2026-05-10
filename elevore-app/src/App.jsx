
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Play, Square, ArrowLeft, X, LogOut, Eye, EyeOff, FileText, Edit3, Trash2, MessageCircle, Sun, BarChart2, ShieldCheck, Users, Image as ImageIcon, Zap, Check, Star, Globe, DollarSign, MapPin, Users2, TrendingUp, Wallet, AlertTriangle, Package, ShieldAlert, CreditCard } from 'lucide-react';

// ── i18n ─────────────────────────────────────────────────────
const T={en:{hub:'Live Mission Hub',balance:'Balance Due',approve:'📝 Approve Your Quote',approveHint:'Sign below to confirm this service',approveBtn:'Sign to approve quote',complete:'🏁 Confirm Completion',completeHint:"Sign to confirm you're satisfied",completeBtn:'Sign to confirm completion',review:'⭐ Leave a Google Review',refer:'🎁 Refer a Friend — Both Get $25 Off',rate:'Rate Your Experience',chat:'Message Us Directly',chatBtn:'Send via WhatsApp',syncing:'Syncing...'},es:{hub:'Centro de Misión',balance:'Saldo Pendiente',approve:'📝 Aprueba Tu Cotización',approveHint:'Firma abajo para confirmar el servicio',approveBtn:'Firma para aprobar',complete:'🏁 Confirmar Finalización',completeHint:'Firma para confirmar que estás satisfecho',completeBtn:'Firma para confirmar',review:'⭐ Dejar Reseña en Google',refer:'🎁 Invita un Amigo — Ambos Obtienen $25 Off',rate:'Califica Tu Experiencia',chat:'Escríbenos Directamente',chatBtn:'Enviar por WhatsApp',syncing:'Cargando...'}};

// ── SUPABASE ─────────────────────────────────────────────────
const SB_URL = 'https://ceijlgurveaalvjmptns.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWpsZ3VydmVhYWx2am1wdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTYwMzEsImV4cCI6MjA5MjM5MjAzMX0.XaPMpXxwMKRM09YN9kroF-gnISM2gBn29wi2R2UdOIc';
const sb = createClient(SB_URL, SB_KEY);

// ── CONSTANTS ────────────────────────────────────────────────
const STAFF_PAY   = 0.40;
const MONTHLY_GOAL = 15000;
const GOOGLE_LINK  = "https://g.page/r/TU_LINK_AQUI/review";
const ADMIN_PIN    = "2026";
const STAFF_PIN    = "staff";
const PRIVATE_PIN  = "boss";  // extra PIN to reveal finances

const ADDONS = [
    {id:'oven',    label:'Inside Oven',   p:35},
    {id:'fridge',  label:'Inside Fridge', p:30},
    {id:'windows', label:'Windows',       p:50},
    {id:'pethair', label:'Pet Hair',      p:25},
    {id:'garage',  label:'Garage',        p:40},
];
const QUICK_JOBS = [
    {id:'tv',      label:'Mount TV',        p:150},
    {id:'door',    label:'Install Door',    p:200},
    {id:'patch',   label:'Drywall Patch',   p:180},
    {id:'shelves', label:'Shelving',        p:100},
    {id:'lock',    label:'Lock Change',     p:85 },
    {id:'paint',   label:'Paint Touch-up',  p:120},
    {id:'faucet',  label:'Faucet Install',  p:130},
    {id:'caulk',   label:'Caulking',        p:75 },
];
const RISK_P = [{label:'None',v:0},{label:'Low',v:50},{label:'Mid',v:100},{label:'High',v:150}];
const CHECKLIST = ['Entrance & hallway','Kitchen counters & sink','Bathrooms scrubbed','Floors mopped','Bedrooms dusted','Windows wiped','Trash removed','Final walkthrough'];
const SVC_LEVELS = {regular:'Bronze',deep:'Silver',moveout:'Gold',postcon:'Gold',handyman:'Silver'};
const CLIENT_LEVELS = [{name:'Bronze',min:0,color:'#cd7f32'},{name:'Silver',min:3,color:'#c0c0c0'},{name:'Gold',min:7,color:'#fbbf24'},{name:'Platinum',min:15,color:'#e5e4e2'}];

const INITIAL = {
    name:"",phone:"",address:"",svc:'regular',
    beds:2,baths:2,living:1,laundryRoom:0,complexity:1,
    sqft:2000,oven:false,fridge:false,windows:false,pethair:false,garage:false,
    laundryLoads:0,expenses:0,deposit:0,discount:0,
    frequency:'one-time',team:"",date:"",status:'scheduled',totalPrice:0,
    laborHours:2,materialCost:0,riskMargin:50,selectedQuickJobs:[],
    audit_link:"",notes:"",preferences:"",urgencyHours:24
};

// ── HELPERS ──────────────────────────────────────────────────
function calcDNA(jobs) {
    if(!jobs.length) return 0;
    let s = Math.min(40,jobs.length*10);
    s += Math.min(30,jobs.filter(j=>j.status==='paid').length*10);
    s += Math.min(20,jobs.filter(j=>j.specs?.frequency&&j.specs.frequency!=='one-time').length*10);
    s += jobs.some(j=>j.specs?.referral)?10:0;
    return Math.min(100,s);
}
function clientLevel(jobCount) {
    let lvl = CLIENT_LEVELS[0];
    CLIENT_LEVELS.forEach(l=>{ if(jobCount>=l.min) lvl=l; });
    return lvl;
}
function daysAgo(dateStr) {
    if(!dateStr) return 999;
    return Math.round((Date.now()-new Date(dateStr).getTime())/86400000);
}
function fmt$(n) { return '$'+Math.round(n||0).toLocaleString(); }
function fmtDate(d) { if(!d) return 'TBD'; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}); }
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180; const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ── SIGNATURE PAD ────────────────────────────────────────────
function SigPad({onSave,label="Sign to approve"}) {
    const ref = useRef(null);
    const [drawing,setDrawing] = useState(false);
    const [has,setHas] = useState(false);

    useEffect(()=>{
        const c=ref.current; if(!c) return;
        const resize=()=>{ c.width=c.offsetWidth; c.height=140; };
        resize();
        window.addEventListener('resize',resize);
        return ()=>window.removeEventListener('resize',resize);
    },[]);

    const xy=(e)=>{ const r=ref.current.getBoundingClientRect(); const s=e.touches?e.touches[0]:e; return{x:s.clientX-r.left,y:s.clientY-r.top}; };
    const start=(e)=>{ e.preventDefault(); const{x,y}=xy(e); const ctx=ref.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(x,y); setDrawing(true); };
    const move=(e)=>{ if(!drawing) return; e.preventDefault(); const{x,y}=xy(e); const ctx=ref.current.getContext('2d'); ctx.lineTo(x,y); ctx.strokeStyle='#22c55e'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke(); setHas(true); };
    const stop=()=>setDrawing(false);
    const clear=()=>{ ref.current.getContext('2d').clearRect(0,0,ref.current.width,ref.current.height); setHas(false); };

    return(
        <div className="space-y-3">
            <p className="text-[10px] font-black text-amber-500 uppercase text-center tracking-widest">{label}</p>
            <canvas ref={ref} className="sigpad" style={{height:'140px'}}
                onMouseDown={start} onTouchStart={start}
                onMouseMove={move}  onTouchMove={move}
                onMouseUp={stop}    onTouchEnd={stop} onMouseLeave={stop}/>
            <div className="flex gap-2">
                <button onClick={clear} className="flex-1 py-3 bg-white/5 text-slate-400 rounded-xl font-black uppercase text-[10px] active:scale-95">Clear</button>
                <button onClick={()=>has&&onSave(ref.current.toDataURL('image/png'))} disabled={!has}
                    className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] active:scale-95 ${has?'gold':'bg-white/5 text-slate-600'}`}>
                    {has?'✅ Confirm':'Sign above'}
                </button>
            </div>
        </div>
    );
}

// ── PHOTO DRIVE ──────────────────────────────────────────────
function PhotoDrive({photos=[],label,onAdd}) {
    const [link,setLink]=useState("");
    return(
        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
            {!photos.length&&<p className="text-[9px] text-slate-700 italic font-black text-center py-2">No photos yet</p>}
            <div className="grid grid-cols-3 gap-2">
                {photos.map((url,i)=>(
                    <a key={i} href={url} target="_blank" className="g p-3 text-center border border-white/5 hover:border-green-500 transition-all active:scale-95">
                        <ImageIcon className="w-4 h-4 mx-auto text-green-400 mb-1" />
                        <p className="text-[7px] text-slate-400 font-black">Photo {i+1}</p>
                    </a>
                ))}
            </div>
            {onAdd&&(
                <div className="flex gap-2">
                    <input type="text" placeholder="Paste photo link..." value={link} onChange={e=>setLink(e.target.value)} className="inp text-xs text-blue-400 flex-1"/>
                    <button onClick={()=>{if(link.trim()){onAdd(link.trim());setLink("");}}} className="px-4 bg-green-600 text-white rounded-xl font-black text-lg active:scale-95">+</button>
                </div>
            )}
        </div>
    );
}

// ── BAR CHART ────────────────────────────────────────────────
function BarChart({data,color='#22c55e',label=''}) {
    const max=Math.max(...data.map(d=>d.v),1);
    return(
        <div>
            {label&&<p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>}
            <div className="flex items-end gap-1 h-20 w-full">
                {data.map((d,i)=>(
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="bar w-full" style={{height:`${(d.v/max)*70}px`,background:d.c||color}}></div>
                        <span className="text-[7px] text-slate-600 font-black leading-none">{d.l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── QR CODE (via API) ────────────────────────────────────────
function QRCode({url,size=120}) {
    const qr=`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=ffffff&bgcolor=000000`;
    return <img src={qr} className="rounded-xl" style={{width:size,height:size}} />;
}

// ════════════════════════════════════════════════════════════
function App() {
    const urlParams   = new URLSearchParams(window.location.search);
    const clientJobId = urlParams.get('mision');
    const clientID    = urlParams.get('client'); // For full command center
    const refCode     = urlParams.get('ref');

    const [view,       setView]      = useState((clientJobId || clientID)?'portal':'auth');
    const [role,       setRole]      = useState('admin');
    const [pass,       setPass]      = useState("");
    const [jobs,       setJobs]      = useState([]);
    const [clients,    setClients]   = useState([]);
    const [loading,    setLoading]   = useState(false);
    const [isPrivate,  setIsPrivate] = useState(true); // private by default
    const [editId,     setEditId]    = useState(null);
    const [deployTab,  setDeployTab] = useState('identity');
    const [filterSt,   setFilterSt]  = useState('all');
    const [searchQ,    setSearchQ]   = useState('');
    const [toast,      setToast]     = useState(null);
    const [activeStaff,setActiveStaff]=useState(null);
    const [quickMode,  setQuickMode] = useState(false); // Quick Quote mode
    const [selJob,     setSelJob]    = useState(null);  // job detail modal
    const [state,      setState]     = useState(INITIAL);
    const [activityLog,setActivityLog]=useState([]);
    const [lang,setLang]=useState('en');
    const [chatInput,setChatInput]=useState('');
    const [staffTab,setStaffTab]=useState('missions');
    const [supplyModal,setSupplyModal]=useState(false);
    const [reportModal,setReportModal]=useState(null);
    const [reports,setReports]=useState([]);
    const [reportDesc,setReportDesc]=useState('');
    const [staffList,setStaffList]=useState([]);
    const [staffName,setStaffName]=useState('');
    const t=T[lang];

    const showToast=(msg,color='green')=>{ setToast({msg,color}); setTimeout(()=>setToast(null),3500); };
    const log=(msg)=>setActivityLog(l=>[{msg,time:new Date().toLocaleTimeString()},...l.slice(0,49)]);

    // ── REFRESH ──────────────────────────────────────────────
    const refresh = useCallback(async()=>{
        setLoading(true);
        const{data:j}=await sb.from('elevore_missions').select('*').order('created_at',{ascending:false});
        const{data:c}=await sb.from('clients').select('*');
        const{data:r}=await sb.from('elevore_reports').select('*').order('created_at',{ascending:false});
        const{data:s}=await sb.from('elevore_staff').select('*').order('name');
        if(j) setJobs(j);
        if(c) setClients(c);
        if(r) setReports(r);
        if(s) setStaffList(s);
        setLoading(false);
        
    },[]);

    useEffect(()=>{
        // Fetch staff immediately so PINs work on first load
        const init = async () => {
            const {data} = await sb.from('elevore_staff').select('*').order('name');
            if(data) setStaffList(data);
        };
        init();

        if(view==='portal'&&clientJobId) loadPortal();
        else if(view!=='auth') refresh();
    },[view,refresh,clientJobId]);

    // ── SUPABASE REALTIME ─────────────────────────────────────
    useEffect(()=>{
        if(view==='auth'||view==='portal') return;
        const ch=sb.channel('elevore-live')
            .on('postgres_changes',{event:'*',schema:'public',table:'elevore_missions'},()=>refresh())
            .on('postgres_changes',{event:'*',schema:'public',table:'clients'},()=>refresh())
            .on('postgres_changes',{event:'*',schema:'public',table:'elevore_reports'},()=>refresh())
            .on('postgres_changes',{event:'*',schema:'public',table:'elevore_staff'},()=>refresh())
            .subscribe();
        return ()=>sb.removeChannel(ch);
    },[view,refresh]);

    async function loadPortal(){
        setLoading(true);
        const{data}=await sb.from('elevore_missions').select('*').eq('id',clientJobId).single();
        if(data) setJobs([data]);
        setLoading(false);
        
    }

    // ── CRM ──────────────────────────────────────────────────
    const onNameChange=(val)=>{
        setState(s=>({...s,name:val}));
        const m=clients.find(c=>c.name.toLowerCase().includes(val.toLowerCase()));
        if(m&&val.length>3) setState(s=>({...s,...m.specs,name:m.name,phone:m.phone,address:m.address}));
    };

    // ── PRICING ENGINE v95 ─── Handyman 100% isolated ────────
    const pricing=useMemo(()=>{
        let advice="✅ COMPETITIVE",ac="text-blue-400";
        if(state.svc==='handyman'){
            const quick=state.selectedQuickJobs.reduce((a,id)=>a+(QUICK_JOBS.find(q=>q.id===id)?.p||0),0);
            const labor=state.laborHours*85;
            let mk=1.2; if(state.materialCost<50)mk=1.4; else if(state.materialCost<200)mk=1.3;
            const mats=Math.round(state.materialCost*mk);
            const sub=quick+labor+mats+state.riskMargin;
            const total=Math.round(sub*(1-(state.discount/100)));
            if(total<125){advice="⚠️ BELOW MIN";ac="text-red-500";}
            else if(total>=500){advice="💰 PREMIUM";ac="text-green-400";}
            return{total,advice,ac,labor,mats,quick};
        }
        let base=0;
        if(state.svc==='postcon'){base=(state.sqft||0)*0.35;}
        else{
            const b={regular:95,deep:165,moveout:195};
            base=(b[state.svc]||95)+(state.beds*40)+(state.baths*35)+(state.living*25)+(state.laundryRoom*25);
            ADDONS.forEach(a=>{if(state[a.id])base+=a.p;});
            base+=state.laundryLoads*25;
        }
        const freq={'one-time':1,'weekly':0.85,'bi-weekly':0.9,'monthly':0.95}[state.frequency]||1;
        const total=Math.round(base*state.complexity*freq*(1-(state.discount/100)));
        if(total<120){advice="⚠️ LOW MARGIN";ac="text-red-500";}
        else if(total>=400){advice="🔥 HIGH VALUE";ac="text-amber-400";}
        return{total,advice,ac,labor:0,mats:0,quick:0};
    },[state]);

    useEffect(()=>{if(!editId)setState(s=>({...s,totalPrice:pricing.total}));},[pricing.total,editId]);

    // ── DEPLOY ───────────────────────────────────────────────
    const deploy=async()=>{
        if(!state.name||!state.address) return showToast("Fill Name and Address",'red');
        setLoading(true);
        try{
            const{data:c,error:cErr}=await sb.from('clients')
                .upsert({name:state.name,phone:state.phone,address:state.address,specs:{...state}},{onConflict:'name'})
                .select().single();
            if(cErr||!c){showToast("Clients Error: "+(cErr?.message||"Check RLS"),'red');setLoading(false);return;}
            const fd={'weekly':7,'bi-weekly':14,'monthly':30,'one-time':null}[state.frequency];
            let nv=null;
            if(fd&&state.date){const d=new Date(state.date);d.setDate(d.getDate()+fd);nv=d.toISOString().split('T')[0];}
            const payload={
                client_name:state.name,client_phone:state.phone,address:state.address,
                service_type:state.svc,total_price:pricing.total,deposit_paid:state.deposit,
                team_assigned:state.team,status:state.status,
                specs:{...state,referral:refCode||null},
                scheduled_date:state.date||null,notes:state.notes||null,next_visit:nv,
                urgency_expires:state.urgencyHours?new Date(Date.now()+state.urgencyHours*3600000).toISOString():null
            };
            const{error:jErr}=editId
                ?await sb.from('elevore_missions').update(payload).eq('id',editId)
                :await sb.from('elevore_missions').insert([payload]);
            if(jErr){showToast("Mission Error: "+jErr.message,'red');setLoading(false);return;}
            setState(INITIAL);setEditId(null);
            log(editId?`Updated job: ${state.name}`:`New job deployed: ${state.name} — ${fmt$(pricing.total)}`);
            showToast(editId?"Mission updated! ⚡":"Mission deployed! 🚀");
            setView('agenda');refresh();
        }catch(e){showToast("Error: "+e.message,'red');}
        setLoading(false);
    };

    // ── QUICK QUOTE DEPLOY ────────────────────────────────────
    const quickDeploy=async(qs)=>{
        if(!qs.name||!qs.address) return showToast("Fill Name and Address",'red');
        setLoading(true);
        const{data:c,error:cErr}=await sb.from('clients')
            .upsert({name:qs.name,phone:qs.phone,address:qs.address,specs:{}},{onConflict:'name'})
            .select().single();
        if(cErr||!c){showToast("Error: "+(cErr?.message),'red');setLoading(false);return;}
        const{data:j,error:jErr}=await sb.from('elevore_missions').insert([{
            client_name:qs.name,client_phone:qs.phone,address:qs.address,
            service_type:qs.svc,total_price:qs.price,deposit_paid:0,
            status:'lead',specs:{},scheduled_date:null,
            urgency_expires:new Date(Date.now()+24*3600000).toISOString()
        }]).select().single();
        if(jErr){showToast("Error: "+jErr.message,'red');setLoading(false);return;}
        showToast("Quick quote sent! 🚀");
        log(`Quick quote: ${qs.name} — ${fmt$(qs.price)}`);
        setQuickMode(false);refresh();
        // Auto-send portal link
        const link=`${window.location.origin}${window.location.pathname}?mision=${j.id}`;
        const p=qs.phone?.replace(/\D/g,'')||'';
        const phone=p.length===10?'1'+p:p;
        const msg=`Hi ${qs.name}! 📋 Your Elevore quote is ready: ${fmt$(qs.price)} for ${qs.svc?.toUpperCase()}.\n\n👉 View & sign here: ${link}\n\n⏰ This quote expires in 24 hours.\n\nZelle: (407) 952-4228`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');
        setLoading(false);
    };

    // ── CHECK-IN / CHECK-OUT ─────────────────────────────────
    const recordTime=async(jobId,type)=>{
        setLoading(true);
        const time=new Date().toISOString();
        const status=type==='check_in_time'?'in_progress':'completed';
        
        let coords = null;
        if(type==='check_in_time' && navigator.geolocation) {
            try {
                const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej));
                coords = {lat: pos.coords.latitude, lng: pos.coords.longitude};
                
                // Geofence Check
                const job = jobs.find(j=>j.id===jobId);
                if(job && job.check_in_coords) {
                    const dist = getDistance(coords.lat, coords.lng, job.check_in_coords.lat, job.check_in_coords.lng);
                    if(dist > 250) { // 250 meters
                        if(!confirm(`⚠️ GEOFENCE ALERT: You are ${Math.round(dist)}m away from the mission target. Continue anyway?`)) {
                            setLoading(false); return;
                        }
                    }
                }
            } catch(e) { console.warn("GPS failed", e); }
        }

        const payload = { [type]:time, status };
        if(coords) payload.check_in_coords = coords;

        const{error}=await sb.from('elevore_missions').update(payload).eq('id',jobId);
        setLoading(false);
        if(!error){
            showToast(type==='check_in_time'?"▶ Mission Started!":"⏹ Mission Completed!");
            if(type==='check_out_time') setActiveStaff(null);
            refresh();
        } else showToast("Error: "+error.message,'red');
    };

    // ── NEURAL UPSELL ────────────────────────────────────────
    const sendUpsell=async(job,addonId)=>{
        const addon=ADDONS.find(a=>a.id===addonId);if(!addon)return;
        const p=job.client_phone?.replace(/\D/g,'')||'';const phone=p.length===10?'1'+p:p;
        const msg=`Hi ${job.client_name}! ✨ Our pro noticed your ${addon.label.toLowerCase()} could use attention. Add it now for just $${addon.p}? Reply YES to authorize — we'll handle it right now! 🏠`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');
        const sent=[...(job.upsell_sent||[]),addonId];
        await sb.from('elevore_missions').update({upsell_sent:sent}).eq('id',job.id);
        log(`Upsell sent: ${addon.label} to ${job.client_name}`);
        showToast(`Upsell: ${addon.label} sent! 💰`);refresh();
    };

    // ── BONUS CALC ───────────────────────────────────────────
    const calcBonus=(job)=>{
        if(job.status!=='paid') return 0;
        const mins=job.check_in_time&&job.check_out_time?Math.round((new Date(job.check_out_time)-new Date(job.check_in_time))/60000):null;
        return(job.final_signature&&mins&&mins<=180)?5:0;
    };

    // ── REAL PROFITABILITY ───────────────────────────────────
    const realProfit=(job)=>{
        const rev=job.deposit_paid||0;
        const staff=rev*STAFF_PAY;
        const exp=job.specs?.expenses||0;
        const bonus=calcBonus(job);
        return Math.round(rev-staff-exp-bonus);
    };

    // ── FINANCE ──────────────────────────────────────────────
    const finance=useMemo(()=>{
        const gross    =jobs.reduce((a,b)=>a+(b.total_price||0),0);
        const collected=jobs.reduce((a,b)=>a+(b.deposit_paid||0),0);
        const exp      =jobs.reduce((a,b)=>a+(b.specs?.expenses||0),0);
        const bonuses  =jobs.reduce((a,b)=>a+calcBonus(b),0);
        const net      =Math.max(0,Math.round(collected-(collected*STAFF_PAY)-exp-bonuses));
        const pending  =gross-collected;
        const progress =Math.min(100,(gross/MONTHLY_GOAL)*100);
        const avg      =jobs.length?Math.round(gross/jobs.length):0;
        const byStatus ={lead:0,scheduled:0,in_progress:0,completed:0,paid:0};
        jobs.forEach(j=>{if(byStatus[j.status]!==undefined)byStatus[j.status]++;});
        const byService={};
        jobs.forEach(j=>{byService[j.service_type]=(byService[j.service_type]||0)+(j.total_price||0);});
        const recurring=jobs.filter(j=>j.specs?.frequency&&j.specs.frequency!=='one-time').reduce((a,b)=>a+(b.total_price||0),0);
        // Projection
        const daysInMonth=30; const today=new Date().getDate();
        const projection=today>0?Math.round((gross/today)*daysInMonth):0;
        // Best day
        const dayTotals={};
        jobs.forEach(j=>{if(!j.scheduled_date)return;const d=new Date(j.scheduled_date).getDay();dayTotals[d]=(dayTotals[d]||0)+(j.total_price||0);});
        const bestDay=Object.entries(dayTotals).sort((a,b)=>b[1]-a[1])[0];
        const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        // Retention due
        const today2=new Date();const soon=new Date();soon.setDate(today2.getDate()+7);
        const retDue=jobs.filter(j=>j.next_visit&&new Date(j.next_visit)<=soon&&j.status==='paid');
        // Cold leads (no signature in 48h)
        const coldLeads=jobs.filter(j=>j.status==='lead'&&!j.approval_signature&&daysAgo(j.created_at)>=2);
        // Churn (paid, no return in 45 days)
        const churn=clients.filter(c=>{
            const cJobs=jobs.filter(j=>j.client_name===c.name&&j.status==='paid');
            if(!cJobs.length) return false;
            const last=cJobs.sort((a,b)=>new Date(b.scheduled_date||0)-new Date(a.scheduled_date||0))[0];
            return daysAgo(last.scheduled_date)>=45;
        });
        // Pending signatures
        const pendSig=jobs.filter(j=>!j.approval_signature&&j.status==='lead');
        // Weekly bars
        const weekBars=Array.from({length:7},(_,i)=>{
            const d=new Date();d.setDate(d.getDate()-6+i);
            const ds=d.toISOString().split('T')[0];
            const v=jobs.filter(j=>j.scheduled_date===ds).reduce((a,b)=>a+(b.total_price||0),0);
            return{l:dayNames[d.getDay()],v};
        });
        // Top client
        const topClient=clients.map(c=>({name:c.name,total:jobs.filter(j=>j.client_name===c.name).reduce((a,b)=>a+(b.total_price||0),0)})).sort((a,b)=>b.total-a.total)[0];
        return{gross,collected,net,pending,progress,avg,byStatus,byService,recurring,projection,bestDay:bestDay?dayNames[bestDay[0]]:null,retDue,coldLeads,churn,pendSig,bonuses,weekBars,topClient,total:jobs.length};
    },[jobs,clients]);

    const clientDNA=useMemo(()=>{
        const map={};
        clients.forEach(c=>{const cj=jobs.filter(j=>j.client_name===c.name);map[c.name]={score:calcDNA(cj),count:cj.length,spent:cj.reduce((a,b)=>a+(b.total_price||0),0),last:cj[0]?.scheduled_date};});
        return map;
    },[clients,jobs]);

    const filtered=useMemo(()=>jobs.filter(j=>{
        const ms=filterSt==='all'||j.status===filterSt;
        const q=searchQ.toLowerCase();
        const mq=!searchQ||j.client_name?.toLowerCase().includes(q)||j.address?.toLowerCase().includes(q)||j.team_assigned?.toLowerCase().includes(q);
        return ms&&mq;
    }),[jobs,filterSt,searchQ]);

    const todayStr=new Date().toISOString().split('T')[0];
    const staffJobs=useMemo(()=>{
        const sName = staffName?.trim().toLowerCase();
        const isGeneric = pass === STAFF_PIN;
        return jobs.filter(j=>{
            // Strict: must match name exactly (case-insensitive), or be the generic 'staff' account
            const assignedTo = j.team_assigned?.trim().toLowerCase();
            const isAssigned = (sName && assignedTo === sName) || isGeneric;
            const isToday = j.scheduled_date===todayStr || j.status==='scheduled' || j.status==='in_progress' || j.status==='lead';
            return isAssigned && isToday;
        });
    },[jobs,todayStr,staffName,pass]);

    // ── MRR (Membresías / Recurrentes) ────────────────────────
    const mrr=useMemo(()=>{
        const rec=jobs.filter(j=>j.specs?.frequency&&j.specs.frequency!=='one-time');
        const byFreq={'weekly':4.33,'bi-weekly':2.17,'monthly':1};
        const monthly=rec.reduce((a,b)=>a+(b.total_price||0)*(byFreq[b.specs.frequency]||1),0);
        const plans={basic:rec.filter(j=>(j.total_price||0)<200).length,pro:rec.filter(j=>(j.total_price||0)>=200&&(j.total_price||0)<400).length,elite:rec.filter(j=>(j.total_price||0)>=400).length};
        return{monthly:Math.round(monthly),annual:Math.round(monthly*12),count:rec.length,plans};
    },[jobs]);

    // ── FORECAST 90 DIAS ──────────────────────────────────────
    const forecast90=useMemo(()=>{
        const dayNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return [0,1,2].map(i=>{
            const d=new Date();d.setMonth(d.getMonth()+i);
            const base=mrr.monthly+(finance.avg*(finance.total/3||1)*0.8);
            const growth=1+(i*0.05);
            return{label:dayNames[d.getMonth()],v:Math.round(base*growth),mrr:mrr.monthly};
        });
    },[mrr,finance]);

    // ── PAYROLL SHEET ─────────────────────────────────────────
    const payrollSheet=useMemo(()=>{
        const teams={};
        jobs.filter(j=>j.team_assigned&&j.status==='paid').forEach(j=>{
            const nm = j.team_assigned.trim();
            const key = nm.toLowerCase();
            if(!teams[key])teams[key]={name:nm,jobs:0,gross:0,pay:0,bonus:0};
            const collected = j.deposit_paid || 0;
            const amount = (j.status === 'paid' && collected === 0) ? (j.total_price || 0) : collected;
            teams[key].jobs++;
            teams[key].gross+=amount;
            teams[key].pay+=Math.round(amount*STAFF_PAY);
            teams[key].bonus+=calcBonus(j);
        });
        return Object.values(teams);
    },[jobs]);

    // ── WA MESSAGES ──────────────────────────────────────────
    const sendWA=(job,type)=>{
        const p=job.client_phone?.replace(/\D/g,'')||'';
        const phone=p.length===10?'1'+p:p;
        const bal=job.total_price-job.deposit_paid;
        const portal=`${window.location.origin}${window.location.pathname}?mision=${job.id}`;
        const ref=`${window.location.origin}${window.location.pathname}?ref=${job.client_name?.replace(/\s/g,'_')}`;
        const msgs={
            confirm:  `Hi ${job.client_name}! ✨ Elevore confirming your ${job.service_type?.toUpperCase()} on ${fmtDate(job.scheduled_date)}. Balance: ${fmt$(bal)}. Zelle: (407) 952-4228 🏠`,
            reminder: `Hi ${job.client_name}! 🔔 Reminder — your Elevore service is coming up ${fmtDate(job.scheduled_date)}. Balance: ${fmt$(bal)}. Questions? Reply here!`,
            review:   `Hi ${job.client_name}! 🌟 Thank you for choosing Elevore! A quick Google review means the world to us: ${GOOGLE_LINK} ⭐⭐⭐⭐⭐`,
            referral: `Hi ${job.client_name}! 🎁 Love your clean space? Refer a friend and BOTH get $25 off! Your link: ${ref}`,
            quote:    `Hi ${job.client_name}! 📋 Your Elevore quote:\n\n🏠 ${job.service_type?.toUpperCase()}\n📅 ${fmtDate(job.scheduled_date)}\n💰 Total: ${fmt$(job.total_price)}\n⚖️ Balance: ${fmt$(bal)}\n\n👉 Sign here: ${portal}\n\n⏰ Quote expires in 24h\nZelle: (407) 952-4228 ✅`,
            portal:   `Hi ${job.client_name}! ✨ Track your ELEVORE mission & sign here: ${portal}`,
            retention:`Hi ${job.client_name}! 🏠 It's been a while since your last clean! Book this week and get 10% off. Reply YES to schedule! 🌟`,
            winback:  `Hi ${job.client_name}! We miss you! 😊 It's been a while. Your home deserves Elevore's touch again. Book today and get a loyalty discount. Reply YES! 💫`,
            bundle:   `Hi ${job.client_name}! 🎯 Add a Deep Clean to your next Regular for just $50 more — save $70! Limited offer. Reply YES to upgrade your booking! 🏠`,
            urgency:  `⏰ Hi ${job.client_name}! Your Elevore quote expires in 2 hours. Lock in your price now: ${portal} — after that, regular rates apply!`,
            arrival:  `🚀 Hi ${job.client_name}! This is the Elevore team. We are on our way to your location! Track our arrival here: ${portal} ✨`
        };
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msgs[type])}`,'_blank');
        log(`WA ${type} sent to ${job.client_name}`);
    };

    const sharePortal=(job)=>sendWA(job,'portal');

    const printInvoice=(job)=>{
        const win=window.open('','_blank');
        const profit=realProfit(job);
        win.document.write(`<html><head><style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}.h{border-bottom:4px solid #22c55e;padding-bottom:15px;display:flex;justify-content:space-between}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}.total{background:#000;color:#fff;padding:30px;border-radius:15px;margin-top:20px}.sig{border:2px solid #eee;border-radius:8px;margin-top:15px;padding:8px;text-align:center}</style></head><body>
        <div class="h"><div><h1 style="font-style:italic;margin:0">ELEVORE</h1><p style="margin:0;color:#666;font-size:12px">Premium Property Services</p></div><div style="text-align:right"><h2 style="margin:0">INVOICE #${job.id?.slice(0,8).toUpperCase()}</h2><p style="margin:0;color:#666;font-size:12px">${new Date().toLocaleDateString()}</p></div></div>
        <div style="margin-top:20px"><h3>BILL TO:</h3><p><b>${job.client_name}</b></p><p>${job.address}</p><p>${job.client_phone||''}</p></div>
        <div style="margin-top:15px">
            <div class="row"><span>Service</span><span>${job.service_type?.toUpperCase()}</span></div>
            <div class="row"><span>Date</span><span>${fmtDate(job.scheduled_date)}</span></div>
            <div class="row"><span>Team</span><span>${job.team_assigned||'TBD'}</span></div>
            ${job.check_in_time?`<div class="row"><span>Check-in</span><span>${new Date(job.check_in_time).toLocaleTimeString()}</span></div>`:''}
            ${job.check_out_time?`<div class="row"><span>Check-out</span><span>${new Date(job.check_out_time).toLocaleTimeString()}</span></div>`:''}
            <div class="row"><span>Total</span><span>${fmt$(job.total_price)}</span></div>
            <div class="row"><span>Deposit Paid</span><span>-${fmt$(job.deposit_paid)}</span></div>
        </div>
        <div class="total"><h1 style="margin:0">BALANCE DUE: ${fmt$(job.total_price-job.deposit_paid)}</h1><p style="margin-top:8px">Zelle: (407) 952-4228</p></div>
        ${job.approval_signature?`<div class="sig"><p style="font-size:10px;color:#999;margin:0">CLIENT APPROVAL</p><img src="${job.approval_signature}" style="max-height:60px"/></div>`:''}
        ${job.final_signature?`<div class="sig"><p style="font-size:10px;color:#999;margin:0">JOB COMPLETION</p><img src="${job.final_signature}" style="max-height:60px"/></div>`:''}
        <p style="margin-top:40px;text-align:center;color:#999;font-size:12px">Thank you for choosing Elevore Premium Services ⭐</p>
        <script>window.print();<\/script></body></html>`);
        win.document.close();
    };

    const exportCSV=()=>{
        const rows=[['Client','Service','Total','Deposit','Balance','Status','Date','Team','Real Profit'],...jobs.map(j=>[j.client_name,j.service_type,j.total_price,j.deposit_paid,j.total_price-j.deposit_paid,j.status,j.scheduled_date||'',j.team_assigned||'',realProfit(j)])];
        const csv=rows.map(r=>r.join(',')).join('\n');
        const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download=`elevore-${todayStr}.csv`;a.click();
        log('CSV exported');showToast("CSV exported ✓");
    };

    // ════════════════════════════════════════════════════════
    // ── PORTAL VIEW ──────────────────────────────────────────
    if(view==='portal'){
        // If we have a specific mission, show detail. If not, show list.
        const myJobs = clientID ? jobs.filter(j => j.client_name?.replace(/\s/g,'_').toLowerCase() === clientID.toLowerCase()) : jobs;
        const job = clientJobId ? jobs.find(j => j.id === clientJobId) : (myJobs.length === 1 ? myJobs[0] : null);

        if(!job && !clientID) return <div className="min-h-screen flex items-center justify-center text-white font-black animate-pulse text-xs uppercase">Connecting to Elevore Matrix...</div>;
        
        const bal=job ? job.total_price-job.deposit_paid : 0;
        const sm={lead:10,scheduled:30,in_progress:65,completed:90,paid:100};
        const urgencyLeft=(job && job.urgency_expires)?Math.max(0,Math.round((new Date(job.urgency_expires)-Date.now())/3600000)):null;

        const FullHistoryView = () => (
            <div className="space-y-5 animate-in fade-in duration-500 pb-20">
                <div className="g p-6 border-t-4 border-amber-500">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Your Elevore History</p>
                    <h2 className="text-2xl font-black italic text-white uppercase">{clientID?.replace(/_/g,' ')}</h2>
                    <p className="text-[8px] text-slate-600 font-black uppercase mt-1">{myJobs.length} Missions completed/scheduled</p>
                </div>

                <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active & Upcoming</p>
                    {myJobs.filter(j => j.status !== 'paid').map(j => (
                        <button key={j.id} onClick={() => window.location.search = `?mision=${j.id}`} className="w-full g p-5 border-l-4 border-amber-500 flex justify-between items-center active:scale-95 transition-all">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-white uppercase">{j.service_type}</p>
                                <p className="text-[7px] text-slate-500 uppercase font-black">{fmtDate(j.scheduled_date)} • {j.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-white">{fmt$(j.total_price)}</p>
                                <p className="text-[6px] text-amber-500 font-black uppercase">View Track →</p>
                            </div>
                        </button>
                    ))}
                    {myJobs.filter(j => j.status !== 'paid').length === 0 && <p className="text-[8px] text-slate-600 italic text-center">No active missions.</p>}
                </div>

                <div className="space-y-3">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Past Experiences</p>
                    {myJobs.filter(j => j.status === 'paid').map(j => (
                        <button key={j.id} onClick={() => window.location.search = `?mision=${j.id}`} className="w-full g p-5 opacity-70 flex justify-between items-center active:scale-95 transition-all">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-white uppercase">{j.service_type}</p>
                                <p className="text-[7px] text-slate-500 uppercase font-black">{fmtDate(j.scheduled_date)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-green-500">PAID</p>
                                <p className="text-[6px] text-slate-500 font-black uppercase">View Details →</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );

        if(!job && clientID) return (
            <div className="min-h-screen p-5 bg-black">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center space-y-4 py-4">
                        <div className="w-20 h-20 bg-white rounded-[2rem] mx-auto flex items-center justify-center font-black text-black text-3xl italic">E</div>
                        <h1 className="text-2xl font-black uppercase tracking-[0.4em] text-white">ELEVORE</h1>
                    </div>
                    <FullHistoryView />
                </div>
            </div>
        );

        const saveApproval=async(sig)=>{const{error}=await sb.from('elevore_missions').update({approval_signature:sig,status:'scheduled'}).eq('id',clientJobId);if(!error){showToast("Quote approved! ✅");loadPortal();}else showToast("Save error",'red');};
        const saveFinal=async(sig)=>{const{error}=await sb.from('elevore_missions').update({final_signature:sig,status:'paid'}).eq('id',clientJobId);if(!error){showToast("Job confirmed! 🌟");loadPortal();}else showToast("Save error",'red');};

        return(
            <div className="min-h-screen p-5 bg-black animate-in fade-in duration-700">
                {toast&&<div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color==='red'?'bg-red-600':'bg-green-600'} text-white`}>{toast.msg}</div>}
                {loading&&<div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center"><div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
                <div className="max-w-md mx-auto space-y-5 pb-20">
                    {/* Lang toggle */}
                    <div className="flex justify-end pt-2">
                        <button onClick={()=>setLang(l=>l==='en'?'es':'en')} className="flex items-center gap-1.5 text-[8px] font-black px-3 py-1.5 bg-white/10 rounded-full text-slate-400 uppercase active:scale-95">
                            <Globe className="w-3 h-3"/>{lang==='en'?'🇪🇸 Español':'🇺🇸 English'}
                        </button>
                    </div>
                    {/* Header */}
                    <div className="text-center space-y-4 py-4">
                        <div className="w-20 h-20 bg-white rounded-[2rem] mx-auto flex items-center justify-center font-black text-black text-3xl italic shadow-2xl shadow-amber-500/20 border-4 border-amber-500/10">E</div>
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-[0.4em] text-white leading-none">ELEVORE</h1>
                            <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mt-1">{t.hub}</p>
                        </div>
                    </div>
                    {/* Urgency banner */}
                    {urgencyLeft!==null&&urgencyLeft>0&&!job.approval_signature&&(
                        <div className="gold py-3 px-5 rounded-2xl text-center font-black uppercase text-sm">
                            ⏰ Quote expires in {urgencyLeft}h — Sign now to lock your price!
                        </div>
                    )}
                    {/* Summary */}
                    <div className="g p-6 border-t-4 border-green-500 space-y-4">
                        <div className="flex justify-between items-center">
                            <div><p className="text-[9px] font-black text-slate-500 uppercase">Client</p><h2 className="text-xl font-black italic uppercase text-white">{job.client_name}</h2></div>
                            <span className={`text-[8px] font-black px-3 py-1.5 rounded-xl uppercase ${job.status==='paid'?'bg-blue-600 text-white':job.status==='in_progress'?'bg-green-600 text-white':job.status==='completed'?'bg-purple-600 text-white':'bg-amber-500 text-black'}`}>{job.status}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-black uppercase space-y-1">
                            <p>📋 {job.service_type?.toUpperCase()}</p>
                            <p>📅 {fmtDate(job.scheduled_date)}</p>
                            <p>👥 {job.team_assigned||'TBD'}</p>
                            <p>📍 {job.address}</p>
                            {job.check_in_time&&<p className="text-green-400">▶ Arrived: {new Date(job.check_in_time).toLocaleTimeString()}</p>}
                            {job.check_out_time&&<p className="text-purple-400">⏹ Done: {new Date(job.check_out_time).toLocaleTimeString()}</p>}
                        </div>
                        <div className="pb-bar">
                            <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 mb-1"><span>Booked</span><span>{sm[job.status]||0}%</span></div>
                            <div className="pb"><div className="pf" style={{width:`${sm[job.status]||0}%`}}></div></div>
                        </div>
                    </div>
                    {/* Balance & Payment */}
                    <div className="g p-8 text-center space-y-4 border-t-4 border-amber-500 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.balance}</p>
                        <h3 className="text-7xl font-black italic tracking-tighter text-white leading-none">{fmt$(bal)}</h3>
                        <div className="pt-2">
                            <button onClick={()=>{showToast("Redirecting to Secure Payment...", "amber"); setTimeout(()=>window.open(`https://buy.stripe.com/test_placeholder?client=${job.id}`),1500);}} className="w-full gold py-5 rounded-2xl font-black uppercase text-sm shadow-xl shadow-amber-900/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                                <CreditCard className="w-5 h-5"/> Pay Securely with Card
                            </button>
                            <p className="text-[8px] text-slate-500 font-black uppercase mt-3">Or Zelle: (407) 952-4228 — Memo: {job.client_name}</p>
                        </div>
                    </div>

                    {/* Team Live Tracking */}
                    {job.status === 'in_progress' && job.check_in_coords && (
                        <div className="g overflow-hidden space-y-0">
                            <div className="p-4 bg-green-600/10 border-b border-white/5 flex justify-between items-center">
                                <p className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2"><div className="dot-g"/> Team is On-Site</p>
                                <span className="text-[8px] text-slate-500 font-black uppercase">Live Update</span>
                            </div>
                            <div className="h-40 w-full bg-slate-900">
                                <iframe
                                    src={`https://maps.google.com/maps?q=${job.check_in_coords.lat},${job.check_in_coords.lng}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
                                    className="w-full h-full border-0 grayscale invert contrast-125"
                                    title="Team Location"
                                />
                            </div>
                        </div>
                    )}
                    {/* Quote approval */}
                    {!job.approval_signature?(
                        <div className="g p-6 border border-amber-500/30 space-y-4">
                            <div className="text-center"><p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">{t.approve}</p><p className="text-[8px] text-slate-500 font-black italic">{t.approveHint}</p></div>
                            <SigPad onSave={saveApproval} label={t.approveBtn}/>
                        </div>
                    ):(
                        <div className="g p-5 border border-green-600/30 text-center space-y-2">
                            <p className="text-[9px] text-green-500 font-black uppercase">✅ Quote Approved</p>
                            <img src={job.approval_signature} className="h-10 mx-auto opacity-50"/>
                        </div>
                    )}
                    {/* Before/After photos side by side */}
                    {(job.before_photos?.length>0||job.after_photos?.length>0)&&(
                        <div className="grid grid-cols-2 gap-3">
                            {job.before_photos?.length>0&&<div className="g p-4"><PhotoDrive photos={job.before_photos} label="📸 Before"/></div>}
                            {job.after_photos?.length>0&&<div className="g p-4"><PhotoDrive photos={job.after_photos} label="✨ After"/></div>}
                        </div>
                    )}
                    {/* Final signature */}
                    {job.approval_signature&&job.after_photos?.length>0&&!job.final_signature&&(
                        <div className="g p-6 border border-purple-500/30 space-y-4">
                            <div className="text-center"><p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">🏁 Confirm Completion</p><p className="text-[8px] text-slate-500 font-black italic">Sign to confirm you're satisfied</p></div>
                            <SigPad onSave={saveFinal} label="Sign to confirm completion"/>
                        </div>
                    )}
                    {job.final_signature&&(
                        <div className="g p-5 border border-purple-600/30 text-center space-y-2">
                            <p className="text-[9px] text-purple-400 font-black uppercase">🏁 Job Complete & Confirmed</p>
                            <img src={job.final_signature} className="h-10 mx-auto opacity-50"/>
                        </div>
                    )}
                    {/* QR code & Quality Seal */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="g p-5 flex flex-col items-center justify-center text-center space-y-2">
                            <QRCode url={`${window.location.origin}${window.location.pathname}?mision=${job.id}`} size={60}/>
                            <p className="text-[7px] font-black text-slate-500 uppercase">Mission QR</p>
                        </div>
                        <div className="g p-5 flex flex-col items-center justify-center text-center space-y-2 border-2 border-amber-500/20">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><ShieldCheck className="w-6 h-6"/></div>
                            <div>
                                <p className="text-[8px] font-black text-white uppercase">Elevore Gold</p>
                                <p className="text-[6px] text-slate-500 font-black uppercase">Certified Quality</p>
                            </div>
                        </div>
                    </div>
                    {/* Review + referral */}
                    {/* Rating inmediato */}
                    {job.status==='paid'&&!job.specs?.rating&&(
                        <div className="g p-6 border border-yellow-500/30 space-y-3 text-center">
                            <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">⭐ {t.rate}</p>
                            <div className="flex justify-center gap-2">
                                {[1,2,3,4,5].map(s=>(
                                    <button key={s} onClick={async()=>{
                                        await sb.from('elevore_missions').update({specs:{...job.specs,rating:s}}).eq('id',clientJobId);
                                        if(s>=4){window.open(GOOGLE_LINK,'_blank');}
                                        showToast(s>=4?'Gracias! ⭐':'Thank you!');
                                        loadPortal();
                                    }} className="text-4xl active:scale-90 transition-transform hover:scale-110">⭐</button>
                                ))}
                            </div>
                        </div>
                    )}
                    {job.specs?.rating&&<div className="g p-4 text-center"><p className="text-amber-400 font-black text-sm">{'⭐'.repeat(job.specs.rating)} Rated!</p></div>}
                    {/* Review + referral */}
                    {job.status==='paid'&&(
                        <div className="space-y-2">
                            <button onClick={()=>window.open(GOOGLE_LINK)} className="w-full gold py-4 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all">{t.review}</button>
                            <button onClick={()=>{const l=`${window.location.origin}${window.location.pathname}?ref=${job.client_name?.replace(/\s/g,'_')}`;navigator.clipboard?.writeText(l);showToast("Link copied! 🎁");}} className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all">{t.refer}</button>
                            <button onClick={()=>{const l=`${window.location.origin}${window.location.pathname}?client=${job.client_name?.replace(/\s/g,'_')}`;window.location.search=`?client=${job.client_name?.replace(/\s/g,'_')}`}} className="w-full bg-white/5 text-slate-400 py-3 rounded-2xl font-black uppercase text-[10px] active:scale-95 transition-all border border-white/5">View All My Missions →</button>
                        </div>
                    )}
                    {/* Chat directo */}
                    <div className="g p-5 space-y-3">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">💬 {t.chat}</p>
                        <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder={lang==='en'?'Type your message...':'Escribe tu mensaje...'} className="inp text-sm resize-none h-20"/>
                        <button onClick={()=>{
                            if(!chatInput.trim())return;
                            window.open(`https://wa.me/14079524228?text=${encodeURIComponent(`[${job.client_name}]: ${chatInput}`)}`,'_blank');
                            setChatInput('');
                            showToast('Message sent! ✉️');
                        }} className="w-full gold py-3 rounded-xl font-black uppercase text-[10px] active:scale-95">{t.chatBtn}</button>
                    </div>
                    <p className="text-[8px] text-slate-700 text-center uppercase font-bold">Elevore Premium Services • Digital signatures are legally binding</p>
                </div>
            </div>
        );
    }

    // ── AUTH ─────────────────────────────────────────────────
    if(view==='auth') return(
        <div className="min-h-screen flex items-center justify-center p-6 bg-black">
            {toast&&<div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color==='red'?'bg-red-600':'bg-green-600'} text-white`}>{toast.msg}</div>}
            <div className="g p-10 w-full max-w-sm text-center space-y-7 border-t-4 border-amber-500 shadow-2xl">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center font-black italic text-3xl text-black">E</div>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white">ELEVORE <span className="text-amber-500 italic">EMPIRE</span></h1>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">v95.0 — Built to Dominate</p>
                </div>
                <input type="password" placeholder="ACCESS PIN" className="inp text-center text-xl tracking-[0.5em]"
                    value={pass}
                    onChange={e=>setPass(e.target.value)}
                    onKeyDown={async(e)=>{
                        if(e.key==='Enter') await handleLogin();
                    }}/>
                <button onClick={handleLogin} className="w-full gold py-4 rounded-xl font-black uppercase active:scale-95 shadow-xl">Unlock Matrix</button>
            </div>
        </div>
    );

    async function handleLogin() {
        setLoading(true);
        // Always refresh staff on login attempt to ensure we have the latest
        const {data:s} = await sb.from('elevore_staff').select('*');
        const currentStaff = s || staffList;
        if(s) setStaffList(s);
        
        if(pass===ADMIN_PIN){ setRole('admin'); setView('brief'); }
        else {
            const member = currentStaff.find(ss=>ss.pin === pass);
            if(member){ setStaffName(member.name); setRole('staff'); setView('staff'); }
            else if(pass===STAFF_PIN){ setStaffName(''); setRole('staff'); setView('staff'); }
            else showToast("Invalid PIN",'red');
        }
        setLoading(false);
    }

    // ── STAFF VIEW ───────────────────────────────────────────
    if(role==='staff'){
        const sName = staffName || pass;
        const lookup = sName.trim().toLowerCase();
        const staffEarnings = payrollSheet.find(p => p.name.trim().toLowerCase() === lookup) || {gross:0, pay:0, bonus:0, jobs:0};
        
        // Performance Metrics
        const myJobs = jobs.filter(j=>j.team_assigned?.trim().toLowerCase() === lookup);
        const ratings = myJobs.filter(j=>j.specs?.rating).map(j=>j.specs.rating);
        const avgRating = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : "5.0";
        const proLevel = myJobs.length > 50 ? 'Platinum' : myJobs.length > 20 ? 'Gold' : myJobs.length > 5 ? 'Silver' : 'Bronze';
        const levelColor = {Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#fbbf24', Platinum:'#e5e4e2'}[proLevel];
        
        if(activeStaff){

            const StaffJob=()=>{
                const[checked,setChecked]=useState({});
                const[showAudit,setShowAudit]=useState(false);
                const done=Object.values(checked).filter(Boolean).length;
                const job=activeStaff;
                const bonus=calcBonus(job);
                const addAfterPhoto=async(url)=>{const c=job.after_photos||[];await sb.from('elevore_missions').update({after_photos:[...c,url]}).eq('id',job.id);showToast("Photo added ✓");setActiveStaff({...job,after_photos:[...c,url]});};
                
                return(
                    <div className="min-h-screen p-5 bg-black pb-32">
                        {toast&&<div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color==='red'?'bg-red-600':'bg-green-600'} text-white`}>{toast.msg}</div>}
                        <button onClick={()=>setActiveStaff(null)} className="mb-5 flex items-center gap-2 text-slate-500 font-black uppercase text-[9px]"><ArrowLeft className="w-4 h-4" /> Back to List</button>
                        
                        <div className="max-w-md mx-auto space-y-5">
                            {/* Mission Header */}
                            <div className="g p-6 border-t-4 border-green-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-20 h-20 text-white" /></div>
                                <h2 className="text-xl font-black uppercase italic text-white mb-1 relative z-10">{job.client_name}</h2>
                                <p className="text-[9px] text-slate-500 uppercase font-black mb-4">{job.service_type} • {job.address}</p>
                                <div className="flex gap-2">
                                    <button onClick={()=>recordTime(job.id,'check_in_time')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black uppercase text-[9px] active:scale-95 flex items-center justify-center gap-1 shadow-lg shadow-green-900/20"><Play className="w-3 h-3" /> Check In</button>
                                    <button onClick={()=>recordTime(job.id,'check_out_time')} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black uppercase text-[9px] active:scale-95 flex items-center justify-center gap-1"><Square className="w-3 h-3" /> Check Out</button>
                                    <button onClick={()=>sendWA(job,'arrival')} className="bg-amber-500 text-black px-4 py-3 rounded-xl font-black text-[9px] active:scale-95 flex items-center gap-1">🚀 En Camino</button>
                                    <button onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`)} className="bg-blue-600 text-white px-4 py-3 rounded-xl font-black text-[9px] active:scale-95">📍</button>
                                </div>
                                {job.check_in_time&&<p className="text-[8px] text-green-400 font-black uppercase mt-3 flex items-center gap-1"><div className="dot-g"/> Session Active: {new Date(job.check_in_time).toLocaleTimeString()}</p>}
                            </div>

                            {/* SPECIAL INSTRUCTIONS */}
                            <div className="g p-5 border-l-4 border-amber-500 space-y-3">
                                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert className="w-3 h-3"/> Special Instructions</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><Users2 className="w-4 h-4 text-amber-400"/></div>
                                        <div><p className="text-[8px] text-slate-500 uppercase font-black">Pets</p><p className="text-[10px] text-white font-black">{job.specs?.pets || 'None reported'}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-blue-400"/></div>
                                        <div><p className="text-[8px] text-slate-500 uppercase font-black">Access</p><p className="text-[10px] text-white font-black">{job.specs?.access_code || 'Doorbell / Knock'}</p></div>
                                    </div>
                                    {job.notes && (
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                            <p className="text-[8px] text-slate-500 uppercase font-black mb-1">Admin Notes</p>
                                            <p className="text-[10px] text-white font-black italic">"{job.notes}"</p>
                                        </div>
                                    )}
                                    {job.specs?.preferences && (
                                        <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                            <p className="text-[8px] text-amber-500 uppercase font-black mb-1 flex items-center gap-1"><Zap className="w-2 h-2"/> Client Pulse (Preferences)</p>
                                            <p className="text-[10px] text-white font-black italic">"{job.specs.preferences}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* UPSELL STRIKE */}
                            <div className="g p-5">
                                <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Neural Upsell</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {ADDONS.filter(a=>!job.specs?.[a.id]).map(a=>{
                                        const sent=(job.upsell_sent||[]).includes(a.id);
                                        return(<button key={a.id} disabled={sent} onClick={()=>sendUpsell(job,a.id)} className={`p-3 rounded-xl border text-[8px] font-black uppercase active:scale-95 transition-all ${sent?'bg-green-900/30 border-green-600/30 text-green-600':'bg-white/5 border-white/10 text-slate-400 hover:border-green-500'}`}>{sent?'✅ Sent':''}{a.label} +${a.p}</button>);
                                    })}
                                </div>
                            </div>

                            {/* CHECKLIST */}
                            <div className="g p-5 space-y-2">
                                <div className="flex justify-between items-center mb-2"><p className="text-[9px] font-black uppercase text-slate-400">Mission Checklist</p><span className="text-[9px] font-black text-white">{done}/{CHECKLIST.length}</span></div>
                                <div className="pb mb-3"><div className="pf" style={{width:`${(done/CHECKLIST.length)*100}%`}}></div></div>
                                {CHECKLIST.map((item,i)=>(
                                    <button key={i} onClick={()=>setChecked(c=>({...c,[i]:!c[i]}))} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 ${checked[i]?'bg-green-600/10 border-green-600/40 text-green-400':'bg-white/5 border-white/5 text-slate-400'}`}>
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${checked[i]?'bg-green-600 border-green-600':'border-slate-700'}`}>{checked[i]&&<Check className="w-3 h-3 text-white" />}</div>
                                        <span className="text-[10px] font-black uppercase text-left">{item}</span>
                                    </button>
                                ))}
                            </div>

                            {/* PHOTOS */}
                            <div className="g p-5"><PhotoDrive photos={job.after_photos||[]} label="✨ Proof of Quality (After Photos)" onAdd={addAfterPhoto}/></div>

                            {/* INCIDENT REPORT BUTTON */}
                            <button onClick={()=>setReportModal({type:'incident', jobId: job.id})} className="w-full bg-red-600/10 border border-red-600/30 text-red-500 py-3 rounded-xl font-black uppercase text-[9px] active:scale-95 flex items-center justify-center gap-2">
                                <AlertTriangle className="w-4 h-4"/> Report Issue or Damage
                            </button>

                            {/* FINISH MISSION */}
                            {done===CHECKLIST.length && (
                                <button onClick={()=>setShowAudit(true)} className="w-full gold py-5 rounded-2xl font-black uppercase text-base active:scale-95 transition-all shadow-xl shadow-amber-900/20">✅ Complete Mission</button>
                            )}
                        </div>

                        {/* SELF-AUDIT MODAL */}
                        {showAudit && (
                            <div className="fixed inset-0 bg-black/95 z-[600] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
                                <div className="g p-8 w-full max-w-sm space-y-6 text-center border-t-4 border-green-500">
                                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-green-500/20">✓</div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase italic text-white">Final Audit</h2>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Before we leave the mission...</p>
                                    </div>
                                    <div className="text-left space-y-3">
                                        {['Lights off?','Windows locked?','Key returned?','No supplies left?'].map((q,i)=>(
                                            <div key={i} className="flex items-center gap-3 text-white font-black uppercase text-[10px] bg-white/5 p-3 rounded-lg"><div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"/> {q}</div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={()=>setShowAudit(false)} className="flex-1 py-4 rounded-xl bg-white/10 text-slate-400 font-black uppercase text-[10px] active:scale-95">Cancel</button>
                                        <button onClick={async()=>{
                                            await sb.from('elevore_missions').update({status:'completed'}).eq('id',job.id);
                                            showToast("Mission objective secured! ✅");
                                            setActiveStaff(null); refresh();
                                        }} className="flex-2 gold py-4 px-6 rounded-xl font-black uppercase text-[10px] active:scale-95">Yes, Exit Mission</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            };
            return <StaffJob/>;
        }

        return(
            <div className="min-h-screen p-5 bg-black pb-24">
                {toast&&<div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color==='red'?'bg-red-600':'bg-green-600'} text-white`}>{toast.msg}</div>}
                {loading&&<div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center"><div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
                
                <div className="max-w-md mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center pt-2">
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">ELEVORE <span className="text-amber-500">STAFF</span></h1>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"/>
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{staffName || 'GENERIC OPS'}</p>
                            </div>
                        </div>
                        <button onClick={()=>{ setView('auth'); setRole('admin'); setPass(''); setStaffName(''); setActiveStaff(null); }} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all active:scale-95"><LogOut className="w-4 h-4" /></button>
                        <button onClick={()=>setSupplyModal(true)} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 hover:bg-amber-500 hover:text-black transition-all active:scale-95"><Package className="w-4 h-4" /></button>
                    </div>

                    {/* STAFF TABS */}
                    <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button onClick={()=>setStaffTab('missions')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${staffTab==='missions'?'bg-white/10 text-white shadow-lg':'text-slate-500'}`}>
                            <Zap className="w-4 h-4 mb-1" />
                            <span className="text-[7px] font-black uppercase">Missions</span>
                        </button>
                        <button onClick={()=>setStaffTab('earnings')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${staffTab==='earnings'?'bg-white/10 text-white shadow-lg':'text-slate-500'}`}>
                            <Wallet className="w-4 h-4 mb-1" />
                            <span className="text-[7px] font-black uppercase">Earnings</span>
                        </button>
                        <button onClick={()=>setStaffTab('incidents')} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${staffTab==='incidents'?'bg-white/10 text-white shadow-lg':'text-slate-500'}`}>
                            <AlertTriangle className="w-4 h-4 mb-1" />
                            <span className="text-[7px] font-black uppercase">Support</span>
                        </button>
                    </div>

                    {/* MISSIONS VIEW */}
                    {staffTab==='missions' && (
                        <div className="space-y-4">
                            {staffJobs.length===0&&<div className="g p-10 text-center text-slate-500 font-black italic uppercase text-xs border-dashed border-white/10">No missions assigned for today.</div>}
                            {staffJobs.map(job=>(
                                <button key={job.id} onClick={()=>setActiveStaff(job)} className="w-full g p-5 border-l-[6px] border-amber-500 text-left active:scale-95 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Zap className="w-16 h-16 text-white"/></div>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="text-lg font-black uppercase italic text-white leading-none mb-1">{job.client_name}</h3>
                                            <p className="text-[8px] text-slate-500 uppercase font-black">{job.service_type}</p>
                                        </div>
                                        <span className={`text-[7px] font-black px-2.5 py-1 rounded-xl uppercase flex items-center gap-1 ${job.status==='in_progress'?'bg-green-600 text-white':job.status==='completed'?'bg-purple-600 text-white':'bg-amber-500 text-black'}`}>
                                            {job.status==='in_progress'&&<div className="w-1 h-1 bg-white rounded-full animate-ping"/>} {job.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-3 text-slate-400">
                                        <MapPin className="w-3 h-3 text-slate-600" />
                                        <p className="text-[8px] font-black uppercase truncate w-full">{job.address}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                        <div className="flex gap-2">
                                            {job.specs?.pets && <div className="px-2 py-1 bg-amber-500/10 rounded text-[6px] font-black text-amber-500 uppercase">🐾 Pets</div>}
                                            {job.specs?.access_code && <div className="px-2 py-1 bg-blue-500/10 rounded text-[6px] font-black text-blue-500 uppercase">🔑 Access</div>}
                                        </div>
                                        <p className="text-[8px] font-black text-white uppercase italic">Mission Details →</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* EARNINGS VIEW */}
                    {staffTab==='earnings' && (
                        <div className="space-y-5 animate-in slide-in-from-bottom-5 duration-500">
                            <div className="g p-8 text-center space-y-2 border-t-4 border-green-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-20 h-20 text-white"/></div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest relative z-10">Available Earnings</p>
                                <h2 className="text-6xl font-black italic text-white tracking-tighter relative z-10">{fmt$(staffEarnings.pay)}</h2>
                                <p className="text-[8px] text-green-500 font-black uppercase pt-2">Includes base pay for {staffEarnings.jobs} missions</p>
                            </div>
                            
                            {/* Neural Performance Card */}
                            <div className="g p-6 border-l-4 space-y-4" style={{borderColor: levelColor}}>
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Performance</p>
                                    <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase" style={{background: levelColor, color: '#000'}}>{proLevel} PRO</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400"><Star className="w-5 h-5 fill-current"/></div>
                                        <div><p className="text-[18px] font-black text-white leading-none">{avgRating}</p><p className="text-[7px] text-slate-500 uppercase font-black">Avg Rating</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400"><Zap className="w-5 h-5 fill-current"/></div>
                                        <div><p className="text-[18px] font-black text-white leading-none">+{Math.round((myJobs.length/50)*100)}%</p><p className="text-[7px] text-slate-500 uppercase font-black">Efficiency</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="g p-5 text-center">
                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Bonuses Earned</p>
                                    <p className="text-2xl font-black italic text-amber-500">{fmt$(staffEarnings.bonus)}</p>
                                </div>
                                <div className="g p-5 text-center">
                                    <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Jobs Completed</p>
                                    <p className="text-2xl font-black italic text-white">{staffEarnings.jobs}</p>
                                </div>
                            </div>
                            <div className="g p-6 space-y-4">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CreditCard className="w-4 h-4"/> Payment Schedule</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-[9px] text-white font-black uppercase">Next Payout</span>
                                        <span className="text-[9px] text-slate-400 font-black uppercase italic">Friday, May 15</span>
                                    </div>
                                    <p className="text-[8px] text-slate-600 italic text-center uppercase font-bold">Payments are processed automatically via Zelle/Bank Transfer</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SUPPORT VIEW */}
                    {staffTab==='incidents' && (
                        <div className="space-y-5 animate-in slide-in-from-bottom-5 duration-500">
                            <div className="g p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center text-red-500 shadow-lg shadow-red-900/20"><AlertTriangle className="w-6 h-6"/></div>
                                    <div><h2 className="text-lg font-black uppercase italic text-white">Ops Support</h2><p className="text-[8px] text-slate-500 uppercase font-black">Report field issues instantly</p></div>
                                </div>
                                <div className="grid gap-3">
                                    <button onClick={()=>setReportModal({type:'incident'})} className="w-full g p-4 text-left flex items-center justify-between border-l-4 border-red-600 hover:bg-white/5 active:scale-95 transition-all">
                                        <div><p className="text-[10px] text-white font-black uppercase">Report Damage</p><p className="text-[8px] text-slate-500 font-black uppercase mt-1">Document pre-existing or new damage</p></div>
                                        <ArrowLeft className="w-4 h-4 rotate-180 text-slate-600" />
                                    </button>
                                    <button onClick={()=>setReportModal({type:'supply'})} className="w-full g p-4 text-left flex items-center justify-between border-l-4 border-amber-500 hover:bg-white/5 active:scale-95 transition-all">
                                        <div><p className="text-[10px] text-white font-black uppercase">Low Supplies</p><p className="text-[8px] text-slate-500 font-black uppercase mt-1">Request materials for next shift</p></div>
                                        <ArrowLeft className="w-4 h-4 rotate-180 text-slate-600" />
                                    </button>
                                    <button onClick={()=>window.open('https://wa.me/14079524228','_blank')} className="w-full g p-4 text-left flex items-center justify-between border-l-4 border-green-500 hover:bg-white/5 active:scale-95 transition-all">
                                        <div><p className="text-[10px] text-white font-black uppercase">Direct Admin Line</p><p className="text-[8px] text-slate-500 font-black uppercase mt-1">WhatsApp chat with Ops Manager</p></div>
                                        <ArrowLeft className="w-4 h-4 rotate-180 text-slate-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                {reportModal && (
                    <div className="fixed inset-0 bg-black/95 z-[600] flex items-end justify-center p-6 animate-in slide-in-from-bottom duration-300">
                        <div className="g p-8 w-full max-w-sm space-y-6 border-t-4 border-red-600">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black uppercase italic text-white">{reportModal.type === 'incident' ? 'Report Damage' : 'Supply Request'}</h2>
                                <button onClick={()=>{setReportModal(null);setReportDesc('');}} className="text-slate-500"><X className="w-6 h-6"/></button>
                            </div>
                            <div className="space-y-4">
                                <div><p className="text-[9px] font-black text-slate-500 uppercase mb-2">Description</p><textarea className="inp text-xs h-24 uppercase" placeholder="Explain the situation clearly..." value={reportDesc} onChange={e=>setReportDesc(e.target.value)}/></div>
                                <div><p className="text-[9px] font-black text-slate-500 uppercase mb-2">Proof (Optional)</p><div className="g p-4 border-dashed border-white/10 text-center"><p className="text-[8px] text-slate-600 font-black italic">Click to upload photo</p></div></div>
                                <button onClick={async()=>{
                                    if(!reportDesc.trim()) return showToast("Please add a description",'red');
                                    setLoading(true);
                                    try {
                                        const {error} = await sb.from('elevore_reports').insert({
                                            type: reportModal.type,
                                            description: reportDesc,
                                            staff_name: staffName || pass,
                                            job_id: reportModal.jobId || null,
                                            status: 'open'
                                        });
                                        if(error) throw error;
                                        showToast("Report submitted successfully! ✓");
                                        setReportModal(null);
                                        setReportDesc('');
                                        refresh();
                                    } catch(e) {
                                        showToast(e.message || "Error sending report",'red');
                                    } finally {
                                        setLoading(false);
                                    }
                                }} className="w-full gold py-4 rounded-xl font-black uppercase active:scale-95 shadow-xl shadow-amber-900/20">Send Report</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUPPLY CHECKLIST MODAL */}
                {supplyModal && (
                    <div className="fixed inset-0 bg-black/95 z-[600] flex items-center justify-center p-6 animate-in zoom-in duration-300">
                        <div className="g p-8 w-full max-w-sm space-y-6 border-t-4 border-amber-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-black uppercase italic text-white flex items-center gap-2"><Package className="w-5 h-5 text-amber-500"/> Stock Check</h2>
                                <button onClick={()=>setSupplyModal(false)} className="text-slate-500"><X className="w-6 h-6"/></button>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {['All-purpose cleaner','Microfiber towels (10)','Vacuum + Mop','Glass cleaner','Trash bags','Supply of sponges','Gloves & Masks','Handyman Tool Kit'].map((item,i)=>(
                                    <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg accent-amber-500" />
                                        <span className="text-[10px] text-white font-black uppercase">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={()=>setSupplyModal(false)} className="w-full gold py-4 rounded-xl font-black uppercase shadow-xl">Everything Ready ✓</button>
                        </div>
                    </div>
                )}

                {/* BOTTOM TAB BAR (Staff) */}
                <div className="fixed bottom-6 left-6 right-6 z-[400] flex gap-2 bg-black/60 backdrop-blur-xl p-2 rounded-3xl border border-white/10 shadow-2xl">
                    <button onClick={()=>setStaffTab('missions')} className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${staffTab==='missions'?'bg-amber-500 text-black shadow-lg':'text-slate-500'}`}>
                        <Zap className="w-4 h-4" /><span className="text-[6px] font-black uppercase mt-1">Ops</span>
                    </button>
                    <button onClick={()=>setStaffTab('earnings')} className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${staffTab==='earnings'?'bg-amber-500 text-black shadow-lg':'text-slate-500'}`}>
                        <Wallet className="w-4 h-4" /><span className="text-[6px] font-black uppercase mt-1">Bank</span>
                    </button>
                    <button onClick={()=>setStaffTab('incidents')} className={`flex-1 flex flex-col items-center py-2 rounded-2xl transition-all ${staffTab==='incidents'?'bg-amber-500 text-black shadow-lg':'text-slate-500'}`}>
                        <AlertTriangle className="w-4 h-4" /><span className="text-[6px] font-black uppercase mt-1">Help</span>
                    </button>
                </div>
            </div>
        );
    }

    // ════════════════════════════════════════════════════════
    // ── QUICK QUOTE MODAL ────────────────────────────────────
    const QuickQuote=()=>{
        const[qq,setQQ]=useState({name:'',phone:'',address:'',svc:'regular',beds:2,baths:2,price:0});
        const qqPrice=useMemo(()=>{
            const b={regular:95,deep:165,moveout:195};
            const base=(b[qq.svc]||95)+(qq.beds*40)+(qq.baths*35);
            return Math.round(base);
        },[qq]);
        return(
            <div className="fixed inset-0 bg-black/90 z-[400] flex items-end justify-center p-4">
                <div className="g p-6 w-full max-w-md space-y-4 border-t-4 border-amber-500">
                    <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">⚡ Quick Quote — 30 seconds</p>
                        <button onClick={()=>setQuickMode(false)} className="text-slate-500 active:scale-95"><X className="w-5 h-5" /></button>
                    </div>
                    <input type="text" placeholder="Client name" className="inp uppercase" value={qq.name} onChange={e=>setQQ({...qq,name:e.target.value})}/>
                    <input type="text" placeholder="Phone" className="inp" value={qq.phone} onChange={e=>setQQ({...qq,phone:e.target.value})}/>
                    <input type="text" placeholder="Address" className="inp text-xs uppercase" value={qq.address} onChange={e=>setQQ({...qq,address:e.target.value})}/>
                    <div className="grid grid-cols-4 gap-1">
                        {['regular','deep','moveout','postcon'].map(s=>(
                            <button key={s} onClick={()=>setQQ({...qq,svc:s})} className={`py-2 rounded-xl text-[8px] font-black uppercase border-2 active:scale-95 ${qq.svc===s?'bg-green-600 border-green-600 text-white':'bg-white/5 border-white/5 text-slate-500'}`}>{s}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[{l:'Beds',k:'beds'},{l:'Baths',k:'baths'}].map(i=>(
                            <div key={i.k} className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                                <span className="text-[8px] uppercase block mb-1 text-slate-400 font-black">{i.l}</span>
                                <div className="flex justify-between items-center">
                                    <button onClick={()=>setQQ({...qq,[i.k]:Math.max(0,qq[i.k]-1)})} className="w-7 h-7 bg-white/10 rounded-lg text-white font-bold active:scale-95">-</button>
                                    <span className="text-lg font-black italic text-white">{qq[i.k]}</span>
                                    <button onClick={()=>setQQ({...qq,[i.k]:qq[i.k]+1})} className="w-7 h-7 bg-white/10 rounded-lg text-white font-bold active:scale-95">+</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl text-center border border-white/10">
                        <p className="text-[8px] text-slate-500 uppercase font-black">Estimated Price</p>
                        <p className="text-4xl font-black italic text-white">${qqPrice}</p>
                    </div>
                    <button onClick={()=>quickDeploy({...qq,price:qqPrice})} className="w-full gold py-4 rounded-xl font-black uppercase active:scale-95 shadow-xl">🚀 Send Quote + Portal Link</button>
                </div>
            </div>
        );
    };

    // ── MORNING BRIEFING ─────────────────────────────────────
    const MorningBrief=()=>(
        <div className="space-y-5 animate-in fade-in duration-500">
            <div className="g p-6 border-t-4 border-amber-500">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Good morning, Jose Mario 👋</p>
                <h2 className="text-2xl font-black italic text-white mb-4">Today's Command</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-600/10 border border-green-600/20 p-4 rounded-xl text-center">
                        <p className="text-[8px] text-green-400 font-black uppercase mb-1">Jobs Today</p>
                        <p className="text-3xl font-black italic text-white">{jobs.filter(j=>j.scheduled_date===todayStr).length}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
                        <p className="text-[8px] text-amber-400 font-black uppercase mb-1">Revenue Today</p>
                        <p className="text-3xl font-black italic text-white">{fmt$(jobs.filter(j=>j.scheduled_date===todayStr).reduce((a,b)=>a+(b.total_price||0),0))}</p>
                    </div>
                </div>
            </div>
            {/* Alerts */}
            <div className="space-y-3">
                {finance.coldLeads.length>0&&(
                    <div className="g p-5 border-l-4 border-red-500">
                        <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">🔥 {finance.coldLeads.length} Cold Lead{finance.coldLeads.length>1?'s':''} — Act Now</p>
                        {finance.coldLeads.slice(0,3).map(job=>(
                            <div key={job.id} className="flex justify-between items-center py-1.5">
                                <span className="text-[10px] font-black text-white uppercase">{job.client_name}</span>
                                <button onClick={()=>sendWA(job,'urgency')} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-xl text-[8px] font-black uppercase active:scale-95">🚨 Urgency</button>
                            </div>
                        ))}
                    </div>
                )}
                {finance.retDue.length>0&&(
                    <div className="g p-5 border-l-4 border-blue-500">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">👻 {finance.retDue.length} Retention Due</p>
                        {finance.retDue.slice(0,3).map(job=>(
                            <div key={job.id} className="flex justify-between items-center py-1.5">
                                <div><span className="text-[10px] font-black text-white uppercase">{job.client_name}</span><p className="text-[8px] text-slate-500">Next: {job.next_visit}</p></div>
                                <button onClick={()=>sendWA(job,'retention')} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-xl text-[8px] font-black uppercase active:scale-95">Re-engage</button>
                            </div>
                        ))}
                    </div>
                )}
                {finance.churn.length>0&&(
                    <div className="g p-5 border-l-4 border-orange-500">
                        <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-2">⚠️ {finance.churn.length} At-Risk Clients (45+ days)</p>
                        {finance.churn.slice(0,3).map(c=>(
                            <div key={c.name} className="flex justify-between items-center py-1.5">
                                <span className="text-[10px] font-black text-white uppercase">{c.name}</span>
                                <button onClick={()=>{const j=jobs.find(jj=>jj.client_name===c.name);if(j)sendWA(j,'winback');}} className="px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-xl text-[8px] font-black uppercase active:scale-95">Win Back</button>
                            </div>
                        ))}
                    </div>
                )}
                {finance.pendSig.length>0&&(
                    <div className="g p-5 border-l-4 border-amber-500">
                        <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">✍️ {finance.pendSig.length} Awaiting Signature</p>
                        {finance.pendSig.slice(0,3).map(job=>(
                            <div key={job.id} className="flex justify-between items-center py-1.5">
                                <span className="text-[10px] font-black text-white uppercase">{job.client_name} — {fmt$(job.total_price)}</span>
                                <button onClick={()=>sendWA(job,'quote')} className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-xl text-[8px] font-black uppercase active:scale-95">Send</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Quick stats */}
            <div className="g p-5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Monthly Pulse</p>
                <div className="pb mb-2"><div className="pf" style={{width:`${finance.progress}%`}}></div></div>
                <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase mb-3">
                    <span>{fmt$(finance.gross)} billed</span><span>{finance.gross>=MONTHLY_GOAL?'🎯 GOAL!':'→ '+fmt$(MONTHLY_GOAL-finance.gross)+' left'}</span>
                </div>
                {finance.projection>0&&<p className="text-[9px] text-green-400 font-black uppercase text-center">📈 Projected month-end: {fmt$(finance.projection)}</p>}
                {finance.bestDay&&<p className="text-[9px] text-amber-400 font-black uppercase text-center mt-1">💰 Your Money Day: {finance.bestDay}</p>}
            </div>
            <button onClick={()=>setView('intel')} className="w-full g py-4 rounded-xl font-black uppercase text-[10px] text-slate-400 border border-white/5 active:scale-95">Full Intel Dashboard →</button>
        </div>
    );

    // ── ADMIN MAIN ───────────────────────────────────────────
    return(
        <div className="min-h-screen flex flex-col pb-32">
            {toast&&<div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color==='red'?'bg-red-600':'bg-green-600'} text-white`}>{toast.msg}</div>}
            {quickMode&&<QuickQuote/>}

            <nav className="p-5 sticky top-0 z-[100] bg-black/90 backdrop-blur-3xl border-b border-white/5 flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-black italic text-xl shadow-xl">E</div>
                    <div>
                        <h1 className="font-black text-lg tracking-tighter uppercase text-white leading-none">Elevore <span className="text-amber-500 italic font-light">Empire</span></h1>
                        <div className="flex items-center gap-2 mt-0.5"><div className="dot-g"></div><p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">v95.0 Monster</p></div>
                    </div>
                </div>
                <div className="flex gap-1.5">
                    <button onClick={()=>setQuickMode(true)} className="gold px-3 py-2 rounded-xl font-black uppercase text-[8px] active:scale-95">⚡ Quick</button>
                    <button onClick={()=>setIsPrivate(p=>!p)} className="p-2.5 bg-slate-900 rounded-xl text-slate-500 hover:text-amber-500 transition-all"><i data-lucide={isPrivate?'eye-off':'eye'} className="w-4 h-4"></i></button>
                    <button onClick={()=>{ setView('auth'); setRole('admin'); setPass(''); setStaffName(''); }} className="p-2.5 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><LogOut className="w-4 h-4" /></button>
                </div>
            </nav>

            {loading&&<div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center"><div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}

            <main className="max-w-xl mx-auto w-full p-4 space-y-5">
                {/* NAV */}
                <div className="flex gap-1 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-xl overflow-x-auto no-sb">
                    {[['brief','☀️','Brief'],['intel','📊','Intel'],['agenda','📋','Logs'],['clients','🧬','DNA'],['mrr','💳','MRR'],['payroll','💵','Pay'],['team','👥','Team'],['support','🚨','Support'],['map','📍','Map'],['deploy','⚡','New']].map(([v,e,l])=>(
                        <button key={v} onClick={()=>{if(v==='deploy'){setEditId(null);setState(INITIAL);setDeployTab('identity');}setView(v);}}
                            className={`flex-shrink-0 flex-1 py-2.5 rounded-xl text-[8px] uppercase font-black transition-all whitespace-nowrap px-2 ${view===v?(v==='deploy'?'bg-amber-500 text-black shadow-lg':'tab-on'):'text-slate-500'}`}>{e} {l}</button>
                    ))}
                </div>

                {/* ── MORNING BRIEFING ── */}
                {view==='brief'&&<MorningBrief/>}

                {/* ── INTEL ── */}
                {view==='intel'&&(
                    <div className="space-y-5 animate-in fade-in duration-500">
                        <section className="g p-8 border-t-4 border-green-600 shadow-xl">
                            <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest italic">Monthly Goal — {fmt$(MONTHLY_GOAL)}</p>
                            <h2 className="text-7xl italic tracking-tighter text-white font-black leading-none">{Math.round(finance.progress)}%</h2>
                            <div className="pb mt-4 mb-3"><div className="pf" style={{width:`${finance.progress}%`}}></div></div>
                            <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase">
                                <span>Billed: {isPrivate?'***':fmt$(finance.gross)}</span>
                                <span>{finance.gross>=MONTHLY_GOAL?'🎯 GOAL HIT!':'Left: '+fmt$(MONTHLY_GOAL-finance.gross)}</span>
                            </div>
                            <p className="text-[9px] text-green-500 mt-2 font-black uppercase italic text-center">Net: {isPrivate?'****':fmt$(finance.net)} | Projected: {isPrivate?'****':fmt$(finance.projection)}</p>
                            {finance.bestDay&&<p className="text-[8px] text-amber-400 font-black uppercase text-center mt-1">💰 Money Day: {finance.bestDay}</p>}
                        </section>
                        {/* Forecast 90 días */}
                        <div className="g p-5 border-t-4 border-blue-500">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">📈 90-Day Forecast</p>
                            <div className="grid grid-cols-3 gap-3">
                                {forecast90.map((m,i)=>(
                                    <div key={i} className={`text-center p-3 rounded-2xl ${i===0?'bg-green-600/20 border border-green-600/30':i===1?'bg-blue-600/20 border border-blue-600/30':'bg-purple-600/20 border border-purple-600/30'}`}>
                                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{m.label}</p>
                                        <p className={`text-xl font-black italic ${i===0?'text-green-400':i===1?'text-blue-400':'text-purple-400'}`}>{isPrivate?'***':fmt$(m.v)}</p>
                                        <p className="text-[7px] text-slate-600 font-black uppercase mt-1">MRR: {isPrivate?'**':fmt$(m.mrr)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Weekly chart */}
                        <div className="g p-5"><BarChart data={finance.weekBars} color="#22c55e" label="📊 Weekly Revenue"/></div>
                        {/* KPIs */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {label:'Pending',val:isPrivate?'***':fmt$(finance.pending),c:'border-orange-500',t:'text-orange-400'},
                                {label:'Avg Ticket',val:isPrivate?'***':fmt$(finance.avg),c:'border-blue-500',t:'text-blue-400'},
                                {label:'Recurring',val:isPrivate?'***':fmt$(finance.recurring),c:'border-purple-500',t:'text-purple-400'},
                                {label:'Staff Bonus',val:fmt$(finance.bonuses),c:'border-amber-500',t:'text-amber-400'},
                            ].map(k=>(
                                <div key={k.label} className={`g p-5 border-b-4 ${k.c} text-center`}>
                                    <p className="text-[8px] text-slate-500 mb-1 uppercase font-black">{k.label}</p>
                                    <p className={`text-2xl font-black italic ${k.t}`}>{k.val}</p>
                                </div>
                            ))}
                        </div>
                        {/* Top client */}
                        {finance.topClient&&(
                            <div className="g p-5 border border-amber-500/30">
                                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-2">👑 Top Client</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[11px] font-black text-white uppercase">{finance.topClient.name}</span>
                                    <span className="text-lg font-black text-amber-400">{fmt$(finance.topClient.total)}</span>
                                </div>
                            </div>
                        )}
                        {/* Pipeline */}
                        <div className="g p-5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Pipeline</p>
                            <div className="grid grid-cols-5 gap-1.5">
                                {[{k:'lead',c:'text-yellow-400',l:'Lead'},{k:'scheduled',c:'text-blue-400',l:'Sched'},{k:'in_progress',c:'text-green-400',l:'Live'},{k:'completed',c:'text-purple-400',l:'Done'},{k:'paid',c:'text-cyan-400',l:'Paid'}].map(s=>(
                                    <div key={s.k} className="text-center bg-white/5 p-2 rounded-xl">
                                        <p className={`text-2xl font-black italic ${s.c}`}>{finance.byStatus[s.k]||0}</p>
                                        <p className="text-[6px] text-slate-500 uppercase font-black mt-0.5">{s.l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Revenue by service */}
                        <div className="g p-5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Revenue by Service</p>
                            {Object.entries(finance.byService).length===0&&<p className="text-[9px] text-slate-600 text-center font-black uppercase italic">No data yet.</p>}
                            {Object.entries(finance.byService).map(([type,rev])=>(
                                <div key={type} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                                    <span className="text-[9px] font-black uppercase text-slate-400">{type} ({jobs.filter(j=>j.service_type===type).length})</span>
                                    <span className="text-sm font-black text-white">{isPrivate?'***':fmt$(rev)}</span>
                                </div>
                            ))}
                        </div>
                        {/* Export */}
                        <button onClick={exportCSV} className="w-full g py-4 rounded-xl font-black uppercase text-[9px] text-slate-400 border border-white/5 active:scale-95">📊 Export CSV for Accountant</button>
                        {/* Activity log */}
                        {activityLog.length>0&&(
                            <div className="g p-5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Activity Log</p>
                                {activityLog.slice(0,8).map((l,i)=>(
                                    <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                                        <span className="text-[8px] text-slate-400 font-black">{l.msg}</span>
                                        <span className="text-[7px] text-slate-600">{l.time}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── AGENDA ── */}
                {view==='agenda'&&(
                    <div className="space-y-4 animate-in slide-in-from-bottom-10 pb-24">
                        <input type="text" placeholder="🔍 Search client, address, team..." className="inp" value={searchQ} onChange={e=>setSearchQ(e.target.value)}/>
                        <div className="flex gap-1.5 overflow-x-auto no-sb pb-1">
                            {['all','lead','scheduled','in_progress','completed','paid'].map(s=>(
                                <button key={s} onClick={()=>setFilterSt(s)} className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase whitespace-nowrap active:scale-95 ${filterSt===s?'bg-amber-500 text-black':'bg-white/5 text-slate-500'}`}>{s}</button>
                            ))}
                        </div>
                        {filtered.length===0&&<div className="g p-10 text-center text-slate-500 font-black italic uppercase">No missions found.</div>}
                        {filtered.map(job=>{
                            const isH=job.service_type==='handyman';
                            const bal=job.total_price-job.deposit_paid;
                            const dna=clientDNA[job.client_name];
                            const lvl=clientLevel(dna?.count||0);
                            const profit=realProfit(job);
                            const bonus=calcBonus(job);
                            const hasSig=!!job.approval_signature;
                            const hasFinal=!!job.final_signature;
                            return(
                                <div key={job.id} className={`g p-5 border-l-[7px] shadow-xl hover:bg-white/[0.02] transition-all ${isH?'border-green-500':job.status==='paid'?'border-blue-500':job.status==='in_progress'?'border-green-400':job.status==='lead'?'border-yellow-500':job.status==='completed'?'border-purple-500':'border-amber-500'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                <h3 className="text-base font-black uppercase italic text-white leading-none">{job.client_name}</h3>
                                                <span className={`text-[6px] font-black px-2 py-1 rounded-full uppercase ${job.status==='paid'?'bg-blue-600 text-white':job.status==='in_progress'?'bg-green-600 text-white':job.status==='lead'?'bg-yellow-500 text-black':job.status==='completed'?'bg-purple-600 text-white':'bg-slate-700 text-slate-300'}`}>{job.status}</span>
                                                {isH&&<span className="text-[6px] bg-green-600 text-black font-black px-1.5 py-0.5 rounded-full">🛠️</span>}
                                                {lvl.name!=='Bronze'&&<span className="text-[6px] font-black px-1.5 py-0.5 rounded-full" style={{background:lvl.color,color:'#000'}}>{lvl.name}</span>}
                                                {hasSig&&<span className="text-[6px] bg-green-900 text-green-400 font-black px-1.5 py-0.5 rounded-full">✍️</span>}
                                                {hasFinal&&<span className="text-[6px] bg-purple-900 text-purple-400 font-black px-1.5 py-0.5 rounded-full">🏁</span>}
                                                {bonus>0&&<span className="text-[6px] bg-amber-900 text-amber-400 font-black px-1.5 py-0.5 rounded-full">⭐+${bonus}</span>}
                                            </div>
                                            <p className="text-[8px] text-slate-500 uppercase">{job.service_type} • {fmtDate(job.scheduled_date)} • {job.team_assigned||'No team'}</p>
                                            {job.check_in_time&&<p className="text-[7px] text-green-400 font-black uppercase">▶ {new Date(job.check_in_time).toLocaleTimeString()}{job.check_out_time&&` ⏹ ${new Date(job.check_out_time).toLocaleTimeString()}`}</p>}
                                        </div>
                                        {dna&&<div className="dna border-2 ml-2" style={{borderColor:lvl.color,color:lvl.color}}><div className="text-center leading-none"><div style={{fontSize:'0.5rem',fontWeight:900}}>{lvl.name.slice(0,3).toUpperCase()}</div><div style={{fontSize:'0.65rem',fontWeight:900}}>{dna.score}</div></div></div>}
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl mb-2">
                                        <p className="text-[8px] text-slate-400 truncate w-44 italic">{job.address}</p>
                                        <button onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`)} className="text-green-500 text-[7px] font-black uppercase px-2 py-1 bg-green-600/10 rounded-lg active:scale-95">GPS</button>
                                    </div>
                                    {/* Real profit */}
                                    {!isPrivate&&job.status==='paid'&&(
                                        <div className="bg-green-900/20 border border-green-600/20 p-2 rounded-xl mb-2 flex justify-between items-center">
                                            <span className="text-[7px] font-black text-green-400 uppercase">Your real pocket</span>
                                            <span className="text-sm font-black text-green-400">{fmt$(profit)}</span>
                                        </div>
                                    )}
                                    {/* WA suite */}
                                    <div className="grid grid-cols-3 gap-1 mb-2">
                                        {[['confirm','✅'],['reminder','🔔'],['review','⭐'],['quote','📋'],['referral','🎁'],['bundle','🎯']].map(([t,e])=>(
                                            <button key={t} onClick={()=>sendWA(job,t)} className="py-1.5 bg-white/5 border border-white/5 rounded-xl text-[7px] font-black uppercase active:scale-95 text-slate-400">{e} {t}</button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-end border-t border-white/5 pt-3">
                                        <div>
                                            <p className="text-[8px] text-slate-500 italic font-black uppercase">Balance</p>
                                            <p className="text-4xl font-black italic tracking-tighter text-white leading-none">{fmt$(bal)}</p>
                                            {job.next_visit&&<p className="text-[7px] text-amber-500 font-black uppercase mt-0.5">↩ {job.next_visit}</p>}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={()=>printInvoice(job)} className="p-2.5 bg-slate-800 text-amber-500 rounded-xl hover:scale-110 transition-all"><FileText className="w-4 h-4" /></button>
                                            <button onClick={()=>{setEditId(job.id);setState({...job.specs,totalPrice:job.total_price});setView('deploy');setDeployTab('identity');}} className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-blue-600 transition-all"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={()=>{if(confirm("Archive?"))sb.from('elevore_missions').delete().eq('id',job.id).then(()=>{showToast("Archived ✓");log(`Archived: ${job.client_name}`);refresh();});}} className="p-2.5 bg-red-900/30 text-red-500 rounded-xl hover:bg-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            <button onClick={()=>window.open(`https://wa.me/${job.client_phone?.replace(/\D/g,'')||''}`)} className="p-2.5 bg-green-600 text-white rounded-xl active:scale-90 transition-all"><MessageCircle className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── CLIENT DNA ── */}
                {view==='clients'&&(
                    <div className="space-y-4 animate-in fade-in pb-24">
                        <div className="g p-5 border-t-4 border-purple-500">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">🧬 Client DNA Intelligence</p>
                            <p className="text-[8px] text-slate-600 font-black italic">Score: visits + payments + recurring + referrals</p>
                        </div>
                        {clients.length===0&&<div className="g p-10 text-center text-slate-500 font-black italic uppercase">No clients yet.</div>}
                        {clients.sort((a,b)=>(clientDNA[b.name]?.score||0)-(clientDNA[a.name]?.score||0)).map(client=>{
                            const dna=clientDNA[client.name]||{score:0,count:0,spent:0};
                            const lvl=clientLevel(dna.count);
                            const last=jobs.filter(j=>j.client_name===client.name)[0];
                            const daysSince=daysAgo(last?.scheduled_date);
                            return(
                                <div key={client.name} className={`g p-5 hover:bg-white/[0.02] transition-all border-l-4 lvl-${lvl.name.toLowerCase()}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="text-base font-black uppercase italic text-white">{client.name}</h3>
                                                <span className="text-[7px] font-black px-2 py-0.5 rounded-full" style={{background:lvl.color,color:'#000'}}>{lvl.name}</span>
                                                {daysSince>=45&&<span className="text-[7px] bg-red-900/50 text-red-400 font-black px-2 py-0.5 rounded-full">⚠️ Churn Risk</span>}
                                            </div>
                                            <p className="text-[8px] text-slate-500 uppercase">{client.phone}</p>
                                            <div className="flex gap-3 mt-1 flex-wrap">
                                                <span className="text-[8px] font-black text-white">{dna.count} jobs</span>
                                                <span className="text-[8px] font-black text-green-400">{isPrivate?'***':fmt$(dna.spent)}</span>
                                                <span className="text-[8px] font-black text-slate-500">Last: {daysSince<999?daysSince+'d ago':'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="dna border-2 ml-2 flex-shrink-0" style={{borderColor:lvl.color,color:lvl.color,width:44,height:44}}>
                                            <div className="text-center leading-none"><div style={{fontSize:'0.5rem',fontWeight:900}}>{lvl.name.slice(0,3)}</div><div style={{fontSize:'0.6rem',fontWeight:900}}>{dna.score}</div></div>
                                        </div>
                                    </div>
                                    <div className="pb mt-2 mb-3"><div className="pf" style={{width:`${dna.score}%`}}></div></div>
                                    <div className="flex gap-2">
                                        <button onClick={()=>window.open(`https://wa.me/${client.phone?.replace(/\D/g,'')}`)} className="flex-1 py-2 bg-green-600/20 text-green-400 rounded-xl text-[7px] font-black uppercase active:scale-95">💬 WA</button>
                                        <button onClick={()=>{const l=`${window.location.origin}${window.location.pathname}?client=${client.name?.replace(/\s/g,'_')}`;navigator.clipboard?.writeText(l);showToast("History Link Copied!");}} className="flex-1 py-2 bg-white/5 text-slate-400 rounded-xl text-[7px] font-black uppercase active:scale-95">🔗 History</button>
                                        <button onClick={()=>{if(last)sendWA(last,'referral');}} className="flex-1 py-2 bg-pink-600/20 text-pink-400 rounded-xl text-[7px] font-black uppercase active:scale-95">🎁 Refer</button>
                                        <button onClick={()=>{if(last)sendWA(last,'bundle');}} className="flex-1 py-2 bg-blue-600/20 text-blue-400 rounded-xl text-[7px] font-black uppercase active:scale-95">🎯 Bundle</button>
                                        <button onClick={()=>{setState({...INITIAL,name:client.name,phone:client.phone,address:client.address,...client.specs});setView('deploy');setDeployTab('specs');}} className="flex-1 py-2 bg-amber-600/20 text-amber-400 rounded-xl text-[7px] font-black uppercase active:scale-95">+ Job</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── MRR / MEMBRESÍAS ── */}
                {view==='mrr'&&(
                    <div className="space-y-4 animate-in fade-in pb-24">
                        <div className="g p-6 border-t-4 border-green-600 text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">💳 Monthly Recurring Revenue</p>
                            <h2 className="text-6xl font-black italic text-white tracking-tighter">{isPrivate?'****':fmt$(mrr.monthly)}</h2>
                            <p className="text-[9px] text-green-400 font-black uppercase mt-2">🗓 Annual Run Rate: {isPrivate?'****':fmt$(mrr.annual)}</p>
                            <p className="text-[9px] text-slate-500 font-black uppercase mt-1">{mrr.count} recurring clients</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[{label:'Basic',val:mrr.plans.basic,c:'border-slate-500',t:'text-slate-300',desc:'< $200/mo'},{label:'Pro',val:mrr.plans.pro,c:'border-blue-500',t:'text-blue-400',desc:'$200-400/mo'},{label:'Elite',val:mrr.plans.elite,c:'border-amber-500',t:'text-amber-400',desc:'$400+/mo'}].map(p=>(
                                <div key={p.label} className={`g p-4 border-b-4 ${p.c} text-center`}>
                                    <p className="text-[7px] font-black text-slate-500 uppercase mb-1">{p.label}</p>
                                    <p className={`text-3xl font-black italic ${p.t}`}>{p.val}</p>
                                    <p className="text-[6px] text-slate-600 mt-1">{p.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="g p-5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Recurring Clients</p>
                            {jobs.filter(j=>j.specs?.frequency&&j.specs.frequency!=='one-time').map(j=>(
                                <div key={j.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                    <div><p className="text-[10px] font-black text-white uppercase">{j.client_name}</p><p className="text-[8px] text-slate-500">{j.specs.frequency} • {j.service_type}</p></div>
                                    <span className="text-sm font-black text-green-400">{isPrivate?'***':fmt$(j.total_price)}</span>
                                </div>
                            ))}
                            {mrr.count===0&&<p className="text-[9px] text-slate-600 text-center font-black italic">No recurring clients yet. Deploy with Weekly/Bi-Weekly frequency!</p>}
                        </div>
                    </div>
                )}

                {/* ── PAYROLL ── */}
                {view==='payroll'&&(
                    <div className="space-y-4 animate-in fade-in pb-24">
                        <div className="g p-5 border-t-4 border-green-500">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">💵 Team Payroll Sheet</p>
                            <p className="text-[8px] text-slate-600 italic">Based on paid jobs · {Math.round(STAFF_PAY*100)}% of deposit</p>
                        </div>
                        {payrollSheet.length===0&&<div className="g p-10 text-center text-slate-500 font-black italic uppercase">No paid jobs yet.</div>}
                        {payrollSheet.map(tm=>(
                            <div key={tm.name} className="g p-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <div><h3 className="text-base font-black uppercase italic text-white">{tm.name}</h3><p className="text-[8px] text-slate-500 uppercase">{tm.jobs} jobs completed</p></div>
                                    <div className="text-right"><p className="text-[8px] text-slate-500 uppercase">Total Pay</p><p className="text-2xl font-black italic text-green-400">{isPrivate?'***':fmt$(tm.pay+tm.bonus)}</p></div>
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl text-[8px] font-black uppercase space-y-1.5">
                                    <div className="flex justify-between text-slate-400"><span>Gross Revenue</span><span>{isPrivate?'***':fmt$(tm.gross)}</span></div>
                                    <div className="flex justify-between text-green-400"><span>Base Pay ({Math.round(STAFF_PAY*100)}%)</span><span>{isPrivate?'***':fmt$(tm.pay)}</span></div>
                                    <div className="flex justify-between text-amber-400"><span>Bonuses Earned</span><span>+{fmt$(tm.bonus)}</span></div>
                                    <div className="flex justify-between text-white border-t border-white/10 pt-1"><span>TOTAL TO PAY</span><span>{isPrivate?'***':fmt$(tm.pay+tm.bonus)}</span></div>
                                </div>
                                <button onClick={()=>{const msg=`Hi ${tm.name}! 💵 Your Elevore payroll:\n\nJobs: ${tm.jobs}\nBase: ${fmt$(tm.pay)}\nBonus: +${fmt$(tm.bonus)}\n✅ TOTAL: ${fmt$(tm.pay+tm.bonus)}\n\nThanks for your hard work! 🌟`;window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');}} className="w-full py-3 bg-green-600/20 text-green-400 rounded-xl font-black uppercase text-[8px] active:scale-95">📲 Send Pay Stub via WA</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── MAP DE ZONAS ── */}
                {view==='map'&&(
                    <div className="space-y-4 animate-in fade-in pb-24">
                        <div className="g p-5 border-t-4 border-blue-500">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">📍 Zone Intelligence Map</p>
                            <p className="text-[8px] text-slate-600 italic">Job concentration by area — target your marketing</p>
                        </div>
                        <div className="g overflow-hidden" style={{height:'320px'}}>
                            <iframe
                                src={`https://maps.google.com/maps?q=${encodeURIComponent('Orlando, FL')}&t=&z=11&ie=UTF8&iwloc=&output=embed`}
                                className="w-full h-full border-0 rounded-2xl"
                                title="Zone Map"
                            />
                        </div>
                        <div className="g p-5 space-y-2">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">📋 Job Addresses</p>
                            {jobs.slice(0,15).map(j=>(
                                <button key={j.id} onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.address)}`)} className="w-full flex justify-between items-center py-2 px-3 bg-white/5 rounded-xl border border-white/5 active:scale-95">
                                    <div className="text-left"><p className="text-[9px] font-black text-white uppercase truncate w-48">{j.client_name}</p><p className="text-[7px] text-slate-500 truncate w-48">{j.address}</p></div>
                                    <span className={`text-[7px] font-black px-2 py-1 rounded-lg ${j.status==='paid'?'bg-blue-600/30 text-blue-400':'bg-amber-500/20 text-amber-400'}`}>{j.status}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── DRIVE ── */}
                {view==='drive'&&(
                    <div className="space-y-4 animate-in fade-in pb-24">
                        <div className="g p-5 border-t-4 border-blue-500">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">📁 Photo Evidence Drive</p>
                            <p className="text-[8px] text-slate-600 font-black italic">Before & after documentation for every mission</p>
                        </div>
                        {jobs.map(job=>{
                            const hasPh=(job.before_photos?.length||0)+(job.after_photos?.length||0)>0;
                            if(!hasPh) return null;
                            return(
                                <div key={job.id} className="g p-5 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div><h3 className="text-base font-black uppercase italic text-white">{job.client_name}</h3><p className="text-[8px] text-slate-500 uppercase">{job.service_type} • {fmtDate(job.scheduled_date)}</p></div>
                                        {/* QR for this job portal */}
                                        <QRCode url={`${window.location.origin}${window.location.pathname}?mision=${job.id}`} size={50}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {job.before_photos?.length>0&&<div className="g p-3"><PhotoDrive photos={job.before_photos} label="📸 Before" onAdd={async url=>{const c=job.before_photos||[];await sb.from('elevore_missions').update({before_photos:[...c,url]}).eq('id',job.id);showToast("Added ✓");refresh();}}/></div>}
                                        {job.after_photos?.length>0&&<div className="g p-3"><PhotoDrive photos={job.after_photos} label="✨ After" onAdd={async url=>{const c=job.after_photos||[];await sb.from('elevore_missions').update({after_photos:[...c,url]}).eq('id',job.id);showToast("Added ✓");refresh();}}/></div>}
                                    </div>
                                </div>
                            );
                        })}
                        {/* Jobs without photos */}
                        {jobs.filter(j=>(j.before_photos?.length||0)===0&&(j.after_photos?.length||0)===0).length>0&&(
                            <div className="g p-5">
                                <p className="text-[9px] text-slate-500 uppercase font-black mb-3">Jobs without photos</p>
                                {jobs.filter(j=>(j.before_photos?.length||0)===0&&(j.after_photos?.length||0)===0).map(job=>(
                                    <div key={job.id} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <div><p className="text-[10px] font-black text-white uppercase">{job.client_name}</p><p className="text-[8px] text-slate-500">{job.service_type}</p></div>
                                        <button onClick={async()=>{const url=prompt("Before photo link:");if(url){await sb.from('elevore_missions').update({before_photos:[url]}).eq('id',job.id);showToast("Added ✓");refresh();}}} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-xl text-[7px] font-black uppercase active:scale-95">+ Photo</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── SUPPORT ── */}
                {view==='support'&&(
                    <div className="space-y-4 animate-in fade-in pb-24">
                        <div className="g p-5 border-t-4 border-red-600">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">🚨 Field Support Alerts</p>
                            <p className="text-[8px] text-slate-600 font-black italic">Manage incidents and supply requests from staff</p>
                        </div>
                        {reports.length===0&&<div className="g p-10 text-center text-slate-500 font-black italic uppercase">No active reports.</div>}
                        {reports.map(rep=>(
                            <div key={rep.id} className={`g p-5 border-l-4 ${rep.status==='open'?'border-red-600':'border-slate-700 opacity-60'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${rep.type==='incident'?'bg-red-600 text-white':'bg-amber-500 text-black'}`}>{rep.type}</span>
                                            <span className="text-[7px] text-slate-500 font-black uppercase">{new Date(rep.created_at).toLocaleString()}</span>
                                        </div>
                                        <p className="text-[10px] font-black text-white uppercase mt-2">From: {rep.staff_name}</p>
                                    </div>
                                    {rep.status==='open' && (
                                        <button onClick={async()=>{
                                            await sb.from('elevore_reports').update({status:'resolved'}).eq('id',rep.id);
                                            showToast("Report resolved ✓");
                                            refresh();
                                        }} className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-xl text-[7px] font-black uppercase active:scale-95">Resolve</button>
                                    )}
                                </div>
                                <div className="bg-black/40 p-3 rounded-xl">
                                    <p className="text-[10px] text-slate-300 font-black italic">"{rep.description}"</p>
                                </div>
                                {rep.job_id && (
                                    <p className="text-[7px] text-slate-500 font-black uppercase mt-2">Related to Mission: {jobs.find(j=>j.id===rep.job_id)?.client_name || 'Unknown'}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ── TEAM ── */}
                {view==='team'&&(
                    <div className="space-y-4 animate-in fade-in pb-24">
                        <div className="g p-5 border-t-4 border-blue-500">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">👥 Team Roster</p>
                            <p className="text-[8px] text-slate-600 font-black italic">Manage your employees and contractors</p>
                        </div>
                        
                        {/* Add Staff Form */}
                        <div className="g p-5 space-y-3 border border-white/5">
                            <p className="text-[9px] font-black text-white uppercase mb-2">Add New Member</p>
                            <div className="flex gap-2">
                                <input type="text" id="staff_name" placeholder="Name" className="inp flex-1 text-[10px] uppercase"/>
                                <input type="text" id="staff_phone" placeholder="Phone" className="inp flex-1 text-[10px] uppercase"/>
                                <input type="text" id="staff_pin" placeholder="PIN" className="inp w-20 text-[10px] text-center"/>
                                <button onClick={async()=>{
                                    const n = document.getElementById('staff_name')?.value;
                                    const p = document.getElementById('staff_phone')?.value;
                                    const pin = document.getElementById('staff_pin')?.value;
                                    if(!n || !pin) return showToast("Name & PIN required",'red');
                                    setLoading(true);
                                    try {
                                        const {error} = await sb.from('elevore_staff').insert({name:n, phone:p, pin:pin});
                                        if(error) throw error;
                                        showToast("Staff added! ✓");
                                        document.getElementById('staff_name').value='';
                                        document.getElementById('staff_phone').value='';
                                        document.getElementById('staff_pin').value='';
                                        refresh();
                                    } catch(e) {
                                        showToast(e.message || "Check your Supabase table",'red');
                                    } finally {
                                        setLoading(false);
                                    }
                                }} className="px-4 bg-blue-600 text-white rounded-xl font-black text-lg active:scale-95 shadow-lg shadow-blue-900/40">+</button>
                            </div>
                        </div>

                        {staffList.length===0&&<div className="g p-10 text-center text-slate-500 font-black italic uppercase">No staff members yet.</div>}
                        <div className="grid gap-3">
                            {staffList.map(s=>(
                                <div key={s.id} className="g p-4 flex justify-between items-center border border-white/5">
                                    <div>
                                        <h3 className="text-sm font-black uppercase italic text-white">{s.name}</h3>
                                        <div className="flex gap-2 items-center">
                                            <p className="text-[8px] text-slate-500 font-black uppercase">{s.phone || 'No phone'}</p>
                                            <span className="text-[7px] bg-white/10 px-1.5 py-0.5 rounded text-amber-500 font-black">PIN: {s.pin}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={()=>window.open(`https://wa.me/${s.phone?.replace(/\D/g,'')}`)} className="p-2 bg-green-600/20 text-green-400 rounded-lg active:scale-95">💬</button>
                                        <button onClick={async()=>{
                                            if(confirm(`Remove ${s.name}?`)){
                                                await sb.from('elevore_staff').delete().eq('id',s.id);
                                                showToast("Member removed");
                                                refresh();
                                            }
                                        }} className="p-2 bg-red-900/30 text-red-500 rounded-lg active:scale-95">🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── DEPLOY ── */}
                {view==='deploy'&&(
                    <div className="space-y-5 animate-in zoom-in-95 pb-32">
                        <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                            {['identity','specs','add-ons','money'].map(t=>(
                                <button key={t} onClick={()=>setDeployTab(t)} className={`flex-1 py-2.5 rounded-xl text-[8px] uppercase font-black transition-all active:scale-95 ${deployTab===t?'tab-on':'text-slate-500'}`}>{t}</button>
                            ))}
                        </div>

                        <div className="g p-6 space-y-5 shadow-xl">
                            {deployTab==='identity'&&(
                                <div className="space-y-3 animate-in fade-in">
                                    <h3 className="text-[10px] uppercase text-amber-500 font-black italic tracking-widest border-b border-white/5 pb-2">Identity Matrix</h3>
                                    <input type="text" placeholder="CLIENT FULL NAME" value={state.name} className="inp uppercase" onChange={e=>onNameChange(e.target.value)}/>
                                    <input type="text" placeholder="PHONE NUMBER" value={state.phone} className="inp" onChange={e=>setState({...state,phone:e.target.value})}/>
                                    <input type="text" placeholder="FULL STREET ADDRESS" value={state.address} className="inp uppercase text-xs" onChange={e=>setState({...state,address:e.target.value})}/>
                                    <input type="text" placeholder="AUDIT PHOTOS LINK (optional)" value={state.audit_link} className="inp text-blue-400 text-xs" onChange={e=>setState({...state,audit_link:e.target.value})}/>
                                    <textarea placeholder="INTERNAL NOTES (Admin only)..." value={state.notes} className="inp text-sm resize-none h-16" onChange={e=>setState({...state,notes:e.target.value})}/>
                                    <textarea placeholder="CLIENT PULSE (Preferences for Staff)..." value={state.preferences} className="inp text-sm resize-none h-16 border-amber-500/30" onChange={e=>setState({...state,preferences:e.target.value})}/>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['lead','scheduled','paid'].map(s=>(
                                            <button key={s} onClick={()=>setState({...state,status:s})} className={`py-3 rounded-xl text-[8px] uppercase font-black border-2 active:scale-95 ${state.status===s?'bg-amber-500 text-black border-amber-500 shadow-lg':'bg-white/5 border-white/5 text-slate-500'}`}>{s}</button>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-slate-500 uppercase font-black mb-2">Frequency (auto next-visit)</p>
                                        <div className="grid grid-cols-4 gap-1">
                                            {[{l:'1x',v:'one-time'},{l:'Weekly',v:'weekly'},{l:'Bi-W',v:'bi-weekly'},{l:'Monthly',v:'monthly'}].map(f=>(
                                                <button key={f.v} onClick={()=>setState({...state,frequency:f.v})} className={`py-2.5 rounded-xl text-[7px] font-black border-2 active:scale-95 ${state.frequency===f.v?'bg-blue-600 border-blue-600 text-white':'bg-white/5 border-white/5 text-slate-500'}`}>{f.l}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[8px] text-slate-500 uppercase font-black mb-2">Quote Urgency (hours)</p>
                                        <div className="grid grid-cols-4 gap-1">
                                            {[{l:'6h',v:6},{l:'12h',v:12},{l:'24h',v:24},{l:'48h',v:48}].map(u=>(
                                                <button key={u.v} onClick={()=>setState({...state,urgencyHours:u.v})} className={`py-2.5 rounded-xl text-[7px] font-black border-2 active:scale-95 ${state.urgencyHours===u.v?'bg-red-600 border-red-600 text-white':'bg-white/5 border-white/5 text-slate-500'}`}>{u.l}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {deployTab==='specs'&&(
                                <div className="space-y-4 animate-in fade-in duration-300 text-center font-black uppercase">
                                    <div className="grid grid-cols-5 gap-1">
                                        {['regular','deep','moveout','postcon','handyman'].map(s=>(
                                            <button key={s} onClick={()=>setState({...state,svc:s,selectedQuickJobs:[]})} className={`py-3 rounded-xl font-black text-[7px] border-2 active:scale-95 ${state.svc===s?'bg-green-600 border-green-600 text-white shadow-lg':'bg-white/5 border-white/5 text-slate-500'}`}>{s==='handyman'?'🛠️':s}</button>
                                        ))}
                                    </div>
                                    {state.svc==='handyman'?(
                                        <div className="space-y-4 text-left">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <p className="text-[9px] text-amber-500 uppercase font-black mb-2 text-center">Labor Hours × $85/hr</p>
                                                <div className="flex justify-between items-center max-w-[180px] mx-auto">
                                                    <button onClick={()=>setState({...state,laborHours:Math.max(1,state.laborHours-1)})} className="w-10 h-10 bg-white/10 rounded-xl text-xl font-bold text-white active:scale-95">-</button>
                                                    <span className="text-3xl font-black italic text-white">{state.laborHours}h</span>
                                                    <button onClick={()=>setState({...state,laborHours:state.laborHours+1})} className="w-10 h-10 bg-white/10 rounded-xl text-xl font-bold text-white active:scale-95">+</button>
                                                </div>
                                                <p className="text-[8px] text-slate-500 mt-1 font-black italic text-center">Labor: {fmt$(state.laborHours*85)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-500 uppercase font-black mb-2">Handyman Estimator Pro</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {QUICK_JOBS.map(q=>{const sel=state.selectedQuickJobs.includes(q.id);return(
                                                        <button key={q.id} onClick={()=>setState(s=>({...s,selectedQuickJobs:sel?s.selectedQuickJobs.filter(x=>x!==q.id):[...s.selectedQuickJobs,q.id]}))}
                                                            className={`p-2.5 rounded-xl border text-[8px] font-black active:scale-95 flex justify-between ${sel?'bg-green-600 border-green-600 text-white':'bg-white/5 border-white/10 text-slate-400'}`}>
                                                            <span>{q.label}</span><span>{fmt$(q.p)}</span>
                                                        </button>
                                                    );})}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-500 uppercase font-black mb-2">Materials ($) — Tiered Markup</p>
                                                <input type="number" placeholder="0" value={state.materialCost||''} className="inp text-blue-400 text-center font-black" onChange={e=>setState({...state,materialCost:parseFloat(e.target.value)||0})}/>
                                                {state.materialCost>0&&<p className="text-[7px] text-slate-500 text-center mt-1 font-black italic">Billed: {fmt$(state.materialCost*(state.materialCost<50?1.4:state.materialCost<200?1.3:1.2))} ({state.materialCost<50?'40%':state.materialCost<200?'30%':'20%'} markup)</p>}
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-slate-500 uppercase font-black mb-2">Risk Margin</p>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {RISK_P.map(r=>(
                                                        <button key={r.v} onClick={()=>setState({...state,riskMargin:r.v})} className={`py-2 rounded-xl text-[7px] font-black border-2 active:scale-95 ${state.riskMargin===r.v?'bg-orange-500 border-orange-500 text-white':'bg-white/5 border-white/5 text-slate-500'}`}>{r.label}{r.v>0?` +$${r.v}`:''}</button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-[8px] font-black uppercase space-y-1">
                                                <div className="flex justify-between text-slate-400"><span>Labor</span><span>{fmt$(pricing.labor)}</span></div>
                                                <div className="flex justify-between text-slate-400"><span>Quick Jobs</span><span>{fmt$(pricing.quick)}</span></div>
                                                <div className="flex justify-between text-slate-400"><span>Materials</span><span>{fmt$(pricing.mats)}</span></div>
                                                <div className="flex justify-between text-slate-400"><span>Risk</span><span>+{fmt$(state.riskMargin)}</span></div>
                                                <div className="flex justify-between text-white border-t border-white/10 pt-1"><span>Total</span><span>{fmt$(pricing.total)}</span></div>
                                            </div>
                                        </div>
                                    ):state.svc==='postcon'?(
                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[9px] text-amber-500 uppercase font-black mb-2">SqFt Area</p>
                                            <input type="number" value={state.sqft} className="bg-transparent text-6xl font-black text-center w-full text-white outline-none italic leading-none" onChange={e=>setState({...state,sqft:parseInt(e.target.value)||0})}/>
                                        </div>
                                    ):(
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                {[{l:'Beds',k:'beds'},{l:'Baths',k:'baths'},{l:'Living',k:'living'},{l:'Laundry',k:'laundryRoom'}].map(i=>(
                                                    <div key={i.k} className="bg-white/5 p-3 rounded-xl text-center border border-white/5">
                                                        <span className="text-[8px] uppercase block mb-1.5 text-slate-400 font-black">{i.l}</span>
                                                        <div className="flex justify-between items-center">
                                                            <button onClick={()=>setState({...state,[i.k]:Math.max(0,state[i.k]-1)})} className="w-8 h-8 bg-white/10 rounded-lg text-white font-bold active:scale-95">-</button>
                                                            <span className="text-xl font-black italic text-white">{state[i.k]}</span>
                                                            <button onClick={()=>setState({...state,[i.k]:state[i.k]+1})} className="w-8 h-8 bg-white/10 rounded-lg text-white font-bold active:scale-95">+</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5">
                                                {[{l:'Tidy',v:0.9},{l:'Avg',v:1},{l:'Heavy',v:1.5},{l:'Ext',v:2.1}].map(c=>(
                                                    <button key={c.l} onClick={()=>setState({...state,complexity:c.v})} className={`py-2 rounded-xl text-[7px] font-black border-2 active:scale-95 ${state.complexity===c.v?'bg-orange-500 border-orange-500 text-white':'bg-white/5 border-white/5 text-slate-500'}`}>{c.l}</button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {deployTab==='add-ons'&&(
                                <div className="space-y-4 animate-in fade-in">
                                    {state.svc==='handyman'?(
                                        <div className="p-8 text-center text-slate-500 font-black italic border-2 border-dashed border-white/5 rounded-2xl">🛠️ Handyman: time & materials only.</div>
                                    ):(
                                        <React.Fragment>
                                            <h3 className="text-[9px] uppercase text-amber-500 italic font-black text-center border-b border-white/5 pb-2">Premium Matrix</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ADDONS.map(ex=>(
                                                    <button key={ex.id} onClick={()=>setState({...state,[ex.id]:!state[ex.id]})}
                                                        className={`p-3.5 rounded-xl flex justify-between items-center border active:scale-95 ${state[ex.id]?'bg-green-600 border-green-600 text-white font-black shadow-lg':'bg-white/5 border-white/5 text-slate-500'}`}>
                                                        <span className="text-[9px] uppercase font-black">{ex.label}</span>
                                                        <span className="text-[9px] font-black">+${ex.p}</span>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 text-center space-y-3">
                                                <span className="text-[9px] uppercase italic text-amber-500 font-black tracking-widest">Laundry Loads</span>
                                                <div className="flex justify-between items-center max-w-[140px] mx-auto">
                                                    <button onClick={()=>setState({...state,laundryLoads:Math.max(0,state.laundryLoads-1)})} className="w-11 h-11 bg-amber-500 text-black rounded-xl text-xl font-bold active:scale-95">-</button>
                                                    <span className="text-3xl font-black italic text-white">{state.laundryLoads}</span>
                                                    <button onClick={()=>setState({...state,laundryLoads:state.laundryLoads+1})} className="w-11 h-11 bg-amber-500 text-black rounded-xl text-xl font-bold active:scale-95">+</button>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    )}
                                </div>
                            )}

                            {deployTab==='money'&&(
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="grid grid-cols-2 gap-3 text-center font-black uppercase">
                                        <div className="space-y-1"><p className="text-[8px] text-slate-500">Expenses ($)</p><input type="number" value={state.expenses} className="inp text-orange-400 text-center" onChange={e=>setState({...state,expenses:parseFloat(e.target.value)||0})}/></div>
                                        <div className="space-y-1"><p className="text-[8px] text-slate-500">Discount (%)</p>
                                            <select value={state.discount} className="inp text-red-500 font-black text-center text-sm appearance-none" onChange={e=>setState({...state,discount:parseInt(e.target.value)})}>
                                                <option value="0">0%</option><option value="10">10%</option><option value="20">20%</option><option value="30">30%</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3 border-t border-white/5 pt-3">
                                        <select value={state.team} className="inp text-xs text-center font-black uppercase" onChange={e=>setState({...state,team:e.target.value})}>
                                            <option value="">Select Team Member...</option>
                                            {staffList.map(s=>(
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                            <option value="Team Alpha">Team Alpha</option>
                                            <option value="Team Beta">Team Beta</option>
                                            <option value="Jose Mario">Jose Mario (CEO)</option>
                                        </select>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1"><p className="text-[8px] text-slate-500 uppercase font-black">Date</p><input type="date" value={state.date} className="inp text-[10px] font-black" onChange={e=>setState({...state,date:e.target.value})}/></div>
                                            <div className="space-y-1"><p className="text-[8px] text-slate-500 uppercase font-black">Deposit ($)</p><input type="number" placeholder="0" value={state.deposit} className="inp text-blue-400 font-black text-center" onChange={e=>setState({...state,deposit:parseFloat(e.target.value)||0})}/></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price card */}
                        <div className="bg-white text-black p-8 rounded-[3rem] text-center shadow-2xl relative overflow-hidden active:scale-95 transition-all">
                            <div className="absolute top-0 left-0 w-full h-2 bg-green-500 animate-pulse"></div>
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deployment Value</p>
                                <span className={`text-[8px] font-black px-3 py-1 rounded-lg border ${pricing.ac} border-current`}>{pricing.advice}</span>
                            </div>
                            <h4 className="text-[6rem] font-black italic tracking-tighter leading-none mb-5 text-black">
                                <span className="text-3xl align-top mr-1 font-light opacity-30">$</span>{state.totalPrice}
                            </h4>
                            {/* Real profit preview */}
                            {state.deposit>0&&(
                                <p className="text-[9px] text-slate-400 font-black italic mb-4">Your pocket after deposit: {fmt$(Math.round(state.deposit-(state.deposit*STAFF_PAY)-(state.expenses||0)))}</p>
                            )}
                            <button onClick={deploy} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-lg uppercase italic active:scale-90 transition-all shadow-xl shadow-green-500/20">
                                {editId?'Update Mission ⚡':'Execute Deploy 🚀'}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg g p-2 flex justify-around items-center border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,1)] z-[1000] overflow-x-auto no-sb">
                {[{v:'brief',icon:Sun,c:'amber'},{v:'intel',icon:BarChart2,c:'green'},{v:'agenda',icon:ShieldCheck,c:'blue'},{v:'clients',icon:Users,c:'purple'},{v:'mrr',icon:TrendingUp,c:'green'},{v:'payroll',icon:DollarSign,c:'yellow'},{v:'map',icon:MapPin,c:'cyan'},{v:'deploy',icon:Zap,c:'amber'}].map(({v,icon:Icon,c})=>(
                    <button key={v} onClick={()=>{if(v==='deploy'){setEditId(null);setState(INITIAL);setView('deploy');setDeployTab('identity');}else setView(v);}}
                        className={`p-2 rounded-xl flex-shrink-0 flex flex-col items-center gap-0.5 transition-all ${view===v?`text-${c}-400 bg-white/5`:'text-slate-600'}`}>
                        <Icon className="w-4 h-4"/>
                        <span className="text-[5px] font-black uppercase">{v==='deploy'?'New':v==='brief'?'AM':v}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

export default App;
