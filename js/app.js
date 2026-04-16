import { db } from './database.js';
import { Utils } from './utils.js';
import { Themes } from './themes.js';

export class App {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.themes = new Themes();
        this.utils = Utils;
        this.init();
    }
    init() {
        console.log('[App] Initialisation');
        this.setupEventListeners();
        this.checkAuth();
    }
    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if(loginForm) loginForm.addEventListener('submit', e => this.handleLogin(e));
        const resetBtn = document.getElementById('resetBtn');
        if(resetBtn) resetBtn.addEventListener('click', () => { if(confirm('Réinitialiser ?')) { db.resetAll(); location.reload(); }});
        const searchInput = document.getElementById('globalSearch');
        if(searchInput) searchInput.addEventListener('input', e => this.doGlobalSearch(e.target.value));
        window.addEventListener('resize', () => this.responsive());
    }
    async checkAuth() {
        try {
            const session = sessionStorage.getItem('milassoc_session');
            if(session) {
                const { email } = JSON.parse(session);
                const users = db.getUsers();
                const user = users.find(u => u.email === email);
                if(user && user.status === 'Actif') { this.currentUser = user; this.showApp(); return true; }
                sessionStorage.removeItem('milassoc_session');
            }
        } catch(e) { console.error('[App] checkAuth:', e); }
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appShell').style.display = 'none';
        return false;
    }
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value.trim();
        const pass = document.getElementById('loginPass')?.value;
        const errEl = document.getElementById('loginError');
        if(!email || !pass) { if(errEl){errEl.style.display='block';errEl.textContent='Champs requis';} return; }
        const users = db.getUsers();
        const user = users.find(u => u.email === email && u.pass === pass);
        if(user) {
            this.currentUser = user;
            sessionStorage.setItem('milassoc_session', JSON.stringify({id:user.id,email:user.email}));
            if(errEl) errEl.style.display='none';
            this.showApp();
        } else {
            if(errEl){errEl.style.display='block';errEl.textContent='Identifiants incorrects';}
            if(document.getElementById('loginPass')) document.getElementById('loginPass').value='';
        }
    }
    showApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appShell').style.display = '';
        const cfg = db.getConfig();
        this.themes.apply(cfg.theme || 'clair_bleu');
        this.updateUserInfo();
        this.buildSidebar();
        this.renderNotifs();
        this.responsive();
        this.navigateTo('dashboard');
    }
    updateUserInfo() {
        if(!this.currentUser) return;
        const {name, role, photo} = this.currentUser;
        document.getElementById('userName').textContent = name;
        document.getElementById('userRole').textContent = role;
        const avatar = document.getElementById('userAvatar');
        if(photo) avatar.innerHTML = `<img src="${photo}" class="avatar-photo">`;
        else { const ini = name.split(' ').map(w=>w[0]).join('').slice(0,2); avatar.textContent = ini; }
    }
    buildSidebar() {
        const nav = document.getElementById('sidebarNav'); if(!nav) return;
        const items = [ /* ... mêmes items que version monolithique ... */ ];
        nav.innerHTML = items.filter(i => this.hasRole(i.roles)).map(i => this.renderNavItem(i)).join('');
    }
    hasRole(roles) { return this.currentUser && roles.includes(this.currentUser.role); }
    renderNavItem(item) {
        const active = item.id === this.currentPage;
        const badge = item.badge ? this.getBadgeValue(item.badge) : '';
        const bg = active ? 'background:rgba(37,99,235,.1);color:var(--accent);font-weight:600;' : 'background:transparent;color:var(--text-dim);';
        return `<a href="#" onclick="App.navigateTo('${item.id}');return false;" data-nav="${item.id}" style="display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:14px;border-radius:8px;transition:all .2s;cursor:pointer;text-decoration:none;${bg}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg><span>${item.label}</span>${badge ? `<span style="margin-left:auto;font-size:11px;padding:2px 8px;border-radius:9999px;background:var(--accent);color:var(--bg-dark);">${badge}</span>` : ''}</a>`;
    }
    getBadgeValue(id) { if(id==='navMemCount') return db.getMembers().length; if(id==='navMsgBadge'){ let t=0;const cs=db.getConvs();for(const c of cs) t+=c.unread; return t>0?t:''; } return ''; }
    navigateTo(page) {
        this.currentPage = page; this.buildSidebar();
        const titles = {dashboard:'Tableau de Bord',members:'Membres',events:'Événements',finance:'Finances',documents:'Documents',messages:'Messages',units:'Unités',admin:'Administration',settings:'Paramètres',cards:'Cartes Membres',txReleve:'Relevé de Transactions'};
        document.getElementById('pageTitle').textContent = titles[page]||page;
        const area = document.getElementById('contentArea');
        const fn = {dashboard:this.renderDashboard,members:this.renderMembers,events:this.renderEvents,finance:this.renderFinance,documents:this.renderDocuments,messages:this.renderMessages,units:this.renderUnits,admin:this.renderAdmin,settings:this.renderSettings,cards:this.renderCards,txReleve:this.renderTxReleve};
        area.innerHTML = ''; if(fn[page]) fn[page].call(this);
        area.classList.remove('fade-in'); void area.offsetWidth; area.classList.add('fade-in'); this.closeSidebar();
    }
    // === Méthodes de rendu (placeholders pour modularisation) ===
    renderDashboard() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Dashboard - En développement</p>'; }
    renderMembers() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Membres - En développement</p>'; }
    renderEvents() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Événements - En développement</p>'; }
    renderFinance() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Finances - En développement</p>'; }
    renderDocuments() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Documents - En développement</p>'; }
    renderMessages() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Messages - En développement</p>'; }
    renderUnits() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Unités - En développement</p>'; }
    renderAdmin() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Administration - En développement</p>'; }
    renderSettings() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Paramètres - En développement</p>'; }
    renderCards() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Cartes - En développement</p>'; }
    renderTxReleve() { document.getElementById('contentArea').innerHTML = '<p style="padding:24px;text-align:center;color:var(--text-dim);">Relevé - En développement</p>'; }
    // === Utilitaires ===
    responsive() { const sw=document.getElementById('searchWrap'),mb=document.getElementById('menuBtn'),ql=document.getElementById('qaLabel'); if(window.innerWidth>=640){if(sw)sw.style.display='';if(mb)mb.style.display='none';if(ql)ql.style.display='';} else {if(sw)sw.style.display='none';if(mb)mb.style.display='';if(ql)ql.style.display='none';} }
    doGlobalSearch(val) { if(val.length<2)return; const v=val.toLowerCase(); const mc=db.getMembers().filter(m=>(m.first+' '+m.last+' '+m.grade).toLowerCase().indexOf(v)>-1).length; const ec=db.getEvents().filter(e=>e.title.toLowerCase().indexOf(v)>-1).length; const dc=db.getDocs().filter(d=>d.title.toLowerCase().indexOf(v)>-1).length; this.utils.showToast(mc+' membres, '+ec+' événements, '+dc+' documents'); }
    copyToClipboard(text) { this.utils.copyToClipboard(text).then(()=>this.utils.showToast('Copié !')); }
    getAssociationName() { const cfg = db.getConfig(); return cfg.cardOrgName || CONFIG.APP.name || 'MilAssoc Pro'; }
    // === Modals & UI ===
    showToast(msg) { this.utils.showToast(msg); }
    showConfirm(title,msg,cb) { document.getElementById('cfmTitle').textContent=title; document.getElementById('cfmMsg').textContent=msg; this.pendingConfirm=cb; document.getElementById('confirmModal').style.display=''; }
    execConfirm() { if(this.pendingConfirm){this.pendingConfirm();this.pendingConfirm=null;} document.getElementById('confirmModal').style.display='none'; }
    closeModal(id) { document.getElementById(id).style.display='none'; }
    closeAllModals() { const c=document.getElementById('modalsContainer'); if(c)c.innerHTML=''; }
    showGenericModal(title,html) { const id='m'+(Date.now()); let c = document.getElementById('modalsContainer'); if(!c){c=document.createElement('div');c.id='modalsContainer';document.body.appendChild(c);} c.innerHTML+=`<div id="${id}" style="position:fixed;inset:0;z-index:100;"><div style="position:absolute;inset:0;background:rgba(0,0,0,.4);" onclick="App.closeModal('${id}')"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:12px;border:1px solid var(--border);width:100%;max-width:600px;margin:0 16px;padding:24px;max-height:90vh;overflow-y:auto;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;"><h3 style="font-size:18px;font-weight:600;color:var(--text);">${title}</h3><button onclick="App.closeModal('${id}')" style="padding:4px;background:none;border:none;cursor:pointer;color:var(--text-dim);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>${html}</div></div>`; }
    // === Sidebar ===
    toggleSidebar() { const sb=document.getElementById('sidebar'),ov=document.getElementById('sidebarOverlay'); sb.classList.toggle('sidebar-open'); ov.style.display=sb.classList.contains('sidebar-open')?'block':'none'; }
    closeSidebar() { if(window.innerWidth<1024){ document.getElementById('sidebar').classList.remove('sidebar-open'); document.getElementById('sidebarOverlay').style.display='none'; } }
    // === Notifications ===
    toggleNotifPanel() { const p=document.getElementById('notifPanel'); p.style.display=p.style.display==='none'?'':'none'; }
    clearNotifs() { const ns=db.getNotifs(); for(let i=0;i<ns.length;i++)ns[i].read=true; db.setNotifs(ns); document.getElementById('notifDot').style.display='none'; this.renderNotifs(); this.utils.showToast('Notifications lues'); }
    renderNotifs() { const ns=db.getNotifs();let unread=0; for(const n of ns){if(!n.read)unread++;} document.getElementById('notifDot').style.display=unread>0?'':'none'; const el=document.getElementById('notifList'); if(!ns.length){el.innerHTML='<div style="padding:24px;text-align:center;font-size:14px;color:var(--text-dim);">Aucune notification</div>';return;} let h=''; for(const n of ns){ h+=`<div style="padding:12px 16px;border-bottom:1px solid var(--border);${n.read?'':'border-left:3px solid var(--accent);'}"><p style="font-size:14px;color:var(--text);">${n.text}</p><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">${n.time}</p></div>`; } el.innerHTML=h; }
    // === Permissions ===
    canEdit() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Secrétaire'); }
    canFinance() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Trésorier'); }
    // === Logout ===
    handleLogout() { this.currentUser = null; sessionStorage.removeItem('milassoc_session'); document.getElementById('appShell').style.display='none'; document.getElementById('loginScreen').style.display='flex'; document.getElementById('loginEmail').value=''; document.getElementById('loginPass').value=''; document.getElementById('loginError').style.display='none'; const mc = document.getElementById('modalsContainer'); if(mc) mc.innerHTML=''; }
}

// Export singleton
const app = new App();
window.App = app; // Pour compatibilité callbacks inline
export default app;