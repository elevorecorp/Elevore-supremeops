import React from 'react';

function BarChart({data,color='#22c55e',label=''}) {
    const max=Math.max(...data.map(d=>d.v),1);
    return(
        <div>
            {label&&<p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>}
            <div className="flex items-end gap-1 h-20 w-full">
                {data.map((d,i)=>(
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="bar w-full" style={{height:`${(d.v/max)*70}px`,background:d.c||color}}></div>
                        <span className="text-[7px] text-slate-600 font-black leading-none">{d.l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BarChart;