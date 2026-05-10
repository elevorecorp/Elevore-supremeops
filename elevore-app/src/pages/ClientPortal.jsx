import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { 
    Globe, CreditCard, ShieldCheck, Sun, Package, Zap, 
    Users2, CreditCard as CardIcon 
} from 'lucide-react';
import { fmt$, fmtDate, daysAgo } from '../lib/helpers';
import SigPad from '../components/ui/SigPad';
import PhotoDrive from '../components/ui/PhotoDrive';
import QRCode from '../components/ui/QRCode';

export default function ClientPortal() {
    const { 
        jobs, loading, toast, showToast, clientJobId, clientID, loadPortal, 
        lang, setLang, t, calcDNA, clientLevel 
    } = useElevore();

    const myJobs = clientID ? jobs.filter(j => j.client_name?.replace(/\s/g, '_').toLowerCase() === clientID.toLowerCase()) : jobs;
    const job = clientJobId ? jobs.find(j => j.id === clientJobId) : (myJobs.length === 1 ? myJobs[0] : null);

    if (!job && !clientID) return <div className="min-h-screen flex items-center justify-center text-white font-black animate-pulse text-xs uppercase">Connecting to Elevore Matrix...</div>;

    const saveApproval = async (sig) => {
        const { error } = await sb.from('elevore_missions').update({ approval_signature: sig, status: 'scheduled' }).eq('id', job.id);
        if (!error) { showToast("Quote approved! ✅"); loadPortal(); }
        else showToast("Save error", 'red');
    };

    const saveFinal = async (sig) => {
        const { error } = await sb.from('elevore_missions').update({ final_signature: sig, status: 'paid' }).eq('id', job.id);
        if (!error) { showToast("Job confirmed! 🌟"); loadPortal(); }
        else showToast("Save error", 'red');
    };

    const bal = job ? job.total_price - job.deposit_paid : 0;
    const sm = { lead: 10, scheduled: 30, in_progress: 65, completed: 90, paid: 100 };
    const urgencyLeft = (job && job.urgency_expires) ? Math.max(0, Math.round((new Date(job.urgency_expires) - Date.now()) / 3600000)) : null;

    if (!job && clientID) {
        return (
            <div className="min-h-screen p-5 bg-black">
                <div className="max-w-md mx-auto space-y-6">
                    <div className="text-center space-y-4 py-4">
                        <div className="w-20 h-20 bg-white rounded-[2rem] mx-auto flex items-center justify-center font-black text-black text-3xl italic">E</div>
                        <h1 className="text-2xl font-black uppercase tracking-[0.4em] text-white">ELEVORE</h1>
                    </div>
                    {/* History View logic here */}
                    <div className="g p-8 text-center border-t-4 border-amber-500">
                        <h2 className="text-xl font-black text-white uppercase italic mb-2">{clientID.replace(/_/g, ' ')}</h2>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Client Portal Active</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-5 bg-black animate-in fade-in duration-700">
            {toast && <div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color === 'red' ? 'bg-red-600' : 'bg-green-600'} text-white`}>{toast.msg}</div>}
            {loading && <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center"><div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>}
            
            <div className="max-w-md mx-auto space-y-5 pb-20">
                <div className="flex justify-end pt-2">
                    <button onClick={() => setLang(l => l === 'en' ? 'es' : 'en')} className="flex items-center gap-1.5 text-[8px] font-black px-3 py-1.5 bg-white/10 rounded-full text-slate-400 uppercase active:scale-95">
                        <Globe className="w-3 h-3" />{lang === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
                    </button>
                </div>

                <div className="text-center space-y-4 py-4">
                    <div className="w-20 h-20 bg-white rounded-[2rem] mx-auto flex items-center justify-center font-black text-black text-3xl italic shadow-2xl shadow-amber-500/20 border-4 border-amber-500/10">E</div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-[0.4em] text-white leading-none">ELEVORE</h1>
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] mt-1">{t.hub}</p>
                    </div>
                </div>

                {urgencyLeft !== null && urgencyLeft > 0 && !job.approval_signature && (
                    <div className="gold py-3 px-5 rounded-2xl text-center font-black uppercase text-sm">
                        ⏰ Quote expires in {urgencyLeft}h — Sign now to lock your price!
                    </div>
                )}

                {/* Live Progress Tracker */}
                {job.status === 'in_progress' && (
                    <div className="g p-6 border-l-4 border-green-500 space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Live Execution</p>
                            <span className="text-xl font-black text-white italic">{Math.round((Object.values(job.specs?.checklist_state || {}).filter(Boolean).length / 8) * 100)}%</span>
                        </div>
                        <div className="pb"><div className="pf" style={{ width: `${(Object.values(job.specs?.checklist_state || {}).filter(Boolean).length / 8) * 100}%` }}></div></div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {['Bathrooms', 'Kitchen', 'Floors', 'Dusting'].map((area, i) => {
                                const isDone = Object.values(job.specs?.checklist_state || {})[i];
                                return (
                                    <div key={area} className={`flex items-center gap-2 p-2 rounded-lg border ${isDone ? 'bg-green-600/10 border-green-600/30 text-green-400' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                                        <div className={`w-3 h-3 rounded-full ${isDone ? 'bg-green-500 animate-pulse' : 'bg-slate-800'}`}></div>
                                        <span className="text-[8px] font-black uppercase">{area}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="g p-6 border-t-4 border-green-500 space-y-4">
                    <div className="flex justify-between items-center">
                        <div><p className="text-[9px] font-black text-slate-500 uppercase">Client</p><h2 className="text-xl font-black italic uppercase text-white">{job.client_name}</h2></div>
                        <span className={`text-[8px] font-black px-3 py-1.5 rounded-xl uppercase ${job.status === 'paid' ? 'bg-blue-600 text-white' : job.status === 'in_progress' ? 'bg-green-600 text-white' : 'bg-amber-500 text-black'}`}>{job.status}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-black uppercase space-y-1">
                        <p>📋 {job.service_type?.toUpperCase()}</p>
                        <p>📅 {fmtDate(job.scheduled_date)}</p>
                        <p>📍 {job.address}</p>
                    </div>
                </div>

                {/* BEFORE & AFTER COMPARISON */}
                {(job.before_photos?.length > 0 || job.after_photos?.length > 0) && (
                    <div className="g p-6 space-y-4">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center">✨ Visual Transformation</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <p className="text-[7px] font-black text-slate-500 uppercase text-center">Initial State</p>
                                <div className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-white/5">
                                    {job.before_photos?.[0] ? <img src={job.before_photos[0]} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full flex items-center justify-center text-[20px]">📸</div>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[7px] font-black text-green-500 uppercase text-center">Elevore Results</p>
                                <div className="aspect-square rounded-2xl overflow-hidden border border-green-500/20 bg-green-500/5">
                                    {job.after_photos?.[0] ? <img src={job.after_photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[20px]">✨</div>}
                                </div>
                            </div>
                        </div>
                        {job.after_photos?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto no-sb pb-1">
                                {job.after_photos.slice(1).map((url, i) => (
                                    <img key={i} src={url} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="g p-8 text-center space-y-4 border-t-4 border-amber-500 shadow-2xl relative overflow-hidden">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.balance}</p>
                    <h3 className="text-7xl font-black italic tracking-tighter text-white leading-none">{fmt$(bal)}</h3>
                    <div className="pt-2">
                        <button onClick={() => showToast("Redirecting to Secure Payment...", "amber")} className="w-full gold py-5 rounded-2xl font-black uppercase text-sm shadow-xl shadow-amber-900/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                            <CardIcon className="w-5 h-5" /> Pay Securely with Card
                        </button>
                    </div>
                </div>

                {!job.approval_signature ? (
                    <div className="g p-6 border border-amber-500/30 space-y-4">
                        <div className="text-center"><p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">{t.approve}</p></div>
                        <SigPad onSave={saveApproval} label={t.approveBtn} />
                    </div>
                ) : (
                    <div className="g p-5 border border-green-600/30 text-center space-y-2">
                        <p className="text-[9px] text-green-500 font-black uppercase">✅ Quote Approved</p>
                        <img src={job.approval_signature} className="h-10 mx-auto opacity-50" />
                    </div>
                )}
            </div>
        </div>
    );
}
