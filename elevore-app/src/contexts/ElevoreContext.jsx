import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { sb } from '../lib/supabase';
import { 
    STAFF_PAY, MONTHLY_GOAL, GOOGLE_LINK, ADMIN_PIN, STAFF_PIN, PRIVATE_PIN, 
    ADDONS, QUICK_JOBS, RISK_P, CHECKLIST, SVC_LEVELS, CLIENT_LEVELS, INITIAL 
} from '../lib/constants';
import { calcDNA, clientLevel, daysAgo, fmt$, fmtDate, getDistance } from '../lib/helpers';

export const ElevoreContext = createContext(null);

const T = {
    en: {
        hub: 'Live Mission Hub',
        balance: 'Balance Due',
        approve: '📝 Approve Your Quote',
        approveHint: 'Sign below to confirm this service',
        approveBtn: 'Sign to approve quote',
        complete: '🏁 Confirm Completion',
        completeHint: "Sign to confirm you're satisfied",
        completeBtn: 'Sign to confirm completion',
        review: '⭐ Leave a Google Review',
        refer: '🎁 Refer a Friend — Both Get $25 Off',
        rate: 'Rate Your Experience',
        chat: 'Message Us Directly',
        chatBtn: 'Send via WhatsApp',
        syncing: 'Syncing...'
    },
    es: {
        hub: 'Centro de Misión',
        balance: 'Saldo Pendiente',
        approve: '📝 Aprueba Tu Cotización',
        approveHint: 'Firma abajo para confirmar el servicio',
        approveBtn: 'Firma para aprobar',
        complete: '🏁 Confirmar Finalización',
        completeHint: 'Firma para confirmar que estás satisfecho',
        completeBtn: 'Firma para confirmar',
        review: '⭐ Dejar Reseña en Google',
        refer: '🎁 Invita un Amigo — Ambos Obtienen $25 Off',
        rate: 'Califica Tu Experiencia',
        chat: 'Escríbenos Directamente',
        chatBtn: 'Enviar por WhatsApp',
        syncing: 'Cargando...'
    }
};

