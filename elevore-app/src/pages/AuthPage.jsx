import React from 'react';
import { useElevore } from '../contexts/ElevoreContext';
import { sb } from '../lib/supabase';
import { ADMIN_PIN, STAFF_PIN } from '../lib/constants';

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');

  .auth-root {
    font-family: 'Syne', sans-serif;
    min-height: 100vh;
    background: #08090c;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* Background grid */
  .auth-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(240,180,41,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(240,180,41,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  /* Glow orb */
  .auth-root::after {
    content: '';
    position: absolute;
    top: -20%; left: 50%;
    transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse, rgba(240,180,41,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 380px;
    background: #0e1117;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 40px 36px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
  }

  .auth-logo {
    width: 52px; height: 52px;
    background: #f0b429;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-style: italic; font-size: 24px; color: #000;
    margin: 0 auto 28px;
    box-shadow: 0 8px 32px rgba(240,180,41,0.4);
  }

  .auth-title {
    text-align: center;
    font-size: 20px; font-weight: 800;
    color: #f1f3f7;
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 4px;
  }
  .auth-title span { color: #f0b429; font-style: italic; }

  .auth-sub {
    text-align: center;
    font-size: 9px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: #3a4156;
    margin-bottom: 32px;
  }

  .auth-label {
    font-size: 9px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: #5a6478; margin-bottom: 6px; display: block;
  }

  .auth-input {
    width: 100%;
    background: #141820;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 14px 18px;
    color: #f1f3f7;
    font-family: 'JetBrains Mono', monospace;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-align: center;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    margin-bottom: 20px;
    box-sizing: border-box;
  }
  .auth-input:focus {
    border-color: rgba(240,180,41,0.5);
    box-shadow: 0 0 0 3px rgba(240,180,41,0.08);
  }
  .auth-input::placeholder { color: #2a3040; letter-spacing: 0.2em; }

  /* PIN DOTS */
  .pin-dots {
    display: flex; justify-content: center; gap: 10px;
    margin-bottom: 24px;
  }
  .pin-dot {
    width: 10px; height: 10px; border-radius: 50%;
    border: 2px solid #2a3040; background: transparent;
    transition: all 0.2s;
  }
  .pin-dot.filled { background: #f0b429; border-color: #f0b429; box-shadow: 0 0 10px rgba(240,180,41,0.5); }

  .auth-btn {
    width: 100%; padding: 16px;
    background: #f0b429; color: #000;
    border: none; border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.1em;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(240,180,41,0.3);
    transition: all 0.15s;
    margin-bottom: 12px;
  }
  .auth-btn:hover { background: #f5c842; box-shadow: 0 12px 32px rgba(240,180,41,0.4); }
  .auth-btn:active { transform: scale(0.98); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  .auth-version {
    text-align: center;
    font-size: 8px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: #2a3040;
    margin-top: 20px;
  }

  .auth-toast {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    z-index: 9999; padding: 12px 24px; border-radius: 10px;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    white-space: nowrap; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: toastIn 0.3s ease;
  }
  @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(-10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

  .auth-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 0 0 16px;
    color: #2a3040; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.05);
  }

  /* Error shake */
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60% { transform: translateX(-6px); }
    40%,80% { transform: translateX(6px); }
  }
  .shake { animation: shake 0.4s ease; }
`;

export default function AuthPage() {
    const {
        pass, setPass, setRole, setView, showToast, toast,
        setLoading, staffList, setStaffList, setStaffName
    } = useElevore();

    const [inputRef] = React.useState(React.createRef());
    const [shaking, setShaking] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const pinLength = pass.length;

    async function handleLogin() {
        if (!pass.trim()) return;
        setIsLoading(true);
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
                showToast('Invalid PIN', 'red');
                setShaking(true);
                setPass('');
                setTimeout(() => setShaking(false), 500);
            }
        }

        setIsLoading(false);
        setLoading(false);
    }

    return (
        <div className="auth-root">
            <style>{css}</style>

            {toast && (
                <div className="auth-toast" style={{ background: toast.color === 'red' ? '#f0483e' : '#22d07a', color: '#fff' }}>
                    {toast.msg}
                </div>
            )}

            <div className="auth-card">
                {/* LOGO */}
                <div className="auth-logo">E</div>

                {/* HEADING */}
                <h1 className="auth-title">ELEVORE <span>EMPIRE</span></h1>
                <p className="auth-sub">Operations Command System</p>

                {/* PIN DOTS */}
                <div className="pin-dots">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`pin-dot ${i < pinLength ? 'filled' : ''}`} />
                    ))}
                </div>

                {/* INPUT */}
                <label className="auth-label">Access PIN</label>
                <input
                    ref={inputRef}
                    type="password"
                    maxLength={8}
                    placeholder="••••••"
                    className={`auth-input ${shaking ? 'shake' : ''}`}
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    onKeyDown={async e => { if (e.key === 'Enter') await handleLogin(); }}
                    autoFocus
                />

                {/* UNLOCK BTN */}
                <button className="auth-btn" onClick={handleLogin} disabled={isLoading || !pass.trim()}>
                    {isLoading ? 'Verifying...' : '⚡ Unlock System'}
                </button>

                {/* VERSION */}
                <p className="auth-version">Elevore v95.0 · Built to Dominate</p>
            </div>
        </div>
    );
}