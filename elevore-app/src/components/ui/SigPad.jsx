import React, { useState, useEffect, useRef } from 'react';

function SigPad({onSave,label="Sign to approve"}) {
    const ref = useRef(null);
    const [drawing,setDrawing] = useState(false);
    const [has,setHas] = useState(false);

    useEffect(()=>{
        const c=ref.current; if(!c) return;
        const resize=()=>{ c.width=c.offsetWidth; c.height=140; };
        resize();
        window.addEventListener('resize',resize);
        return ()=>window.removeEventListener('resize',resize);
    },[]);

    const xy=(e)=>{ const r=ref.current.getBoundingClientRect(); const s=e.touches?e.touches[0]:e; return{x:s.clientX-r.left,y:s.clientY-r.top}; };
    const start=(e)=>{ e.preventDefault(); const{x,y}=xy(e); const ctx=ref.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(x,y); setDrawing(true); };
    const move=(e)=>{ if(!drawing) return; e.preventDefault(); const{x,y}=xy(e); const ctx=ref.current.getContext('2d'); ctx.lineTo(x,y); ctx.strokeStyle='#22c55e'; ctx.lineWidth=3; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke(); setHas(true); };
    const stop=()=>setDrawing(false);
    const clear=()=>{ ref.current.getContext('2d').clearRect(0,0,ref.current.width,ref.current.height); setHas(false); };

    return(
        <div className="space-y-3">
            <p className="text-[10px] font-black text-amber-500 uppercase text-center tracking-widest">{label}</p>
            <canvas ref={ref} className="sigpad" style={{height:'140px'}}
                onMouseDown={start} onTouchStart={start}
                onMouseMove={move}  onTouchMove={move}
                onMouseUp={stop}    onTouchEnd={stop} onMouseLeave={stop}/>
            <div className="flex gap-2">
                <button onClick={clear} className="flex-1 py-3 bg-white/5 text-slate-400 rounded-xl font-black uppercase text-[10px] active:scale-95">Clear</button>
                <button onClick={()=>has&&onSave(ref.current.toDataURL('image/png'))} disabled={!has}
                    className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] active:scale-95 ${has?'gold':'bg-white/5 text-slate-600'}`}>
                    {has?'✅ Confirm':'Sign above'}
                </button>
            </div>
        </div>
    );
}

export default SigPad;