export function ElevoreProvider({ children }) {
    const urlParams = new URLSearchParams(window.location.search);
    const clientJobId = urlParams.get('mision');
    const clientID = urlParams.get('client');
    const refCode = urlParams.get('ref');

    const [view, setView] = useState((clientJobId || clientID) ? 'portal' : 'auth');
    const [role, setRole] = useState('admin');
    const [pass, setPass] = useState("");
    const [jobs, setJobs] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPrivate, setIsPrivate] = useState(true);
    const [editId, setEditId] = useState(null);
    const [deployTab, setDeployTab] = useState('identity');
    const [filterSt, setFilterSt] = useState('all');
    const [searchQ, setSearchQ] = useState('');
    const [toast, setToast] = useState(null);
    const [activeStaff, setActiveStaff] = useState(null);
    const [quickMode, setQuickMode] = useState(false);
    const [selJob, setSelJob] = useState(null);
    const [state, setState] = useState(INITIAL);
    const [activityLog, setActivityLog] = useState([]);
    const [lang, setLang] = useState('en');
    const [chatInput, setChatInput] = useState('');
    const [staffTab, setStaffTab] = useState('missions');
    const [supplyModal, setSupplyModal] = useState(false);
    const [reportModal, setReportModal] = useState(null);
    const [reports, setReports] = useState([]);
    const [reportDesc, setReportDesc] = useState('');
    const [staffList, setStaffList] = useState([]);
    const [staffName, setStaffName] = useState('');
    const [chatJob, setChatJob] = useState(null);
    const [chatLog, setChatLog] = useState([]);

    const t = T[lang];

    const showToast = (msg, color = 'green') => { setToast({ msg, color }); setTimeout(() => setToast(null), 3500); };
    const log = (msg) => setActivityLog(l => [{ msg, time: new Date().toLocaleTimeString() }, ...l.slice(0, 49)]);

    const refresh = useCallback(async () => {
        setLoading(true);
        const { data: j } = await sb.from('elevore_missions').select('*').order('created_at', { ascending: false });
        const { data: c } = await sb.from('clients').select('*');
        const { data: r } = await sb.from('elevore_reports').select('*').order('created_at', { ascending: false });
        const { data: s } = await sb.from('elevore_staff').select('*').order('name');
        if (j) setJobs(j);
        if (c) setClients(c);
        if (r) setReports(r);
        if (s) setStaffList(s);
        setLoading(false);
    }, []);

    useEffect(() => {
        const init = async () => {
            const { data } = await sb.from('elevore_staff').select('*').order('name');
            if (data) setStaffList(data);
        };
        init();

        if (view === 'portal' && clientJobId) loadPortal();
        else if (view !== 'auth') refresh();
    }, [view, refresh, clientJobId]);

    useEffect(() => {
        if (view === 'auth' || view === 'portal') return;
        const ch = sb.channel('elevore-live')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'elevore_missions' }, () => refresh())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => refresh())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'elevore_reports' }, () => refresh())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'elevore_staff' }, () => refresh())
            .subscribe();
        return () => sb.removeChannel(ch);
    }, [view, refresh]);

    async function loadPortal() {
        setLoading(true);
        const { data } = await sb.from('elevore_missions').select('*').eq('id', clientJobId).single();
        if (data) setJobs([data]);
        setLoading(false);
    }

    const onNameChange = (val) => {
        setState(s => ({ ...s, name: val }));
        const m = clients.find(c => c.name.toLowerCase().includes(val.toLowerCase()));
        if (m && val.length > 3) setState(s => ({ ...s, ...m.specs, name: m.name, phone: m.phone, address: m.address }));
    };

    const pricing = useMemo(() => {
        let advice = "✅ COMPETITIVE", ac = "text-blue-400";
        if (state.svc === 'handyman') {
            const quick = state.selectedQuickJobs.reduce((a, id) => a + (QUICK_JOBS.find(q => q.id === id)?.p || 0), 0);
            const labor = state.laborHours * 85;
            let mk = 1.2; if (state.materialCost < 50) mk = 1.4; else if (state.materialCost < 200) mk = 1.3;
            const mats = Math.round(state.materialCost * mk);
            const sub = quick + labor + mats + state.riskMargin;
            const total = Math.round(sub * (1 - (state.discount / 100)));
            if (total < 125) { advice = "⚠️ BELOW MIN"; ac = "text-red-500"; }
            else if (total >= 500) { advice = "💰 PREMIUM"; ac = "text-green-400"; }
            return { total, advice, ac, labor, mats, quick };
        }
        let base = 0;
        if (state.svc === 'postcon') { base = (state.sqft || 0) * 0.35; }
        else {
            const b = { regular: 95, deep: 165, moveout: 195 };
            base = (b[state.svc] || 95) + (state.beds * 40) + (state.baths * 35) + (state.living * 25) + (state.laundryRoom * 25);
            ADDONS.forEach(a => { if (state[a.id]) base += a.p; });
            base += state.laundryLoads * 25;
        }
        const freq = { 'one-time': 1, 'weekly': 0.85, 'bi-weekly': 0.9, 'monthly': 0.95 }[state.frequency] || 1;
        const total = Math.round(base * state.complexity * freq * (1 - (state.discount / 100)));
        if (total < 120) { advice = "⚠️ LOW MARGIN"; ac = "text-red-500"; }
        else if (total >= 400) { advice = "🔥 HIGH VALUE"; ac = "text-amber-400"; }
        return { total, advice, ac, labor: 0, mats: 0, quick: 0 };
    }, [state]);

    useEffect(() => { if (!editId) setState(s => ({ ...s, totalPrice: pricing.total })); }, [pricing.total, editId]);

    const deploy = async () => {
        if (!state.name || !state.address) return showToast("Fill Name and Address", 'red');
        setLoading(true);
        try {
            const { data: c, error: cErr } = await sb.from('clients')
                .upsert({ name: state.name, phone: state.phone, address: state.address, specs: { ...state } }, { onConflict: 'name' })
                .select().single();
            if (cErr || !c) { showToast("Clients Error: " + (cErr?.message || "Check RLS"), 'red'); setLoading(false); return; }
            const fd = { 'weekly': 7, 'bi-weekly': 14, 'monthly': 30, 'one-time': null }[state.frequency];
            let nv = null;
            if (fd && state.date) { const d = new Date(state.date); d.setDate(d.getDate() + fd); nv = d.toISOString().split('T')[0]; }
            const payload = {
                client_name: state.name, client_phone: state.phone, address: state.address,
                service_type: state.svc, total_price: pricing.total, deposit_paid: state.deposit,
                team_assigned: state.team, status: state.status,
                specs: { ...state, referral: refCode || null },
                scheduled_date: state.date || null, notes: state.notes || null, next_visit: nv,
                urgency_expires: state.urgencyHours ? new Date(Date.now() + state.urgencyHours * 3600000).toISOString() : null
            };
            const { error: jErr } = editId
                ? await sb.from('elevore_missions').update(payload).eq('id', editId)
                : await sb.from('elevore_missions').insert([payload]);
            if (jErr) { showToast("Mission Error: " + jErr.message, 'red'); setLoading(false); return; }
            setState(INITIAL); setEditId(null);
            log(editId ? `Updated job: ${state.name}` : `New job deployed: ${state.name} — ${fmt$(pricing.total)}`);
            showToast(editId ? "Mission updated! ⚡" : "Mission deployed! 🚀");
            setView('agenda'); refresh();
        } catch (e) { showToast("Error: " + e.message, 'red'); }
        setLoading(false);
    };

    const quickDeploy = async (qs) => {
        if (!qs.name || !qs.address) return showToast("Fill Name and Address", 'red');
        setLoading(true);
        const { data: c, error: cErr } = await sb.from('clients')
            .upsert({ name: qs.name, phone: qs.phone, address: qs.address, specs: {} }, { onConflict: 'name' })
            .select().single();
        if (cErr || !c) { showToast("Error: " + (cErr?.message), 'red'); setLoading(false); return; }
        const { data: j, error: jErr } = await sb.from('elevore_missions').insert([{
            client_name: qs.name, client_phone: qs.phone, address: qs.address,
            service_type: qs.svc, total_price: qs.price, deposit_paid: 0,
            status: 'lead', specs: {}, scheduled_date: null,
            urgency_expires: new Date(Date.now() + 24 * 3600000).toISOString()
        }]).select().single();
        if (jErr) { showToast("Error: " + jErr.message, 'red'); setLoading(false); return; }
        showToast("Quick quote sent! 🚀");
        log(`Quick quote: ${qs.name} — ${fmt$(qs.price)}`);
        setQuickMode(false); refresh();
        const link = `${window.location.origin}${window.location.pathname}?mision=${j.id}`;
        const p = qs.phone?.replace(/\D/g, '') || '';
        const phone = p.length === 10 ? '1' + p : p;
        const msg = `Hi ${qs.name}! 📋 Your Elevore quote is ready: ${fmt$(qs.price)} for ${qs.svc?.toUpperCase()}.\n\n👉 View & sign here: ${link}\n\n⏰ This quote expires in 24 hours.\n\nZelle: (407) 952-4228`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
        setLoading(false);
    };

    const recordTime = async (jobId, type) => {
        setLoading(true);
        const time = new Date().toISOString();
        const status = type === 'check_in_time' ? 'in_progress' : 'completed';

        let coords = null;
        if (type === 'check_in_time' && navigator.geolocation) {
            try {
                const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
                coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };

                const job = jobs.find(j => j.id === jobId);
                if (job && job.check_in_coords) {
                    const dist = getDistance(coords.lat, coords.lng, job.check_in_coords.lat, job.check_in_coords.lng);
                    if (dist > 250) {
                        if (!confirm(`⚠️ GEOFENCE ALERT: You are ${Math.round(dist)}m away from the mission target. Continue anyway?`)) {
                            setLoading(false); return;
                        }
                    }
                }
            } catch (e) { console.warn("GPS failed", e); }
        }

        const payload = { [type]: time, status };
        if (coords) payload.check_in_coords = coords;

        const { error } = await sb.from('elevore_missions').update(payload).eq('id', jobId);
        setLoading(false);
        if (!error) {
            showToast(type === 'check_in_time' ? "▶ Mission Started!" : "⏹ Mission Completed!");
            if (type === 'check_out_time') setActiveStaff(null);
            refresh();
        } else showToast("Error: " + error.message, 'red');
    };

    const sendUpsell = async (job, addonId) => {
        const addon = ADDONS.find(a => a.id === addonId); if (!addon) return;
        const p = job.client_phone?.replace(/\D/g, '') || ''; const phone = p.length === 10 ? '1' + p : p;
        const msg = `Hi ${job.client_name}! ✨ Our pro noticed your ${addon.label.toLowerCase()} could use attention. Add it now for just $${addon.p}? Reply YES to authorize — we'll handle it right now! 🏠`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
        const sent = [...(job.upsell_sent || []), addonId];
        await sb.from('elevore_missions').update({ upsell_sent: sent }).eq('id', job.id);
        log(`Upsell sent: ${addon.label} to ${job.client_name}`);
        showToast(`Upsell: ${addon.label} sent! 💰`); refresh();
    };

    const calcBonus = (job) => {
        if (job.status !== 'paid') return 0;
        const mins = job.check_in_time && job.check_out_time ? Math.round((new Date(job.check_out_time) - new Date(job.check_in_time)) / 60000) : null;
        return (job.final_signature && mins && mins <= 180) ? 5 : 0;
    };

    const realProfit = (job) => {
        const rev = job.deposit_paid || 0;
        const staff = rev * STAFF_PAY;
        const exp = job.specs?.expenses || 0;
        const bonus = calcBonus(job);
        return Math.round(rev - staff - exp - bonus);
    };

    const finance = useMemo(() => {
        const gross = jobs.reduce((a, b) => a + (b.total_price || 0), 0);
        const collected = jobs.reduce((a, b) => a + (b.deposit_paid || 0), 0);
        const exp = jobs.reduce((a, b) => a + (b.specs?.expenses || 0), 0);
        const bonuses = jobs.reduce((a, b) => a + calcBonus(b), 0);
        const net = Math.max(0, Math.round(collected - (collected * STAFF_PAY) - exp - bonuses));
        const pending = gross - collected;
        const progress = Math.min(100, (gross / MONTHLY_GOAL) * 100);
        const avg = jobs.length ? Math.round(gross / jobs.length) : 0;
        const byStatus = { lead: 0, scheduled: 0, in_progress: 0, completed: 0, paid: 0 };
        jobs.forEach(j => { if (byStatus[j.status] !== undefined) byStatus[j.status]++; });
        const byService = {};
        jobs.forEach(j => { byService[j.service_type] = (byService[j.service_type] || 0) + (j.total_price || 0); });
        const recurring = jobs.filter(j => j.specs?.frequency && j.specs.frequency !== 'one-time').reduce((a, b) => a + (b.total_price || 0), 0);
        const daysInMonth = 30; const today = new Date().getDate();
        const projection = today > 0 ? Math.round((gross / today) * daysInMonth) : 0;
        const dayTotals = {};
        jobs.forEach(j => { if (!j.scheduled_date) return; const d = new Date(j.scheduled_date).getDay(); dayTotals[d] = (dayTotals[d] || 0) + (j.total_price || 0); });
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const bestDay = Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0];
        const today2 = new Date(); const soon = new Date(); soon.setDate(today2.getDate() + 7);
        const retDue = jobs.filter(j => j.next_visit && new Date(j.next_visit) <= soon && j.status === 'paid');
        const coldLeads = jobs.filter(j => j.status === 'lead' && !j.approval_signature && daysAgo(j.created_at) >= 2);
        const churn = clients.filter(c => {
            const cJobs = jobs.filter(j => j.client_name === c.name && j.status === 'paid');
            if (!cJobs.length) return false;
            const last = cJobs.sort((a, b) => new Date(b.scheduled_date || 0) - new Date(a.scheduled_date || 0))[0];
            return daysAgo(last.scheduled_date) >= 45;
        });
        const pendSig = jobs.filter(j => !j.approval_signature && j.status === 'lead');
        const weekBars = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - 6 + i);
            const ds = d.toISOString().split('T')[0];
            const v = jobs.filter(j => j.scheduled_date === ds).reduce((a, b) => a + (b.total_price || 0), 0);
            return { l: dayNames[d.getDay()], v };
        });
        const topClient = clients.map(c => ({ name: c.name, total: jobs.filter(j => j.client_name === c.name).reduce((a, b) => a + (b.total_price || 0), 0) })).sort((a, b) => b.total - a.total)[0];
        return { gross, collected, net, pending, progress, avg, byStatus, byService, recurring, projection, bestDay: bestDay ? dayNames[bestDay[0]] : null, retDue, coldLeads, churn, pendSig, bonuses, weekBars, topClient, total: jobs.length };
    }, [jobs, clients]);

    const clientDNA = useMemo(() => {
        const map = {};
        clients.forEach(c => { const cj = jobs.filter(j => j.client_name === c.name); map[c.name] = { score: calcDNA(cj), count: cj.length, spent: cj.reduce((a, b) => a + (b.total_price || 0), 0), last: cj[0]?.scheduled_date }; });
        return map;
    }, [clients, jobs]);

    const filtered = useMemo(() => jobs.filter(j => {
        const ms = filterSt === 'all' || j.status === filterSt;
        const q = searchQ.toLowerCase();
        const mq = !searchQ || j.client_name?.toLowerCase().includes(q) || j.address?.toLowerCase().includes(q) || j.team_assigned?.toLowerCase().includes(q);
        return ms && mq;
    }), [jobs, filterSt, searchQ]);

    const todayStr = new Date().toISOString().split('T')[0];
    
    const mrr = useMemo(() => {
        const rec = jobs.filter(j => j.specs?.frequency && j.specs.frequency !== 'one-time');
        const byFreq = { 'weekly': 4.33, 'bi-weekly': 2.17, 'monthly': 1 };
        const monthly = rec.reduce((a, b) => a + (b.total_price || 0) * (byFreq[b.specs.frequency] || 1), 0);
        const plans = { basic: rec.filter(j => (j.total_price || 0) < 200).length, pro: rec.filter(j => (j.total_price || 0) >= 200 && (j.total_price || 0) < 400).length, elite: rec.filter(j => (j.total_price || 0) >= 400).length };
        return { monthly: Math.round(monthly), annual: Math.round(monthly * 12), count: rec.length, plans };
    }, [jobs]);

    const payrollSheet = useMemo(() => {
        const teams = {};
        jobs.filter(j => j.team_assigned && j.status === 'paid').forEach(j => {
            const nm = j.team_assigned.trim();
            const key = nm.toLowerCase();
            if (!teams[key]) teams[key] = { name: nm, jobs: 0, gross: 0, pay: 0, bonus: 0 };
            const collected = j.deposit_paid || 0;
            const amount = (j.status === 'paid' && collected === 0) ? (j.total_price || 0) : collected;
            teams[key].jobs++;
            teams[key].gross += amount;
            teams[key].pay += Math.round(amount * STAFF_PAY);
            teams[key].bonus += calcBonus(j);
        });
        return Object.values(teams);
    }, [jobs]);

    const sendWA = (job, type) => {
        const p = job.client_phone?.replace(/\D/g, '') || '';
        const phone = p.length === 10 ? '1' + p : p;
        const bal = job.total_price - job.deposit_paid;
        const portal = `${window.location.origin}${window.location.pathname}?mision=${job.id}`;
        const ref = `${window.location.origin}${window.location.pathname}?ref=${job.client_name?.replace(/\s/g, '_')}`;
        const msgs = {
            confirm: `Hi ${job.client_name}! ✨ Elevore confirming your ${job.service_type?.toUpperCase()} on ${fmtDate(job.scheduled_date)}. Balance: ${fmt$(bal)}. Zelle: (407) 952-4228 🏠`,
            reminder: `Hi ${job.client_name}! 🔔 Reminder — your Elevore service is coming up ${fmtDate(job.scheduled_date)}. Balance: ${fmt$(bal)}. Questions? Reply here!`,
            review: `Hi ${job.client_name}! 🌟 Thank you for choosing Elevore! A quick Google review means the world to us: ${GOOGLE_LINK} ⭐⭐⭐⭐⭐`,
            referral: `Hi ${job.client_name}! 🎁 Love your clean space? Refer a friend and BOTH get $25 off! Your link: ${ref}`,
            quote: `Hi ${job.client_name}! 📋 Your Elevore quote:\n\n🏠 ${job.service_type?.toUpperCase()}\n📅 ${fmtDate(job.scheduled_date)}\n💰 Total: ${fmt$(job.total_price)}\n⚖️ Balance: ${fmt$(bal)}\n\n👉 Sign here: ${portal}\n\n⏰ Quote expires in 24h\nZelle: (407) 952-4228 ✅`,
            portal: `Hi ${job.client_name}! ✨ Track your ELEVORE mission & sign here: ${portal}`,
            retention: `Hi ${job.client_name}! 🏠 It's been a while since your last clean! Book this week and get 10% off. Reply YES to schedule! 🌟`,
            winback: `Hi ${job.client_name}! We miss you! 😊 It's been a while. Your home deserves Elevore's touch again. Book today and get a loyalty discount. Reply YES! 💫`,
            bundle: `Hi ${job.client_name}! 🎯 Add a Deep Clean to your next Regular for just $50 more — save $70! Limited offer. Reply YES to upgrade your booking! 🏠`,
            urgency: `⏰ Hi ${job.client_name}! Your Elevore quote expires in 2 hours. Lock in your price now: ${portal} — after that, regular rates apply!`,
            arrival: `🚀 Hi ${job.client_name}! This is the Elevore team. We are on our way to your location! Track our arrival here: ${portal} ✨`
        };
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msgs[type])}`, '_blank');
        log(`WA ${type} sent to ${job.client_name}`);
    };

    const printInvoice = (job) => {
        const win = window.open('', '_blank');
        const profit = realProfit(job);
        win.document.write(`<html><head><style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}.h{border-bottom:4px solid #22c55e;padding-bottom:15px;display:flex;justify-content:space-between}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee}.total{background:#000;color:#fff;padding:30px;border-radius:15px;margin-top:20px}.sig{border:2px solid #eee;border-radius:8px;margin-top:15px;padding:8px;text-align:center}</style></head><body>
        <div class="h"><div><h1 style="font-style:italic;margin:0">ELEVORE</h1><p style="margin:0;color:#666;font-size:12px">Premium Property Services</p></div><div style="text-align:right"><h2 style="margin:0">INVOICE #${job.id?.slice(0, 8).toUpperCase()}</h2><p style="margin:0;color:#666;font-size:12px">${new Date().toLocaleDateString()}</p></div></div>
        <div style="margin-top:20px"><h3>BILL TO:</h3><p><b>${job.client_name}</b></p><p>${job.address}</p><p>${job.client_phone || ''}</p></div>
        <div style="margin-top:15px">
            <div class="row"><span>Service</span><span>${job.service_type?.toUpperCase()}</span></div>
            <div class="row"><span>Date</span><span>${fmtDate(job.scheduled_date)}</span></div>
            <div class="row"><span>Team</span><span>${job.team_assigned || 'TBD'}</span></div>
            ${job.check_in_time ? `<div class="row"><span>Check-in</span><span>${new Date(job.check_in_time).toLocaleTimeString()}</span></div>` : ''}
            ${job.check_out_time ? `<div class="row"><span>Check-out</span><span>${new Date(job.check_out_time).toLocaleTimeString()}</span></div>` : ''}
            <div class="row"><span>Total</span><span>${fmt$(job.total_price)}</span></div>
            <div class="row"><span>Deposit Paid</span><span>-${fmt$(job.deposit_paid)}</span></div>
        </div>
        <div class="total"><h1 style="margin:0">BALANCE DUE: ${fmt$(job.total_price - job.deposit_paid)}</h1><p style="margin-top:8px">Zelle: (407) 952-4228</p></div>
        ${job.approval_signature ? `<div class="sig"><p style="font-size:10px;color:#999;margin:0">CLIENT APPROVAL</p><img src="${job.approval_signature}" style="max-height:60px"/></div>` : ''}
        ${job.final_signature ? `<div class="sig"><p style="font-size:10px;color:#999;margin:0">JOB COMPLETION</p><img src="${job.final_signature}" style="max-height:60px"/></div>` : ''}
        <p style="margin-top:40px;text-align:center;color:#999;font-size:12px">Thank you for choosing Elevore Premium Services ⭐</p>
        <script>window.print();<\/script></body></html>`);
        win.document.close();
    };

    const exportCSV = () => {
        const rows = [['Client', 'Service', 'Total', 'Deposit', 'Balance', 'Status', 'Date', 'Team', 'Real Profit'], ...jobs.map(j => [j.client_name, j.service_type, j.total_price, j.deposit_paid, j.total_price - j.deposit_paid, j.status, j.scheduled_date || '', j.team_assigned || '', realProfit(j)])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv); a.download = `elevore-${todayStr}.csv`; a.click();
        log('CSV exported'); showToast("CSV exported ✓");
    };

    const uploadPhoto = async (file, path = 'missions') => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { data, error } = await sb.storage
            .from('elevore-photos')
            .upload(filePath, file);

        if (error) {
            showToast("Upload Error: " + error.message, 'red');
            return null;
        }

        const { data: { publicUrl } } = sb.storage
            .from('elevore-photos')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const contextValue = {
        urlParams, clientJobId, clientID, refCode,
        view, setView, role, setRole, pass, setPass,
        jobs, setJobs, clients, setClients,
        loading, setLoading, isPrivate, setIsPrivate,
        editId, setEditId, deployTab, setDeployTab,
        filterSt, setFilterSt, searchQ, setSearchQ,
        toast, setToast, activeStaff, setActiveStaff,
        quickMode, setQuickMode, selJob, setSelJob,
        state, setState, activityLog, setActivityLog,
        lang, setLang, chatInput, setChatInput,
        staffTab, setStaffTab, supplyModal, setSupplyModal,
        reportModal, setReportModal, reports, setReports,
        reportDesc, setReportDesc, staffList, setStaffList,
        staffName, setStaffName,
        t, showToast, log, refresh, loadPortal,
        onNameChange, pricing, deploy, quickDeploy,
        recordTime, sendUpsell, calcBonus, realProfit,
        finance, clientDNA, todayStr, filtered,
        mrr, payrollSheet, sendWA, printInvoice, exportCSV,
        uploadPhoto, chatJob, setChatJob, chatLog, setChatLog
    };

    return (
        <ElevoreContext.Provider value={contextValue}>
            {children}
        </ElevoreContext.Provider>
    );
}

export const useElevore = () => useContext(ElevoreContext);
