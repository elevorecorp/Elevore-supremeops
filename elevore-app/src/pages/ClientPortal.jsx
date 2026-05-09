import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import SigPad from '../components/ui/SigPad';
import PhotoDrive from '../components/ui/PhotoDrive';
import QRCode from '../components/ui/QRCode';
import { fmt$, fmtDate, GOOGLE_LINK } from '../lib/helpers';

export default function ClientPortal() {
    const { jobs, loading, toast, showToast, clientJobId, loadPortal } = useElevore();
    const view = 'portal';
import { sb } from './lib/supabase.js';
import { STAFF_PAY, MONTHLY_GOAL, GOOGLE_LINK, ADMIN_PIN, STAFF_PIN, PRIVATE_PIN, ADDONS
    return null;
}
