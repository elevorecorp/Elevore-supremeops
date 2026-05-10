
import { createClient } from '@supabase/supabase-js';

const SB_URL = 'https://ceijlgurveaalvjmptns.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlaWpsZ3VydmVhYWx2am1wdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MTYwMzEsImV4cCI6MjA5MjM5MjAzMX0.XaPMpXxwMKRM09YN9kroF-gnISM2gBn29wi2R2UdOIc';
const sb = createClient(SB_URL, SB_KEY);

async function check() {
    console.log('--- STAFF LIST ---');
    const { data: staff } = await sb.from('elevore_staff').select('name, pin');
    console.table(staff);

    console.log('\n--- MISSIONS ---');
    const { data: missions } = await sb.from('elevore_missions').select('client_name, team_assigned, status, total_price, deposit_paid');
    console.table(missions);
}

check();
