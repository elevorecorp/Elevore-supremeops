import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import {
    Sun, BarChart2, ShieldCheck, Users, Zap, FileText, Edit3, Trash2,
    MessageCircle, TrendingUp, DollarSign, MapPin, Package, ShieldAlert,
    Globe, AlertTriangle, Image as ImageIcon, Star, Check, ArrowLeft,
    Play, Square, LogOut, ChevronRight, Activity, Clock, Target,
    Briefcase, Radio, Layers, Command, Bell, Settings, PieChart,
    ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter, Search,
    CreditCard, Home, Calendar, Users2
} from 'lucide-react';
import { fmt$, fmtDate, clientLevel, daysAgo } from '../lib/helpers';
import {
    INITIAL, MONTHLY_GOAL, QUICK_JOBS, RISK_P, ADDONS, CHECKLIST, GOOGLE_LINK
} from '../lib/constants';
import PhotoDrive from '../components/ui/PhotoDrive';
import BarChart from '../components/ui/BarChart';
import QRCode from '../components/ui/QRCode';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  :root {
    --bg:        #08090c;
    --surface:   #0e1117;
    --surface2:  #141820;
    --border:    rgba(255,255,255,0.06);
    --border2:   rgba(255,255,255,0.10);
    --accent:    #f0b429;
    --accent2:   #e8480c;
    --green:     #22d07a;
    --blue:      #3d8ef8;
    --purple:    #9b5de5;
    --red:       #f0483e;
    --text:      #f1f3f7;
    --muted:     #5a6478;
    --muted2:    #3a4156;
  }

  .saas-root * { font-family: 'Syne', sans-serif; box-sizing: border-box; }
  .saas-root { background: var(--bg); min-height: 100vh; color: var(--text); }

  /* SIDEBAR */
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    width: 68px; background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; align-items: center;
    padding: 20px 0; z-index: 200; gap: 6px;
  }
  @media (max-width: 640px) {
    .sidebar { display: none; }
    .main-content { margin-left: 0 !important; }
  }

  .logo-mark {
    width: 38px; height: 38px;
    background: var(--accent);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-style: italic; font-size: 18px; color: #000;
    margin-bottom: 20px; flex-shrink: 0;
    box-shadow: 0 0 24px rgba(240,180,41,0.3);
  }

  .nav-btn {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; cursor: pointer; transition: all 0.15s;
    border: 1px solid transparent; background: transparent; color: var(--muted);
    position: relative;
  }
  .nav-btn:hover { background: var(--surface2); color: var(--text); }
  .nav-btn.active { background: rgba(240,180,41,0.12); color: var(--accent); border-color: rgba(240,180,41,0.2); }
  .nav-btn span { font-size: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .nav-btn .badge {
    position: absolute; top: 6px; right: 6px;
    width: 6px; height: 6px; border-radius: 50%; background: var(--red);
  }

  .nav-divider { width: 24px; height: 1px; background: var(--border); margin: 6px 0; }

  /* TOPBAR */
  .topbar {
    position: fixed; top: 0; left: 68px; right: 0; height: 56px;
    background: rgba(8,9,12,0.85); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 24px; z-index: 100;
  }
  @media (max-width: 640px) { .topbar { left: 0; } }

  /* CARDS */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
  }
  .card-p { padding: 20px; }

  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 20px; position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 60%);
    pointer-events: none;
  }

  /* TAGS / BADGES */
  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; padding: 3px 8px; border-radius: 6px;
  }
  .tag-green { background: rgba(34,208,122,0.12); color: var(--green); }
  .tag-amber { background: rgba(240,180,41,0.12); color: var(--accent); }
  .tag-red   { background: rgba(240,72,62,0.12);  color: var(--red); }
  .tag-blue  { background: rgba(61,142,248,0.12); color: var(--blue); }
  .tag-muted { background: var(--surface2); color: var(--muted); }

  /* STATUS PILL */
  .status-pill {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    padding: 4px 10px; border-radius: 999px;
  }
  .status-pill::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  /* INPUT */
  .s-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 14px; color: var(--text);
    font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 500;
    outline: none; transition: border-color 0.15s;
  }
  .s-input:focus { border-color: var(--accent); }
  .s-input::placeholder { color: var(--muted); }

  /* BUTTON */
  .s-btn {
    display: inline-flex; align-items: center; justify-content: center; gap-6px;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    padding: 10px 18px; border-radius: 10px; cursor: pointer;
    transition: all 0.15s; border: none; outline: none;
  }
  .s-btn:active { transform: scale(0.97); }
  .s-btn-primary { background: var(--accent); color: #000; box-shadow: 0 4px 16px rgba(240,180,41,0.25); }
  .s-btn-primary:hover { background: #f5c842; }
  .s-btn-ghost { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .s-btn-ghost:hover { border-color: var(--border2); background: rgba(255,255,255,0.05); }
  .s-btn-danger { background: rgba(240,72,62,0.12); color: var(--red); border: 1px solid rgba(240,72,62,0.2); }
  .s-btn-danger:hover { background: var(--red); color: #fff; }
  .s-btn-icon { width: 36px; height: 36px; padding: 0; border-radius: 10px; }

  /* PROGRESS BAR */
  .s-progress { height: 4px; background: var(--surface2); border-radius: 999px; overflow: hidden; }
  .s-progress-fill { height: 100%; background: var(--accent); border-radius: 999px; transition: width 0.6s ease; }
  .s-progress-fill.green { background: var(--green); }

  /* MONO */
  .mono { font-family: 'JetBrains Mono', monospace; }

  /* SCROLL */
  .no-sb::-webkit-scrollbar { display: none; }
  .no-sb { scrollbar-width: none; -ms-overflow-style: none; }

  /* TABLE */
  .s-table { width: 100%; border-collapse: collapse; }
  .s-table th { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); padding: 10px 16px; text-align: left; border-bottom: 1px solid var(--border); }
  .s-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); font-size: 12px; vertical-align: middle; }
  .s-table tr:last-child td { border-bottom: none; }
  .s-table tr:hover td { background: rgba(255,255,255,0.02); }

  /* BOTTOM NAV MOBILE */
  .mobile-nav {
    display: none; position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(14,17,23,0.95); backdrop-filter: blur(20px);
    border-top: 1px solid var(--border); padding: 8px 0 16px;
    z-index: 200;
  }
  @media (max-width: 640px) { .mobile-nav { display: flex; justify-content: space-around; } }

  .m-nav-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 6px 12px; border-radius: 10px; cursor: pointer;
    background: transparent; border: none; color: var(--muted); transition: color 0.15s;
  }
  .m-nav-btn.active { color: var(--accent); }
  .m-nav-btn span { font-size: 7px; font-weight: 700; text-transform: uppercase; }

  /* TOAST */
  .s-toast {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    z-index: 9999; padding: 12px 24px; border-radius: 12px;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    animation: toastIn 0.3s ease; white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  /* SECTION HEADER */
  .section-header { margin-bottom: 20px; }
  .section-eyebrow { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 4px; }
  .section-title { font-size: 22px; font-weight: 800; color: var(--text); line-height: 1.1; }

  /* METRIC VALUE */
  .metric-val { font-size: 28px; font-weight: 800; line-height: 1; color: var(--text); }
  .metric-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 8px; }
  .metric-delta { font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 3px; margin-top: 8px; }
  .delta-up { color: var(--green); }
  .delta-down { color: var(--red); }

  /* LIVE DOT */
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* JOB CARD */
  .job-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 16px; transition: border-color 0.15s;
    cursor: pointer;
  }
  .job-card:hover { border-color: var(--border2); }

  /* MODAL BACKDROP */
  .modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(8px); z-index: 500;
    display: flex; align-items: flex-end; justify-content: center; padding: 16px;
  }
  @media (min-width: 640px) { .modal-bg { align-items: center; } }
  .modal-box {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; width: 100%; max-width: 480px;
    max-height: 90vh; overflow-y: auto; padding: 24px;
    animation: modalUp 0.25s ease;
  }
  @keyframes modalUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }

  /* FILTER TABS */
  .filter-tabs { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
  .filter-tab {
    flex-shrink: 0; padding: 6px 14px; border-radius: 8px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--muted);
    transition: all 0.15s;
  }
  .filter-tab.active { background: var(--accent); color: #000; border-color: var(--accent); }
  .filter-tab:hover:not(.active) { border-color: var(--border2); color: var(--text); }

  /* DEPLOY TABS */
  .deploy-tabs { display: flex; background: var(--surface2); border-radius: 12px; padding: 4px; }
  .deploy-tab {
    flex: 1; padding: 8px; border-radius: 8px; font-size: 9px;
    font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
    cursor: pointer; border: none; background: transparent; color: var(--muted); transition: all 0.15s;
  }
  .deploy-tab.active { background: var(--surface); color: var(--accent); box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
`;

/* ─────────────────────────────────────────────
   SIDEBAR NAV CONFIG
───────────────────────────────────────────── */
const NAV = [
    { v: 'brief', icon: Sun, label: 'Brief', color: 'amber' },
    { v: 'intel', icon: Activity, label: 'Intel', color: 'green' },
    { v: 'agenda', icon: ShieldCheck, label: 'Jobs', color: 'blue' },
    { v: 'clients', icon: Users, label: 'CRM', color: 'purple' },
    { v: 'mrr', icon: TrendingUp, label: 'MRR', color: 'green' },
    { v: 'payroll', icon: DollarSign, label: 'Pay', color: 'yellow' },
    { v: 'map', icon: MapPin, label: 'Map', color: 'cyan' },
    { v: 'team', icon: Users2, label: 'Team', color: 'amber' },
    { v: 'deploy', icon: Zap, label: 'New', color: 'amber' },
];

/* ─────────────────────────────────────────────
   CHAT MODAL
───────────────────────────────────────────── */
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
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setChatJob(null)}>
            <div className="modal-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--green)', marginBottom: 2 }}>Direct Channel</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{chatJob?.client_name}</div>
                    </div>
                    <button className="s-btn s-btn-ghost s-btn-icon" onClick={() => setChatJob(null)} style={{ fontSize: 16 }}>×</button>
                </div>

                <div style={{ height: 120, overflowY: 'auto', marginBottom: 12 }} className="no-sb">
                    {chatLog.length === 0 && <p style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', paddingTop: 32, fontStyle: 'italic' }}>No messages yet</p>}
                    {chatLog.map((m, i) => (
                        <div key={i} style={{ background: 'rgba(34,208,122,0.08)', border: '1px solid rgba(34,208,122,0.15)', borderRadius: 10, padding: '8px 12px', marginBottom: 6, marginLeft: 24 }}>
                            <p style={{ fontSize: 11, fontWeight: 600 }}>{m.m}</p>
                            <p style={{ fontSize: 8, color: 'var(--muted)', marginTop: 2, textAlign: 'right' }}>{m.time}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                    {[['✅ Confirm', 'confirm'], ['🔔 Remind', 'reminder'], ['⭐ Review', 'review'], ['📋 Quote', 'quote']].map(([l, type]) => (
                        <button key={type} className="s-btn s-btn-ghost" style={{ fontSize: 9 }} onClick={() => {
                            const msgs = {
                                confirm: `Hi ${chatJob.client_name}! ✨ Elevore confirming service ${fmtDate(chatJob.scheduled_date)}.`,
                                reminder: `Hi ${chatJob.client_name}! 🔔 Service ${fmtDate(chatJob.scheduled_date)}.`,
                                review: `Hi ${chatJob.client_name}! 🌟 Review: ${GOOGLE_LINK}`,
                                quote: `Hi ${chatJob.client_name}! Portal: ${window.location.origin}${window.location.pathname}?mision=${chatJob.id}`
                            };
                            setChatMsg(msgs[type]);
                        }}>{l}</button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                    <textarea value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type message..." className="s-input no-sb" style={{ resize: 'none', height: 64, flex: 1 }} />
                    <button className="s-btn s-btn-primary" onClick={send} style={{ alignSelf: 'stretch', minWidth: 60, flexDirection: 'column', gap: 4 }}>
                        <Zap size={14} /><span style={{ fontSize: 8 }}>Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function AdminDashboard() {
    const {
        view, setView, jobs, clients, loading, isPrivate, setIsPrivate,
        editId, setEditId, deployTab, setDeployTab, filterSt, setFilterSt,
        searchQ, setSearchQ, toast, showToast, quickMode, setQuickMode,
        selJob, setSelJob, state, setState, activityLog, log, refresh,
        onNameChange, pricing, deploy, realProfit, finance, clientDNA,
        todayStr, filtered, mrr, payrollSheet, sendWA, printInvoice,
        exportCSV, staffList, reports, lang, setLang, t,
        chatJob, setChatJob, chatLog, setChatLog
    } = useElevore();

    return (
        <div className="saas-root">
            <style>{css}</style>

            {/* TOAST */}
            {toast && (
                <div className="s-toast" style={{ background: toast.color === 'red' ? 'var(--red)' : 'var(--green)', color: '#fff' }}>
                    {toast.msg}
                </div>
            )}

            {/* CHAT MODAL */}
            {chatJob && <ChatModal />}

            {/* LOADING */}
            {loading && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,12,0.8)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 44, height: 44, border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)' }}>Syncing</p>
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="logo-mark">E</div>
                {NAV.slice(0, 7).map(({ v, icon: Icon, label }) => (
                    <button key={v} className={`nav-btn ${view === v ? 'active' : ''}`}
                        onClick={() => {
                            if (v === 'deploy') { setEditId(null); setState(INITIAL); setDeployTab('identity'); }
                            setView(v);
                        }}>
                        <Icon size={16} />
                        <span>{label}</span>
                    </button>
                ))}
                <div className="nav-divider" />
                <button className={`nav-btn ${view === 'team' ? 'active' : ''}`} onClick={() => setView('team')}>
                    <Users2 size={16} /><span>Team</span>
                </button>
                <button className={`nav-btn ${view === 'deploy' ? 'active' : ''}`}
                    onClick={() => { setEditId(null); setState(INITIAL); setDeployTab('identity'); setView('deploy'); }}
                    style={{ background: 'rgba(240,180,41,0.12)', color: 'var(--accent)', borderColor: 'rgba(240,180,41,0.2)', marginTop: 'auto' }}>
                    <Zap size={16} /><span>New</span>
                </button>
            </aside>

            {/* TOPBAR */}
            <header className="topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="logo-mark" style={{ display: 'none', width: 30, height: 30, fontSize: 14, borderRadius: 8 }}>E</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.1 }}>
                            Elevore <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>Empire</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <div className="live-dot" />
                            <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)' }}>Live Operations</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="s-btn s-btn-ghost s-btn-icon" onClick={() => setLang(l => l === 'en' ? 'es' : 'en')}>
                        <Globe size={14} />
                    </button>
                    <button className="s-btn s-btn-ghost s-btn-icon" onClick={() => setIsPrivate(p => !p)}>
                        {isPrivate ? <Zap size={14} /> : <Activity size={14} />}
                    </button>
                    <button className="s-btn s-btn-ghost s-btn-icon" onClick={() => sb.auth.signOut().then(() => window.location.reload())} style={{ color: 'var(--red)' }}>
                        <LogOut size={14} />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="main-content" style={{ marginLeft: 68, paddingTop: 56, minHeight: '100vh' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px 100px' }}>
                    {view === 'brief' && <BriefView />}
                    {view === 'intel' && <IntelView />}
                    {view === 'agenda' && <AgendaView />}
                    {view === 'clients' && <ClientsView />}
                    {view === 'mrr' && <MRRView />}
                    {view === 'payroll' && <PayrollView />}
                    {view === 'map' && <MapView />}
                    {view === 'team' && <TeamView />}
                    {view === 'deploy' && <DeployView />}
                    {view === 'drive' && <DriveView />}
                    {view === 'support' && <SupportView />}
                </div>
            </main>

            {/* MOBILE BOTTOM NAV */}
            <nav className="mobile-nav">
                {[
                    { v: 'brief', icon: Sun, label: 'Brief' },
                    { v: 'agenda', icon: ShieldCheck, label: 'Jobs' },
                    { v: 'deploy', icon: Zap, label: 'New' },
                    { v: 'clients', icon: Users, label: 'CRM' },
                    { v: 'team', icon: Users2, label: 'Team' },
                ].map(({ v, icon: Icon, label }) => (
                    <button key={v} className={`m-nav-btn ${view === v ? 'active' : ''}`}
                        onClick={() => {
                            if (v === 'deploy') { setEditId(null); setState(INITIAL); setDeployTab('identity'); }
                            setView(v);
                        }}>
                        <Icon size={18} />
                        <span>{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

/* ─────────────────────────────────────────────
   BRIEF VIEW
───────────────────────────────────────────── */
function BriefView() {
    const { jobs, todayStr, finance, sendWA, setView, isPrivate, reports } = useElevore();
    const todayJobs = jobs.filter(j => j.scheduled_date === todayStr);
    const inProgress = todayJobs.filter(j => j.status === 'in_progress');
    const openReports = (reports || []).filter(r => r.status === 'open');
    const todayRev = todayJobs.reduce((a, b) => a + (b.total_price || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="section-header">
                <div className="section-eyebrow">Morning Brief</div>
                <div className="section-title">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* STAT ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div className="stat-card" style={{ borderTop: '2px solid var(--accent)' }}>
                    <div className="metric-label">Missions Today</div>
                    <div className="metric-val">{todayJobs.length}</div>
                    <div className="metric-delta delta-up">
                        <Activity size={10} /> {inProgress.length} active
                    </div>
                </div>
                <div className="stat-card" style={{ borderTop: '2px solid var(--green)' }}>
                    <div className="metric-label">Today's Revenue</div>
                    <div className="metric-val">{isPrivate ? '—' : fmt$(todayRev)}</div>
                    <div className="metric-delta delta-up">
                        <ArrowUpRight size={10} /> Projected
                    </div>
                </div>
            </div>

            {/* STATUS STRIP */}
            <div className="card card-p" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Radio size={16} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 2 }}>Fleet Status</div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>Operational <span className="live-dot" style={{ display: 'inline-block', marginLeft: 6, verticalAlign: 'middle' }} /></div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active</div>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{inProgress.length}</div>
                    </div>
                    {openReports.length > 0 && (
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 8, color: 'var(--red)', fontWeight: 700, textTransform: 'uppercase' }}>Alerts</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)' }}>{openReports.length}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* MONTHLY PROGRESS */}
            {finance && (
                <div className="card card-p">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 2 }}>Monthly Goal</div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>{isPrivate ? '—' : fmt$(finance.gross)}</div>
                        </div>
                        <div className="tag tag-amber">{Math.round(finance.progress)}%</div>
                    </div>
                    <div className="s-progress">
                        <div className="s-progress-fill" style={{ width: `${finance.progress}%` }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, marginTop: 8 }}>
                        Projection: {isPrivate ? '—' : fmt$(finance.projection)} this month
                    </div>
                </div>
            )}

            {/* TODAY'S QUEUE */}
            <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>Active Queue</div>
                {todayJobs.length === 0 && (
                    <div className="card card-p" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, fontStyle: 'italic' }}>
                        No missions scheduled today
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {todayJobs.map(j => (
                        <div key={j.id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${j.status === 'in_progress' ? 'var(--green)' : 'var(--accent)'}` }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{j.client_name}</div>
                                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{j.service_type?.toUpperCase()} · {j.team_assigned || 'TBD'}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className={`status-pill ${j.status === 'in_progress' ? 'tag-green' : 'tag-amber'}`}>{j.status.replace('_', ' ')}</span>
                                <button className="s-btn s-btn-ghost s-btn-icon" style={{ width: 32, height: 32 }} onClick={() => sendWA(j, 'confirm')}>
                                    <MessageCircle size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   INTEL VIEW
───────────────────────────────────────────── */
function IntelView() {
    const { finance, sendWA, isPrivate } = useElevore();
    if (!finance) return null;
    const { churn = [], coldLeads = [], retDue = [], projection = 0, progress = 0, byStatus = {}, gross = 0, net = 0 } = finance;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="section-header">
                <div className="section-eyebrow">Revenue Radar</div>
                <div className="section-title">Intelligence Hub</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[
                    { label: 'Gross', val: isPrivate ? '—' : fmt$(gross), color: 'var(--accent)' },
                    { label: 'Net', val: isPrivate ? '—' : fmt$(net), color: 'var(--green)' },
                    { label: 'Projection', val: isPrivate ? '—' : fmt$(projection), color: 'var(--blue)' },
                ].map(m => (
                    <div key={m.label} className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="metric-label">{m.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
                    </div>
                ))}
            </div>

            {/* STATUS COUNTS */}
            <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>Pipeline</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {Object.entries(byStatus).map(([s, count]) => (
                        <div key={s} style={{ flex: '1 1 80px', textAlign: 'center', padding: '10px 8px', background: 'var(--surface2)', borderRadius: 10 }}>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>{count}</div>
                            <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>{s.replace('_', ' ')}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ALERTS */}
            {[
                { list: churn, color: 'var(--red)', label: 'Churn Risk', sub: c => `Last service: ${c.last_job_date ? fmtDate(c.last_job_date) : '—'}`, action: c => sendWA({ client_name: c.name, client_phone: c.phone }, 'winback'), actionLabel: 'Winback' },
                { list: coldLeads, color: 'var(--accent)', label: 'Cold Leads', sub: j => `${fmt$(j.total_price)} · ${daysAgo(j.created_at)}d ago`, action: j => sendWA(j, 'urgency'), actionLabel: 'Follow Up' },
                { list: retDue, color: 'var(--blue)', label: 'Retention Due', sub: j => `Suggested: ${fmtDate(j.next_visit)}`, action: j => sendWA(j, 'retention'), actionLabel: 'Re-book' },
            ].map(({ list, color, label, sub, action, actionLabel }) => (
                <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>{label}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, background: `${color}22`, color, padding: '2px 8px', borderRadius: 6 }}>{list.length}</div>
                    </div>
                    {list.length === 0 && <div className="card card-p" style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center' }}>All clear ✓</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {list.map((item, i) => (
                            <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${color}` }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.name || item.client_name}</div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{sub(item)}</div>
                                </div>
                                <button className="s-btn s-btn-ghost" style={{ fontSize: 9, borderColor: color, color }} onClick={() => action(item)}>{actionLabel}</button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   AGENDA VIEW
───────────────────────────────────────────── */
function AgendaView() {
    const {
        filtered = [], searchQ, setSearchQ, filterSt, setFilterSt,
        realProfit, calcBonus, clientDNA, isPrivate, sendWA, printInvoice,
        setEditId, setState, setView, setDeployTab, refresh, log, showToast,
        setChatJob
    } = useElevore();

    const STATUS_COLORS = { lead: 'var(--accent)', scheduled: 'var(--blue)', in_progress: 'var(--green)', completed: 'var(--purple)', paid: 'var(--blue)' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">Mission Control</div>
                <div className="section-title">All Jobs</div>
            </div>

            {/* SEARCH */}
            <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }} />
                <input className="s-input" style={{ paddingLeft: 36 }} placeholder="Search client, address, team..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>

            {/* FILTERS */}
            <div className="filter-tabs no-sb">
                {['all', 'lead', 'scheduled', 'in_progress', 'completed', 'paid'].map(s => (
                    <button key={s} className={`filter-tab ${filterSt === s ? 'active' : ''}`} onClick={() => setFilterSt(s)}>
                        {s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card card-p" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, fontStyle: 'italic', padding: 40 }}>
                    No missions found
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(job => {
                    const bal = job.total_price - job.deposit_paid;
                    const borderColor = STATUS_COLORS[job.status] || 'var(--muted2)';
                    return (
                        <div key={job.id} className="card" style={{ borderLeft: `3px solid ${borderColor}`, padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                        <span style={{ fontSize: 14, fontWeight: 800 }}>{job.client_name}</span>
                                        <span className={`tag ${job.status === 'paid' ? 'tag-blue' : job.status === 'in_progress' ? 'tag-green' : job.status === 'lead' ? 'tag-amber' : 'tag-muted'}`}>
                                            {job.status.replace('_', ' ')}
                                        </span>
                                        {job.approval_signature && <span className="tag tag-green">✍️ Signed</span>}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                                        {job.service_type?.toUpperCase()} · {fmtDate(job.scheduled_date)} · {job.team_assigned || 'No team'}
                                    </div>
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 800, marginLeft: 12, flexShrink: 0 }}>{fmt$(bal)}</div>
                            </div>

                            {/* ADDRESS ROW */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                                <span style={{ fontSize: 10, color: 'var(--muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{job.address}</span>
                                <button className="s-btn s-btn-ghost" style={{ fontSize: 8, height: 24, padding: '0 8px', flexShrink: 0 }}
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`)}>
                                    <MapPin size={10} style={{ marginRight: 4 }} />GPS
                                </button>
                            </div>

                            {/* ACTIONS */}
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button className="s-btn s-btn-ghost s-btn-icon" style={{ width: 32, height: 32 }} onClick={() => setChatJob(job)}>
                                    <MessageCircle size={12} />
                                </button>
                                <button className="s-btn s-btn-ghost s-btn-icon" style={{ width: 32, height: 32 }} onClick={() => printInvoice(job)}>
                                    <FileText size={12} />
                                </button>
                                <button className="s-btn s-btn-ghost s-btn-icon" style={{ width: 32, height: 32 }}
                                    onClick={() => { setEditId(job.id); setState({ ...job.specs, totalPrice: job.total_price }); setDeployTab('identity'); setView('deploy'); }}>
                                    <Edit3 size={12} />
                                </button>
                                <button className="s-btn s-btn-danger s-btn-icon" style={{ width: 32, height: 32 }}
                                    onClick={() => { if (confirm('Archive this job?')) sb.from('elevore_missions').delete().eq('id', job.id).then(() => { showToast('Archived ✓'); log(`Archived: ${job.client_name}`); refresh(); }); }}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   DEPLOY VIEW
───────────────────────────────────────────── */
function DeployView() {
    const { deployTab, setDeployTab, state, setState, onNameChange, deploy, editId, pricing } = useElevore();
    const TABS = ['identity', 'specs', 'add-ons', 'money'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">{editId ? 'Edit Mission' : 'New Mission'}</div>
                <div className="section-title">Deploy</div>
            </div>

            <div className="deploy-tabs">
                {TABS.map(tab => (
                    <button key={tab} className={`deploy-tab ${deployTab === tab ? 'active' : ''}`} onClick={() => setDeployTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {deployTab === 'identity' && (
                    <>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 4 }}>Client Identity</div>
                        <input className="s-input" placeholder="Client Full Name" value={state.name || ''} onChange={e => onNameChange(e.target.value)} />
                        <input className="s-input" placeholder="Phone Number" value={state.phone || ''} onChange={e => setState({ ...state, phone: e.target.value })} />
                        <input className="s-input" placeholder="Full Street Address" value={state.address || ''} onChange={e => setState({ ...state, address: e.target.value })} />
                        <input className="s-input" placeholder="Scheduled Date" type="date" value={state.date || ''} onChange={e => setState({ ...state, date: e.target.value })} />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 4 }}>
                            {['lead', 'scheduled', 'paid'].map(s => (
                                <button key={s} onClick={() => setState({ ...state, status: s })}
                                    style={{ padding: '10px', borderRadius: 10, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.15s', border: `2px solid ${state.status === s ? 'var(--accent)' : 'var(--border)'}`, background: state.status === s ? 'rgba(240,180,41,0.12)' : 'var(--surface2)', color: state.status === s ? 'var(--accent)' : 'var(--muted)' }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {deployTab === 'specs' && (
                    <>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 4 }}>Client Specs</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <input className="s-input" placeholder="Pets" value={state.pets || ''} onChange={e => setState({ ...state, pets: e.target.value })} />
                            <input className="s-input" placeholder="Access Code" value={state.access_code || ''} onChange={e => setState({ ...state, access_code: e.target.value })} />
                        </div>
                        <textarea className="s-input" style={{ resize: 'none', height: 96 }} placeholder="Special instructions..." value={state.preferences || ''} onChange={e => setState({ ...state, preferences: e.target.value })} />
                    </>
                )}
                {deployTab === 'add-ons' && (
                    <>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 4 }}>Add-on Services</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {ADDONS.map(a => (
                                <button key={a.id} onClick={() => setState({ ...state, [a.id]: !state[a.id] })}
                                    style={{ padding: '12px', borderRadius: 10, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', border: `2px solid ${state[a.id] ? 'var(--accent)' : 'var(--border)'}`, background: state[a.id] ? 'rgba(240,180,41,0.08)' : 'var(--surface2)', color: state[a.id] ? 'var(--accent)' : 'var(--muted)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{a.label}</span>
                                        {state[a.id] && <Check size={12} />}
                                    </div>
                                    <div style={{ fontSize: 9, marginTop: 4, opacity: 0.7 }}>+${a.p}</div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
                {deployTab === 'money' && (
                    <>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 4 }}>Financials</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            <div>
                                <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Discount %</div>
                                <input type="number" className="s-input" placeholder="0" value={state.discount || ''} onChange={e => setState({ ...state, discount: Number(e.target.value) })} />
                            </div>
                            <div>
                                <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Deposit Paid $</div>
                                <input type="number" className="s-input" placeholder="0" value={state.deposit || ''} onChange={e => setState({ ...state, deposit: Number(e.target.value) })} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* PRICE DISPLAY + DEPLOY */}
            <div style={{ background: 'var(--accent)', borderRadius: 20, padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.5)', marginBottom: 4 }}>Total Price</div>
                <div style={{ fontSize: 52, fontWeight: 800, fontStyle: 'italic', lineHeight: 1, color: '#000', marginBottom: 20 }}>
                    ${state.totalPrice || 0}
                </div>
                <button onClick={deploy}
                    style={{ width: '100%', background: '#000', color: '#fff', padding: '16px', borderRadius: 12, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', border: 'none', transition: 'opacity 0.15s' }}
                    onMouseOver={e => e.target.style.opacity = '0.8'} onMouseOut={e => e.target.style.opacity = '1'}>
                    {editId ? 'Update Mission' : '⚡ Deploy Mission'}
                </button>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   CLIENTS VIEW
───────────────────────────────────────────── */
function ClientsView() {
    const { clients, clientDNA, sendWA, isPrivate } = useElevore();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">CRM Core</div>
                <div className="section-title">Client Database</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {clients.map(c => {
                    const dna = clientDNA[c.name] || { score: 0, count: 0, spent: 0 };
                    const lvl = clientLevel(dna.count);
                    return (
                        <div key={c.name} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${lvl.color}` }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 800 }}>{c.name}</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                                    <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 6, background: `${lvl.color}22`, color: lvl.color }}>{lvl.name}</span>
                                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>{dna.count} missions · {isPrivate ? '—' : fmt$(dna.spent)}</span>
                                </div>
                            </div>
                            <button className="s-btn s-btn-ghost s-btn-icon" style={{ width: 32, height: 32 }} onClick={() => sendWA({ client_name: c.name, client_phone: c.phone }, 'portal')}>
                                <MessageCircle size={12} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   MRR VIEW
───────────────────────────────────────────── */
function MRRView() {
    const { mrr, isPrivate } = useElevore();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">Financial Matrix</div>
                <div className="section-title">MRR Tracker</div>
            </div>
            <div className="card card-p" style={{ textAlign: 'center', borderTop: '2px solid var(--green)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>Monthly Recurring Revenue</div>
                <div style={{ fontSize: 48, fontWeight: 800, fontStyle: 'italic', color: 'var(--green)', lineHeight: 1, marginBottom: 8 }}>
                    {isPrivate ? '—' : fmt$(mrr.monthly)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Projected Annual: {isPrivate ? '—' : fmt$(mrr.annual)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {Object.entries(mrr.plans).map(([name, count]) => (
                    <div key={name} className="stat-card" style={{ textAlign: 'center' }}>
                        <div className="metric-label">{name}</div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{count}</div>
                        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>clients</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   PAYROLL VIEW
───────────────────────────────────────────── */
function PayrollView() {
    const { payrollSheet, isPrivate, showToast } = useElevore();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">Operations Cost</div>
                <div className="section-title">Team Payroll</div>
            </div>
            <div className="card" style={{ overflow: 'hidden' }}>
                <table className="s-table">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th>Missions</th>
                            <th>Gross</th>
                            <th>Pay Due</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {payrollSheet.map(team => (
                            <tr key={team.name}>
                                <td style={{ fontWeight: 700 }}>{team.name}</td>
                                <td style={{ color: 'var(--muted)' }}>{team.jobs}</td>
                                <td style={{ fontWeight: 700 }}>{isPrivate ? '—' : fmt$(team.gross)}</td>
                                <td style={{ fontWeight: 800, color: 'var(--accent)' }}>{isPrivate ? '—' : fmt$(team.pay + (team.bonus || 0))}</td>
                                <td>
                                    <button className="s-btn s-btn-ghost" style={{ fontSize: 8, height: 28, padding: '0 10px' }} onClick={() => showToast('Payment processed (Demo)')}>
                                        Mark Paid
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {payrollSheet.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', fontSize: 11 }}>No payroll data yet</div>}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   MAP VIEW
───────────────────────────────────────────── */
function MapView() {
    const { jobs, todayStr, sendWA } = useElevore();
    const activeJobs = jobs.filter(j => j.scheduled_date === todayStr || j.status === 'in_progress');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">Global Positioning</div>
                <div className="section-title">Strike Map</div>
            </div>

            {/* RADAR */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <div style={{ position: 'relative', width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 40px rgba(6,182,212,0.1)' }}>
                    <div style={{ position: 'absolute', width: '75%', height: '75%', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.15)' }} />
                    <div style={{ position: 'absolute', width: '50%', height: '50%', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.15)' }} />
                    <MapPin size={24} style={{ color: 'rgba(6,182,212,0.8)', position: 'relative', zIndex: 2 }} />
                    {activeJobs.slice(0, 4).map((_, i) => (
                        <div key={i} style={{ position: 'absolute', width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 8px var(--accent)', top: `${18 + i * 16}%`, left: `${28 + i * 18}%`, animation: 'pulse 2s infinite', animationDelay: `${i * 0.4}s` }} />
                    ))}
                </div>
            </div>

            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>
                Active Coordinates ({activeJobs.length})
            </div>
            {activeJobs.length === 0 && (
                <div className="card card-p" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, fontStyle: 'italic' }}>No active signals today</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeJobs.map(job => (
                    <div key={job.id} className="card" style={{ padding: '16px', borderLeft: '3px solid rgba(6,182,212,0.6)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 800 }}>{job.client_name}</div>
                                <div style={{ fontSize: 10, color: 'rgba(6,182,212,0.8)', fontWeight: 700, marginTop: 2 }}>Team: {job.team_assigned || 'Unassigned'}</div>
                            </div>
                            <span className={`status-pill ${job.status === 'in_progress' ? 'tag-green' : 'tag-muted'}`}>
                                {job.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                            <div style={{ fontSize: 10, color: 'var(--muted)', fontStyle: 'italic' }}>{job.address}</div>
                            {job.check_in_coords && (
                                <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, marginTop: 4 }}>
                                    📡 GPS: {job.check_in_coords.lat.toFixed(4)}, {job.check_in_coords.lng.toFixed(4)}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="s-btn s-btn-ghost" style={{ flex: 1, fontSize: 9 }}
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`)}>
                                <MapPin size={11} style={{ marginRight: 4 }} /> Route
                            </button>
                            <button className="s-btn s-btn-ghost" style={{ flex: 1, fontSize: 9, borderColor: 'var(--accent)', color: 'var(--accent)' }} onClick={() => sendWA(job, 'arrival')}>
                                <Zap size={11} style={{ marginRight: 4 }} /> Dispatch
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   TEAM VIEW  (Staff Manager — expandido en Fase 2)
───────────────────────────────────────────── */
function TeamView() {
    const { staffList, showToast, refresh } = useElevore();
    const [newStaff, setNewStaff] = React.useState({ name: '', pin: '' });

    const addStaff = async () => {
        if (!newStaff.name || !newStaff.pin) return showToast('Fill Name and PIN', 'red');
        const { error } = await sb.from('elevore_staff').insert([{ name: newStaff.name, pin: newStaff.pin }]);
        if (error) { showToast('Error adding staff', 'red'); }
        else { showToast('Staff Added! ✓'); setNewStaff({ name: '', pin: '' }); refresh(); }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">Human Capital</div>
                <div className="section-title">Elite Staff</div>
            </div>

            {/* ADD MEMBER */}
            <div className="card card-p" style={{ borderTop: '2px solid var(--accent)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 12 }}>Add New Member</div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input className="s-input" style={{ flex: 1 }} placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} />
                    <input className="s-input" style={{ width: 80, textAlign: 'center' }} placeholder="PIN" value={newStaff.pin} onChange={e => setNewStaff({ ...newStaff, pin: e.target.value })} />
                    <button className="s-btn s-btn-primary" onClick={addStaff}>Add</button>
                </div>
            </div>

            {/* STAFF LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {staffList.map(s => (
                    <div key={s.id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--accent)' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 800 }}>{s.name}</div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                                <span style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace' }}>PIN: {s.pin}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <div className="live-dot" />
                                    <span style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, textTransform: 'uppercase' }}>Active</span>
                                </div>
                            </div>
                        </div>
                        <button className="s-btn s-btn-danger s-btn-icon" style={{ width: 32, height: 32 }}
                            onClick={() => { if (confirm('Remove staff member?')) sb.from('elevore_staff').delete().eq('id', s.id).then(() => { showToast('Removed'); refresh(); }); }}>
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}
                {staffList.length === 0 && (
                    <div className="card card-p" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, fontStyle: 'italic' }}>No staff members yet</div>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SUPPORT VIEW
───────────────────────────────────────────── */
function SupportView() {
    const { reports = [], refresh, showToast } = useElevore();
    const solveReport = async (id) => {
        const { error } = await sb.from('elevore_reports').update({ status: 'closed' }).eq('id', id);
        if (!error) { showToast('Report solved! ✓'); refresh(); }
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">Support & Logistics</div>
                <div className="section-title">Command Center</div>
            </div>
            {reports.filter(r => r.status === 'open').map(rep => (
                <div key={rep.id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${rep.type === 'incident' ? 'var(--red)' : 'var(--accent)'}` }}>
                    <div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                            <span className={`tag ${rep.type === 'incident' ? 'tag-red' : 'tag-amber'}`}>{rep.type}</span>
                            <span style={{ fontSize: 9, color: 'var(--muted)' }}>{rep.staff_name} · {new Date(rep.created_at).toLocaleDateString()}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{rep.description}</div>
                    </div>
                    <button className="s-btn s-btn-ghost" style={{ fontSize: 9, marginLeft: 12, flexShrink: 0 }} onClick={() => solveReport(rep.id)}>✅ Solve</button>
                </div>
            ))}
            {reports.filter(r => r.status === 'open').length === 0 && (
                <div className="card card-p" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, fontStyle: 'italic' }}>No active reports</div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   DRIVE VIEW
───────────────────────────────────────────── */
function DriveView() {
    const { jobs } = useElevore();
    const allPhotos = jobs.reduce((acc, j) => [...acc, ...(j.before_photos || []), ...(j.after_photos || [])], []);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="section-header">
                <div className="section-eyebrow">Visual Assets</div>
                <div className="section-title">Global Drive</div>
            </div>
            {allPhotos.length === 0 && <div className="card card-p" style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, fontStyle: 'italic' }}>No photos yet</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {allPhotos.map((url, i) => (
                    <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface2)' }}>
                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => window.open(url, '_blank')}
                            onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                            onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                    </div>
                ))}
            </div>
        </div>
    );
}