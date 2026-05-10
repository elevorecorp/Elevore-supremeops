import React, { useState } from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { 
    ArrowLeft, Play, Square, Check, LogOut, Zap, ShieldCheck, 
    Users2, ShieldAlert, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { CHECKLIST, ADDONS } from '../lib/constants';
import PhotoDrive from '../components/ui/PhotoDrive';

export default function StaffDashboard() {
    const { 
        role, activeStaff, setActiveStaff, toast, showToast, recordTime, 
        sendUpsell, calcBonus, refresh, jobs, todayStr, staffName, pass, 
        payrollSheet, setReportModal 
    } = useElevore();

    const sName = staffName || pass;
    const lookup = sName?.trim().toLowerCase();
    
    // Performance Metrics
    const myJobs = jobs.filter(j => j.team_assigned?.trim().toLowerCase() === lookup);
    const ratings = myJobs.filter(j => j.specs?.rating).map(j => j.specs.rating);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "5.0";
    const proLevel = myJobs.length > 50 ? 'Platinum' : myJobs.length > 20 ? 'Gold' : myJobs.length > 5 ? 'Silver' : 'Bronze';
    const levelColor = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#fbbf24', Platinum: '#e5e4e2' }[proLevel];

    const staffEarnings = payrollSheet.find(p => p.name.trim().toLowerCase() === lookup) || { gross: 0, pay: 0, bonus: 0, jobs: 0 };

    if (activeStaff) {
        return <StaffJobView job={activeStaff} setActiveStaff={setActiveStaff} />;
    }

    const todayJobs = jobs.filter(j => {
        const assignedTo = j.team_assigned?.trim().toLowerCase();
        const isAssigned = (lookup && assignedTo === lookup);
        const isToday = j.scheduled_date === todayStr || j.status === 'in_progress';
        return isAssigned && isToday;
    });

    return (
        <div className="min-h-screen p-5 bg-black pb-32">
            {toast && <div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color === 'red' ? 'bg-red-600' : 'bg-green-600'} text-white`}>{toast.msg}</div>}
            
            <div className="max-w-md mx-auto space-y-6">
                {/* Staff Header */}
                <div className="g p-6 border-t-4 flex justify-between items-start relative overflow-hidden" style={{ borderColor: levelColor }}>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Operative Unit</p>
                        <h2 className="text-3xl font-black italic text-white uppercase leading-none">{sName}</h2>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-[8px] font-black px-2 py-1 rounded-full uppercase" style={{ background: levelColor, color: '#000' }}>{proLevel} PRO</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase">⭐ {avgRating} Rating</span>
                        </div>
                    </div>
                    <button onClick={() => sb.auth.signOut().then(() => window.location.reload())} className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><LogOut className="w-4 h-4" /></button>
                </div>

                {/* Earnings Card */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="g p-5 border-l-4 border-green-500">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Your Pay</p>
                        <p className="text-2xl font-black italic text-green-400">${staffEarnings.pay + staffEarnings.bonus}</p>
                    </div>
                    <div className="g p-5 border-l-4 border-amber-500">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Missions</p>
                        <p className="text-2xl font-black italic text-white">{staffEarnings.jobs}</p>
                    </div>
                </div>

                {/* Mission List */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Today's Missions</p>
                    {todayJobs.length === 0 && <div className="g p-10 text-center text-slate-600 font-black italic uppercase border-2 border-dashed border-white/5">No missions assigned for today.</div>}
                    {todayJobs.map(j => (
                        <button key={j.id} onClick={() => setActiveStaff(j)} className={`w-full g p-5 border-l-4 flex justify-between items-center active:scale-95 transition-all ${j.status === 'in_progress' ? 'border-green-500 shadow-lg shadow-green-900/20' : 'border-amber-500'}`}>
                            <div className="text-left">
                                <p className="text-sm font-black text-white uppercase">{j.client_name}</p>
                                <p className="text-[9px] text-slate-500 uppercase font-black">{j.service_type} • {j.address}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-[7px] font-black px-2 py-1 rounded-lg uppercase ${j.status === 'in_progress' ? 'bg-green-600 text-white' : 'bg-amber-500 text-black'}`}>{j.status}</span>
                                <p className="text-[8px] text-slate-500 font-black mt-1 uppercase">Start →</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StaffJobView({ job, setActiveStaff }) {
    const { recordTime, sendWA, sendUpsell, showToast, toast, refresh, setReportModal } = useElevore();
    const [checked, setChecked] = useState(job.specs?.checklist_state || {});
    const [requestingSupplies, setRequestingSupplies] = useState(false);
    
    const done = Object.values(checked).filter(Boolean).length;
    const progress = Math.round((done / CHECKLIST.length) * 100);

    const toggleCheck = async (i) => {
        const newState = { ...checked, [i]: !checked[i] };
        setChecked(newState);
        // Sync to Supabase
        await sb.from('elevore_missions').update({ 
            specs: { ...job.specs, checklist_state: newState } 
        }).eq('id', job.id);
    };

    const addAfterPhoto = async (url) => {
        const c = job.after_photos || [];
        const { error } = await sb.from('elevore_missions').update({ after_photos: [...c, url] }).eq('id', job.id);
        if (!error) {
            showToast("Photo added ✓");
            refresh();
        } else showToast("Error adding photo", 'red');
    };

    const sendSupplyRequest = async (item) => {
        const { error } = await sb.from('elevore_reports').insert({
            type: 'supply',
            staff_name: job.team_assigned,
            description: `SUPPLY REQUEST: ${item}`,
            job_id: job.id,
            status: 'open'
        });
        if (!error) {
            showToast(`Request for ${item} sent! 📦`);
            setRequestingSupplies(false);
        } else showToast("Error sending request", 'red');
    };

    return (
        <div className="min-h-screen p-5 bg-black pb-32">
            {toast && <div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color === 'red' ? 'bg-red-600' : 'bg-green-600'} text-white`}>{toast.msg}</div>}
            
            {/* Supply Modal */}
            {requestingSupplies && (
                <div className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-6 backdrop-blur-md">
                    <div className="g p-8 w-full max-w-xs space-y-5 border-t-4 border-amber-500">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-center">Select Supply Needed</p>
                        <div className="grid grid-cols-1 gap-2">
                            {['Glass Cleaner', 'All-Purpose', 'Microfiber Towels', 'Vacuum Bags', 'Degreaser', 'Paper Towels'].map(s => (
                                <button key={s} onClick={() => sendSupplyRequest(s)} className="w-full py-3 bg-white/5 rounded-xl text-[10px] font-black uppercase hover:bg-amber-500 hover:text-black transition-all">📦 {s}</button>
                            ))}
                        </div>
                        <button onClick={() => setRequestingSupplies(false)} className="w-full py-3 text-slate-500 text-[8px] font-black uppercase">Cancel</button>
                    </div>
                </div>
            )}

            <button onClick={() => setActiveStaff(null)} className="mb-5 flex items-center gap-2 text-slate-500 font-black uppercase text-[9px]"><ArrowLeft className="w-4 h-4" /> Back to List</button>

            <div className="max-w-md mx-auto space-y-5">
                {/* MISSION HEADER */}
                <div className="g p-6 border-t-4 border-green-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-20 h-20 text-white" /></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-black uppercase italic text-white mb-1 relative z-10">{job.client_name}</h2>
                            <p className="text-[9px] text-slate-500 uppercase font-black mb-4">{job.service_type} • {job.address}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[7px] font-black text-green-400 uppercase">Live Progress</p>
                            <p className="text-2xl font-black italic text-white">{progress}%</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => recordTime(job.id, 'check_in_time')} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-black uppercase text-[9px] active:scale-95 flex items-center justify-center gap-1 shadow-lg shadow-green-900/20"><Play className="w-3 h-3" /> Check In</button>
                        <button onClick={() => recordTime(job.id, 'check_out_time')} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black uppercase text-[9px] active:scale-95 flex items-center justify-center gap-1"><Square className="w-3 h-3" /> Check Out</button>
                        <button onClick={() => setRequestingSupplies(true)} className="bg-white/10 text-white px-4 py-3 rounded-xl font-black text-[9px] active:scale-95 flex items-center gap-1">📦</button>
                    </div>
                </div>

                {/* CLIENT PULSE (VIP PREFERENCES) */}
                <div className="g p-5 border-l-4 border-amber-500 space-y-4">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2"><ShieldAlert className="w-3 h-3"/> Client Pulse & Instructions</p>
                    <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Users2 className="w-4 h-4 text-blue-400"/></div>
                            <div>
                                <p className="text-[8px] text-slate-500 uppercase font-black">Pets & People</p>
                                <p className="text-[10px] text-white font-black">{job.specs?.pets || 'None reported'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><Zap className="w-4 h-4 text-amber-400"/></div>
                            <div>
                                <p className="text-[8px] text-slate-500 uppercase font-black">Staff Instructions</p>
                                <p className="text-[10px] text-white font-black italic">"{job.specs?.preferences || 'Execute standard protocol'}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BEFORE PHOTOS */}
                <div className="g p-5 border-l-4 border-blue-500">
                    <PhotoDrive photos={job.before_photos || []} label="📸 Phase 1: Arrival Proof (Before)" onAdd={(url) => addPhoto(url, 'before')} />
                </div>

                {/* Checklist */}
                <div className="g p-5 space-y-2">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[9px] font-black uppercase text-slate-400">Mission Checklist</p>
                        <span className="text-[9px] font-black text-white">{done}/{CHECKLIST.length}</span>
                    </div>
                    <div className="pb mb-3"><div className="pf" style={{ width: `${progress}%` }}></div></div>
                    {CHECKLIST.map((item, i) => (
                        <button key={i} onClick={() => toggleCheck(i)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 ${checked[i] ? 'bg-green-600/10 border-green-600/40 text-green-400' : 'bg-white/5 border-white/5 text-slate-400'}`}>
                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${checked[i] ? 'bg-green-600 border-green-600' : 'border-slate-700'}`}>{checked[i] && <Check className="w-3 h-3 text-white" />}</div>
                            <span className="text-[10px] font-black uppercase text-left">{item}</span>
                        </button>
                    ))}
                </div>

                {/* Upsell */}
                <div className="g p-5">
                    <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-3 flex items-center gap-2"><TrendingUp className="w-3 h-3" /> Neural Upsell</p>
                    <div className="grid grid-cols-2 gap-2">
                        {ADDONS.filter(a => !job.specs?.[a.id]).map(a => {
                            const sent = (job.upsell_sent || []).includes(a.id);
                            return (
                                <button key={a.id} disabled={sent} onClick={() => sendUpsell(job, a.id)} className={`p-3 rounded-xl border text-[8px] font-black uppercase active:scale-95 transition-all ${sent ? 'bg-green-900/30 border-green-600/30 text-green-600' : 'bg-white/5 border-white/10 text-slate-400 hover:border-green-500'}`}>
                                    {sent ? '✅ Sent ' : ''}{a.label} +${a.p}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* AFTER PHOTOS */}
                <div className="g p-5 border-l-4 border-green-500">
                    <PhotoDrive photos={job.after_photos || []} label="✨ Phase 2: Results (After Photos)" onAdd={(url) => addPhoto(url, 'after')} />
                </div>
                
                <button onClick={() => setReportModal({ type: 'incident', jobId: job.id })} className="w-full py-4 text-red-500 text-[8px] font-black uppercase bg-red-500/5 rounded-xl border border-red-500/10">Report Incident</button>
            </div>
        </div>
    );
}
