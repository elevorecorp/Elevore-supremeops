import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Plus } from 'lucide-react';
import { useElevore } from '../../contexts/ElevoreContext';

export default function PhotoDrive({ photos = [], label = "Photos", onAdd }) {
    const { uploadPhoto } = useElevore();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const url = await uploadPhoto(file);
        if (url) {
            onAdd(url);
        }
        setUploading(false);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                <span className="text-[9px] font-black text-white bg-white/10 px-2 py-0.5 rounded-full">{photos.length}</span>
            </div>

            <div className="flex gap-2 overflow-x-auto no-sb py-1 px-1">
                {/* Add Photo Button */}
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-20 h-20 flex-shrink-0 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-all hover:border-amber-500/50 group"
                >
                    {uploading ? (
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                    ) : (
                        <>
                            <Camera className="w-6 h-6 text-slate-500 group-hover:text-amber-500" />
                            <span className="text-[7px] font-black text-slate-600 uppercase">Add Photo</span>
                        </>
                    )}
                </button>

                {/* Photo List */}
                {photos.map((url, i) => (
                    <div key={i} className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 relative group">
                        <img src={url} alt="Proof" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => window.open(url, '_blank')} className="p-1 bg-white/20 rounded-lg text-white"><ImageIcon className="w-3 h-3" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                onChange={handleFile} 
                className="hidden" 
            />
        </div>
    );
}