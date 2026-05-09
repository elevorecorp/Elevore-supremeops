import React from 'react';
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

import { sb } from './lib/supabase.js';
import { STAFF_PAY, MONT
}
