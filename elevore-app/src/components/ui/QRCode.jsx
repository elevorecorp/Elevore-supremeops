import React from 'react';

function QRCode({url,size=120}) {
    const qr=`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=ffffff&bgcolor=000000`;
    return <img src={qr} className="rounded-xl" style={{width:size,height:size}} />;
}

export default QRCode;