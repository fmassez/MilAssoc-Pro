// js/app.js

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
    
    THEMES: {
        kaki: {name:'Kaki Militaire',bgDark:'#0f1a0f',bgCard:'#1a2a1a',bgInput:'#243524',border:'#2d402d',accent:'#4f7a3f',accentLight:'#6b9e55',text:'#e0e8d8',textDim:'#8a9a80',textMuted:'#5a6a50',light:false},
        bleu: {name:'Bleu Marine',bgDark:'#0a1520',bgCard:'#112030',bgInput:'#182a40',border:'#1e3550',accent:'#2563eb',accentLight:'#3b82f6',text:'#dce8f5',textDim:'#7a9ab8',textMuted:'#4a6a88',light:false},
        rouge: {name:'Rouge Bordeaux',bgDark:'#1a0a0a',bgCard:'#2a1111',bgInput:'#3a1a1a',border:'#4a2222',accent:'#991b1b',accentLight:'#b91c1c',text:'#f5dcdc',textDim:'#b87a7a',textMuted:'#884a4a',light:false},
        gris: {name:'Gris Ardoise',bgDark:'#111827',bgCard:'#1f2937',bgInput:'#374151',border:'#374151',accent:'#4b5563',accentLight:'#6b7280',text:'#f3f4f6',textDim:'#9ca3af',textMuted:'#6b7280',light:false},
        sable: {name:'Sable du Désert',bgDark:'#1c1510',bgCard:'#2a2018',bgInput:'#3a2e22',border:'#4a3e30',accent:'#a07840',accentLight:'#c09060',text:'#f0e6d8',textDim:'#a89880',textMuted:'#7a6a58',light:false},
        clair_vert: {name:'Clair - Vert Forêt',bgDark:'#f0f5ed',bgCard:'#ffffff',bgInput:'#f5f8f3',border:'#d4ddd4',accent:'#4f7a3f',accentLight:'#6b9e55',text:'#1a2a1a',textDim:'#5a6a50',textMuted:'#8a9a80',light:true},
        clair_bleu: {name:'Clair - Bleu Ciel',bgDark:'#e8edf2',bgCard:'#ffffff',bgInput:'#f0f4f8',border:'#c4d0de',accent:'#2563eb',accentLight:'#3b82f6',text:'#112030',textDim:'#4a6a88',textMuted:'#7a9ab8',light:true},
        clair_gris: {name:'Clair - Gris Clair',bgDark:'#f3f4f6',bgCard:'#ffffff',bgInput:'#f9fafb',border:'#d1d5db',accent:'#4b5563',accentLight:'#6b7280',text:'#111827',textDim:'#6b7280',textMuted:'#9ca3af',light:true},
        custom: {name:'Personnalisé',bgDark:'#0f1a0f',bgCard:'#1a2a1a',bgInput:'#243524',border:'#2d402d',accent:'#4f7a3f',accentLight:'#6b9e55',text:'#e0e8d8',textDim:'#8a9a80',textMuted:'#5a6a50',light:false}
    },

    init: function() {
        console.log('App.init appelé');
        var loginForm = document.getElementById('loginForm');
        if(loginForm) loginForm.addEventListener('submit', function(e){ App.handleLogin(e); });
        var resetBtn = document.getElementById('resetBtn');
        if(resetBtn) resetBtn.addEventListener('click', function(){ if(confirm('Réinitialiser toutes les données ?')){ DB.resetAll(); location.reload(); }});
        var searchInput = document.getElementById('globalSearch');
        if(searchInput) searchInput.addEventListener('input', function(){ App.doGlobalSearch(this.value); });
        window.addEventListener('resize', function(){ App.responsive(); });
        if(typeof DB === 'undefined') {
            console.error('DB n\'est pas défini!');
            alert('Erreur: Base de données non chargée.');
            return;
        }
        this.checkAuth();
    },

    checkAuth: function() {
        try {
            var session = sessionStorage.getItem('milassoc_session');
            if(session) {
                var user = JSON.parse(session);
                var users = DB.getUsers();
                var found = users.find(function(u){ return u.id === user.id && u.email === user.email; });
                if(found) {
                    this.currentUser = found;
                    this.showApp();
                    return;
                } else {
                    sessionStorage.removeItem('milassoc_session');
                }
            }
        } catch(e) {
            console.error('Erreur checkAuth:', e);
            sessionStorage.removeItem('milassoc_session');
        }
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appShell').style.display = 'none';
    },

    handleLogin: function(e) {
        e.preventDefault();
        var email = document.getElementById('loginEmail').value.trim();
        var pass = document.getElementById('loginPass').value;
        var errEl = document.getElementById('loginError');
        if(!email||!pass){
            errEl.style.display='block';
            errEl.textContent='Veuillez remplir tous les champs.';
            return;
        }
        var users = DB.getUsers();
        var user = null;
        for(var i=0;i<users.length;i++){
            if(users[i].email===email && users[i].pass===pass){
                user=users[i];
                break;
            }
        }
        if(user){
            if(user.status !== 'Actif'){
                errEl.style.display='block';
                errEl.textContent='Compte désactivé. Contactez l\'administrateur.';
                return;
            }
            this.currentUser = user;
            try {
                sessionStorage.setItem('milassoc_session', JSON.stringify({id:user.id, email:user.email}));
            } catch(e) {
                errEl.style.display='block';
                errEl.textContent='Erreur de session. Vérifiez que les cookies sont activés.';
                return;
            }
            errEl.style.display='none';
            this.showApp();
        } else {
            errEl.style.display='block'; 
            errEl.textContent='Identifiants incorrects.';
            document.getElementById('loginPass').value='';
        }
    },

    // === NOUVELLE FONCTION: Récupération de mot de passe ===
    showForgotPassword: function() {
        var h = '<form onsubmit="App.handlePasswordReset(event)" style="display:flex;flex-direction:column;gap:16px;">'+
        '<p style="font-size:14px;color:var(--text-dim);">Entrez votre email pour recevoir un nouveau mot de passe.</p>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Email</label>'+
        '<input type="email" id="resetEmail" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;">'+
        '<button type="button" onclick="App.closeAllModals()" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Annuler</button>'+
        '<button type="submit" style="padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Envoyer</button>'+
        '</div></form>';
        this.showGenericModal('Récupération de mot de passe', h);
    },

    handlePasswordReset: function(e) {
        e.preventDefault();
        var email = document.getElementById('resetEmail').value.trim();
        var user = DB.getUserByEmail ? DB.getUserByEmail(email) : DB.getUsers().find(function(u){ return u.email === email; });
        
        if(!user) {
            this.showToast('Aucun compte trouvé avec cet email');
            return;
        }
        
        // Générer un nouveau mot de passe temporaire
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var newPassword = '';
        for(var i=0; i<8; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Sauvegarder le nouveau mot de passe
        if(DB.resetPassword) {
            if(DB.resetPassword(email, newPassword)) {
                this.showPasswordSentModal(email, newPassword);
            } else {
                this.showToast('Erreur lors de la réinitialisation');
            }
        } else {
            // Fallback si resetPassword n'existe pas
            var users = DB.getUsers();
            for(var i=0; i<users.length; i++) {
                if(users[i].email === email) {
                    users[i].pass = newPassword;
                    break;
                }
            }
            DB.setUsers(users);
            this.showPasswordSentModal(email, newPassword);
        }
    },

    showPasswordSentModal: function(email, newPassword) {
        var h = '<div style="text-align:center;">'+
        '<p style="font-size:14px;margin-bottom:16px;">Un nouveau mot de passe a été généré pour <strong>'+email+'</strong></p>'+
        '<div style="background:var(--bg-input);padding:16px;border-radius:8px;margin-bottom:16px;">'+
        '<p style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">Votre nouveau mot de passe :</p>'+
        '<p style="font-size:20px;font-weight:700;color:var(--accent);font-family:monospace;">'+newPassword+'</p>'+
        '</div>'+
        '<p style="font-size:12px;color:var(--text-dim);">Note: Dans une version déployée sur serveur, ce mot de passe serait envoyé par email.</p>'+
        '<button onclick="App.closeAllModals()" style="margin-top:16px;padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Fermer</button>'+
        '</div>';
        this.showGenericModal('Mot de passe réinitialisé', h);
    },

    handleLogout: function() {
        this.currentUser = null;
        sessionStorage.removeItem('milassoc_session');
        document.getElementById('appShell').style.display='none';
        document.getElementById('loginScreen').style.display='flex';
        document.getElementById('loginEmail').value='';
        document.getElementById('loginPass').value='';
        document.getElementById('loginError').style.display='none';
        var mc = document.getElementById('modalsContainer'); if(mc) mc.innerHTML='';
    },

    showApp: function() {
        console.log('showApp appelé, currentUser:', this.currentUser);
        var loginScreen = document.getElementById('loginScreen');
        var appShell = document.getElementById('appShell');
        if(!loginScreen || !appShell) {
            console.error('Éléments DOM non trouvés!');
            return;
        }
        loginScreen.style.display='none';
        appShell.style.display='';
        var cfg = DB.getConfig();
        var t = this.THEMES[cfg.theme] || this.THEMES.clair_bleu;
        if(cfg.customColors) { for(var k in cfg.customColors) { t[k] = cfg.customColors[k]; } }
        this.applyThemeObject(t);
        if(cfg.logo) this.applyLogo(cfg.logo);
        if(cfg.favicon) this.applyFavicon(cfg.favicon);
        var cfg2 = DB.getConfig();
        if(cfg2.appName) {
            document.getElementById('loginAppTitle').textContent = cfg2.appName;
            document.getElementById('appTitle').textContent = cfg2.appName;
            document.getElementById('pageTitleMeta').textContent = cfg2.appName;
        }
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role;
        var ini = this.currentUser.name.split(' ').map(function(w){return w[0];}).join('').substring(0,2);
        var avatar = document.getElementById('userAvatar');
        if(this.currentUser.photo) {
            avatar.innerHTML = '<img src="'+this.currentUser.photo+'" class="avatar-photo">';
        } else {
            avatar.textContent = ini;
            avatar.style.background = 'var(--accent)';
            avatar.style.color = 'white';
        }
        this.buildSidebar();
        this.renderNotifs();
        this.responsive();
        this.navigateTo('dashboard');
    },

    applyThemeObject: function(t) {
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
        var cfg = DB.getConfig(); cfg.logo = b64; DB.setConfig(cfg);
        var ids = ['sidebarLogo','loginLogoContainer','headerLogo'];
        for(var i=0;i<ids.length;i++){
            var el = document.getElementById(ids[i]); if(!el) continue;
            if(b64) {
                var br = ids[i]==='headerLogo'?'50%':'8px';
                el.innerHTML = '<img src="'+b64+'" style="width:100%;height:100%;object-fit:cover;border-radius:'+br+';">';
                el.style.background='transparent';
            } else {
                var sz = ids[i]==='loginLogoContainer'?36:22;
                el.innerHTML = '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/><path d="M12 22V12"/><path d="M22 7L12 12 2 7"/></svg>';
                el.style.background = cfg.logoBg||'#4f7a3f';
            }
        }
    },

    applyFavicon: function(b64) {
        var cfg = DB.getConfig(); cfg.favicon = b64; DB.setConfig(cfg);
        var link = document.getElementById('favicon');
        if(link && b64) { link.href = b64; }
    },

    buildSidebar: function() {
        var nav = document.getElementById('sidebarNav'); if(!nav) return;
        var items = [
            {id:'dashboard',label:'Tableau de Bord',icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',badge:'navMemCount',roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'members',label:'Membres',icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',badge:null,roles:['Administrateur','Secrétaire','Lecteur seul']},
            {id:'events',label:'Événements',icon:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',badge:null,roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'finance',label:'Finances',icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',badge:null,roles:['Administrateur','Trésorier']},
            {id:'documents',label:'Documents',icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',badge:null,roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'messages',label:'Messages',icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',badge:'navMsgBadge',roles:['Administrateur','Trésorier','Secrétaire','Lecteur seul']},
            {id:'units',label:'Unités',icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',badge:null,roles:['Administrateur','Secrétaire']},
            {id:'cards',label:'Cartes Membres',icon:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',badge:null,roles:['Administrateur','Secrétaire']},
            {id:'admin',label:'Administration',icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',badge:null,roles:['Administrateur']},
            {id:'settings',label:'Paramètres',icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15.18 15a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',badge:null,roles:['Administrateur']}
        ];
        var h = '';
        for(var i=0;i<items.length;i++){
            var n = items[i];
            if(n.roles.indexOf(this.currentUser.role)===-1) continue;
            var active = n.id===this.curPage;
            var badge = '';
            if(n.badge){ var bv = this.getBadgeValue(n.badge); if(bv) badge='<span style="margin-left:auto;font-size:11px;padding:2px 8px;border-radius:9999px;background:var(--accent);color:var(--bg-dark);">'+bv+'</span>'; }
            var bg = active ? 'background:rgba(37,99,235,.1);color:var(--accent);font-weight:600;' : 'background:transparent;color:var(--text-dim);';
            h += '<a href="#" onclick="App.navigateTo(\''+n.id+'\');return false;" data-nav="'+n.id+'" style="display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:14px;border-radius:8px;transition:all .2s;cursor:pointer;text-decoration:none;'+bg+'"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+n.icon+'</svg><span>'+n.label+'</span>'+badge+'</a>';
        }
        nav.innerHTML = h;
    },

    getBadgeValue: function(id) {
        if(id==='navMemCount') return DB.getMembers().length;
        if(id==='navMsgBadge'){ var t=0;var cs=DB.getConvs();for(var i=0;i<cs.length;i++)t+=cs[i].unread; return t>0?t:''; }
        return '';
    },

    navigateTo: function(page) {
        this.curPage = page;
        this.buildSidebar();
        var titles = {dashboard:'Tableau de Bord',members:'Membres',events:'Événements',finance:'Finances',documents:'Documents',messages:'Messages',units:'Unités',admin:'Administration',settings:'Paramètres',cards:'Cartes Membres',txReleve:'Relevé de Transactions'};
        document.getElementById('pageTitle').textContent = titles[page]||page;
        var area = document.getElementById('contentArea');
        var fn = {dashboard:this.renderDashboard,members:this.renderMembers,events:this.renderEvents,finance:this.renderFinance,documents:this.renderDocuments,messages:this.renderMessages,units:this.renderUnits,admin:this.renderAdmin,settings:this.renderSettings,cards:this.renderCards,txReleve:this.renderTxReleve};
        area.innerHTML = '';
        if(fn[page]) fn[page].call(this);
        area.classList.remove('fade-in'); void area.offsetWidth; area.classList.add('fade-in');
        this.closeSidebar();
    },

    showToast: function(msg) {
        var t = document.getElementById('toast');
        document.getElementById('toastMsg').textContent = msg;
        t.style.transform='translateY(0)'; t.style.opacity='1';
        clearTimeout(window._toastT);
        window._toastT = setTimeout(function(){ t.style.transform='translateY(100px)'; t.style.opacity='0'; }, 3000);
    },

    showConfirm: function(title,msg,cb) {
        document.getElementById('cfmTitle').textContent=title;
        document.getElementById('cfmMsg').textContent=msg;
        this.pendingConfirm=cb;
        document.getElementById('confirmModal').style.display='';
    },

    execConfirm: function() {
        if(this.pendingConfirm){this.pendingConfirm();this.pendingConfirm=null;}
        document.getElementById('confirmModal').style.display='none';
    },

    closeModal: function(id) { document.getElementById(id).style.display='none'; },

    showGenericModal: function(title,html) {
        var id='m'+(Date.now());
        var c = document.getElementById('modalsContainer');
        if(!c){c=document.createElement('div');c.id='modalsContainer';document.body.appendChild(c);}
        c.innerHTML+='<div id="'+id+'" style="position:fixed;inset:0;z-index:100;"><div style="position:absolute;inset:0;background:rgba(0,0,0,.4);" onclick="App.closeModal(\''+id+'\')"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:12px;border:1px solid var(--border);width:100%;max-width:600px;margin:0 16px;padding:24px;max-height:90vh;overflow-y:auto;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;"><h3 style="font-size:18px;font-weight:600;color:var(--text);">'+title+'</h3><button onclick="App.closeModal(\''+id+'\')" style="padding:4px;background:none;border:none;cursor:pointer;color:var(--text-dim);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>'+html+'</div></div>';
    },

    closeAllModals: function() { var c=document.getElementById('modalsContainer'); if(c)c.innerHTML=''; },

    toggleSidebar: function() {
        var sb=document.getElementById('sidebar'),ov=document.getElementById('sidebarOverlay');
        sb.classList.toggle('sidebar-open');
        ov.style.display=sb.classList.contains('sidebar-open')?'block':'none';
    },

    closeSidebar: function() {
        document.getElementById('sidebar').classList.remove('sidebar-open');
        document.getElementById('sidebarOverlay').style.display='none';
    },

    toggleNotifPanel: function() {
        var p=document.getElementById('notifPanel');
        p.style.display=p.style.display==='none'?'':'none';
    },

    clearNotifs: function() {
        var ns=DB.getNotifs(); for(var i=0;i<ns.length;i++)ns[i].read=true; DB.setNotifs(ns);
        document.getElementById('notifDot').style.display='none';
        this.renderNotifs(); this.showToast('Notifications lues');
    },

    renderNotifs: function() {
        var ns=DB.getNotifs(),unread=0;
        for(var i=0;i<ns.length;i++){if(!ns[i].read)unread++;}
        document.getElementById('notifDot').style.display=unread>0?'':'none';
        var el=document.getElementById('notifList');
        if(!ns.length){el.innerHTML='<div style="padding:24px;text-align:center;font-size:14px;color:var(--text-dim);">Aucune notification</div>';return;}
        var h='';
        for(var i=0;i<ns.length;i++){var n=ns[i];h+='<div style="padding:12px 16px;border-bottom:1px solid var(--border);'+(n.read?'':'border-left:3px solid var(--accent);')+'"><p style="font-size:14px;color:var(--text);">'+n.text+'</p><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">'+n.time+'</p></div>';}
        el.innerHTML=h;
    },

    canEdit: function() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Secrétaire'); },
    canFinance: function() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Trésorier'); },

    responsive: function() {
        var sw=document.getElementById('searchWrap'),mb=document.getElementById('menuBtn'),ql=document.getElementById('qaLabel');
        function ck(){
            if(window.innerWidth>=640){if(sw)sw.style.display='';if(mb)mb.style.display='none';if(ql)ql.style.display='';}
            else{if(sw)sw.style.display='none';if(mb)mb.style.display='';if(ql)ql.style.display='none';}
        }
        ck();
    },

    doGlobalSearch: function(val) {
        if(val.length<2)return;
        var v=val.toLowerCase();
        var mc=DB.getMembers().filter(function(m){return(m.first+' '+m.last+' '+m.grade).toLowerCase().indexOf(v)>-1;}).length;
        var ec=DB.getEvents().filter(function(e){return e.title.toLowerCase().indexOf(v)>-1;}).length;
        var dc=DB.getDocs().filter(function(d){return d.title.toLowerCase().indexOf(v)>-1;}).length;
        this.showToast(mc+' membres, '+ec+' événements, '+dc+' documents');
    },

    copyToClipboard: function(text) {
        if(navigator.clipboard){ navigator.clipboard.writeText(text).then(function(){App.showToast('Copié !');}); }
        else { var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);App.showToast('Copié !'); }
    },

    getAssociationName: function() {
        var cfg = DB.getConfig();
        return cfg.cardOrgName || cfg.appName || 'MilAssoc Pro';
    },

    // === DASHBOARD ===
    renderDashboard: function() {
        var members=DB.getMembers(),events=DB.getEvents(),docs=DB.getDocs(),tx=DB.getTx();
        var active=0,inc=0,exp=0;
        for(var i=0;i<members.length;i++){if(members[i].status==='Actif')active++;}
        for(var i=0;i<tx.length;i++){if(tx[i].type==='income')inc+=tx[i].amt;else exp+=tx[i].amt;}
        var total=members.length,pct=total>0?Math.min(100,Math.round((active/total)*100)):0;
        var gc={};for(var i=0;i<members.length;i++)gc[members[i].grade]=(gc[members[i].grade]||0)+1;
        var sorted=[];for(var g in gc)sorted.push([g,gc[g]]);sorted.sort(function(a,b){return b[1]-a[1];});
        var colors=['from-yellow-600 to-yellow-800','from-green-600 to-green-800','from-blue-600 to-blue-800','from-purple-600 to-purple-800','from-red-600 to-red-800'];
        var gh='';for(var i=0;i<sorted.length;i++){var p=Math.round((sorted[i][1]/Math.max(total,1))*100);gh+='<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:12px;width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-dim);">'+sorted[i][0]+'</span><div style="flex:1;border-radius:9999px;height:16px;position:relative;overflow:hidden;background:var(--bg-input);"><div class="progress-fill bg-gradient-to-r '+colors[i%colors.length]+'" style="height:100%;width:'+p+'%;"></div><span style="position:absolute;right:8px;top:1px;font-size:11px;color:var(--text);">'+sorted[i][1]+'</span></div></div>';}
        var sc={};for(var i=0;i<members.length;i++)sc[members[i].section]=(sc[members[i].section]||0)+1;
        var sh='';var sk=Object.keys(sc).sort();for(var i=0;i<sk.length;i++)sh+='<div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:var(--text-dim);">'+sk[i]+'</span><span style="font-family:monospace;">'+sc[sk[i]]+'</span></div>';
        var se=events.slice().sort(function(a,b){return a.date.localeCompare(b.date);}).slice(0,3);
        var mois=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
        var uh='';for(var i=0;i<se.length;i++){var ev=se[i],d=new Date(ev.date),day=String(d.getDate()).padStart(2,'0'),mo=mois[d.getMonth()];uh+='<div style="border-radius:8px;padding:16px;border:1px solid var(--border);background:var(--bg-input);cursor:pointer;" onclick="App.navigateTo(\'events\')"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="font-size:11px;font-weight:700;padding:4px 8px;border-radius:4px;background:var(--accent);color:white;">'+day+' '+mo+'</span><span style="font-size:11px;padding:4px 8px;border-radius:4px;background:rgba(37,99,235,.1);color:var(--accent);">'+ev.type+'</span></div><p style="font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+ev.title+'</p><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">'+ev.time+' — '+ev.loc+'</p></div>';}
        if(!uh)uh='<p style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text-dim);">Aucun événement</p>';
        var ns=DB.getNotifs(),ah='';
        for(var i=0;i<Math.min(4,ns.length);i++){ah+='<div style="display:flex;align-items:start;gap:12px;padding:12px;border-radius:8px;"><div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;background:var(--accent);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div style="flex:1;"><p style="font-size:14px;color:var(--text);">'+ns[i].text+'</p><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">'+ns[i].time+'</p></div></div>';}
        if(!ah)ah='<p style="text-align:center;padding:16px;color:var(--text-dim);">Aucune activité</p>';
        var area=document.getElementById('contentArea');
        area.innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">'+
        '<div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo(\'members\')"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><div style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(37,99,235,.1);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><span style="font-size:11px;padding:2px 8px;border-radius:4px;background:var(--accent);color:white;">'+members.length+' total</span></div><p style="font-size:24px;font-weight:700;">'+total+'</p><p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Membres ('+active+' actifs)</p><div style="margin-top:12px;width:100%;border-radius:9999px;height:6px;background:var(--bg-input);"><div class="progress-fill" style="height:100%;width:'+pct+'%;background:var(--accent);border-radius:9999px;"></div></div></div>'+
        '<div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo(\'finance\')"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><div style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(160,120,64,.1);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div><p style="font-size:24px;font-weight:700;color:var(--accent-light);">€ '+(inc-exp).toLocaleString('fr-FR')+'</p><p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Solde net</p><div style="margin-top:12px;width:100%;border-radius:9999px;height:6px;background:var(--bg-input);"><div class="progress-fill" style="height:100%;width:72%;background:var(--accent-light);border-radius:9999px;"></div></div></div>'+
        '<div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo(\'events\')"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><div style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(37,99,235,.1);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg></div></div><p style="font-size:24px;font-weight:700;">'+events.length+'</p><p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Événements</p><div style="margin-top:12px;width:100%;border-radius:9999px;height:6px;background:var(--bg-input);"><div class="progress-fill" style="height:100%;width:60%;background:var(--accent);border-radius:9999px;"></div></div></div>'+
        '<div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo(\'documents\')"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><div style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(160,120,64,.1);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div></div><p style="font-size:24px;font-weight:700;">'+docs.length+'</p><p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Documents</p><div style="margin-top:12px;width:100%;border-radius:9999px;height:6px;background:var(--bg-input);"><div class="progress-fill" style="height:100%;width:45%;background:var(--accent-light);border-radius:9999px;"></div></div></div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-bottom:24px;">'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><h3 style="font-size:18px;font-weight:600;margin-bottom:16px;">Activité récente</h3><div style="display:flex;flex-direction:column;gap:8px;">'+ah+'</div></div>'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><h3 style="font-size:18px;font-weight:600;margin-bottom:16px;">Par grade</h3><div style="display:flex;flex-direction:column;gap:12px;">'+gh+'</div><div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);"><h4 style="font-size:14px;font-weight:600;margin-bottom:12px;color:var(--accent-light);">Par section</h4><div style="display:flex;flex-direction:column;gap:8px;">'+sh+'</div></div></div>'+
        '</div>'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><h3 style="font-size:18px;font-weight:600;">Prochains événements</h3><button onclick="App.navigateTo(\'events\')" style="font-size:13px;color:var(--accent);background:none;border:none;cursor:pointer;">Voir tout →</button></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">'+uh+'</div></div>';
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
