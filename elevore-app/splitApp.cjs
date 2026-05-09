const fs = require('fs');

let appCode = fs.readFileSync('src/App.jsx', 'utf8');

// Extraction logic based on comments in App.jsx
function extractSection(startComment, endComment) {
    const startIndex = appCode.indexOf(startComment);
    if (startIndex === -1) return null;
    let endIndex = appCode.length;
    if (endComment) {
        endIndex = appCode.indexOf(endComment, startIndex);
        if (endIndex === -1) endIndex = appCode.length;
    }
    const section = appCode.substring(startIndex + startComment.length, endIndex);
    return { section: section.trim(), startIndex, endIndex };
}

let imports = [];

function processSection(startComment, endComment, handler) {
    const extracted = extractSection(startComment, endComment);
    if (extracted) {
        handler(extracted.section);
        appCode = appCode.substring(0, extracted.startIndex) + appCode.substring(extracted.endIndex);
    }
}

const supabaseStart = '// ── SUPABASE ─────────────────────────────────────────────────';
const constantsStart = '// ── CONSTANTS ────────────────────────────────────────────────';
processSection(supabaseStart, constantsStart, (code) => {
    fs.mkdirSync('src/lib', { recursive: true });
    fs.writeFileSync('src/lib/supabase.js', `import { createClient } from '@supabase/supabase-js';\n\n${code}\n\nexport { sb };`);
    imports.push(`import { sb } from './lib/supabase.js';`);
    console.log('Extracted supabase.js');
});

const helpersStart = '// ── HELPERS ──────────────────────────────────────────────────';
processSection(constantsStart, helpersStart, (code) => {
    let exports = ['STAFF_PAY', 'MONTHLY_GOAL', 'GOOGLE_LINK', 'ADMIN_PIN', 'STAFF_PIN', 'PRIVATE_PIN', 'ADDONS', 'QUICK_JOBS', 'RISK_P', 'CHECKLIST', 'SVC_LEVELS', 'CLIENT_LEVELS', 'INITIAL'];
    fs.writeFileSync('src/lib/constants.js', `${code}\n\nexport {\n  ${exports.join(',\n  ')}\n};`);
    imports.push(`import { ${exports.join(', ')} } from './lib/constants.js';`);
    console.log('Extracted constants.js');
});

const sigpadStart = '// ── SIGNATURE PAD ────────────────────────────────────────────';
processSection(helpersStart, sigpadStart, (code) => {
    let exports = ['calcDNA', 'clientLevel', 'daysAgo', 'fmt$', 'fmtDate'];
    fs.writeFileSync('src/lib/helpers.js', `import { CLIENT_LEVELS } from './constants.js';\n\n${code}\n\nexport {\n  ${exports.join(',\n  ')}\n};`);
    imports.push(`import { ${exports.join(', ')} } from './lib/helpers.js';`);
    console.log('Extracted helpers.js');
});

const photoDriveStart = '// ── PHOTO DRIVE ──────────────────────────────────────────────';
processSection(sigpadStart, photoDriveStart, (code) => {
    fs.mkdirSync('src/components/ui', { recursive: true });
    fs.writeFileSync('src/components/ui/SigPad.jsx', `import React, { useState, useEffect, useRef } from 'react';\n\n${code}\n\nexport default SigPad;`);
    imports.push(`import SigPad from './components/ui/SigPad.jsx';`);
});

const barChartStart = '// ── BAR CHART ────────────────────────────────────────────────';
processSection(photoDriveStart, barChartStart, (code) => {
    fs.writeFileSync('src/components/ui/PhotoDrive.jsx', `import React, { useState } from 'react';\nimport { Image as ImageIcon } from 'lucide-react';\n\n${code}\n\nexport default PhotoDrive;`);
    imports.push(`import PhotoDrive from './components/ui/PhotoDrive.jsx';`);
});

const qrCodeStart = '// ── QR CODE (via API) ────────────────────────────────────────';
processSection(barChartStart, qrCodeStart, (code) => {
    fs.writeFileSync('src/components/ui/BarChart.jsx', `import React from 'react';\n\n${code}\n\nexport default BarChart;`);
    imports.push(`import BarChart from './components/ui/BarChart.jsx';`);
});

const endComponentsStart = '// ════════════════════════════════════════════════════════════';
processSection(qrCodeStart, endComponentsStart, (code) => {
    fs.writeFileSync('src/components/ui/QRCode.jsx', `import React from 'react';\n\n${code}\n\nexport default QRCode;`);
    imports.push(`import QRCode from './components/ui/QRCode.jsx';`);
});

appCode = appCode.replace("import { createClient } from '@supabase/supabase-js';", "");
appCode = imports.join('\n') + '\n\n' + appCode;

fs.writeFileSync('src/App.jsx', appCode);
console.log('App.jsx updated correctly');
