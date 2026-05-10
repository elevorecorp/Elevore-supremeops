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
    INITIAL, MONTHLY_GOAL, QUICK_JOBS, RISK_P, ADDONS, CHECKLIST 
} from '../lib/constants';
import PhotoDrive from '../components/ui/PhotoDrive';
import BarChart from '../components/ui/BarChart';
import QRCode from '../components/ui/QRCode';

export default function AdminDashboard() {
    const { 
        view, setView, role, setRole, jobs, clients, loading, isPrivate, setIsPrivate,
        editId, setEditId, deployTab, setDeployTab, filterSt, setFilterSt, searchQ, setSearchQ,
        toast, showToast, activeStaff, setActiveStaff, quickMode, setQuickMode, selJob, setSelJob,
        state, setState, activityLog, log, refresh, onNameChange, pricing, deploy, 
        quickDeploy, realProfit, finance, clientDNA, todayStr, filtered, 
        mrr, payrollSheet, sendWA, printInvoice, exportCSV, staffList, reports,
        lang, setLang, t
    } = useElevore();

    return (
        <div className="min-h-screen bg-[#020203] text-white selection:bg-amber-500 selection:text-black">
            {toast && <div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color === 'red' ? 'bg-red-600' : 'bg-green-600'} text-white border border-white/10 animate-in slide-in-from-top-full duration-300`}>{toast.msg}</div>}
            
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
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Package className="w-3 h-3"/> Retention Due (Coming Soon)</p>
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
    const { filtered = [], searchQ, setSearchQ, filterSt, setFilterSt, realProfit, calcBonus, clientDNA, isPrivate, sendWA, printInvoice, setEditId, setState, setView, setDeployTab, refresh, log, showToast, t } = useElevore();
    
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
                <p className="text-center text-[7px] text-slate-600 font-black uppercase">Configure mission parameters</p>
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

function ClientsView() { return <div className="g p-10 text-center text-slate-500 font-black italic uppercase">Clients CRM Module <br/> <span className="text-[8px] text-amber-500">Coming Soon</span></div>; }
function MRRView() { return <div className="g p-10 text-center text-slate-500 font-black italic uppercase">MRR & Subscriptions <br/> <span className="text-[8px] text-amber-500">Coming Soon</span></div>; }
function PayrollView() { return <div className="g p-10 text-center text-slate-500 font-black italic uppercase">Payroll Automation <br/> <span className="text-[8px] text-amber-500">Coming Soon</span></div>; }
function MapView() { return <div className="g p-10 text-center text-slate-500 font-black italic uppercase">Strike Map (GPS) <br/> <span className="text-[8px] text-amber-500">Coming Soon</span></div>; }
function DriveView() { return <div className="g p-10 text-center text-slate-500 font-black italic uppercase">Multimedia Drive <br/> <span className="text-[8px] text-amber-500">Coming Soon</span></div>; }
function TeamView() { return <div className="g p-10 text-center text-slate-500 font-black italic uppercase">Team Management <br/> <span className="text-[8px] text-amber-500">Coming Soon</span></div>; }
