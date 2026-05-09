import React, { useState } from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { ArrowLeft, Play, Square, Check, LogOut } from 'lucide-react';
import { fmtDate, CHECKLIST, ADDONS } from '../lib/constants'; // assuming they are in constants or helpers
import PhotoDrive from '../components/ui/PhotoDrive';

export default function StaffDashboard() {
    const { role, activeStaff, setActiveStaff, toast, showToast, recordTime, sendUpsell, calcBonus, refresh, jobs, todayStr } = useElevore();
    const staffJobs = jobs.filter(j => j.team_assigned && j.scheduled_date === todayStr);
import { sb } from './lib/supabase.js';
import { STAFF_PAY, MONT
    return null;
}
