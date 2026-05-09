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

export {
  calcDNA,
  clientLevel,
  daysAgo,
  fmt$,
  fmtDate
};