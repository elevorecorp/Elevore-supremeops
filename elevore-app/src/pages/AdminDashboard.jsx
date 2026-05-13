import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { 
    Sun, BarChart2, ShieldCheck, Users, Zap, FileText, Edit3, Trash2, 
    MessageCircle, TrendingUp, DollarSign, MapPin, Package, ShieldAlert,
    CreditCard, Globe, AlertTriangle, Users2, Image as ImageIcon,
    Star, Check, ArrowLeft, Play, Square, LogOut
} from 'lucide-react';
import { fmt$, fmtDate, clientLevel, daysAgo } from '../lib/helpers';
import { 
    INITIAL, MONTHLY_GOAL, QUICK_JOBS, RISK_P, ADDONS, CHECKLIST, GOOGLE_LINK 
} from '../lib/constants';
import PhotoDrive from '../components/ui/PhotoDrive';
import BarChart from '../components/ui/BarChart';
import QRCode from '../components/ui/QRCode';

function ChatModal() {
    const { chatJob, setChatJob, chatLog, setChatLog, log } = useElevore();
    const [chatMsg, setChatMsg] = React.useState('');

    const send = () => {
        if (!chatMsg.trim()) return;
        const p = chatJob.client_phone?.replace(/\D/g, '') || '';
        const ph = p.length === 10 ? '1' + p : p;
        window.open(`https://wa.me/${ph}?text=${encodeURIComponent(chatMsg)}`, '_blank');
        setChatLog(l => [...l, { from: 'admin', m: chatMsg, time: new Date().toLocaleTimeString() }]);
        setChatMsg('');
        log(`Chat → ${chatJob.client_name}`);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[400] flex items-end p-4 animate-in fade-in" onClick={e => e.target === e.currentTarget && setChatJob(null)}>
            <div className="g p-6 w-full max-w-md space-y-4 border-t-4 border-green-500 mx-auto animate-in slide-in-from-bottom-10 shadow-[0_0_50px_rgba(34,197,94,0.15)]">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-2"><MessageCircle className="w-4 h-4"/> {chatJob?.client_name}</p>
                    <button onClick={() => setChatJob(null)} className="active:scale-95 text-slate-500 hover:text-white transition-all"><span className="text-[10px] uppercase font-black tracking-widest">Close X</span></button>
                </div>
                <div className="h-32 overflow-y-auto space-y-2 no-sb">
                    {chatLog.length === 0 && <p className="text-[9px] text-slate-600 italic text-center py-4 uppercase font-black">No messages yet.</p>}
                    {chatLog.map((m, i) => (
                        <div key={i} className="p-3 rounded-xl text-[10px] font-black bg-green-900/30 text-green-400 ml-8 border border-green-500/20">
                            <p className="leading-snug">{m.m}</p>
                            <p className="text-[7px] text-slate-500 mt-1 uppercase text-right">{m.time}</p>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        ['✅ Confirm', 'confirm'],
                        ['🔔 Remind', 'reminder'],
                        ['⭐ Review', 'review'],
                        ['📋 Quote', 'quote']
                    ].map(([l, type]) => (
                        <button key={type} onClick={() => {
                            const msgs = {
                                confirm: `Hi ${chatJob.client_name}! ✨ Elevore confirming service ${fmtDate(chatJob.scheduled_date)}.`,
                                reminder: `Hi ${chatJob.client_name}! 🔔 Service ${fmtDate(chatJob.scheduled_date)}.`,
                                review: `Hi ${chatJob.client_name}! 🌟 Review: ${GOOGLE_LINK}`,
                                quote: `Hi ${chatJob.client_name}! Portal: ${window.location.origin}${window.location.pathname}?mision=${chatJob.id}`
                            };
                            setChatMsg(msgs[type]);
                        }} className="py-2 bg-white/5 text-slate-400 rounded-xl text-[8px] font-black uppercase active:scale-95 border border-white/5 hover:bg-white/10 transition-all">{l}</button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <textarea value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type AI message..." className="inp text-sm resize-none h-16 flex-1 bg-[#0d1117]" />
                    <button onClick={send} className="bg-green-600 text-white px-5 rounded-xl font-black active:scale-95 hover:bg-green-500 transition-all flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <Zap className="w-5 h-5" />
                        <span className="text-[7px] uppercase tracking-widest">Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { 
        view, setView, role, setRole, jobs, clients, loading, isPrivate, setIsPrivate,
        editId, setEditId, deployTab, setDeployTab, filterSt, setFilterSt, searchQ, setSearchQ,
        toast, showToast, activeStaff, setActiveStaff, quickMode, setQuickMode, selJob, setSelJob,
        state, setState, activityLog, log, refresh, onNameChange, pricing, deploy, 
        quickDeploy, realProfit, finance, clientDNA, todayStr, filtered, 
        mrr, payrollSheet, sendWA, printInvoice, exportCSV, staffList, reports,
        lang, setLang, t, chatJob, setChatJob, chatLog, setChatLog
    } = useElevore();

    return (
        <div className="min-h-screen bg-[#020203] text-white selection:bg-amber-500 selection:text-black">
            {toast && <div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color === 'red' ? 'bg-red-600' : 'bg-green-600'} text-white border border-white/10 animate-in slide-in-from-top-full duration-300`}>{toast.msg}</div>}
            {chatJob && <ChatModal />}
            
            {loading && (
                <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center backdrop-blur-md">
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_40px_rgba(245,158,11,0.2)]"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 animate-pulse">{t.syncing}</p>
                    </div>
                </div>
            )}

            {/* TOP NAV / STATUS BAR */}
            <header className="sticky top-0 z-[100] bg-[#020203]/40 backdrop-blur-2xl border-b border-white/5 px-6 py-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center font-black italic text-black text-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">E</div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tighter leading-none">Elevore <span className="text-amber-500 italic">Empire</span></h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="dot-g"/>
                            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.2em]">Quantum Link Active</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={() => setLang(l => l === 'en' ? 'es' : 'en')} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"><Globe className="w-4 h-4" /></button>
                    <button onClick={() => setIsPrivate(p => !p)} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-amber-500 hover:bg-white/10 transition-all active:scale-90">{isPrivate ? <Zap className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}</button>
                    <button onClick={() => sb.auth.signOut().then(() => window.location.reload())} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"><LogOut className="w-4 h-4" /></button>
                </div>
            </header>

            <main className="p-5 max-w-lg mx-auto">
                {/* ── VIEWS ── */}
                {view === 'brief' && <MorningBriefView />}
                {view === 'intel' && <IntelView />}
                {view === 'agenda' && <AgendaView />}
                {view === 'clients' && <ClientsView />}
                {view === 'mrr' && <MRRView />}
                {view === 'payroll' && <PayrollView />}
                {view === 'map' && <MapView />}
                {view === 'drive' && <DriveView />}
                {view === 'support' && <SupportView />}
                {view === 'team' && <TeamView />}
                {view === 'deploy' && <DeployView />}
            </main>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg g p-2 flex justify-around items-center border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,1)] z-[1000] overflow-x-auto no-sb">
                {[{ v: 'brief', icon: Sun, c: 'amber' }, { v: 'intel', icon: BarChart2, c: 'green' }, { v: 'agenda', icon: ShieldCheck, c: 'blue' }, { v: 'clients', icon: Users, c: 'purple' }, { v: 'mrr', icon: TrendingUp, c: 'green' }, { v: 'payroll', icon: DollarSign, c: 'yellow' }, { v: 'map', icon: MapPin, c: 'cyan' }, { v: 'deploy', icon: Zap, c: 'amber' }].map(({ v, icon: Icon, c }) => (
                    <button key={v} onClick={() => { if (v === 'deploy') { setEditId(null); setState(INITIAL); setView('deploy'); setDeployTab('identity'); } else setView(v); }}
                        className={`p-2 rounded-xl flex-shrink-0 flex flex-col items-center gap-0.5 transition-all ${view === v ? `text-${c}-400 bg-white/5` : 'text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-[5px] font-black uppercase">{v === 'deploy' ? 'New' : v === 'brief' ? 'AM' : v}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

// ── SUB-VIEWS ──

function MorningBriefView() {
    const { jobs, todayStr, finance, sendWA, setView, isPrivate, t } = useElevore();
    const todayJobs = (jobs || []).filter(j => j.scheduled_date === todayStr);
    
    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-24">
            <div className="text-center space-y-2 py-4">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Morning Briefing</p>
                <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Today's <span className="text-amber-500">Strike</span></h2>
                <p className="text-[9px] text-slate-500 font-bold uppercase">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="g p-6 bg-green-500/5 border border-green-500/20">
                    <p className="text-[8px] font-black text-green-500 uppercase mb-1">Missions Today</p>
                    <p className="text-3xl font-black italic text-white">{todayJobs.length}</p>
                </div>
                <div className="g p-6 bg-blue-500/5 border border-blue-500/20">
                    <p className="text-[8px] font-black text-blue-500 uppercase mb-1">Projected Rev</p>
                    <p className="text-3xl font-black italic text-white">{isPrivate ? '***' : fmt$(todayJobs.reduce((a, b) => a + (b.total_price || 0), 0))}</p>
                </div>
            </div>

            {/* NEW: Fleet Status Widget */}
            <div className="g p-4 flex justify-between items-center border border-white/5 bg-black/20 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fleet Status</p>
                        <p className="text-sm font-black text-white uppercase tracking-wider">Optimal <span className="text-green-500 text-[8px] ml-1 align-middle">● LIVE</span></p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Units</p>
                    <p className="text-2xl font-black italic text-white leading-none">{todayJobs.filter(j => j.status === 'in_progress').length}</p>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Active Queue</p>
                {todayJobs.map(j => (
                    <div key={j.id} className="g p-5 border-l-4 border-amber-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-black text-white uppercase">{j.client_name}</p>
                            <p className="text-[8px] text-slate-500 uppercase font-black">{j.service_type} • {j.team_assigned || 'TBD'}</p>
                        </div>
                        <button onClick={() => sendWA(j, 'confirm')} className="p-2 bg-amber-500/10 text-amber-500 rounded-lg active:scale-90">✅</button>
                    </div>
                ))}
                {todayJobs.length === 0 && <p className="text-center py-10 text-slate-600 font-black italic uppercase text-[10px]">No missions scheduled for today.</p>}
            </div>
        </div>
    );
}

function IntelView() {
    const { finance, sendWA, isPrivate, t } = useElevore();
    if (!finance) return null;
    const { churn = [], coldLeads = [], retDue = [], projection = 0, progress = 0 } = finance;

    return (
        <div className="space-y-6 animate-in zoom-in-95 pb-24">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em]">Retention Matrix</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">Revenue <span className="text-green-500">Radar</span></h2>
            </div>

            <div className="g p-6 border-t-4 border-green-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-20 h-20 text-white" /></div>
                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Monthly Projection</p>
                <h3 className="text-4xl font-black italic text-white">{isPrivate ? '***' : fmt$(projection)}</h3>
                <div className="pb mt-4"><div className="pf" style={{ width: `${progress}%` }}></div></div>
                <p className="text-[8px] text-slate-500 font-black uppercase mt-2">{Math.round(progress)}% of Monthly Goal reached</p>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert className="w-3 h-3"/> Churn Risk (Inactive 45+ days)</p>
                    <span className="text-[10px] font-black text-white bg-red-500/20 px-2 py-0.5 rounded-full">{churn.length}</span>
                </div>
                {churn.length === 0 && <p className="text-center py-6 text-slate-700 font-black italic uppercase text-[8px]">No churn risk detected ✓</p>}
                {churn.map(c => (
                    <div key={c.name} className="g p-5 border-l-4 border-red-500 flex justify-between items-center bg-red-500/5">
                        <div>
                            <p className="text-sm font-black text-white uppercase">{c.name}</p>
                            <p className="text-[8px] text-slate-500 uppercase font-black">Last service: {fmtDate(c.last_job_date)}</p>
                        </div>
                        <button onClick={() => sendWA({client_name: c.name, client_phone: c.phone}, 'winback')} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase active:scale-95 shadow-lg shadow-red-900/20">Winback 🎣</button>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3"/> Cold Leads (Unsigned 48h+)</p>
                    <span className="text-[10px] font-black text-white bg-amber-500/20 px-2 py-0.5 rounded-full">{coldLeads.length}</span>
                </div>
                {coldLeads.map(j => (
                    <div key={j.id} className="g p-5 border-l-4 border-amber-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-black text-white uppercase">{j.client_name}</p>
                            <p className="text-[8px] text-slate-500 uppercase font-black">Quote: {fmt$(j.total_price)} • {daysAgo(j.created_at)} days ago</p>
                        </div>
                        <button onClick={() => sendWA(j, 'urgency')} className="px-4 py-2 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase active:scale-95">Follow up ⏰</button>
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Package className="w-3 h-3"/> Retention Due</p>
                    <span className="text-[10px] font-black text-white bg-blue-500/20 px-2 py-0.5 rounded-full">{retDue.length}</span>
                </div>
                {retDue.map(j => (
                    <div key={j.id} className="g p-5 border-l-4 border-blue-500 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-black text-white uppercase">{j.client_name}</p>
                            <p className="text-[8px] text-slate-500 uppercase font-black">Suggested: {fmtDate(j.next_visit)}</p>
                        </div>
                        <button onClick={() => sendWA(j, 'retention')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase active:scale-95">Re-book 🔄</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AgendaView() {
    const { filtered = [], searchQ, setSearchQ, filterSt, setFilterSt, realProfit, calcBonus, clientDNA, isPrivate, sendWA, printInvoice, setEditId, setState, setView, setDeployTab, refresh, log, showToast, t, setChatJob } = useElevore();
    
    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-10 pb-24">
            <input type="text" placeholder="🔍 Search client, address, team..." className="inp" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            <div className="flex gap-1.5 overflow-x-auto no-sb pb-1">
                {['all', 'lead', 'scheduled', 'in_progress', 'completed', 'paid'].map(s => (
                    <button key={s} onClick={() => setFilterSt(s)} className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase whitespace-nowrap active:scale-95 ${filterSt === s ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-500'}`}>{s}</button>
                ))}
            </div>
            {filtered.length === 0 && <div className="g p-10 text-center text-slate-500 font-black italic uppercase">No missions found.</div>}
            {filtered.map(job => {
                const isH = job.service_type === 'handyman';
                const bal = job.total_price - job.deposit_paid;
                const dna = clientDNA[job.client_name];
                const lvl = clientLevel(dna?.count || 0);
                const profit = realProfit(job);
                const bonus = calcBonus(job);
                const hasSig = !!job.approval_signature;
                const hasFinal = !!job.final_signature;
                return (
                    <div key={job.id} className={`g p-5 border-l-[7px] shadow-xl hover:bg-white/[0.02] transition-all ${isH ? 'border-green-500' : job.status === 'paid' ? 'border-blue-500' : job.status === 'in_progress' ? 'border-green-400' : job.status === 'lead' ? 'border-yellow-500' : job.status === 'completed' ? 'border-purple-500' : 'border-amber-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                    <h3 className="text-base font-black uppercase italic text-white leading-none">{job.client_name}</h3>
                                    <span className={`text-[6px] font-black px-2 py-1 rounded-full uppercase ${job.status === 'paid' ? 'bg-blue-600 text-white' : job.status === 'in_progress' ? 'bg-green-600 text-white' : job.status === 'lead' ? 'bg-yellow-500 text-black' : job.status === 'completed' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{job.status}</span>
                                    {isH && <span className="text-[6px] bg-green-600 text-black font-black px-1.5 py-0.5 rounded-full">🛠️</span>}
                                    {lvl.name !== 'Bronze' && <span className="text-[6px] font-black px-1.5 py-0.5 rounded-full" style={{ background: lvl.color, color: '#000' }}>{lvl.name}</span>}
                                    {hasSig && <span className="text-[6px] bg-green-900 text-green-400 font-black px-1.5 py-0.5 rounded-full">✍️</span>}
                                    {hasFinal && <span className="text-[6px] bg-purple-900 text-purple-400 font-black px-1.5 py-0.5 rounded-full">🏁</span>}
                                    {bonus > 0 && <span className="text-[6px] bg-amber-900 text-amber-400 font-black px-1.5 py-0.5 rounded-full">⭐+${bonus}</span>}
                                </div>
                                <p className="text-[8px] text-slate-500 uppercase">{job.service_type} • {fmtDate(job.scheduled_date)} • {job.team_assigned || 'No team'}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl mb-2">
                            <p className="text-[8px] text-slate-400 truncate w-44 italic">{job.address}</p>
                            <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`)} className="text-green-500 text-[7px] font-black uppercase px-2 py-1 bg-green-600/10 rounded-lg active:scale-95">GPS</button>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/5 pt-3">
                            <div>
                                <p className="text-[8px] text-slate-500 italic font-black uppercase">Balance</p>
                                <p className="text-4xl font-black italic tracking-tighter text-white leading-none">{fmt$(bal)}</p>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => setChatJob(job)} className="p-2.5 bg-blue-900/30 text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><MessageCircle className="w-4 h-4" /></button>
                                <button onClick={() => printInvoice(job)} className="p-2.5 bg-slate-800 text-amber-500 rounded-xl hover:scale-110 transition-all"><FileText className="w-4 h-4" /></button>
                                <button onClick={() => { setEditId(job.id); setState({ ...job.specs, totalPrice: job.total_price }); setView('deploy'); setDeployTab('identity'); }} className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-blue-600 transition-all"><Edit3 className="w-4 h-4" /></button>
                                <button onClick={() => { if (confirm("Archive?")) sb.from('elevore_missions').delete().eq('id', job.id).then(() => { showToast("Archived ✓"); log(`Archived: ${job.client_name}`); refresh(); }); }} className="p-2.5 bg-red-900/30 text-red-500 rounded-xl hover:bg-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function DeployView() {
    const { deployTab, setDeployTab, state, setState, onNameChange, deploy, editId, pricing, t } = useElevore();
    
    return (
        <div className="space-y-5 animate-in zoom-in-95 pb-32">
            <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                {['identity', 'specs', 'add-ons', 'money'].map(tab => (
                    <button key={tab} onClick={() => setDeployTab(tab)} className={`flex-1 py-2.5 rounded-xl text-[8px] uppercase font-black transition-all active:scale-95 ${deployTab === tab ? 'tab-on' : 'text-slate-500'}`}>{tab}</button>
                ))}
            </div>

            <div className="g p-6 space-y-5 shadow-xl">
                {deployTab === 'identity' && (
                    <div className="space-y-3 animate-in fade-in">
                        <h3 className="text-[10px] uppercase text-amber-500 font-black italic tracking-widest border-b border-white/5 pb-2">Identity Matrix</h3>
                        <input type="text" placeholder="CLIENT FULL NAME" value={state.name || ''} className="inp uppercase" onChange={e => onNameChange(e.target.value)} />
                        <input type="text" placeholder="PHONE NUMBER" value={state.phone || ''} className="inp" onChange={e => setState({ ...state, phone: e.target.value })} />
                        <input type="text" placeholder="FULL STREET ADDRESS" value={state.address || ''} className="inp uppercase text-xs" onChange={e => setState({ ...state, address: e.target.value })} />
                        <div className="grid grid-cols-3 gap-2">
                            {['lead', 'scheduled', 'paid'].map(s => (
                                <button key={s} onClick={() => setState({ ...state, status: s })} className={`py-3 rounded-xl text-[8px] uppercase font-black border-2 active:scale-95 ${state.status === s ? 'bg-amber-500 text-black border-amber-500 shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                )}
                {deployTab === 'specs' && (
                    <div className="space-y-3 animate-in fade-in">
                        <h3 className="text-[10px] uppercase text-amber-500 font-black italic tracking-widest border-b border-white/5 pb-2">Client Pulse (VIP)</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="text" placeholder="PETS" value={state.pets || ''} className="inp text-[10px]" onChange={e => setState({ ...state, pets: e.target.value })} />
                            <input type="text" placeholder="CODE" value={state.access_code || ''} className="inp text-[10px]" onChange={e => setState({ ...state, access_code: e.target.value })} />
                        </div>
                        <textarea placeholder="SPECIAL INSTRUCTIONS" value={state.preferences || ''} className="inp h-24 text-[10px] resize-none" onChange={e => setState({ ...state, preferences: e.target.value })} />
                    </div>
                )}
                {deployTab === 'add-ons' && (
                    <div className="space-y-3 animate-in fade-in">
                        <h3 className="text-[10px] uppercase text-amber-500 font-black italic tracking-widest border-b border-white/5 pb-2">Extra Services</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {ADDONS.map(a => (
                                <button key={a.id} onClick={() => setState({ ...state, [a.id]: !state[a.id] })} className={`p-3 rounded-xl text-[10px] font-black uppercase text-left transition-all border-2 ${state[a.id] ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                                    <div className="flex justify-between items-center">
                                        <span>{a.label}</span>
                                        {state[a.id] && <Check className="w-3 h-3"/>}
                                    </div>
                                    <p className="text-[8px] mt-1 opacity-70">+${a.p}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {deployTab === 'money' && (
                    <div className="space-y-3 animate-in fade-in">
                        <h3 className="text-[10px] uppercase text-amber-500 font-black italic tracking-widest border-b border-white/5 pb-2">Financials</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[8px] font-black text-slate-500 uppercase ml-2">Discount %</label>
                                <input type="number" placeholder="Discount %" value={state.discount || ''} className="inp mt-1" onChange={e => setState({ ...state, discount: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-slate-500 uppercase ml-2">Deposit Paid $</label>
                                <input type="number" placeholder="Deposit" value={state.deposit || ''} className="inp mt-1" onChange={e => setState({ ...state, deposit: Number(e.target.value) })} />
                            </div>
                        </div>
                    </div>
                )}
                <p className="text-center text-[7px] text-slate-600 font-black uppercase pt-2">Configure mission parameters</p>
            </div>

            <div className="bg-white text-black p-8 rounded-[3rem] text-center shadow-2xl relative overflow-hidden active:scale-95 transition-all">
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500 animate-pulse"></div>
                <h4 className="text-[6rem] font-black italic tracking-tighter leading-none mb-5 text-black">
                    <span className="text-3xl align-top mr-1 font-light opacity-30">$</span>{state.totalPrice || 0}
                </h4>
                <button onClick={deploy} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-lg uppercase italic active:scale-90 transition-all shadow-xl shadow-green-500/20">
                    {editId ? 'Update Mission' : 'Execute Deploy'}
                </button>
            </div>
        </div>
    );
}

function SupportView() {
    const { reports = [], refresh, showToast } = useElevore();
    const solveReport = async (id) => {
        const { error } = await sb.from('elevore_reports').update({ status: 'closed' }).eq('id', id);
        if (!error) { showToast("Report solved! ✓"); refresh(); }
    };
    return (
        <div className="space-y-4 pb-24">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Support & Logistics</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">Command <span className="text-amber-500">Center</span></h2>
            </div>
            {reports.length === 0 && <p className="text-center py-10 text-slate-600 font-black italic uppercase text-[10px]">No active reports.</p>}
            <div className="space-y-3">
                {reports.filter(r => r.status === 'open').map(rep => (
                    <div key={rep.id} className={`g p-5 border-l-4 ${rep.type === 'incident' ? 'border-red-600' : 'border-amber-500'} flex justify-between items-center`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[6px] font-black px-1.5 py-0.5 rounded-full uppercase ${rep.type === 'incident' ? 'bg-red-600 text-white' : 'bg-amber-500 text-black'}`}>{rep.type}</span>
                                <p className="text-[8px] text-slate-500 font-black uppercase">{rep.staff_name} • {new Date(rep.created_at).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm font-black text-white uppercase">{rep.description}</p>
                        </div>
                        <button onClick={() => solveReport(rep.id)} className="p-2 bg-white/10 text-white rounded-lg active:scale-90 hover:bg-green-600 transition-all">✅</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ClientsView() {
    const { clients, clientDNA, sendWA, isPrivate } = useElevore();
    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-24">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Client Database</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">CRM <span className="text-purple-500">Core</span></h2>
            </div>
            {clients.map(c => {
                const dna = clientDNA[c.name] || { score: 0, count: 0, spent: 0 };
                const lvl = clientLevel(dna.count);
                return (
                    <div key={c.name} className="g p-5 flex justify-between items-center border-l-4" style={{ borderColor: lvl.color }}>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase">{c.name}</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[7px] font-black px-2 py-0.5 rounded-full" style={{ background: lvl.color, color: '#000' }}>{lvl.name}</span>
                                <p className="text-[8px] text-slate-500 font-black uppercase">{dna.count} Missions • {isPrivate ? '***' : fmt$(dna.spent)} spent</p>
                            </div>
                        </div>
                        <button onClick={() => sendWA({client_name: c.name, client_phone: c.phone}, 'portal')} className="p-2 bg-white/5 rounded-xl text-purple-500 active:scale-90"><MessageCircle className="w-4 h-4"/></button>
                    </div>
                );
            })}
        </div>
    );
}

function MRRView() {
    const { mrr, isPrivate } = useElevore();
    return (
        <div className="space-y-6 animate-in zoom-in-95 pb-24">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Financial Matrix</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">MRR <span className="text-green-500">Tracker</span></h2>
            </div>
            <div className="g p-8 border-t-4 border-green-500 text-center space-y-2 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-3xl rounded-full"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Recurring Revenue</p>
                <h3 className="text-6xl font-black italic tracking-tighter text-white">{isPrivate ? '***' : fmt$(mrr.monthly)}</h3>
                <p className="text-[8px] text-green-500 font-black uppercase">Projected Annual: {isPrivate ? '***' : fmt$(mrr.annual)}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {Object.entries(mrr.plans).map(([name, count]) => (
                    <div key={name} className="g p-4 text-center border-b-2 border-white/5">
                        <p className="text-[7px] font-black text-slate-500 uppercase mb-1">{name}</p>
                        <p className="text-xl font-black text-white">{count}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PayrollView() {
    const { payrollSheet, isPrivate, showToast } = useElevore();
    return (
        <div className="space-y-4 animate-in slide-in-from-right-10 pb-24">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Operations Cost</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">Team <span className="text-yellow-500">Payroll</span></h2>
            </div>
            {payrollSheet.map(team => (
                <div key={team.name} className="g p-5 border-l-4 border-yellow-500 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Team Unit</p>
                        <h3 className="text-lg font-black text-white uppercase italic">{team.name}</h3>
                        <p className="text-[8px] text-slate-600 font-black uppercase">{team.jobs} Missions Completed</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black text-yellow-500 uppercase mb-1">Payment Due</p>
                        <p className="text-2xl font-black italic text-white">{isPrivate ? '***' : fmt$(team.pay + (team.bonus || 0))}</p>
                        <button onClick={() => showToast("Payment processed (Demo)", "green")} className="mt-2 text-[7px] font-black bg-white/10 px-2 py-1 rounded-full uppercase text-slate-400">Mark as Paid</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

function MapView() {
    const { jobs, todayStr, sendWA } = useElevore();
    const activeJobs = jobs.filter(j => j.scheduled_date === todayStr || j.status === 'in_progress');

    return (
        <div className="space-y-6 animate-in zoom-in-95 pb-24">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Global Positioning</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">Strike <span className="text-cyan-500">Map</span></h2>
            </div>
            
            {/* RADAR ANIMATION */}
            <div className="flex justify-center my-6">
                <div className="relative w-48 h-48 rounded-full border border-cyan-500/30 bg-cyan-900/10 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)]">
                    <div className="absolute w-full h-full border-2 border-cyan-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute w-3/4 h-3/4 border border-cyan-500/20 rounded-full"></div>
                    <div className="absolute w-1/2 h-1/2 border border-cyan-500/20 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent origin-left animate-spin" style={{ animationDuration: '4s' }}></div>
                    <MapPin className="text-cyan-400 w-8 h-8 z-10" />
                    {activeJobs.slice(0, 4).map((_, i) => (
                        <div key={i} className="absolute w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]" style={{ top: `${20 + i*15}%`, left: `${30 + i*20}%` }}></div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Active Coordinates ({activeJobs.length})</p>
                {activeJobs.length === 0 && <p className="text-center py-6 text-slate-600 font-black italic uppercase text-[10px]">No active signals detected today.</p>}
                
                {activeJobs.map(job => (
                    <div key={job.id} className="g p-5 border-l-4 border-cyan-500 flex flex-col gap-3 relative overflow-hidden shadow-xl">
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl"></div>
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="text-sm font-black text-white uppercase truncate">{job.client_name}</h3>
                                <p className="text-[8px] text-cyan-400 uppercase font-black">Team: {job.team_assigned || 'UNASSIGNED'}</p>
                            </div>
                            <span className={`text-[6px] font-black px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${job.status === 'in_progress' ? 'bg-green-600 text-white animate-pulse' : 'bg-cyan-900 text-cyan-400'}`}>{job.status.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                            <p className="text-[9px] text-slate-400 italic truncate">{job.address}</p>
                            {job.check_in_coords && (
                                <p className="text-[7px] text-green-500 font-black uppercase mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> GPS: {job.check_in_coords.lat.toFixed(4)}, {job.check_in_coords.lng.toFixed(4)}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`)} className="flex-1 py-2 bg-cyan-600/20 text-cyan-400 rounded-xl text-[9px] font-black uppercase active:scale-95 flex items-center justify-center gap-1"><MapPin className="w-3 h-3"/> Route</button>
                            <button onClick={() => sendWA(job, 'arrival')} className="flex-1 py-2 bg-amber-500/20 text-amber-500 rounded-xl text-[9px] font-black uppercase active:scale-95 flex items-center justify-center gap-1"><Zap className="w-3 h-3"/> Dispatch</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DriveView() {
    const { jobs } = useElevore();
    const allPhotos = jobs.reduce((acc, j) => [...acc, ...(j.before_photos || []), ...(j.after_photos || [])], []);
    return (
        <div className="space-y-4 pb-24">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Visual Assets</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">Global <span className="text-cyan-500">Drive</span></h2>
            </div>
            <div className="grid grid-cols-3 gap-1">
                {allPhotos.map((url, i) => (
                    <div key={i} className="aspect-square bg-white/5 rounded-lg overflow-hidden border border-white/5">
                        <img src={url} className="w-full h-full object-cover hover:scale-110 transition-all cursor-pointer" onClick={() => window.open(url, '_blank')} />
                    </div>
                ))}
                {allPhotos.length === 0 && <p className="col-span-3 text-center py-20 text-slate-700 font-black italic uppercase text-[10px]">Cloud is empty.</p>}
            </div>
        </div>
    );
}

function TeamView() {
    const { staffList, showToast, refresh } = useElevore();
    const [newStaff, setNewStaff] = React.useState({ name: '', pin: '' });

    const addStaff = async () => {
        if (!newStaff.name || !newStaff.pin) return showToast("Fill Name and PIN", "red");
        const { error } = await sb.from('elevore_staff').insert([{ name: newStaff.name, pin: newStaff.pin }]);
        if (error) {
            showToast("Error adding staff", "red");
        } else {
            showToast("Staff Added!");
            setNewStaff({ name: '', pin: '' });
            refresh();
        }
    };

    return (
        <div className="space-y-4 pb-24 animate-in fade-in">
            <div className="text-center py-4">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Human Capital</p>
                <h2 className="text-3xl font-black italic text-white uppercase leading-none">Elite <span className="text-amber-500">Staff</span></h2>
            </div>
            
            <div className="g p-5 border border-amber-500/30 bg-amber-500/5 mb-6">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">Add New Member</p>
                <div className="flex gap-2">
                    <input type="text" placeholder="Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="inp flex-1" />
                    <input type="text" placeholder="PIN" value={newStaff.pin} onChange={e => setNewStaff({ ...newStaff, pin: e.target.value })} className="inp w-20 text-center" />
                    <button onClick={addStaff} className="bg-amber-500 text-black font-black uppercase px-4 rounded-xl active:scale-95">Add</button>
                </div>
            </div>

            <div className="space-y-2">
                {staffList.map(s => (
                    <div key={s.id} className="g p-5 flex justify-between items-center border-l-4 border-amber-500">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase">{s.name}</h3>
                            <p className="text-[8px] text-slate-500 font-black uppercase">Access PIN: {s.pin}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-[8px] text-green-500 font-black uppercase">Active</p>
                            <button onClick={() => {
                                if(confirm("Remove staff?")) sb.from('elevore_staff').delete().eq('id', s.id).then(() => { showToast("Removed"); refresh(); });
                            }} className="ml-3 p-2 bg-red-900/30 text-red-500 rounded-lg hover:bg-red-600 transition-all"><Trash2 className="w-3 h-3"/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
