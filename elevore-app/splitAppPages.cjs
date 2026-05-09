const fs = require('fs');

let appCode = fs.readFileSync('src/App.jsx', 'utf8');

// The markers inside App.jsx
const markers = {
    start: '    // ════════════════════════════════════════════════════════\n    // ── PORTAL VIEW ──────────────────────────────────────────\n',
    auth: '    // ── AUTH ─────────────────────────────────────────────────\n',
    staff: '    // ── STAFF VIEW ───────────────────────────────────────────\n',
    quickQuote: '    // ════════════════════════════════════════════════════════\n    // ── QUICK QUOTE MODAL ────────────────────────────────────\n',
    morningBrief: '    // ── MORNING BRIEFING ─────────────────────────────────────\n',
    admin: '    // ── ADMIN MAIN ───────────────────────────────────────────\n',
    end: '}\n\nexport default App;'
};

const portalBlock = appCode.substring(appCode.indexOf(markers.start) + markers.start.length, appCode.indexOf(markers.auth));
const authBlock = appCode.substring(appCode.indexOf(markers.auth) + markers.auth.length, appCode.indexOf(markers.staff));
const staffBlock = appCode.substring(appCode.indexOf(markers.staff) + markers.staff.length, appCode.indexOf(markers.quickQuote));
const qqBlock = appCode.substring(appCode.indexOf(markers.quickQuote) + markers.quickQuote.length, appCode.indexOf(markers.morningBrief));
const briefBlock = appCode.substring(appCode.indexOf(markers.morningBrief) + markers.morningBrief.length, appCode.indexOf(markers.admin));
const adminBlock = appCode.substring(appCode.indexOf(markers.admin) + markers.admin.length, appCode.lastIndexOf('}\n\nexport default App;'));

const contextBlock = appCode.substring(appCode.indexOf('function App() {\n') + 'function App() {\n'.length, appCode.indexOf(markers.start));
const importsBlock = appCode.substring(0, appCode.indexOf('function App() {'));

fs.mkdirSync('src/contexts', { recursive: true });
fs.mkdirSync('src/pages', { recursive: true });
fs.mkdirSync('src/components', { recursive: true });

// 1. Context
const contextCode = `import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Play, Square, Check, LogOut, X, FileText, Edit3, Trash2, MessageCircle } from 'lucide-react';
${importsBlock.replace(/import React.*?;\n/g, '').replace('import "./App.css";\n', '')}
export const ElevoreContext = createContext(null);

export function ElevoreProvider({ children }) {
${contextBlock}
    const contextValue = {
        urlParams, clientJobId, refCode, view, setView, role, setRole, pass, setPass,
        jobs, setJobs, clients, setClients, loading, setLoading, isPrivate, setIsPrivate,
        editId, setEditId, deployTab, setDeployTab, filterSt, setFilterSt, searchQ, setSearchQ,
        toast, setToast, activeStaff, setActiveStaff, quickMode, setQuickMode, selJob, setSelJob,
        state, setState, activityLog, setActivityLog, showToast, log, refresh, loadPortal,
        onNameChange, pricing, deploy, quickDeploy, recordTime, sendUpsell, calcBonus, realProfit,
        finance, clientDNA, todayStr, filtered, StaffJob, sendWA, printInvoice, exportCSV
    };

    return (
        <ElevoreContext.Provider value={contextValue}>
            {children}
        </ElevoreContext.Provider>
    );
}

export const useElevore = () => useContext(ElevoreContext);
`;
fs.writeFileSync('src/contexts/ElevoreContext.jsx', contextCode);

// 2. Portal
fs.writeFileSync('src/pages/ClientPortal.jsx', `import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import SigPad from '../components/ui/SigPad';
import PhotoDrive from '../components/ui/PhotoDrive';
import QRCode from '../components/ui/QRCode';
import { fmt$, fmtDate, GOOGLE_LINK } from '../lib/helpers';

export default function ClientPortal() {
    const { jobs, loading, toast, showToast, clientJobId, loadPortal } = useElevore();
    const view = 'portal';
${portalBlock}
    return null;
}
`);

// 3. Auth
fs.writeFileSync('src/pages/AuthPage.jsx', `import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { ADMIN_PIN, STAFF_PIN } from '../lib/constants';

export default function AuthPage() {
    const { pass, setPass, setView, setRole, showToast, toast } = useElevore();
    const view = 'auth';
${authBlock}
    return null;
}
`);

// 4. Staff
fs.writeFileSync('src/pages/StaffDashboard.jsx', `import React, { useState } from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { ArrowLeft, Play, Square, Check, LogOut } from 'lucide-react';
import { fmtDate, CHECKLIST, ADDONS } from '../lib/constants'; // assuming they are in constants or helpers
import PhotoDrive from '../components/ui/PhotoDrive';

export default function StaffDashboard() {
    const { role, activeStaff, setActiveStaff, toast, showToast, recordTime, sendUpsell, calcBonus, refresh, jobs, todayStr } = useElevore();
    const staffJobs = jobs.filter(j => j.team_assigned && j.scheduled_date === todayStr);
${staffBlock}
    return null;
}
`);

// 5. QuickQuote
fs.writeFileSync('src/components/QuickQuote.jsx', `import React, { useState, useMemo } from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { X } from 'lucide-react';

export default function QuickQuote() {
    const { setQuickMode, quickDeploy } = useElevore();
${qqBlock.replace('const QuickQuote=()=>{', '').replace(/};\n$/, '')}
}
`);

// 6. MorningBrief
fs.writeFileSync('src/components/MorningBrief.jsx', `import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { fmt$ } from '../lib/helpers';

export default function MorningBrief() {
    const { jobs, todayStr, finance, sendWA, setView } = useElevore();
${briefBlock.replace('const MorningBrief=()=>(', 'return (').replace(/\);\n$/, ';')}
}
`);

// 7. Admin
fs.writeFileSync('src/pages/AdminDashboard.jsx', `import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { LogOut, FileText, Edit3, Trash2, MessageCircle } from 'lucide-react';
import QuickQuote from '../components/QuickQuote';
import MorningBrief from '../components/MorningBrief';
import BarChart from '../components/ui/BarChart';
import PhotoDrive from '../components/ui/PhotoDrive';
import QRCode from '../components/ui/QRCode';
import { fmt$, fmtDate, clientLevel, daysAgo, INITIAL, MONTHLY_GOAL, QUICK_JOBS, RISK_P, ADDONS } from '../lib/constants';

export default function AdminDashboard() {
    const { 
        toast, quickMode, setQuickMode, isPrivate, setIsPrivate, setView, view,
        setEditId, setState, setDeployTab, loading, finance, activityLog, exportCSV,
        searchQ, setSearchQ, filterSt, setFilterSt, filtered, clientDNA, realProfit, calcBonus,
        sendWA, printInvoice, refresh, log, showToast, clients, jobs, state, onNameChange, deployTab, pricing
    } = useElevore();

${adminBlock}
}
`);

// Rewrite App.jsx
fs.writeFileSync('src/App.jsx', `import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ElevoreProvider, useElevore } from './contexts/ElevoreContext';
import ClientPortal from './pages/ClientPortal';
import AuthPage from './pages/AuthPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import "./App.css";

function AppRouter() {
    const { view, role, clientJobId } = useElevore();

    if (view === 'portal') return <ClientPortal />;
    if (view === 'auth') return <AuthPage />;
    if (role === 'staff') return <StaffDashboard />;
    return <AdminDashboard />;
}

function App() {
    return (
        <ElevoreProvider>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </ElevoreProvider>
    );
}

export default App;
`);

console.log('App completely refactored.');
