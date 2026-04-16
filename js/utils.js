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
    static isValidEmail(email) { if(!email) return false; return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    static isValidPhoneFR(phone) { if(!phone) return false; return /^(\+33|0)[1-9](\s?\d{2}){4}$/.test(phone.replace(/[\s.-]/g,'')); }
    static sleep(ms) { return new Promise(resolve=>setTimeout(resolve,ms)); }
}

export default Utils;
