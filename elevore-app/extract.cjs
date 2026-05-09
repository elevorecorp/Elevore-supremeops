const fs = require('fs');
const html = fs.readFileSync('../index.html', 'utf8');
const scriptStart = html.indexOf('<script type="text/babel">') + 26;
const scriptEnd = html.indexOf('</script>', scriptStart);
let js = html.substring(scriptStart, scriptEnd);

js = js.replace('const { useState, useMemo, useEffect, useCallback, useRef } = React;', "import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';\nimport { createClient } from '@supabase/supabase-js';\nimport { Play, Square, ArrowLeft, X, LogOut, Eye, EyeOff, FileText, Edit3, Trash2, MessageCircle, Sun, BarChart2, ShieldCheck, Users, Image as ImageIcon, Zap, Check } from 'lucide-react';");
js = js.replace(/window\.supabase\.createClient/, 'createClient');
js = js.replace(/setTimeout\(\(\)=>lucide\.createIcons\(\),[^\)]+\);/g, ''); // remove lucide.createIcons

js = js.replace(/<i data-lucide="([^"]+)"([^>]*)><\/i>/g, (m, p1, p2) => {
    const map = {
        'play': 'Play',
        'square': 'Square',
        'arrow-left': 'ArrowLeft',
        'x': 'X',
        'log-out': 'LogOut',
        'eye': 'Eye',
        'eye-off': 'EyeOff',
        'file-text': 'FileText',
        'edit-3': 'Edit3',
        'trash-2': 'Trash2',
        'message-circle': 'MessageCircle',
        'sun': 'Sun',
        'bar-chart-2': 'BarChart2',
        'shield-check': 'ShieldCheck',
        'users': 'Users',
        'image': 'ImageIcon',
        'zap': 'Zap',
        'check': 'Check'
    };
    return '<' + (map[p1] || p1) + p2 + ' />';
});

js = js.replace(/const root=ReactDOM\.createRoot[\s\S]*/, 'export default App;');
fs.writeFileSync('src/App.jsx', js);
console.log('App.jsx extracted!');
