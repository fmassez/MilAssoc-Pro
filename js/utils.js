export class Utils {
    static showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMsg');
        if(!toast || !toastMsg) { alert(msg); return; }
        const colors = { success:{bg:'var(--accent)',icon:'✓'}, error:{bg:'#ef4444',icon:'✕'}, info:{bg:'#3b82f6',icon:'ℹ'}, warning:{bg:'#f59e0b',icon:'⚠'} };
        const cfg = colors[type] || colors.success;
        toastMsg.textContent = msg;
        toast.style.background = cfg.bg;
        toast.style.color = 'white';
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
        clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(() => { toast.style.transform = 'translateY(100px)'; toast.style.opacity = '0'; }, 3000);
    }
    static showError(msg, el) { if(el) { el.style.display='block'; el.textContent=msg; } }
    static hideError(el) { if(el) { el.style.display='none'; el.textContent=''; } }
    static debounce(func, wait) { let timeout; return function(...args) { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), wait); }; }
    static throttle(func, limit) { let inThrottle; return function(...args) { if(!inThrottle) { func.apply(this, args); inThrottle=true; setTimeout(()=>inThrottle=false, limit); } }; }
    static async copyToClipboard(text) {
        try { if(navigator.clipboard) { await navigator.clipboard.writeText(text); return true; } else { const ta=document.createElement('textarea'); ta.value=text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); return true; } }
        catch(err) { console.error('Copie:', err); return false; }
    }
    static formatDate(date, opts={}) { const d=new Date(date); if(isNaN(d.getTime())) return 'Date invalide'; return d.toLocaleDateString('fr-FR', {day:'2-digit',month:'2-digit',year:'numeric',...opts}); }
    static formatTime(date) { const d=new Date(date); if(isNaN(d.getTime())) return '--:--'; return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
    static formatEuro(amt, showSign=false) { const sign=showSign?(amt>=0?'+':''):''; return sign+'€ '+Math.abs(amt).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
    static generateId() { return Date.now() + Math.floor(Math.random()*10000); }
    static generateUUID() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);}); }
    static truncate(text, max) { if(!text||text.length<=max) return text||''; return text.substring(0,max-3)+'...'; }
    static escapeHtml(str) { if(!str) return ''; const div=document.createElement('div'); div.textContent=str; return div.innerHTML; }
    static isEmpty(v) { if(v===null||v===undefined) return true; if(typeof v==='string'&&v.trim()==='') return true; if(Array.isArray(v)&&v.length===0) return true; if(typeof v==='object'&&Object.keys(v).length===0) return true; return false; }
    static parseCSV(csv, delim=',') { const lines=csv.trim().split('\n'); if(lines.length<2) return []; const headers=lines[0].split(delim).map(h=>h.trim().replace(/^"|"$/g,'')); const result=[]; for(let i=1;i<lines.length;i++){ if(!lines[i].trim()) continue; const vals=lines[i].split(delim).map(v=>v.trim().replace(/^"|"$/g,'')); const obj={}; for(let j=0;j<headers.length;j++) obj[headers[j]]=vals[j]||''; result.push(obj); } return result; }
    static toCSV(data, headers=null, delim=',') { delim=delim||','; if(!data||data.length===0) return ''; headers=headers||Object.keys(data[0]); const esc=v=>{if(v===null||v===undefined) return '""'; v=String(v); if(v.indexOf(delim)>=0||v.indexOf('"')>=0) return '"'+v.replace(/"/g,'""')+'"'; return v;}; const lines=[headers.map(esc).join(delim)]; for(const row of data) lines.push(headers.map(h=>esc(row[h])).join(delim)); return lines.join('\n'); }
    static downloadFile(content, filename, mime='application/octet-stream') { const blob=new Blob([content],{type:mime}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }
    static isValidEmail(email) { if(!email) return false; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    static isValidPhoneFR(phone) { if(!phone) return false; return /^(\+33|0)[1-9](\s?\d{2}){4}$/.test(phone.replace(/[\s.-]/g,'')); }
    static sleep(ms) { return new Promise(resolve=>setTimeout(resolve,ms)); }
    static loadImageAsBase64(file, cb) { if(!file||!file.type.startsWith('image/')) { if(cb) cb(null,'Fichier invalide'); return; } const reader=new FileReader(); reader.onload=e=>{if(cb) cb(e.target.result,null);}; reader.onerror=()=>{if(cb) cb(null,'Erreur lecture');}; reader.readAsDataURL(file); }
    static async resizeImage(src, maxWidth, maxHeight) { return new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>{ const canvas=document.createElement('canvas'); const ctx=canvas.getContext('2d'); const ratio=Math.min(maxWidth/img.width, maxHeight/img.height, 1); canvas.width=img.width*ratio; canvas.height=img.height*ratio; ctx.drawImage(img,0,0,canvas.width,canvas.height); resolve(canvas.toDataURL('image/jpeg',0.9)); }; img.onerror=reject; img.src=src; }); }
}
export default Utils;