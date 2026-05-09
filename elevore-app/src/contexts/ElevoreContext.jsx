import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ArrowLeft, Play, Square, Check, LogOut, X, FileText, Edit3, Trash2, MessageCircle } from 'lucide-react';
import { sb } from './lib/supabase.js';
import { STAFF_PAY, MONTHLY_GOAL, GOOGLE_LINK, ADMIN_PIN, STAFF_PIN, PRIVATE_PIN, ADDONS, QUICK_JOBS, RISK_P, CHECKLIST, SVC_LEVELS, CLIENT_LEVELS, INITIAL } from './lib/constants.js';
import { calcDNA, clientLevel, daysAgo, fmt$, fmtDate } from './lib/helpers.js';
import SigPad from './components/ui/SigPad.jsx';
import PhotoDrive from './components/ui/PhotoDrive.jsx';
import BarChart from './components/ui/BarChart.jsx';
import QRCode from './components/ui/QRCode.jsx';



import { Play, Square, ArrowLeft, X, LogOut, Eye, EyeOff, FileText, Edit3, Trash2, MessageCircle, Sun, BarChart2, ShieldCheck, Users, Image as ImageIcon, Zap, Check } from 'lucide-react';

// ════════════════════════════════════════════════════════════

export const ElevoreContext = createContext(null);

export function ElevoreProvider({ children }) {
import { sb } fr
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
