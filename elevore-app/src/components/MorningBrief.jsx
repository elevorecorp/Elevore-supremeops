import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { fmt$ } from '../lib/helpers';

export default function MorningBrief() {
    const { jobs, todayStr, finance, sendWA, setView } = useElevore();
import { sb } from './lib/supabase.js';
import { STAFF_PAY, MONT
}
