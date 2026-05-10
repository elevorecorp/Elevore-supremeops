import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { ADMIN_PIN, STAFF_PIN } from '../lib/constants';

export default function AuthPage() {
    const { 
        pass, setPass, setRole, setView, showToast, toast, 
        setLoading, staffList, setStaffList, setStaffName 
    } = useElevore();

    async function handleLogin() {
        setLoading(true);
        const { data: s } = await sb.from('elevore_staff').select('*');
        const currentStaff = s || staffList;
        if (s) setStaffList(s);

        if (pass === ADMIN_PIN) { 
            setRole('admin'); 
            setView('brief'); 
        } else {
            const member = currentStaff.find(ss => ss.pin === pass);
            if (member) { 
                setStaffName(member.name); 
                setRole('staff'); 
                setView('staff'); 
            } else if (pass === STAFF_PIN) { 
                setStaffName(''); 
                setRole('staff'); 
                setView('staff'); 
            } else {
                showToast("Invalid PIN", 'red');
            }
        }
        setLoading(false);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-black">
            {toast && (
                <div className={`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl ${toast.color === 'red' ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                    {toast.msg}
                </div>
            )}
            <div className="g p-10 w-full max-w-sm text-center space-y-7 border-t-4 border-amber-500 shadow-2xl">
                <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center font-black italic text-3xl text-black">E</div>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-white">ELEVORE <span className="text-amber-500 italic">EMPIRE</span></h1>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">v95.0 — Built to Dominate</p>
                </div>
                <input 
                    type="password" 
                    placeholder="ACCESS PIN" 
                    className="inp text-center text-xl tracking-[0.5em]"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    onKeyDown={async (e) => {
                        if (e.key === 'Enter') await handleLogin();
                    }}
                />
                <button onClick={handleLogin} className="w-full gold py-4 rounded-xl font-black uppercase active:scale-95 shadow-xl">Unlock Matrix</button>
            </div>
        </div>
    );
}
