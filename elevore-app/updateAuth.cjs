const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add email/password state
code = code.replace(
    /const \[view,\s*setView\]\s*=\s*useState\(clientJobId\?'portal':'auth'\);\r?\n\s*const \[role,\s*setRole\]\s*=\s*useState\('admin'\);\r?\n\s*const \[pass,\s*setPass\]\s*=\s*useState\(""\);/m,
    `    const [view,       setView]      = useState(clientJobId?'portal':'auth');\n    const [role,       setRole]      = useState('admin');\n    const [email,      setEmail]     = useState("");\n    const [password,   setPassword]  = useState("");\n    const [session,    setSession]   = useState(null);`
);

// 2. Update useEffect for Auth state change
code = code.replace(
    /useEffect\(\(\)=>\{\r?\n\s*if\(view==='portal'&&clientJobId\) loadPortal\(\);\r?\n\s*else if\(view!=='auth'\) refresh\(\);\r?\n\s*\},\[view,refresh\]\);/m,
    `    useEffect(() => {\n        sb.auth.getSession().then(({ data: { session } }) => {\n            setSession(session);\n            if (session && !clientJobId) {\n                const userRole = session.user.email === 'admin@elevore.com' ? 'admin' : 'staff';\n                setRole(userRole);\n                setView(userRole === 'admin' ? 'brief' : 'staff');\n            }\n        });\n\n        const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {\n            setSession(session);\n            if (session && !clientJobId) {\n                const userRole = session.user.email === 'admin@elevore.com' ? 'admin' : 'staff';\n                setRole(userRole);\n                setView(userRole === 'admin' ? 'brief' : 'staff');\n            } else if (!session && view !== 'portal') {\n                setView('auth');\n            }\n        });\n\n        return () => subscription.unsubscribe();\n    }, [clientJobId, view]);\n\n    useEffect(()=>{\n        if(view==='portal'&&clientJobId) loadPortal();\n        else if(view!=='auth' && view!=='portal') refresh();\n    },[view,refresh,clientJobId]);`
);

// 3. Replace Auth View
const authRegex = /\/\/ ── AUTH ─────────────────────────────────────────────────\r?\n\s*if\(view==='auth'\) return\([\s\S]*?\);\r?\n\r?\n\s*\/\/ ── STAFF VIEW/m;

const newAuthView = `// ── AUTH ─────────────────────────────────────────────────
    if(view==='auth') {
        const handleAuth = async (e, isSignUp = false) => {
            e.preventDefault();
            if(!email || !password) return showToast("Falta correo o contraseña", 'red');
            setLoading(true);
            let result;
            if(isSignUp) {
                result = await sb.auth.signUp({ email, password });
                if(!result.error) showToast("Cuenta creada! Revisa tu email (si aplica)");
            } else {
                result = await sb.auth.signInWithPassword({ email, password });
            }
            if (result.error) showToast(result.error.message, 'red');
            setLoading(false);
        };

        return(
            <div className="min-h-screen flex items-center justify-center p-6 bg-black">
                {toast&&<div className={\`toast fixed top-5 left-1/2 -translate-x-1/2 z-[500] px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-2xl \${toast.color==='red'?'bg-red-600':'bg-green-600'} text-white\`}>{toast.msg}</div>}
                <div className="g p-10 w-full max-w-sm text-center space-y-7 border-t-4 border-amber-500 shadow-2xl">
                    <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center font-black italic text-3xl text-black">E</div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">ELEVORE <span className="text-amber-500 italic">EMPIRE</span></h1>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">SaaS Edition — Secure Access</p>
                    </div>
                    <form className="space-y-4">
                        <input type="email" placeholder="EMAIL DE ACCESO" className="inp text-center"
                            onChange={e=>setEmail(e.target.value)} required/>
                        <input type="password" placeholder="CONTRASEÑA" className="inp text-center"
                            onChange={e=>setPassword(e.target.value)} required/>
                        <div className="flex gap-2">
                            <button onClick={(e)=>handleAuth(e, false)} disabled={loading} className="flex-1 bg-amber-500 text-black py-4 rounded-xl font-black uppercase active:scale-95 shadow-xl disabled:opacity-50">
                                {loading ? '...' : 'Entrar'}
                            </button>
                            <button onClick={(e)=>handleAuth(e, true)} disabled={loading} className="flex-1 bg-white text-black py-4 rounded-xl font-black uppercase shadow-xl active:scale-95 disabled:opacity-50">
                                Registro
                            </button>
                        </div>
                    </form>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-4">
                        ¿Pines Legacy? Crea el usuario:<br/>
                        admin@elevore.com / staff@elevore.com
                    </p>
                </div>
            </div>
        );
    }

    // ── STAFF VIEW`;

code = code.replace(authRegex, newAuthView);

// 4. Update logout buttons
// Staff logout
code = code.replace(
    /<button onClick=\{\(\)=>\{setRole\('admin'\);setView\('auth'\);\}\} className="p-3 bg-slate-900 rounded-xl text-slate-500"><LogOut \/><\/button>/g,
    `<button onClick={()=>sb.auth.signOut()} className="p-3 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><LogOut className="w-4 h-4" /></button>`
);

// Top nav logout
code = code.replace(
    /<button onClick=\{\(\)=>setView\('auth'\)\} className="p-2\.5 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><LogOut className="w-4 h-4" \/><\/button>/g,
    `<button onClick={()=>sb.auth.signOut()} className="p-2.5 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-all"><LogOut className="w-4 h-4" /></button>`
);

// Fix eye icon if it was converted wrongly in earlier step
code = code.replace(
    /<button onClick=\{\(\)=>setIsPrivate\(p=>!p\)\} className="p-2\.5 bg-slate-900 rounded-xl text-slate-500 hover:text-amber-500 transition-all"><i data-lucide=\{isPrivate\?'eye-off':'eye'\} className="w-4 h-4"><\/i><\/button>/g,
    `<button onClick={()=>setIsPrivate(p=>!p)} className="p-2.5 bg-slate-900 rounded-xl text-slate-500 hover:text-amber-500 transition-all">{isPrivate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>`
);

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx Auth updated successfully!');
