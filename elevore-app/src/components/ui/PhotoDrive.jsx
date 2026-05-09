import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

function PhotoDrive({photos=[],label,onAdd}) {
    const [link,setLink]=useState("");
    return(
        <div className="space-y-2">
            <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
            {!photos.length&&<p className="text-[9px] text-slate-700 italic font-black text-center py-2">No photos yet</p>}
            <div className="grid grid-cols-3 gap-2">
                {photos.map((url,i)=>(
                    <a key={i} href={url} target="_blank" className="g p-3 text-center border border-white/5 hover:border-green-500 transition-all active:scale-95">
                        <ImageIcon className="w-4 h-4 mx-auto text-green-400 mb-1" />
                        <p className="text-[7px] text-slate-400 font-black">Photo {i+1}</p>
                    </a>
                ))}
            </div>
            {onAdd&&(
                <div className="flex gap-2">
                    <input type="text" placeholder="Paste photo link..." value={link} onChange={e=>setLink(e.target.value)} className="inp text-xs text-blue-400 flex-1"/>
                    <button onClick={()=>{if(link.trim()){onAdd(link.trim());setLink("");}}} className="px-4 bg-green-600 text-white rounded-xl font-black text-lg active:scale-95">+</button>
                </div>
            )}
        </div>
    );
}

export default PhotoDrive;