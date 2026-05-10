import { CLIENT_LEVELS } from './constants.js';

function calcDNA(jobs) {
    if(!jobs.length) return 0;
    let s = Math.min(40,jobs.length*10);
    s += Math.min(30,jobs.filter(j=>j.status==='paid').length*10);
    s += Math.min(20,jobs.filter(j=>j.specs?.frequency&&j.specs.frequency!=='one-time').length*10);
    s += jobs.some(j=>j.specs?.referral)?10:0;
    return Math.min(100,s);
}
function clientLevel(jobCount) {
    let lvl = CLIENT_LEVELS[0];
    CLIENT_LEVELS.forEach(l=>{ if(jobCount>=l.min) lvl=l; });
    return lvl;
}
function daysAgo(dateStr) {
    if(!dateStr) return 999;
    return Math.round((Date.now()-new Date(dateStr).getTime())/86400000);
}
function fmt$(n) { return '$'+Math.round(n||0).toLocaleString(); }
function fmtDate(d) { if(!d) return 'TBD'; return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'}); }

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180; const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export {
  calcDNA,
  clientLevel,
  daysAgo,
  fmt$,
  fmtDate,
  getDistance
};