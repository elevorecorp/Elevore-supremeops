import React, { useState } from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import {
    ArrowLeft, Play, Square, Check, LogOut, Zap, ShieldCheck,
    Users2, ShieldAlert, TrendingUp, AlertTriangle, MapPin,
    Package, Clock, Star, ChevronRight, Activity, DollarSign
} from 'lucide-react';
import { CHECKLIST, ADDONS } from '../lib/constants';
import PhotoDrive from '../components/ui/PhotoDrive';
import { fmt$, fmtDate } from '../lib/helpers';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  :root {
    --bg:       #08090c;
    --s:        #0e1117;
    --s2:       #141820;
    --b:        rgba(255,255,255,0.06);
    --b2:       rgba(255,255,255,0.10);
    --acc:      #f0b429;
    --green:    #22d07a;
    --blue:     #3d8ef8;
    --red:      #f0483e;
    --muted:    #5a6478;
    --text:     #f1f3f7;
  }

  .staff-root * { font-family: 'Syne', sans-serif; box-sizing: border-box; }
  .staff-root { background: var(--bg); min-height: 100vh; color: var(--text); }

  .s-card {
    background: var(--s); border: 1px solid var(--b);
    border-radius: 16px; padding: 20px;
  }

  .s-tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; padding: 3px 8px; border-radius: 6px;
  }
  .s-tag-green { background: rgba(34,208,122,0.12); color: var(--green); }
  .s-tag-amber { background: rgba(240,180,41,0.12); color: var(--acc); }
  .s-tag-red   { background: rgba(240,72,62,0.12);  color: var(--red); }
  .s-tag-blue  { background: rgba(61,142,248,0.12); color: var(--blue); }

  .s-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    padding: 10px 18px; border-radius: 10px; cursor: pointer;
    transition: all 0.15s; border: none; outline: none;
  }
  .s-btn:active { transform: scale(0.97); }
  .s-btn-primary { background: var(--acc); color: #000; }
  .s-btn-ghost { background: var(--s2); color: var(--text); border: 1px solid var(--b); }
  .s-btn-ghost:hover { border-color: var(--b2); }
  .s-btn-green { background: rgba(34,208,122,0.12); color: var(--green); border: 1px solid rgba(34,208,122,0.2); }
  .s-btn-green:hover { background: var(--green); color: #000; }
  .s-btn-red   { background: rgba(240,72,62,0.12); color: var(--red); border: 1px solid rgba(240,72,62,0.2); }
  .s-btn-red:hover { background: var(--red); color: #fff; }

  .s-input {
    width: 100%; background: var(--s2); border: 1px solid var(--b);
    border-radius: 10px; padding: 10px 14px; color: var(--text);
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 500;
    outline: none; transition: border-color 0.15s;
  }
  .s-input:focus { border-color: var(--acc); }

  .s-progress { height: 5px; background: var(--s2); border-radius: 999px; overflow: hidden; }
  .s-progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }

  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); display: inline-block; animation: lpulse 2s infinite; }
  @keyframes lpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .toast-el {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    z-index: 9999; padding: 12px 24px; border-radius: 10px;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    white-space: nowrap; animation: tIn 0.25s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  @keyframes tIn { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }

  .job-row {
    background: var(--s); border: 1px solid var(--b);
    border-radius: 14px; padding: 16px 18px;
    display: flex; justify-content: space-between; align-items: center;
    cursor: pointer; transition: border-color 0.15s, background 0.15s;
  }
  .job-row:hover { border-color: var(--b2); background: rgba(255,255,255,0.02); }
  .job-row:active { transform: scale(0.99); }

  .check-item {
    width: 100%; display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; border-radius: 10px; border: 1px solid var(--b);
    cursor: pointer; transition: all 0.15s; background: transparent;
    text-align: left;
  }
  .check-item:hover { border-color: var(--b2); }
  .check-item.done { background: rgba(34,208,122,0.06); border-color: rgba(34,208,122,0.25); }

  .check-box {
    width: 20px; height: 20px; flex-shrink: 0;
    border-radius: 6px; border: 2px solid #2a3040;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .check-box.done { background: var(--green); border-color: var(--green); }

  .supply-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .supply-item { padding: 12px; background: var(--s2); border: 1px solid var(--b); border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: all 0.15s; color: var(--text); text-align: center; }
  .supply-item:hover { border-color: var(--acc); color: var(--acc); background: rgba(240,180,41,0.08); }

  .modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    backdrop-filter: blur(8px); z-index: 500;
    display: flex; align-items: flex-end; justify-content: center; padding: 16px;
  }
  .modal-box {
    background: var(--s); border: 1px solid var(--b); border-radius: 20px;
    width: 100%; max-width: 420px; padding: 24px;
    animation: mUp 0.25s ease; max-height: 80vh; overflow-y: auto;
  }
  @keyframes mUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .mono { font-family: 'JetBrains Mono', monospace; }
  .no-sb::-webkit-scrollbar{display:none} .no-sb{scrollbar-width:none}
`;

/* ─────────────────────────────────────────────
   MAIN STAFF DASHBOARD
───────────────────────────────────────────── */
export default function StaffDashboard() {
    const {
        activeStaff, setActiveStaff, toast, showToast, recordTime,
        sendUpsell, calcBonus, refresh, jobs, todayStr, staffName,
        pass, payrollSheet, setReportModal
    } = useElevore();

    const sName = staffName || pass;
    const lookup = sName?.trim().toLowerCase();

    const myJobs = jobs.filter(j => j.team_assigned?.trim().toLowerCase() === lookup);
    const paidJobs = myJobs.filter(j => j.status === 'paid');
    const ratings = myJobs.filter(j => j.specs?.rating).map(j => j.specs.rating);
    const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '5.0';
    const proLevel = myJobs.length > 50 ? 'Platinum' : myJobs.length > 20 ? 'Gold' : myJobs.length > 5 ? 'Silver' : 'Bronze';
    const levelColor = { Bronze: '#cd7f32', Silver: '#c0c0c0', Gold: '#fbbf24', Platinum: '#e5e4e2' }[proLevel];

    const staffEarnings = payrollSheet.find(p => p.name.trim().toLowerCase() === lookup) || { gross: 0, pay: 0, bonus: 0, jobs: 0 };
    const totalWallet = staffEarnings.pay + (staffEarnings.bonus || 0);

    const todayJobs = myJobs.filter(j => {
        const isToday = j.scheduled_date === todayStr || j.status === 'in_progress';
        return isToday;
    });

    if (activeStaff) return <StaffJobView job={activeStaff} setActiveStaff={setActiveStaff} />;

    return (
        <div className="staff-root">
            <style>{css}</style>

            {toast && (
                <div className="toast-el" style={{ background: toast.color === 'red' ? 'var(--red)' : 'var(--green)', color: '#fff' }}>
                    {toast.msg}
                </div>
            )}

            <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 100px' }}>

                {/* HEADER CARD */}
                <div className="s-card" style={{ borderTop: `3px solid ${levelColor}`, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${levelColor}10` }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4 }}>Operative Unit</div>
                            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, marginBottom: 8 }}>{sName}</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6, background: `${levelColor}22`, color: levelColor }}>{proLevel} PRO</span>
                                <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>⭐ {avgRating}</span>
                            </div>
                        </div>
                        <button className="s-btn s-btn-ghost" style={{ width: 36, height: 36, padding: 0, borderRadius: 10 }}
                            onClick={() => sb.auth.signOut().then(() => window.location.reload())}>
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>

                {/* WALLET + STATS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                    {/* WALLET */}
                    <div className="s-card" style={{ borderLeft: `3px solid var(--green)`, gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>
                            💰 My Wallet — Earned to Date
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 800, fontStyle: 'italic', color: 'var(--green)', lineHeight: 1 }}>
                            {fmt$(totalWallet)}
                        </div>
                        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                            <div>
                                <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Missions Done</div>
                                <div style={{ fontSize: 16, fontWeight: 800 }}>{staffEarnings.jobs}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Bonus Earned</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--acc)' }}>{fmt$(staffEarnings.bonus || 0)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Total Missions</div>
                                <div style={{ fontSize: 16, fontWeight: 800 }}>{myJobs.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TODAY'S MISSIONS */}
                <div style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>Today's Missions</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div className="live-dot" />
                            <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase' }}>{todayJobs.filter(j => j.status === 'in_progress').length} Active</span>
                        </div>
                    </div>

                    {todayJobs.length === 0 && (
                        <div className="s-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 11, fontStyle: 'italic', borderStyle: 'dashed' }}>
                            No missions assigned for today
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {todayJobs.map(j => (
                            <div key={j.id} className="job-row"
                                style={{ borderLeft: `3px solid ${j.status === 'in_progress' ? 'var(--green)' : 'var(--acc)'}` }}
                                onClick={() => setActiveStaff(j)}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{j.client_name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {j.service_type?.toUpperCase()} · {j.address}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 12 }}>
                                    <span className={`s-tag ${j.status === 'in_progress' ? 's-tag-green' : 's-tag-amber'}`}>
                                        {j.status.replace('_', ' ')}
                                    </span>
                                    <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   STAFF JOB VIEW
───────────────────────────────────────────── */
function StaffJobView({ job, setActiveStaff }) {
    const { recordTime, sendUpsell, showToast, toast, refresh, setReportModal } = useElevore();
    const [checked, setChecked] = useState(job.specs?.checklist_state || {});
    const [requestingSupplies, setRequestingSupplies] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const done = Object.values(checked).filter(Boolean).length;
    const progress = Math.round((done / CHECKLIST.length) * 100);

    const toggleCheck = async (i) => {
        const newState = { ...checked, [i]: !checked[i] };
        setChecked(newState);
        await sb.from('elevore_missions').update({
            specs: { ...job.specs, checklist_state: newState }
        }).eq('id', job.id);
    };

    const addAfterPhoto = async (url) => {
        const current = job.after_photos || [];
        const { error } = await sb.from('elevore_missions').update({ after_photos: [...current, url] }).eq('id', job.id);
        if (!error) { showToast('Photo added ✓'); refresh(); }
        else showToast('Error adding photo', 'red');
    };

    const sendSupplyRequest = async (item) => {
        const { error } = await sb.from('elevore_reports').insert({
            type: 'supply', staff_name: job.team_assigned,
            description: `SUPPLY REQUEST: ${item}`, job_id: job.id, status: 'open'
        });
        if (!error) { showToast(`${item} requested! 📦`); setRequestingSupplies(false); }
        else showToast('Error', 'red');
    };

    const progressColor = progress < 33 ? 'var(--red)' : progress < 66 ? 'var(--acc)' : 'var(--green)';

    return (
        <div className="staff-root">
            <style>{css}</style>

            {toast && (
                <div className="toast-el" style={{ background: toast.color === 'red' ? 'var(--red)' : 'var(--green)', color: '#fff' }}>
                    {toast.msg}
                </div>
            )}

            {/* SUPPLY MODAL */}
            {requestingSupplies && (
                <div className="modal-bg" onClick={e => e.target === e.currentTarget && setRequestingSupplies(false)}>
                    <div className="modal-box">
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--acc)', marginBottom: 16, textAlign: 'center' }}>
                            Request Supplies
                        </div>
                        <div className="supply-grid">
                            {['Glass Cleaner', 'All-Purpose', 'Microfiber Towels', 'Vacuum Bags', 'Degreaser', 'Paper Towels'].map(s => (
                                <button key={s} className="supply-item" onClick={() => sendSupplyRequest(s)}>
                                    📦 {s}
                                </button>
                            ))}
                        </div>
                        <button className="s-btn s-btn-ghost" style={{ width: '100%', marginTop: 12, fontSize: 10 }} onClick={() => setRequestingSupplies(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 100px' }}>
                {/* BACK */}
                <button className="s-btn s-btn-ghost" style={{ marginBottom: 16, fontSize: 10 }} onClick={() => setActiveStaff(null)}>
                    <ArrowLeft size={13} /> Back
                </button>

                {/* MISSION HEADER */}
                <div className="s-card" style={{ borderTop: '3px solid var(--green)', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 4 }}>Active Mission</div>
                            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.1 }}>{job.client_name}</div>
                            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{job.service_type?.toUpperCase()}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Progress</div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: progressColor }}>{progress}%</div>
                        </div>
                    </div>

                    {/* PROGRESS */}
                    <div className="s-progress" style={{ marginBottom: 14 }}>
                        <div className="s-progress-fill" style={{ width: `${progress}%`, background: progressColor }} />
                    </div>

                    {/* ADDRESS + GPS */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--s2)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                        <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', flex: 1, marginRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            📍 {job.address}
                        </span>
                        <button className="s-btn s-btn-ghost" style={{ fontSize: 9, height: 28, padding: '0 10px', flexShrink: 0, borderColor: 'rgba(6,182,212,0.3)', color: 'rgba(6,182,212,0.8)' }}
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`)}>
                            <MapPin size={10} /> GPS Route
                        </button>
                    </div>

                    {/* CHECK IN / OUT */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
                        <button className="s-btn s-btn-green" style={{ fontSize: 10 }} onClick={() => recordTime(job.id, 'check_in_time')}>
                            <Play size={12} /> Check In
                        </button>
                        <button className="s-btn s-btn-red" style={{ fontSize: 10 }} onClick={() => recordTime(job.id, 'check_out_time')}>
                            <Square size={12} /> Check Out
                        </button>
                        <button className="s-btn s-btn-ghost" style={{ fontSize: 10, padding: '10px 12px' }} onClick={() => setRequestingSupplies(true)}>
                            📦
                        </button>
                    </div>
                </div>

                {/* CLIENT PULSE */}
                <div className="s-card" style={{ borderLeft: '3px solid var(--acc)', marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--acc)', marginBottom: 12 }}>
                        ⚡ Client Pulse
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 12, background: 'var(--s2)', borderRadius: 10, padding: '10px 14px', alignItems: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(61,142,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Users2 size={14} style={{ color: 'var(--blue)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Pets & People</div>
                                <div style={{ fontSize: 11, fontWeight: 700 }}>{job.specs?.pets || 'None reported'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, background: 'var(--s2)', borderRadius: 10, padding: '10px 14px', alignItems: 'center' }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(240,180,41,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ShieldAlert size={14} style={{ color: 'var(--acc)' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Instructions</div>
                                <div style={{ fontSize: 11, fontWeight: 700, fontStyle: 'italic' }}>"{job.specs?.preferences || 'Execute standard protocol'}"</div>
                            </div>
                        </div>
                        {job.specs?.access_code && (
                            <div style={{ display: 'flex', gap: 12, background: 'rgba(34,208,122,0.06)', border: '1px solid rgba(34,208,122,0.15)', borderRadius: 10, padding: '10px 14px', alignItems: 'center' }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,208,122,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <ShieldCheck size={14} style={{ color: 'var(--green)' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Access Code</div>
                                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.15em' }}>{job.specs.access_code}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* CHECKLIST */}
                <div className="s-card" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>Mission Checklist</div>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>{done}/{CHECKLIST.length}</span>
                    </div>
                    <div className="s-progress" style={{ marginBottom: 12 }}>
                        <div className="s-progress-fill" style={{ width: `${progress}%`, background: progressColor }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {CHECKLIST.map((item, i) => (
                            <button key={i} className={`check-item ${checked[i] ? 'done' : ''}`} onClick={() => toggleCheck(i)}>
                                <div className={`check-box ${checked[i] ? 'done' : ''}`}>
                                    {checked[i] && <Check size={11} style={{ color: '#000' }} />}
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: checked[i] ? 'var(--green)' : 'var(--text)' }}>{item}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* UPSELL */}
                <div className="s-card" style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendingUp size={12} /> Neural Upsell
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {ADDONS.filter(a => !job.specs?.[a.id]).map(a => {
                            const sent = (job.upsell_sent || []).includes(a.id);
                            return (
                                <button key={a.id} disabled={sent}
                                    style={{ padding: '10px 12px', borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', cursor: sent ? 'default' : 'pointer', transition: 'all 0.15s', border: `1px solid ${sent ? 'rgba(34,208,122,0.25)' : 'var(--b)'}`, background: sent ? 'rgba(34,208,122,0.08)' : 'var(--s2)', color: sent ? 'var(--green)' : 'var(--muted)', fontFamily: 'Syne,sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    onClick={() => !sent && sendUpsell(job, a.id)}>
                                    <span>{sent ? '✅ ' : ''}{a.label}</span>
                                    <span style={{ fontSize: 9, opacity: 0.7 }}>+${a.p}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* AFTER PHOTOS */}
                <div className="s-card" style={{ borderLeft: '3px solid var(--green)', marginBottom: 12 }}>
                    <PhotoDrive photos={job.after_photos || []} label="✨ After Photos" onAdd={addAfterPhoto} />
                </div>

                {/* INCIDENT */}
                <button className="s-btn s-btn-ghost" style={{ width: '100%', color: 'var(--red)', borderColor: 'rgba(240,72,62,0.2)', fontSize: 10 }}
                    onClick={() => setReportModal && setReportModal({ type: 'incident', jobId: job.id })}>
                    <AlertTriangle size={12} /> Report Incident
                </button>
            </div>
        </div>
    );
}