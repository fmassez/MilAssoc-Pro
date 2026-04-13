// ==========================================
// APPLICATION PRINCIPALE - MilAssoc Pro
// ==========================================

const App = {
    currentUser: null,
    curPage: 'dashboard',
    memSort: {field:'last', dir:1},
    memPage: 1,
    memPageSize: 8,
    curConv: 0,
    pendingConfirm: null,

    THEMES: {
        kaki: {name:'Kaki Militaire',bgDark:'#0f1a0f',bgCard:'#1a2a1a',bgInput:'#243524',border:'#2d402d',accent:'#4f7a3f',accentLight:'#6b9e55',text:'#e0e8d8',textDim:'#8a9a80',textMuted:'#5a6a50'},
        bleu: {name:'Bleu Marine',bgDark:'#0a1520',bgCard:'#112030',bgInput:'#182a40',border:'#1e3550',accent:'#2563eb',accentLight:'#3b82f6',text:'#dce8f5',textDim:'#7a9ab8',textMuted:'#4a6a88'},
        rouge: {name:'Rouge Bordeaux',bgDark:'#1a0a0a',bgCard:'#2a1111',bgInput:'#3a1a1a',border:'#4a2222',accent:'#991b1b',accentLight:'#b91c1c',text:'#f5dcdc',textDim:'#b87a7a',textMuted:'#884a4a'},
        gris: {name:'Gris Ardoise',bgDark:'#111827',bgCard:'#1f2937',bgInput:'#374151',border:'#374151',accent:'#4b5563',accentLight:'#6b7280',text:'#f3f4f6',textDim:'#9ca3af',textMuted:'#6b7280'},
        sable: {name:'Sable du Désert',bgDark:'#1c1510',bgCard:'#2a2018',bgInput:'#3a2e22',border:'#4a3e30',accent:'#a07840',accentLight:'#c09060',text:'#f0e6d8',textDim:'#a89880',textMuted:'#7a6a58'}
    },

    init: function() {
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents: function() {
        var loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.addEventListener('submit', function(e){ App.handleLogin(e); });
        
        var resetBtn = document.getElementById('resetBtn');
        if (resetBtn) resetBtn.addEventListener('click', function(){ App.clearAllData(); });
        
        var searchInput = document.getElementById('globalSearch');
        if (searchInput) searchInput.addEventListener('input', function(){ App.doGlobalSearch(this.value); });

        window.addEventListener('resize', function(){ App.responsive(); });
    },

    checkAuth: function() {
        var session = sessionStorage.getItem('milassoc_session');
        if (session) {
            try {
                var user = JSON.parse(session);
                var users = MilAssocDB.getUsers();
                var found = users.find(function(u){ return u.id === user.id && u.email === user.email; });
                if (found) {
                    this.currentUser = found;
                    this.showApp();
                    return;
                }
            } catch(e) {}
        }
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appShell').style.display = 'none';
    },

    handleLogin: function(e) {
        e.preventDefault();
        var email = document.getElementById('loginEmail').value.trim();
        var pass = document.getElementById('loginPass').value;
        var errEl = document.getElementById('loginError');
        
        if (!email || !pass) {
            errEl.style.display = 'block';
            errEl.textContent = 'Veuillez remplir tous les champs.';
            return;
        }

        var users = MilAssocDB.getUsers();
        var user = null;
        for (var i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].pass === pass) {
                user = users[i];
                break;
            }
        }

        if (user) {
            this.currentUser = user;
            sessionStorage.setItem('milassoc_session', JSON.stringify({id:user.id, email:user.email}));
            errEl.style.display = 'none';
            this.showApp();
        } else {
            errEl.style.display = 'block';
            errEl.textContent = 'Identifiants incorrects.';
            document.getElementById('loginPass').value = '';
        }
    },

    handleLogout: function() {
        this.currentUser = null;
        sessionStorage.removeItem('milassoc_session');
        document.getElementById('appShell').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPass').value = '';
        document.getElementById('loginError').style.display = 'none';
        var mc = document.getElementById('modalsContainer');
        if (mc) mc.innerHTML = '';
    },

    showApp: function() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appShell').style.display = '';
        
        var cfg = MilAssocDB.getConfig();
        this.applyTheme(cfg.theme || 'kaki');
        if (cfg.logo) this.applyLogo(cfg.logo);
        if (cfg.logoBg) this.applyLogoBg(cfg.logoBg);
        if (cfg.bgColor) document.body.style.background = cfg.bgColor;
        
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role;
        var ini = this.currentUser.name.split(' ').map(function(w){return w[0];}).join('').substring(0,2);
        var avatar = document.getElementById('userAvatar');
        avatar.textContent = ini;
        if (this.currentUser.photo) {
            avatar.innerHTML = '<img src="'+this.currentUser.photo+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
        }
        
        // Logo dans le sidebar
        var sidebarLogo = document.getElementById('sidebarLogo');
        if (sidebarLogo && cfg.logo) {
            sidebarLogo.innerHTML = '<img src="'+cfg.logo+'" style="width:100%;height:100%;border-radius:8px;object-fit:cover;">';
            sidebarLogo.style.background = 'transparent';
        }
        
        this.buildSidebar();
        this.renderNotifs();
        this.responsive();
        this.navigateTo('dashboard');
    },

    applyTheme: function(key) {
        var t = this.THEMES[key] || this.THEMES.kaki;
        var cfg = MilAssocDB.getConfig();
        cfg.theme = key;
        MilAssocDB.setConfig(cfg);
        
        var r = document.getElementById('appBody').style;
        r.setProperty('--bg-dark', t.bgDark);
        r.setProperty('--bg-card', t.bgCard);
        r.setProperty('--bg-input', t.bgInput);
        r.setProperty('--border', t.border);
        r.setProperty('--accent', t.accent);
        r.setProperty('--accent-light', t.accentLight);
        r.setProperty('--text', t.text);
        r.setProperty('--text-dim', t.textDim);
        r.setProperty('--text-muted', t.textMuted);
        document.body.style.background = t.bgDark;
        document.body.style.color = t.text;
    },

    applyLogo: function(b64) {
        var cfg = MilAssocDB.getConfig();
        cfg.logo = b64;
        MilAssocDB.setConfig(cfg);
        
        var ids = ['sidebarLogo', 'loginLogoContainer', 'headerLogo'];
        for (var i = 0; i < ids.length; i++) {
            var el = document.getElementById(ids[i]);
            if (!el) continue;
            if (b64) {
                el.innerHTML = '<img src="'+b64+'" style="width:100%;height:100%;object-fit:cover;border-radius:'+(ids[i]==='headerLogo'?'50%':'8px')+';">';
                el.style.background = 'transparent';
            } else {
                var sz = ids[i] === 'loginLogoContainer' ? 36 : 22;
                el.innerHTML = '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><path d="M12 22V12"/><path d="M22 7L12 12 2 7"/></svg>';
                el.style.background = cfg.logoBg || '#4f7a3f';
            }
        }
    },

    applyLogoBg: function(color) {
        var cfg = MilAssocDB.getConfig();
        cfg.logoBg = color;
        MilAssocDB.setConfig(cfg);
        var ids = ['sidebarLogo', 'loginLogoContainer', 'headerLogo'];
        for (var i = 0; i < ids.length; i++) {
            var el = document.getElementById(ids[i]);
            if (el && !cfg.logo) el.style.background = color;
        }
    },

    buildSidebar: function() {
        var nav = document.getElementById('sidebarNav');
        if (!nav) return;
        
        var items = [
            {id:'dashboard',label:'Tableau de Bord',icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',badge:'navMemCount',roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'members',label:'Membres',icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',badge:null,roles:['Administrateur','Secrétaire','Lecteur seul']},
            {id:'events',label:'Événements',icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',badge:null,roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'finance',label:'Finances',icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',badge:null,roles:['Administrateur','Trésorier']},
            {id:'documents',label:'Documents',icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',badge:null,roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'messages',label:'Messages',icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',badge:'navMsgBadge',roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'units',label:'Unités',icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',badge:null,roles:['Administrateur','Secrétaire']},
            {id:'admin',label:'Administration',icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',badge:null,roles:['Administrateur']},
            {id:'settings',label:'Paramètres',icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15.18 15a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',badge:null,roles:['Administrateur']}
        ];

        var h = '';
        for (var i = 0; i < items.length; i++) {
            var n = items[i];
            if (n.roles.indexOf(this.currentUser.role) === -1) continue;
            var active = n.id === this.curPage;
            var badge = '';
            if (n.badge) {
                var bv = this.getBadgeValue(n.badge);
                if (bv) badge = '<span style="margin-left:auto;font-size:11px;padding:2px 8px;border-radius:9999px;background:var(--accent);color:var(--bg-dark);">'+bv+'</span>';
            }
            var bg = active ? 'background:rgba(79,122,63,.2);color:var(--accent-light);font-weight:600;' : 'background:transparent;color:var(--text-dim);';
            h += '<a href="#" onclick="App.navigateTo(\''+n.id+'\');return false;" data-nav="'+n.id+'" style="display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:14px;border-radius:8px;transition:all .2s;cursor:pointer;text-decoration:none;'+bg+'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+n.icon+'</svg><span>'+n.label+'</span>'+badge+'</a>';
        }
        nav.innerHTML = h;
    },

    getBadgeValue: function(id) {
        if (id === 'navMemCount') return MilAssocDB.getMembers().length;
        if (id === 'navMsgBadge') {
            var t = 0; var cs = MilAssocDB.getConvs();
            for (var i = 0; i < cs.length; i++) t += cs[i].unread;
            return t > 0 ? t : '';
        }
        return '';
    },

    navigateTo: function(page) {
        this.curPage = page;
        this.buildSidebar();
        var titles = {dashboard:'Tableau de Bord',members:'Membres',events:'Événements',finance:'Finances',documents:'Documents',messages:'Messages',units:'Unités',admin:'Administration',settings:'Paramètres'};
        document.getElementById('pageTitle').textContent = titles[page] || page;
        
        var area = document.getElementById('contentArea');
        var fn = {dashboard:this.renderDashboard,members:this.renderMembers,events:this.renderEvents,finance:this.renderFinance,documents:this.renderDocuments,messages:this.renderMessages,units:this.renderUnits,admin:this.renderAdmin,settings:this.renderSettings};
        area.innerHTML = '';
        if (fn[page]) fn[page].call(this);
        area.classList.remove('fade-in');
        void area.offsetWidth;
        area.classList.add('fade-in');
        this.closeSidebar();
    },

    // ... (Les autres méthodes de rendu seront incluses dans le fichier complet)

    showToast: function(msg) {
        var t = document.getElementById('toast');
        document.getElementById('toastMsg').textContent = msg;
        t.style.transform = 'translateY(0)';
        t.style.opacity = '1';
        clearTimeout(window._toastT);
        window._toastT = setTimeout(function(){ t.style.transform = 'translateY(100px)'; t.style.opacity = '0'; }, 3000);
    },

    showConfirm: function(title, msg, cb) {
        document.getElementById('cfmTitle').textContent = title;
        document.getElementById('cfmMsg').textContent = msg;
        this.pendingConfirm = cb;
        document.getElementById('confirmModal').style.display = '';
    },

    execConfirm: function() {
        if (this.pendingConfirm) { this.pendingConfirm(); this.pendingConfirm = null; }
        document.getElementById('confirmModal').style.display = 'none';
    },

    closeModal: function(id) { document.getElementById(id).style.display = 'none'; },

    showGenericModal: function(title, html) {
        var id = 'm' + (Date.now());
        var c = document.getElementById('modalsContainer');
        if (!c) { c = document.createElement('div'); c.id = 'modalsContainer'; document.body.appendChild(c); }
        c.innerHTML += '<div id="'+id+'" style="position:fixed;inset:0;z-index:100;"><div style="position:absolute;inset:0;background:rgba(0,0,0,.6);" onclick="App.closeModal(\''+id+'\')"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:12px;border:1px solid var(--border);width:100%;max-width:512px;margin:0 16px;padding:24px;max-height:90vh;overflow-y:auto;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;"><h3 style="font-size:18px;font-weight:600;color:var(--text);">'+title+'</h3><button onclick="App.closeModal(\''+id+'\')" style="padding:4px;background:none;border:none;cursor:pointer;color:var(--text-dim);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'+html+'</div></div>';
    },

    closeAllModals: function() {
        var c = document.getElementById('modalsContainer');
        if (c) c.innerHTML = '';
    },

    toggleSidebar: function() {
        var sb = document.getElementById('sidebar');
        var ov = document.getElementById('sidebarOverlay');
        sb.classList.toggle('sidebar-open');
        ov.style.display = sb.classList.contains('sidebar-open') ? 'block' : 'none';
    },

    closeSidebar: function() {
        document.getElementById('sidebar').classList.remove('sidebar-open');
        document.getElementById('sidebarOverlay').style.display = 'none';
    },

    toggleNotifPanel: function() {
        var p = document.getElementById('notifPanel');
        p.style.display = p.style.display === 'none' ? '' : 'none';
    },

    clearNotifs: function() {
        var ns = MilAssocDB.getNotifs();
        for (var i = 0; i < ns.length; i++) ns[i].read = true;
        MilAssocDB.setNotifs(ns);
        document.getElementById('notifDot').style.display = 'none';
        this.renderNotifs();
        this.showToast('Notifications lues');
    },

    renderNotifs: function() {
        var ns = MilAssocDB.getNotifs();
        var unread = 0;
        for (var i = 0; i < ns.length; i++) { if (!ns[i].read) unread++; }
        document.getElementById('notifDot').style.display = unread > 0 ? '' : 'none';
        var el = document.getElementById('notifList');
        if (!ns.length) { el.innerHTML = '<div style="padding:24px;text-align:center;font-size:14px;color:var(--text-dim);">Aucune notification</div>'; return; }
        var h = '';
        for (var i = 0; i < ns.length; i++) {
            var n = ns[i];
            h += '<div style="padding:12px 16px;border-bottom:1px solid var(--border);'+(n.read?'':'border-left:3px solid var(--accent);')+'"><p style="font-size:14px;color:var(--text);">'+n.text+'</p><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">'+n.time+'</p></div>';
        }
        el.innerHTML = h;
    },

    canEdit: function() { return this.currentUser && (this.currentUser.role === 'Administrateur' || this.currentUser.role === 'Secrétaire'); },
    canFinance: function() { return this.currentUser && (this.currentUser.role === 'Administrateur' || this.currentUser.role === 'Trésorier'); },

    responsive: function() {
        var sw = document.getElementById('searchWrap');
        var mb = document.getElementById('menuBtn');
        var ql = document.getElementById('qaLabel');
        function ck() {
            if (window.innerWidth >= 640) { if(sw) sw.style.display=''; if(mb) mb.style.display='none'; if(ql) ql.style.display=''; }
            else { if(sw) sw.style.display='none'; if(mb) mb.style.display=''; if(ql) ql.style.display='none'; }
        }
        ck();
    },

    doGlobalSearch: function(val) {
        if (val.length < 2) return;
        var v = val.toLowerCase();
        var mc = MilAssocDB.getMembers().filter(function(m){return (m.first+' '+m.last+' '+m.grade+' '+m.mat).toLowerCase().indexOf(v)>-1;}).length;
        var ec = MilAssocDB.getEvents().filter(function(e){return e.title.toLowerCase().indexOf(v)>-1;}).length;
        var dc = MilAssocDB.getDocs().filter(function(d){return d.title.toLowerCase().indexOf(v)>-1;}).length;
        this.showToast(mc+' membres, '+ec+' événements, '+dc+' documents');
    },

    clearAllData: function() {
        if (confirm('Réinitialiser toutes les données ? Cette action est irréversible.')) {
            MilAssocDB.resetAll();
            location.reload();
        }
    },

    copyToClipboard: function(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function(){ App.showToast('Copié !'); });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.showToast('Copié !');
        }
    },

    // ... (Méthodes de rendu pour chaque page - à compléter)
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});