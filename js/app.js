/**
 * MilAssoc Pro - Module Application Principale
 * Version globale (compatible GitHub Pages sans bundler)
 */

(function(global) {
    'use strict';
    
    const App = {
        currentUser: null,
        curPage: 'dashboard',
        memSort: {field:'last', dir:1},
        memPage: 1,
        memPageSize: 8,
        curConv: 0,
        pendingConfirm: null,
        adminTab: 'grades',
        docViewMode: 'grid',
        calMonth: new Date().getMonth(),
        calYear: new Date().getFullYear(),
        
        // Thèmes (copie de DB.DEFAULTS.config.themes)
        THEMES: {
            kaki: {name:'Kaki Militaire',bgDark:'#0f1a0f',bgCard:'#1a2a1a',bgInput:'#243524',border:'#2d402d',accent:'#4f7a3f',accentLight:'#6b9e55',text:'#e0e8d8',textDim:'#8a9a80',textMuted:'#5a6a50',light:false},
            bleu: {name:'Bleu Marine',bgDark:'#0a1520',bgCard:'#112030',bgInput:'#182a40',border:'#1e3550',accent:'#2563eb',accentLight:'#3b82f6',text:'#dce8f5',textDim:'#7a9ab8',textMuted:'#4a6a88',light:false},
            clair_bleu: {name:'Clair - Bleu Ciel',bgDark:'#e8edf2',bgCard:'#ffffff',bgInput:'#f0f4f8',border:'#c4d0de',accent:'#2563eb',accentLight:'#3b82f6',text:'#112030',textDim:'#4a6a88',textMuted:'#7a9ab8',light:true}
        },
        
        init: function() {
            console.log('[App] Initialisation...');
            this.setupEventListeners();
            this.checkAuth();
        },
        
        setupEventListeners: function() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) resetBtn.addEventListener('click', () => { if(confirm('Réinitialiser ?')) { DB.resetAll(); location.reload(); }});
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) searchInput.addEventListener('input', (e) => this.doGlobalSearch(e.target.value));
            window.addEventListener('resize', () => this.responsive());
        },
        
        checkAuth: function() {
            try {
                const session = sessionStorage.getItem('milassoc_session');
                if (session) {
                    const { email } = JSON.parse(session);
                    const users = DB.getUsers();
                    const user = users.find(u => u.email === email);
                    if (user && user.status === 'Actif') {
                        this.currentUser = user;
                        this.showApp();
                        return true;
                    }
                    sessionStorage.removeItem('milassoc_session');
                }
            } catch (e) { console.error('[App] checkAuth:', e); }
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appShell').style.display = 'none';
            return false;
        },
        
        handleLogin: function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim();
            const pass = document.getElementById('loginPass')?.value;
            const errEl = document.getElementById('loginError');
            if (!email || !pass) { if(errEl){errEl.style.display='block';errEl.textContent='Champs requis';} return; }
            const users = DB.getUsers();
            const user = users.find(u => u.email === email && u.pass === pass);
            if (user) {
                this.currentUser = user;
                sessionStorage.setItem('milassoc_session', JSON.stringify({id:user.id,email:user.email}));
                if(errEl) errEl.style.display='none';
                this.showApp();
            } else {
                if(errEl){errEl.style.display='block';errEl.textContent='Identifiants incorrects';}
                if(document.getElementById('loginPass')) document.getElementById('loginPass').value='';
            }
        },
        
        showApp: function() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appShell').style.display = '';
            const cfg = DB.getConfig();
            const theme = this.THEMES[cfg.theme] || this.THEMES.clair_bleu;
            this.applyTheme(theme);
            this.updateUserInfo();
            this.buildSidebar();
            this.renderNotifs();
            this.responsive();
            this.navigateTo('dashboard');
        },
        
        applyTheme: function(theme) {
            const root = document.documentElement.style;
            Object.entries(theme).forEach(([k,v]) => { if(!['name','light'].includes(k)) root.setProperty(`--${k}`, v); });
            document.body.style.background = theme.bgDark;
            document.body.style.color = theme.text;
        },
        
        updateUserInfo: function() {
            if(!this.currentUser) return;
            const {name, role, photo} = this.currentUser;
            document.getElementById('userName').textContent = name;
            document.getElementById('userRole').textContent = role;
            const avatar = document.getElementById('userAvatar');
            if(photo) avatar.innerHTML = `<img src="${photo}" class="avatar-photo">`;
            else { const ini = name.split(' ').map(w=>w[0]).join('').slice(0,2); avatar.textContent = ini; }
        },
        
        buildSidebar: function() {
            const nav = document.getElementById('sidebarNav'); if(!nav) return;
            const items = [ /* ... menu items ... */ ];
            nav.innerHTML = items.filter(i => this.hasRole(i.roles)).map(i => this.renderNavItem(i)).join('');
        },
        
        hasRole: function(roles) { return this.currentUser && roles.includes(this.currentUser.role); },
        renderNavItem: function(item) { /* ... render logic ... */ },
        
        navigateTo: function(page) { /* ... navigation logic ... */ },
        showToast: function(msg) { /* ... toast logic ... */ },
        // ... autres méthodes ...
    };
    
    // Exposition globale
    global.App = App;
    
})(typeof window !== 'undefined' ? window : this);