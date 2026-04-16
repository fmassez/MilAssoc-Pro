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
        const items = [
            {id:'dashboard',label:'Tableau de Bord',icon:'<rect x="3" y="3" width="7" height="7" rx="1"/>',roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'members',label:'Membres',icon:'<circle cx="9" cy="7" r="4"/>',roles:['Administrateur','Secrétaire','Lecteur seul']},
            {id:'events',label:'Événements',icon:'<rect x="3" y="4" width="18" height="18" rx="2"/>',roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'admin',label:'Administration',icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',roles:['Administrateur']}
        ];
        nav.innerHTML = items.filter(i => this.hasRole(i.roles)).map(i => this.renderNavItem(i)).join('');
    }
    
    hasRole(roles) { return this.currentUser && roles.includes(this.currentUser.role); }
    
    renderNavItem(item) {
        const active = item.id === this.currentPage;
        const bg = active ? 'background:rgba(37,99,235,.1);color:var(--accent);font-weight:600;' : 'background:transparent;color:var(--text-dim);';
        return `<a href="#" onclick="App.navigateTo('${item.id}');return false;" data-nav="${item.id}" style="display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:14px;border-radius:8px;transition:all .2s;cursor:pointer;text-decoration:none;${bg}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg><span>${item.label}</span></a>`;
    }
    
    navigateTo(page) {
        this.currentPage = page; this.buildSidebar();
        const titles = {dashboard:'Tableau de Bord',members:'Membres',events:'Événements',admin:'Administration'};
        document.getElementById('pageTitle').textContent = titles[page]||page;
        const area = document.getElementById('contentArea');
        area.innerHTML = `<p style="padding:24px;text-align:center;color:var(--text-dim);">Page ${page} - En développement</p>`;
        area.classList.remove('fade-in'); void area.offsetWidth; area.classList.add('fade-in');
    }
    
    responsive() {
        const mb = document.getElementById('menuBtn');
        if(window.innerWidth >= 640) { if(mb) mb.style.display = 'none'; }
        else { if(mb) mb.style.display = ''; }
    }
    
    handleLogout() {
        this.currentUser = null;
        sessionStorage.removeItem('milassoc_session');
        document.getElementById('appShell').style.display='none';
        document.getElementById('loginScreen').style.display='flex';
    }
    
    // Méthodes utilitaires
    showToast(msg) { this.utils.showToast(msg); }
    closeModal(id) { document.getElementById(id).style.display='none'; }
    closeAllModals() { const c=document.getElementById('modalsContainer'); if(c)c.innerHTML=''; }
    closeSidebar() { if(window.innerWidth<1024){ document.getElementById('sidebar').classList.remove('sidebar-open'); document.getElementById('sidebarOverlay').style.display='none'; } }
    toggleSidebar() { const sb=document.getElementById('sidebar'),ov=document.getElementById('sidebarOverlay'); sb.classList.toggle('sidebar-open'); ov.style.display=sb.classList.contains('sidebar-open')?'block':'none'; }
    toggleNotifPanel() { const p=document.getElementById('notifPanel'); p.style.display=p.style.display==='none'?'':'none'; }
    clearNotifs() { const ns=db.getNotifs(); for(let i=0;i<ns.length;i++)ns[i].read=true; db.setNotifs(ns); document.getElementById('notifDot').style.display='none'; this.utils.showToast('Notifications lues'); }
    renderNotifs() { const ns=db.getNotifs();let unread=0; for(const n of ns){if(!n.read)unread++;} document.getElementById('notifDot').style.display=unread>0?'':'none'; const el=document.getElementById('notifList'); if(!ns.length){el.innerHTML='<div style="padding:24px;text-align:center;font-size:14px;color:var(--text-dim);">Aucune notification</div>';return;} let h=''; for(const n of ns){ h+=`<div style="padding:12px 16px;border-bottom:1px solid var(--border);${n.read?'':'border-left:3px solid var(--accent);'}"><p style="font-size:14px;color:var(--text);">${n.text}</p><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">${n.time}</p></div>`; } el.innerHTML=h; }
    canEdit() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Secrétaire'); }
    canFinance() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Trésorier'); }
    openQuickAction() { this.utils.showToast('Action rapide - En développement'); }
}

export default App;
