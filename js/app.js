// ==========================================
// APPLICATION
// ==========================================
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
            errEl.style.display='block'; errEl.textContent='Identifiants incorrects.';
            document.getElementById('loginPass').value='';
        }
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

    // ==================== DASHBOARD ====================
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
    },

    // ==================== MEMBRES ====================
    renderMembers: function() {
        var members = DB.getMembers();
        var area = document.getElementById('contentArea');
        var self = this;
        var field = this.memSort.field;
        var dir = this.memSort.dir;
        
        members.sort(function(a, b) {
            var valA = (a[field] || '').toLowerCase();
            var valB = (b[field] || '').toLowerCase();
            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
            return 0;
        });

        var h = '<div style="margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'+
                '<div><h3 style="font-size:24px;font-weight:700;margin-bottom:4px;">Membres</h3><p style="font-size:14px;color:var(--text-dim);">Gérez les membres de l\'association</p></div>'+
                '<div style="display:flex;gap:8px;">'+
                '<button onclick="App.exportMembersToCSV()" style="padding:8px 12px;border-radius:6px;font-size:13px;background:var(--bg-input);color:var(--text);border:1px solid var(--border);cursor:pointer;">📥 Export</button>'+
                '<button onclick="App.openAddMember()" style="padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">'+
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Ajouter</button>'+
                '</div></div>'+
                '<div style="border-radius:12px;border:1px solid var(--border);overflow:hidden;background:var(--bg-card);overflow-x:auto;">'+
                '<table style="width:100%;border-collapse:collapse;min-width:600px;">'+
                '<thead><tr style="background:var(--bg-input);text-align:left;">'+
                '<th class="sortable" onclick="App.sortMembers(\'last\')" style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;cursor:pointer;">Nom ▲▼</th>'+
                '<th class="sortable" onclick="App.sortMembers(\'grade\')" style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;cursor:pointer;">Grade ▲▼</th>'+
                '<th class="sortable" onclick="App.sortMembers(\'section\')" style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;cursor:pointer;">Section ▲▼</th>'+
                '<th class="sortable" onclick="App.sortMembers(\'status\')" style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;cursor:pointer;">Statut ▲▼</th>'+
                '<th style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;text-align:right;">Actions</th>'+
                '</tr></thead><tbody>';

        if(members.length === 0) {
            h += '<tr><td colspan="5" style="padding:40px;text-align:center;color:var(--text-dim);">Aucun membre</td></tr>';
        } else {
            for(var i=0; i<members.length; i++) {
                var m = members[i];
                var statusColor = m.status === 'Actif' ? 'var(--accent)' : '#ef4444';
                h += '<tr style="border-top:1px solid var(--border);">'+
                     '<td style="padding:12px 16px;"><div style="display:flex;align-items:center;gap:12px;">'+
                     '<div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:var(--accent);color:white;">'+(m.first[0]+m.last[0]).toUpperCase()+'</div>'+
                     '<div><p style="font-weight:500;">'+m.first+' '+m.last+'</p><p style="font-size:12px;color:var(--text-dim);">'+m.mat+'</p></div></div></td>'+
                     '<td style="padding:12px 16px;font-size:14px;">'+m.grade+'</td>'+
                     '<td style="padding:12px 16px;font-size:14px;">'+m.section+'</td>'+
                     '<td style="padding:12px 16px;"><span style="padding:4px 12px;border-radius:9999px;font-size:12px;background:'+statusColor+'20;color:'+statusColor+';">'+m.status+'</span></td>'+
                     '<td style="padding:12px 16px;text-align:right;"><button onclick="App.editMember('+m.id+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">✏️</button>'+
                     '<button onclick="App.deleteMember('+m.id+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">🗑️</button></td></tr>';
            }
        }
        h += '</tbody></table></div>';
        area.innerHTML = h;
    },

    sortMembers: function(field) {
        if(this.memSort.field === field) {
            this.memSort.dir = this.memSort.dir === 1 ? -1 : 1;
        } else {
            this.memSort.field = field;
            this.memSort.dir = 1;
        }
        this.renderMembers();
    },

    openAddMember: function() {
        var sections = DB.getSections();
        var grades = DB.getGrades();
        var h = '<form onsubmit="App.handleMemberSave(event)" style="display:flex;flex-direction:column;gap:16px;">'+
        '<input type="hidden" id="memberEditId" value="">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Prénom *</label><input type="text" id="memberFirst" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Nom *</label><input type="text" id="memberLast" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Email</label><input type="email" id="memberEmail" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Téléphone</label><input type="tel" id="memberPhone" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Grade</label><select id="memberGrade" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+grades.map(function(g){return '<option>'+g+'</option>';}).join('')+'</select></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Section</label><select id="memberSection" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+sections.map(function(s){return '<option>'+s+'</option>';}).join('')+'</select></div></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Adresse</label><textarea id="memberAddress" rows="3" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);resize:vertical;"></textarea></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Cotisation</label><select id="memberCot" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><option>À jour</option><option>En retard</option><option>Non payée</option><option>Exonéré</option></select></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;"><button type="button" onclick="App.closeAllModals()" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Annuler</button><button type="submit" style="padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Enregistrer</button></div></form>';
        this.showGenericModal('Ajouter un membre', h);
    },

    handleMemberSave: function(e) {
        e.preventDefault();
        var eid = document.getElementById('memberEditId').value;
        var memberData = {
            first: document.getElementById('memberFirst').value.trim(),
            last: document.getElementById('memberLast').value.trim(),
            email: document.getElementById('memberEmail').value.trim(),
            phone: document.getElementById('memberPhone').value.trim(),
            grade: document.getElementById('memberGrade').value,
            section: document.getElementById('memberSection').value,
            address: document.getElementById('memberAddress').value.trim(),
            cot: document.getElementById('memberCot').value,
            mat: 'FR-'+new Date().getFullYear()+'-'+String(Math.floor(Math.random()*10000)).padStart(4,'0')
        };
        var members = DB.getMembers();
        if(eid) {
            for(var i=0;i<members.length;i++) {
                if(members[i].id === parseInt(eid)) {
                    members[i] = Object.assign(members[i], memberData);
                    break;
                }
            }
            this.showToast('Membre modifié');
        } else {
            memberData.id = members.length > 0 ? Math.max.apply(Math, members.map(function(m){return m.id;})) + 1 : 1;
            memberData.status = 'Actif';
            memberData.photo = null;
            members.push(memberData);
            this.showToast('Membre ajouté');
        }
        DB.setMembers(members);
        this.closeAllModals();
        this.renderMembers();
        this.buildSidebar();
    },

    editMember: function(id) {
        var m = DB.getMembers().find(function(x){return x.id===id;});
        if(!m) return;
        this.openAddMember();
        setTimeout(function(){
            document.getElementById('memberEditId').value = m.id;
            document.getElementById('memberFirst').value = m.first;
            document.getElementById('memberLast').value = m.last;
            document.getElementById('memberEmail').value = m.email||'';
            document.getElementById('memberPhone').value = m.phone||'';
            document.getElementById('memberGrade').value = m.grade;
            document.getElementById('memberSection').value = m.section;
            document.getElementById('memberAddress').value = m.address||'';
            document.getElementById('memberCot').value = m.cot;
        }, 100);
    },

    deleteMember: function(id) {
        var m = DB.getMembers().find(function(x){return x.id===id;});
        if(!m) return;
        this.showConfirm('Supprimer le membre ?', m.first+' '+m.last, function(){
            DB.setMembers(DB.getMembers().filter(function(x){return x.id!==id;}));
            App.renderMembers();
            App.buildSidebar();
            App.showToast('Membre supprimé');
        });
    },

    // ==================== ÉVÉNEMENTS ====================
    renderEvents: function() {
        var events = DB.getEvents();
        var area = document.getElementById('contentArea');
        var h = '<div style="margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">'+
                '<div><h3 style="font-size:24px;font-weight:700;margin-bottom:4px;">Événements</h3><p style="font-size:14px;color:var(--text-dim);">Gérez les événements et cérémonies</p></div>'+
                '<button onclick="App.openAddEvent()" style="padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">'+
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Ajouter</button></div>'+
                '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">';
        
        events.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
        var mois=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
        
        for(var i=0;i<events.length;i++) {
            var e = events[i];
            var d = new Date(e.date);
            var day = String(d.getDate()).padStart(2,'0');
            var month = mois[d.getMonth()];
            h += '<div style="border-radius:12px;border:1px solid var(--border);padding:16px;background:var(--bg-card);cursor:pointer;" onclick="App.editEvent('+e.id+')">'+
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">'+
            '<span style="font-size:11px;font-weight:700;padding:4px 8px;border-radius:4px;background:var(--accent);color:white;">'+day+' '+month+'</span>'+
            '<span style="font-size:11px;padding:4px 8px;border-radius:4px;background:rgba(37,99,235,.1);color:var(--accent);">'+e.type+'</span></div>'+
            '<p style="font-size:16px;font-weight:600;margin-bottom:8px;">'+e.title+'</p>'+
            '<p style="font-size:13px;color:var(--text-dim);margin-bottom:4px;"> '+e.time+'</p>'+
            '<p style="font-size:13px;color:var(--text-dim);">📍 '+e.loc+'</p></div>';
        }
        h += '</div>';
        area.innerHTML = h;
    },

    openAddEvent: function() {
        var types = DB.getEventTypes();
        var h = '<form onsubmit="App.handleEventSave(event)" style="display:flex;flex-direction:column;gap:16px;">'+
        '<input type="hidden" id="eventEditId" value="">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Titre *</label><input type="text" id="eventTitle" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Date *</label><input type="date" id="eventDate" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Heure *</label><input type="time" id="eventTime" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Lieu *</label><input type="text" id="eventLoc" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Type</label><select id="eventType" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+types.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Description</label><textarea id="eventDesc" rows="3" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);resize:vertical;"></textarea></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;"><button type="button" onclick="App.closeAllModals()" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Annuler</button><button type="submit" style="padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Enregistrer</button></div></form>';
        this.showGenericModal('Ajouter un événement', h);
    },

    handleEventSave: function(e) {
        e.preventDefault();
        var eid = document.getElementById('eventEditId').value;
        var eventData = {
            title: document.getElementById('eventTitle').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            loc: document.getElementById('eventLoc').value.trim(),
            type: document.getElementById('eventType').value,
            desc: document.getElementById('eventDesc').value.trim()
        };
        var events = DB.getEvents();
        if(eid) {
            for(var i=0;i<events.length;i++) {
                if(events[i].id === parseInt(eid)) {
                    events[i] = Object.assign(events[i], eventData);
                    break;
                }
            }
            this.showToast('Événement modifié');
        } else {
            eventData.id = events.length > 0 ? Math.max.apply(Math, events.map(function(ev){return ev.id;})) + 1 : 1;
            events.push(eventData);
            this.showToast('Événement ajouté');
        }
        DB.setEvents(events);
        this.closeAllModals();
        this.renderEvents();
    },

    editEvent: function(id) {
        var e = DB.getEvents().find(function(x){return x.id===id;});
        if(!e) return;
        this.openAddEvent();
        setTimeout(function(){
            document.getElementById('eventEditId').value = e.id;
            document.getElementById('eventTitle').value = e.title;
            document.getElementById('eventDate').value = e.date;
            document.getElementById('eventTime').value = e.time;
            document.getElementById('eventLoc').value = e.loc;
            document.getElementById('eventType').value = e.type;
            document.getElementById('eventDesc').value = e.desc||'';
        }, 100);
    },

    // ==================== FINANCES ====================
    renderFinance: function() {
        var tx = DB.getTx();
        var inc = 0, exp = 0;
        var incByCat = {}, expByCat = {};
        
        for(var i=0; i<tx.length; i++) {
            if(tx[i].type === 'income') {
                inc += tx[i].amt;
                incByCat[tx[i].category] = (incByCat[tx[i].category] || 0) + tx[i].amt;
            } else {
                exp += tx[i].amt;
                expByCat[tx[i].category] = (expByCat[tx[i].category] || 0) + tx[i].amt;
            }
        }
        var balance = inc - exp;
        var area = document.getElementById('contentArea');

        var h = '<div style="margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">'+
                '<div><h3 style="font-size:24px;font-weight:700;margin-bottom:4px;">Finances</h3><p style="font-size:14px;color:var(--text-dim);">Gérez les transactions et analysez les comptes</p></div>'+
                '<div style="display:flex;gap:8px;">'+
                '<button onclick="App.exportTableToCSV(DB.getTx(), \'finances.csv\')" style="padding:8px 12px;border-radius:6px;font-size:13px;background:var(--bg-input);color:var(--text);border:1px solid var(--border);cursor:pointer;">📥 Export CSV</button>'+
                '<button onclick="App.importTableFromCSV(\'finances.csv\', function(data){ App.handleImportTx(data); })" style="padding:8px 12px;border-radius:6px;font-size:13px;background:var(--bg-input);color:var(--text);border:1px solid var(--border);cursor:pointer;">📤 Import CSV</button>'+
                '<button onclick="App.printFinancialReport('+inc+', '+exp+', new Date().getFullYear())" style="padding:8px 12px;border-radius:6px;font-size:13px;background:var(--accent);color:white;border:none;cursor:pointer;">️ Bilan Annuel</button>'+
                '<button onclick="App.openAddTx()" style="padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">'+
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Ajouter</button>'+
                '</div></div>';

        // Cartes Résumé Cliquables
        h += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">'+
             '<div onclick="App.showFinanceDetails(\'income\')" class="clickable-zone finance-card" style="cursor:pointer;"><p style="font-size:14px;color:var(--text-dim);margin-bottom:8px;">Recettes</p><p class="finance-stat-value" style="color:var(--accent);">€ '+inc.toLocaleString('fr-FR')+'</p></div>'+
             '<div onclick="App.showFinanceDetails(\'expense\')" class="clickable-zone finance-card" style="cursor:pointer;"><p style="font-size:14px;color:var(--text-dim);margin-bottom:8px;">Dépenses</p><p class="finance-stat-value" style="color:#ef4444;">€ '+exp.toLocaleString('fr-FR')+'</p></div>'+
             '<div class="finance-card"><p style="font-size:14px;color:var(--text-dim);margin-bottom:8px;">Solde</p><p class="finance-stat-value" style="color:'+(balance>=0?'var(--accent)':'#ef4444')+';">€ '+balance.toLocaleString('fr-FR')+'</p></div>'+
             '</div>';

        // Analyse des comptes
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">'+
             '<div class="finance-card">'+
             '<h4 style="font-weight:600;margin-bottom:16px;">Analyse des Recettes</h4>';
        for(var cat in incByCat) {
            var pct = inc > 0 ? Math.round((incByCat[cat]/inc)*100) : 0;
            h += '<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>'+cat+'</span><span>€ '+incByCat[cat].toLocaleString('fr-FR')+' ('+pct+'%)</span></div>'+
                 '<div style="width:100%;height:6px;background:var(--bg-input);border-radius:3px;"><div class="progress-fill" style="height:100%;width:'+pct+'%;background:var(--accent);border-radius:3px;"></div></div></div>';
        }
        h += '</div>'+
             '<div class="finance-card">'+
             '<h4 style="font-weight:600;margin-bottom:16px;">Analyse des Dépenses</h4>';
        for(var cat in expByCat) {
            var pct = exp > 0 ? Math.round((expByCat[cat]/exp)*100) : 0;
            h += '<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;"><span>'+cat+'</span><span>€ '+expByCat[cat].toLocaleString('fr-FR')+' ('+pct+'%)</span></div>'+
                 '<div style="width:100%;height:6px;background:var(--bg-input);border-radius:3px;"><div class="progress-fill" style="height:100%;width:'+pct+'%;background:#ef4444;border-radius:3px;"></div></div></div>';
        }
        h += '</div></div>';

        // Tableau Transactions
        h += '<div style="border-radius:12px;border:1px solid var(--border);overflow:hidden;background:var(--bg-card);overflow-x:auto;">'+
             '<table style="width:100%;border-collapse:collapse;min-width:600px;">'+
             '<thead><tr style="background:var(--bg-input);text-align:left;">'+
             '<th style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;">Description</th>'+
             '<th style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;">Catégorie</th>'+
             '<th style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;">Date</th>'+
             '<th style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;text-align:right;">Montant</th>'+
             '<th style="padding:12px 16px;font-size:12px;font-weight:600;color:var(--text-dim);text-transform:uppercase;text-align:right;">Actions</th>'+
             '</tr></thead><tbody>';
        
        tx.sort(function(a,b){return new Date(b.date)-new Date(a.date);});
        for(var i=0; i<tx.length; i++) {
            var t = tx[i];
            var color = t.type === 'income' ? 'var(--accent)' : '#ef4444';
            var sign = t.type === 'income' ? '+' : '-';
            h += '<tr style="border-top:1px solid var(--border);">'+
                 '<td style="padding:12px 16px;font-weight:500;">'+t.desc+'</td>'+
                 '<td style="padding:12px 16px;font-size:14px;color:var(--text-dim);">'+t.category+'</td>'+
                 '<td style="padding:12px 16px;font-size:14px;color:var(--text-dim);">'+t.date+'</td>'+
                 '<td style="padding:12px 16px;font-weight:600;color:'+color+';text-align:right;">'+sign+' € '+t.amt.toLocaleString('fr-FR')+'</td>'+
                 '<td style="padding:12px 16px;text-align:right;"><button onclick="App.deleteTx('+t.id+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">🗑️</button></td></tr>';
        }
        h += '</tbody></table></div>';
        area.innerHTML = h;
    },

    showFinanceDetails: function(type) {
        var tx = DB.getTx();
        var list = tx.filter(function(t){ return t.type === type; });
        var total = 0;
        list.forEach(function(t){ total += t.amt; });
        var typeName = type === 'income' ? 'Recettes' : 'Dépenses';
        var color = type === 'income' ? 'var(--accent)' : '#ef4444';
        
        var h = '<div style="margin-bottom:16px;"><h3 style="font-size:20px;font-weight:700;">Détail des '+typeName+'</h3><p style="color:'+color+';font-weight:600;">Total: € '+total.toLocaleString('fr-FR')+'</p></div>';
        h += '<div style="max-height:300px;overflow-y:auto;">';
        list.sort(function(a,b){return new Date(b.date)-new Date(a.date);});
        list.forEach(function(t){
            h += '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);"><span>'+t.desc+' ('+t.date+')</span><span style="font-weight:600;color:'+color+';">€ '+t.amt.toLocaleString('fr-FR')+'</span></div>';
        });
        h += '</div>';
        this.showGenericModal('Détail des '+typeName, h);
    },

    printFinancialReport: function(inc, exp, year) {
        var tx = DB.getTx();
        var balance = inc - exp;
        var incByCat = {}, expByCat = {};
        tx.forEach(function(t){
            if(t.type==='income') incByCat[t.category] = (incByCat[t.category]||0) + t.amt;
            else expByCat[t.category] = (expByCat[t.category]||0) + t.amt;
        });
        var cfg = DB.getConfig();
        var assocName = cfg.cardOrgName || 'Association';

        var html = '<html><head><title>Bilan Financier '+year+'</title><style>'+
        'body{font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;}'+
        'h1{border-bottom:2px solid #333;padding-bottom:10px;}'+
        'table{width:100%;border-collapse:collapse;margin-top:20px;}'+
        'th,td{border:1px solid #ddd;padding:8px;text-align:left;}'+
        'th{background:#f4f4f4;}'+
        '.total{font-weight:bold;font-size:1.2em;margin-top:20px;}'+
        '</style></head><body>'+
        '<h1>Bilan Financier '+year+'</h1>'+
        '<p>Association : <strong>'+assocName+'</strong></p>'+
        '<p>Exercice : <strong>'+year+'</strong></p>'+
        
        '<h3>Recettes</h3><table><tr><th>Catégorie</th><th>Montant</th></tr>';
        for(var c in incByCat) html += '<tr><td>'+c+'</td><td>€ '+incByCat[c].toLocaleString('fr-FR')+'</td></tr>';
        html += '<tr class="total"><td>TOTAL RECETTES</td><td>€ '+inc.toLocaleString('fr-FR')+'</td></tr></table>'+
        
        '<h3>Dépenses</h3><table><tr><th>Catégorie</th><th>Montant</th></tr>';
        for(var c in expByCat) html += '<tr><td>'+c+'</td><td>€ '+expByCat[c].toLocaleString('fr-FR')+'</td></tr>';
        html += '<tr class="total"><td>TOTAL DÉPENSES</td><td>€ '+exp.toLocaleString('fr-FR')+'</td></tr></table>'+
        
        '<div class="total" style="color:'+(balance>=0?'green':'red')+';">SOLDE : € '+balance.toLocaleString('fr-FR')+'</div>'+
        '</body></html>';

        var win = window.open('', '', 'width=800,height=600');
        win.document.write(html);
        win.document.close();
        setTimeout(function(){win.print();}, 500);
    },

    openAddTx: function() {
        var h = '<form onsubmit="App.handleTxSave(event)" style="display:flex;flex-direction:column;gap:16px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Description *</label><input type="text" id="txDesc" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Type</label><select id="txType" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><option value="income">Recette</option><option value="expense">Dépense</option></select></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Montant (€) *</label><input type="number" id="txAmt" step="0.01" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Catégorie</label><input type="text" id="txCategory" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Date *</label><input type="date" id="txDate" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;"><button type="button" onclick="App.closeAllModals()" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Annuler</button><button type="submit" style="padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Enregistrer</button></div></form>';
        this.showGenericModal('Ajouter une transaction', h);
    },

    handleTxSave: function(e) {
        e.preventDefault();
        var txData = {
            desc: document.getElementById('txDesc').value.trim(),
            type: document.getElementById('txType').value,
            amt: parseFloat(document.getElementById('txAmt').value),
            category: document.getElementById('txCategory').value.trim()||'Divers',
            date: document.getElementById('txDate').value
        };
        var tx = DB.getTx();
        txData.id = tx.length > 0 ? Math.max.apply(Math, tx.map(function(t){return t.id;})) + 1 : 1;
        tx.push(txData);
        DB.setTx(tx);
        this.closeAllModals();
        this.renderFinance();
        this.showToast('Transaction ajoutée');
    },

    deleteTx: function(id) {
        this.showConfirm('Supprimer la transaction ?', 'Cette action est irréversible.', function(){
            var tx = DB.getTx();
            tx = tx.filter(function(t){return t.id!==id;});
            DB.setTx(tx);
            App.renderFinance();
            App.showToast('Transaction supprimée');
        });
    },

    // ==================== DOCUMENTS ====================
    renderDocuments: function() {
        var docs = DB.getDocs();
        var area = document.getElementById('contentArea');
        var h = '<div style="margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;">'+
                '<div><h3 style="font-size:24px;font-weight:700;margin-bottom:4px;">Documents</h3><p style="font-size:14px;color:var(--text-dim);">Gérez les documents</p></div>'+
                '<button onclick="App.openUploadDoc()" style="padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;display:flex;align-items:center;gap:8px;">'+
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Uploader</button></div>'+
                '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;">';
        
        for(var i=0;i<docs.length;i++) {
            var d = docs[i];
            h += '<div style="border-radius:12px;border:1px solid var(--border);padding:16px;background:var(--bg-card);cursor:pointer;" onclick="App.downloadDoc('+d.id+')">'+
            '<div style="display:flex;align-items:start;gap:12px;margin-bottom:12px;">'+
            '<div style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(37,99,235,.1);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>'+
            '<div style="flex:1;"><p style="font-weight:600;margin-bottom:4px;">'+d.title+'</p><p style="font-size:12px;color:var(--text-dim);">'+d.type+' • '+d.size+'</p></div></div>'+
            '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--text-dim);">'+
            '<span>📅 '+d.date+'</span><span>👤 '+d.author+'</span></div></div>';
        }
        h += '</div>';
        area.innerHTML = h;
    },

    openUploadDoc: function() {
        var types = DB.getDocTypes();
        var h = '<form onsubmit="App.handleDocSave(event)" style="display:flex;flex-direction:column;gap:16px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Titre *</label><input type="text" id="docTitle" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Type</label><select id="docType" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+types.map(function(t){return '<option>'+t+'</option>';}).join('')+'</select></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Auteur</label><input type="text" id="docAuthor" value="'+this.currentUser.name+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Fichier</label><input type="file" id="docFile" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;"><button type="button" onclick="App.closeAllModals()" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Annuler</button><button type="submit" style="padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Enregistrer</button></div></form>';
        this.showGenericModal('Ajouter un document', h);
    },

    handleDocSave: function(e) {
        e.preventDefault();
        var docData = {
            title: document.getElementById('docTitle').value.trim(),
            type: document.getElementById('docType').value,
            author: document.getElementById('docAuthor').value.trim(),
            date: new Date().toISOString().split('T')[0],
            size: Math.floor(Math.random()*5+1)+' MB',
            file: null
        };
        var docs = DB.getDocs();
        docData.id = docs.length > 0 ? Math.max.apply(Math, docs.map(function(d){return d.id;})) + 1 : 1;
        docs.push(docData);
        DB.setDocs(docs);
        this.closeAllModals();
        this.renderDocuments();
        this.showToast('Document ajouté');
    },

    downloadDoc: function(id) {
        this.showToast('Téléchargement simulé');
    },

    // ==================== MESSAGES ====================
    renderMessages: function() {
        var convs = DB.getConvs();
        var area = document.getElementById('contentArea');
        var h = '<div style="display:grid;grid-template-columns:300px 1fr;gap:0;border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--bg-card);height:calc(100vh - 200px);">'+
        '<div style="border-right:1px solid var(--border);overflow-y:auto;">'+
        '<div style="padding:16px;border-bottom:1px solid var(--border);"><h3 style="font-weight:600;">Conversations</h3></div>';
        
        for(var i=0;i<convs.length;i++) {
            var c = convs[i];
            var active = i===this.curConv ? 'background:var(--bg-input);' : '';
            h += '<div onclick="App.openConversation('+i+')" style="padding:16px;cursor:pointer;'+active+'">'+
            '<div style="display:flex;align-items:center;gap:12px;">'+
            '<div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;background:var(--accent);color:white;">'+c.init+'</div>'+
            '<div style="flex:1;"><p style="font-weight:500;">'+c.name+'</p><p style="font-size:12px;color:var(--text-dim);">'+c.msgs[c.msgs.length-1].text.substring(0,30)+'...</p></div>'+
            (c.unread>0?'<span style="background:var(--accent);color:white;padding:2px 8px;border-radius:9999px;font-size:11px;">'+c.unread+'</span>':'')+'</div></div>';
        }
        h += '</div><div style="display:flex;flex-direction:column;">';
        
        if(convs.length > 0) {
            var c = convs[this.curConv];
            h += '<div style="padding:16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">'+
            '<div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;background:var(--accent);color:white;">'+c.init+'</div>'+
            '<div><p style="font-weight:600;">'+c.name+'</p><p style="font-size:12px;color:var(--text-dim);">'+(c.online?'En ligne':'Hors ligne')+'</p></div></div>'+
            '<div style="flex:1;padding:16px;overflow-y:auto;" id="chatMessages">';
            for(var j=0;j<c.msgs.length;j++) {
                var m = c.msgs[j];
                var align = m.from==='me' ? 'text-align:right;' : '';
                var bg = m.from==='me' ? 'background:var(--accent);color:white;' : 'background:var(--bg-input);';
                h += '<div style="margin-bottom:12px;'+align+'"><span style="display:inline-block;padding:8px 12px;border-radius:12px;'+bg+'">'+m.text+'</span><p style="font-size:11px;color:var(--text-dim);margin-top:4px;">'+m.time+'</p></div>';
            }
            h += '</div><div style="padding:16px;border-top:1px solid var(--border);"><form onsubmit="App.sendMessage(event)" style="display:flex;gap:8px;">'+
            '<input type="text" id="chatInput" placeholder="Écrire un message..." style="flex:1;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+
            '<button type="submit" style="padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Envoyer</button></form></div>';
        }
        h += '</div></div>';
        area.innerHTML = h;
    },

    openConversation: function(i) {
        this.curConv = i;
        var convs = DB.getConvs();
        convs[i].unread = 0;
        DB.setConvs(convs);
        this.renderMessages();
        this.buildSidebar();
    },

    sendMessage: function(e) {
        e.preventDefault();
        var input = document.getElementById('chatInput');
        if(!input.value.trim()) return;
        var convs = DB.getConvs();
        convs[this.curConv].msgs.push({from:'me',text:input.value,time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})});
        DB.setConvs(convs);
        input.value = '';
        this.renderMessages();
    },

    // ==================== UNITÉS ====================
    renderUnits: function() {
        var units = DB.getUnits();
        var area = document.getElementById('contentArea');
        var h = '<div style="margin-bottom:24px;"><h3 style="font-size:24px;font-weight:700;margin-bottom:4px;">Unités</h3><p style="font-size:14px;color:var(--text-dim);">Gérez les sections</p></div>'+
                '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">';
        
        for(var i=0;i<units.length;i++) {
            var u = units[i];
            h += '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);">'+
            '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">'+
            '<div style="width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--accent);color:white;font-size:24px;">⭐</div>'+
            '<div><p style="font-size:18px;font-weight:700;">'+u.name+'</p><p style="font-size:13px;color:var(--text-dim);">'+u.chief+'</p></div></div>'+
            '<p style="font-size:14px;color:var(--text-dim);margin-bottom:16px;">'+u.desc+'</p>'+
            '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:16px;border-top:1px solid var(--border);">'+
            '<span style="font-size:14px;color:var(--text-dim);">'+u.members+' membres</span>'+
            '<button onclick="App.viewUnit('+u.id+')" style="padding:6px 12px;border-radius:6px;font-size:13px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Voir détails</button></div></div>';
        }
        h += '</div>';
        area.innerHTML = h;
    },

    viewUnit: function(id) {
        this.showToast('Détails de l\'unité '+id);
    },

    // ==================== CARTES MEMBRES ====================
    renderCards: function() {
        var members = DB.getMembers(), cfg = DB.getConfig();
        var area = document.getElementById('contentArea');
        var mgrs = DB.getManagers();
        var natName='', depName='', secName='';
        if(cfg.cardPresNat) { var mgr = mgrs.find(function(m){return m.id==cfg.cardPresNat;}); if(mgr) natName = mgr.first+' '+mgr.last; }
        if(cfg.cardPresDep) { var mgr = mgrs.find(function(m){return m.id==cfg.cardPresDep;}); if(mgr) depName = mgr.first+' '+mgr.last; }
        if(cfg.cardPresSec) { var mgr = mgrs.find(function(m){return m.id==cfg.cardPresSec;}); if(mgr) secName = mgr.first+' '+mgr.last; }
        var logoHtml = cfg.cardLogo ? '<img src="'+cfg.cardLogo+'" style="width:100%;height:100%;object-fit:contain;">' : '<div style="width:100%;height:100%;background:linear-gradient(135deg,#002395,#ffffff,#ed2939);border-radius:4px;display:flex;align-items:center;justify-content:center;"><div style="text-align:center;"><div style="font-size:10px;font-weight:bold;color:#002395;">U N C</div><div style="font-size:20px;margin:2px 0;">🎖️</div><div style="font-size:7px;color:#333;">Combattants</div></div></div>';
        area.innerHTML = '<div style="margin-bottom:24px;"><h3 style="font-size:24px;font-weight:700;margin-bottom:4px;">Cartes de Membre</h3><p style="font-size:14px;color:var(--text-dim);">Générez les cartes au format UNC</p></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);">'+
        '<h4 style="font-weight:600;margin-bottom:16px;">Configuration (modifiable dans Administration)</h4>'+
        '<div style="display:flex;flex-direction:column;gap:12px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Nom de l\'association</label><input type="text" value="'+(cfg.cardOrgName||'')+'" readonly style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text-dim);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Adresse</label><input type="text" value="'+(cfg.cardOrgAddr||'')+'" readonly style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text-dim);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Président National</label><input type="text" value="'+natName+'" readonly style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text-dim);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Président Départemental</label><input type="text" value="'+depName+'" readonly style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text-dim);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Président de Section</label><input type="text" value="'+secName+'" readonly style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text-dim);"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Format</label><select id="cardFormat" onchange="App.previewCard()" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><option value="a6"'+(cfg.cardFormat==='a6'?' selected':'')+'>A6 (105×148mm)</option><option value="a5"'+(cfg.cardFormat==='a5'?' selected':'')+'>A5 (148×210mm)</option></select></div>'+
        '</div>'+
        '</div></div>'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);">'+
        '<h4 style="font-weight:600;margin-bottom:16px;">Sélectionner un membre</h4>'+
        '<select id="cardMemberSelect" onchange="App.previewCard()" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);margin-bottom:16px;"><option value="">-- Choisir un membre --</option>'+members.map(function(m){return '<option value="'+m.id+'">'+m.grade+' '+m.first+' '+m.last+' ('+m.section+')</option>';}).join('')+'</select>'+
        '<div id="cardPreviewContainer" style="display:flex;justify-content:center;align-items:center;min-height:300px;">'+
        '<p style="color:var(--text-dim);">Sélectionnez un membre pour prévisualiser la carte</p>'+
        '</div>'+
        '<div id="cardActions" style="display:none;margin-top:16px;display:flex;gap:8px;justify-content:center;">'+
        '<button onclick="App.printCard()" style="padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">🖨️ Imprimer</button>'+
        '<button onclick="App.generateAllCards()" style="padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent-light);border:none;cursor:pointer;">📋 Générer toutes les cartes</button>'+
        '</div>'+
        '</div></div>';
    },

    previewCard: function() {
        var mid = document.getElementById('cardMemberSelect').value;
        if(!mid) { document.getElementById('cardPreviewContainer').innerHTML = '<p style="color:var(--text-dim);">Sélectionnez un membre</p>'; document.getElementById('cardActions').style.display = 'none'; return; }
        var m = DB.getMembers().find(function(x){return x.id===parseInt(mid);});
        if(!m) return;
        var cfg = DB.getConfig();
        var format = document.getElementById('cardFormat').value;
        var w = format==='a5' ? 595 : 420;
        var h = format==='a5' ? 374 : 264;
        var mgrs = DB.getManagers();
        var natName='', depName='', secName='';
        var natSig='', depSig='', secSig='';
        
        if(cfg.cardPresNat) { var mgr = mgrs.find(function(mgr){return mgr.id==cfg.cardPresNat;}); if(mgr) { natName = mgr.first+' '+mgr.last; natSig = mgr.sigNat; } }
        if(cfg.cardPresDep) { var mgr = mgrs.find(function(mgr){return mgr.id==cfg.cardPresDep;}); if(mgr) { depName = mgr.first+' '+mgr.last; depSig = mgr.sigDep; } }
        if(cfg.cardPresSec) { var mgr = mgrs.find(function(mgr){return mgr.id==cfg.cardPresSec;}); if(mgr) { secName = mgr.first+' '+mgr.last; secSig = mgr.sigSec; } }
        
        var logoHtml = cfg.cardLogo ? '<img src="'+cfg.cardLogo+'" style="width:56px;height:56px;object-fit:contain;">' : '<div style="width:56px;height:56px;background:linear-gradient(135deg,#002395,#ffffff,#ed2939);border-radius:4px;display:flex;align-items:center;justify-content:center;"><div style="text-align:center;"><div style="font-size:10px;font-weight:bold;color:#002395;">U N C</div><div style="font-size:20px;margin:2px 0;">🎖️</div><div style="font-size:7px;color:#333;">Combattants</div></div></div>';
        var sigImg = function(sig){ return sig ? '<img src="'+sig+'" style="height:30px;object-fit:contain;">' : ''; };
        
        var cardHtml = '<div class="member-card-preview print-area" style="width:'+w+'px;height:'+h+'px;" id="memberCardPrint">'+
        '<div class="card-header">'+logoHtml+
        '<div class="card-org-block"><div class="card-org-name">'+(cfg.cardOrgName||'Union Nationale des Combattants')+'</div>'+
        '<div class="card-org-addr">'+(cfg.cardOrgAddr||'18, rue Vezelay - 75008 PARIS')+' - Tél. '+(cfg.cardOrgPhone||'01 53 89 04 04')+'</div>'+
        '<div class="card-org-decret">'+(cfg.cardOrgDecret||'')+'</div></div></div>'+
        '<div class="card-type-line"><span class="card-type">Membre Actif</span> <span class="card-number">N° '+m.mat+'</span></div>'+
        '<div class="card-fields">'+
        '<div class="card-field"><label>Nom et Prénom</label><div class="value">'+m.last.toUpperCase()+' '+m.first+'</div></div>'+
        '<div class="card-field"><label>Adresse</label><div class="value">'+(m.address||'')+'</div></div>'+
        '</div>'+
        '<div class="card-section"><span class="section-label">Section</span> <span class="section-value">'+(m.section||'')+'</span></div>'+
        '<div class="card-footer">'+
        '<div class="card-signature"><div class="sig-img">'+sigImg(natSig)+'</div><div class="sig-line">'+natName+'</div><div class="sig-label">Le Président National</div></div>'+
        '<div class="card-signature"><div class="sig-img">'+sigImg(depSig)+'</div><div class="sig-line">'+depName+'</div><div class="sig-label">Le Président Départemental</div></div>'+
        '<div class="card-signature"><div class="sig-img">'+sigImg(secSig)+'</div><div class="sig-line">'+secName+'</div><div class="sig-label">Le Président de Section</div></div>'+
        '</div></div>';
        document.getElementById('cardPreviewContainer').innerHTML = cardHtml;
        document.getElementById('cardActions').style.display = 'flex';
    },

    printCard: function() {
        var card = document.getElementById('memberCardPrint');
        if(!card) return;
        var win = window.open('', '', 'width=650,height=450');
        win.document.write('<html><head><title>Carte de Membre</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;}@media print{body{margin:0;}}</style></head><body>');
        win.document.write(card.outerHTML);
        win.document.write('</body></html>');
        win.document.close();
        setTimeout(function(){win.print();}, 500);
    },

    generateAllCards: function() {
        var members = DB.getMembers().filter(function(m){return m.status==='Actif';});
        if(!members.length) { this.showToast('Aucun membre actif'); return; }
        var cfg = DB.getConfig();
        var format = document.getElementById('cardFormat').value;
        var w = format==='a5' ? 595 : 420;
        var h = format==='a5' ? 374 : 264;
        var mgrs = DB.getManagers();
        var natName='', depName='', secName='';
        var natSig='', depSig='', secSig='';
        
        if(cfg.cardPresNat) { var mgr = mgrs.find(function(mgr){return mgr.id==cfg.cardPresNat;}); if(mgr) { natName = mgr.first+' '+mgr.last; natSig = mgr.sigNat; } }
        if(cfg.cardPresDep) { var mgr = mgrs.find(function(mgr){return mgr.id==cfg.cardPresDep;}); if(mgr) { depName = mgr.first+' '+mgr.last; depSig = mgr.sigDep; } }
        if(cfg.cardPresSec) { var mgr = mgrs.find(function(mgr){return mgr.id==cfg.cardPresSec;}); if(mgr) { secName = mgr.first+' '+mgr.last; secSig = mgr.sigSec; } }
        
        var logoHtml = cfg.cardLogo ? '<img src="'+cfg.cardLogo+'" style="width:56px;height:56px;object-fit:contain;">' : '<div style="width:56px;height:56px;background:linear-gradient(135deg,#002395,#ffffff,#ed2939);border-radius:4px;display:flex;align-items:center;justify-content:center;"><div style="text-align:center;"><div style="font-size:10px;font-weight:bold;color:#002395;">U N C</div><div style="font-size:20px;margin:2px 0;">🎖️</div><div style="font-size:7px;color:#333;">Combattants</div></div></div>';
        var sigImg = function(sig, name){ return sig ? '<img src="'+sig+'" style="height:30px;object-fit:contain;">' : ''; };

        var html = '<html><head><title>Cartes de Membres</title><style>body{margin:0;padding:20px;font-family:Georgia,serif;}.page-break{page-break-after:always;}.member-card-preview{width:'+w+'px;height:'+h+'px;background:linear-gradient(135deg,#e0e4e8 0%,#f0f0f0 25%,#ffffff 50%,#ffe8e0 75%,#e8d8d0 100%);border:2px solid #b0b0b0;border-radius:6px;position:relative;overflow:hidden;margin:10px auto;box-shadow:0 2px 8px rgba(0,0,0,.1);}.card-header{display:flex;align-items:flex-start;padding:10px 16px 6px;gap:12px;}.card-org-name{font-size:18px;font-weight:bold;color:#c0392b;line-height:1.2;letter-spacing:0.5px;}.card-org-addr{font-size:10px;color:#4a4a6a;margin-top:2px;}.card-org-decret{font-size:8px;color:#777;font-style:italic;}.card-type-line{text-align:center;padding:6px 0 4px;border-bottom:1px solid #ccc;margin:0 16px;}.card-type{font-size:17px;font-style:italic;color:#2c2c2c;}.card-number{font-size:13px;font-style:normal;color:#555;}.card-fields{padding:6px 16px;}.card-field{display:flex;align-items:baseline;margin-bottom:5px;font-size:12px;}.card-field label{font-size:10px;color:#666;min-width:90px;}.card-field .value{font-size:16px;font-weight:bold;color:#1a1a1a;border-bottom:1px dotted #999;flex:1;padding:0 6px;min-height:22px;}.card-section{padding:2px 16px;}.card-section .section-label{font-size:10px;color:#666;}.card-section .section-value{font-size:14px;font-weight:bold;color:#1a1a1a;}.card-footer{display:flex;justify-content:space-around;padding:6px 12px 8px;margin-top:4px;}.card-signature{text-align:center;flex:1;}.card-signature .sig-img{width:80px;height:32px;margin:0 auto 2px;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;}.card-signature .sig-img img{max-width:100%;max-height:100%;object-fit:contain;}.card-signature .sig-line{font-size:14px;font-style:italic;color:#333;min-height:20px;display:flex;align-items:flex-end;justify-content:center;font-family:\'Brush Script MT\',cursive;}.card-signature .sig-label{font-size:7px;color:#888;}@media print{.member-card-preview{box-shadow:none;border:2px solid #b0b0b0;}}</style></head><body>';
        members.forEach(function(m){
            html += '<div class="member-card-preview">'+
            '<div class="card-header">'+logoHtml+
            '<div class="card-org-block"><div class="card-org-name">'+(cfg.cardOrgName||'Union Nationale des Combattants')+'</div>'+
            '<div class="card-org-addr">'+(cfg.cardOrgAddr||'18, rue Vezelay - 75008 PARIS')+' - Tél. '+(cfg.cardOrgPhone||'01 53 89 04 04')+'</div>'+
            '<div class="card-org-decret">'+(cfg.cardOrgDecret||'')+'</div></div></div>'+
            '<div class="card-type-line"><span class="card-type">Membre Actif</span> <span class="card-number">N° '+m.mat+'</span></div>'+
            '<div class="card-fields">'+
            '<div class="card-field"><label>Nom et Prénom</label><div class="value">'+m.last.toUpperCase()+' '+m.first+'</div></div>'+
            '<div class="card-field"><label>Adresse</label><div class="value">'+(m.address||'')+'</div></div>'+
            '</div>'+
            '<div class="card-section"><span class="section-label">Section</span> <span class="section-value">'+(m.section||'')+'</span></div>'+
            '<div class="card-footer">'+
            '<div class="card-signature"><div class="sig-img">'+sigImg(natSig, natName)+'</div><div class="sig-line">'+natName+'</div><div class="sig-label">Le Président National</div></div>'+
            '<div class="card-signature"><div class="sig-img">'+sigImg(depSig, depName)+'</div><div class="sig-line">'+depName+'</div><div class="sig-label">Le Président Départemental</div></div>'+
            '<div class="card-signature"><div class="sig-img">'+sigImg(secSig, secName)+'</div><div class="sig-line">'+secName+'</div><div class="sig-label">Le Président de Section</div></div>'+
            '</div></div><div class="page-break"></div>';
        });
        html += '</body></html>';
        var win = window.open('', '', 'width=800,height=600');
        win.document.write(html);
        win.document.close();
        setTimeout(function(){win.print();}, 500);
    },

    // ==================== ADMINISTRATION ====================
    renderAdmin: function() {
        var area = document.getElementById('contentArea');
        var h = '<div style="margin-bottom:24px;"><h3 style="font-size:24px;font-weight:700;margin-bottom:4px;">Administration</h3><p style="font-size:14px;color:var(--text-dim);">Gérez les paramètres avancés de l\'application</p></div>'+
                '<div style="display:flex;gap:12px;margin-bottom:24px;border-bottom:1px solid var(--border);padding-bottom:12px;">'+
                '<button onclick="App.renderAdminGrades()" class="tab-active" id="tabGrades" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Grades</button>'+
                '<button onclick="App.renderAdminSections()" id="tabSections" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Sections</button>'+
                '<button onclick="App.renderAdminEvtTypes()" id="tabEvtTypes" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Types événements</button>'+
                '<button onclick="App.renderAdminDocTypes()" id="tabDocTypes" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Types documents</button>'+
                '<button onclick="App.renderAdminManagers()" id="tabManagers" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Gestionnaires</button>'+
                '<button onclick="App.renderAdminCards()" id="tabCards" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Cartes</button></div>'+
                '<div id="adminContent"></div>';
        area.innerHTML = h;
        this.renderAdminGrades();
    },

    renderAdminGrades: function() {
        document.querySelectorAll('[id^="tab"]').forEach(function(b){b.classList.remove('tab-active');});
        document.getElementById('tabGrades').classList.add('tab-active');
        var c = document.getElementById('adminContent');
        var grades = DB.getGrades();
        var h = '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;"><h4 style="font-weight:600;">Grades militaires</h4><div style="display:flex;gap:8px;"><input type="text" id="newGradeInput" placeholder="Nouveau grade..." style="border-radius:8px;padding:8px 12px;font-size:13px;outline:none;width:200px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><button onclick="App.addGrade()" style="padding:8px 12px;border-radius:8px;font-size:13px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Ajouter</button><button onclick="App.exportTableToCSV(DB.getGrades(), \'grades.csv\')" style="padding:8px 12px;border-radius:8px;font-size:13px;background:var(--bg-input);color:var(--text);border:1px solid var(--border);cursor:pointer;">📥</button></div></div><div style="display:flex;flex-direction:column;gap:8px;">';
        for(var i=0;i<grades.length;i++) {
            h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-radius:8px;background:var(--bg-input);"><span>'+grades[i]+'</span><div style="display:flex;gap:4px;"><button onclick="App.editGradeItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">✏️</button><button onclick="App.delGradeItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">🗑️</button></div></div>';
        }
        h += '</div></div>';
        c.innerHTML = h;
    },

    addGrade: function() {
        var inp = document.getElementById('newGradeInput');
        if(!inp) return;
        var v = inp.value.trim();
        if(!v) return;
        if(DB.getGrades().indexOf(v) > -1) { this.showToast('Existant'); return; }
        var g = DB.getGrades();
        g.push(v);
        DB.setGrades(g);
        inp.value = '';
        this.renderAdminGrades();
        this.showToast('Ajouté');
    },

    editGradeItem: function(i) {
        var nv = prompt('Modifier:', DB.getGrades()[i]);
        if(nv && nv.trim()) {
            var old = DB.getGrades()[i];
            var g = DB.getGrades();
            g[i] = nv.trim();
            DB.setGrades(g);
            var members = DB.getMembers();
            for(var j=0; j<members.length; j++) {
                if(members[j].grade === old) members[j].grade = nv.trim();
            }
            DB.setMembers(members);
            this.renderAdminGrades();
            this.showToast('Modifié');
        }
    },

    delGradeItem: function(i) {
        this.showConfirm('Supprimer?', DB.getGrades()[i], function(){
            var g = DB.getGrades();
            g.splice(i, 1);
            DB.setGrades(g);
            App.renderAdminGrades();
            App.showToast('Supprimé');
        });
    },

    renderAdminSections: function() {
        document.querySelectorAll('[id^="tab"]').forEach(function(b){b.classList.remove('tab-active');});
        document.getElementById('tabSections').classList.add('tab-active');
        var c = document.getElementById('adminContent');
        var sections = DB.getSections();
        var h = '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;"><h4 style="font-weight:600;">Sections</h4><div style="display:flex;gap:8px;"><input type="text" id="newSectionInput" placeholder="Nouvelle..." style="border-radius:8px;padding:8px 12px;font-size:13px;outline:none;width:180px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><button onclick="App.addSection()" style="padding:8px 12px;border-radius:8px;font-size:13px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Ajouter</button></div></div><div style="display:flex;flex-direction:column;gap:8px;">';
        for(var i=0;i<sections.length;i++) {
            var mc = 0;
            var members = DB.getMembers();
            for(var j=0;j<members.length;j++) { if(members[j].section === sections[i]) mc++; }
            h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-radius:8px;background:var(--bg-input);"><div><span>'+sections[i]+'</span><span style="font-size:12px;margin-left:8px;color:var(--text-dim);">('+mc+' membres)</span></div><div style="display:flex;gap:4px;"><button onclick="App.editSectionItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">✏️</button><button onclick="App.delSectionItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">️</button></div></div>';
        }
        h += '</div></div>';
        c.innerHTML = h;
    },

    addSection: function() {
        var inp = document.getElementById('newSectionInput');
        if(!inp) return;
        var v = inp.value.trim();
        if(!v) return;
        if(DB.getSections().indexOf(v) > -1) { this.showToast('Existant'); return; }
        var s = DB.getSections();
        s.push(v);
        DB.setSections(s);
        inp.value = '';
        this.renderAdminSections();
        this.showToast('Ajouté');
    },

    editSectionItem: function(i) {
        var nv = prompt('Modifier:', DB.getSections()[i]);
        if(nv && nv.trim()) {
            var old = DB.getSections()[i];
            var s = DB.getSections();
            s[i] = nv.trim();
            DB.setSections(s);
            var members = DB.getMembers();
            for(var j=0;j<members.length;j++) { if(members[j].section === old) members[j].section = nv.trim(); }
            DB.setMembers(members);
            this.renderAdminSections();
            this.showToast('Modifié');
        }
    },

    delSectionItem: function(i) {
        var members = DB.getMembers();
        for(var j=0;j<members.length;j++) { if(members[j].section === DB.getSections()[i]) { this.showToast('Impossible: membres dans cette section'); return; } }
        this.showConfirm('Supprimer?', DB.getSections()[i], function(){
            var s = DB.getSections();
            s.splice(i, 1);
            DB.setSections(s);
            App.renderAdminSections();
            App.showToast('Supprimé');
        });
    },

    renderAdminEvtTypes: function() {
        document.querySelectorAll('[id^="tab"]').forEach(function(b){b.classList.remove('tab-active');});
        document.getElementById('tabEvtTypes').classList.add('tab-active');
        var c = document.getElementById('adminContent');
        var types = DB.getEventTypes();
        var h = '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;"><h4 style="font-weight:600;">Types événements</h4><div style="display:flex;gap:8px;"><input type="text" id="newEvtTypeInput" placeholder="Nouveau..." style="border-radius:8px;padding:8px 12px;font-size:13px;outline:none;width:180px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><button onclick="App.addEvtType()" style="padding:8px 12px;border-radius:8px;font-size:13px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Ajouter</button></div></div><div style="display:flex;flex-direction:column;gap:8px;">';
        for(var i=0;i<types.length;i++) h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-radius:8px;background:var(--bg-input);"><span>'+types[i]+'</span><div style="display:flex;gap:4px;"><button onclick="App.editEvtTypeItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">✏️</button><button onclick="App.delEvtTypeItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">🗑️</button></div></div>';
        h += '</div></div>';
        c.innerHTML = h;
    },

    addEvtType: function() {
        var inp = document.getElementById('newEvtTypeInput');
        if(!inp) return;
        var v = inp.value.trim();
        if(!v) return;
        if(DB.getEventTypes().indexOf(v) > -1) { this.showToast('Existant'); return; }
        var t = DB.getEventTypes();
        t.push(v);
        DB.setEventTypes(t);
        inp.value = '';
        this.renderAdminEvtTypes();
        this.showToast('Ajouté');
    },

    editEvtTypeItem: function(i) {
        var nv = prompt('Modifier:', DB.getEventTypes()[i]);
        if(nv && nv.trim()) {
            var old = DB.getEventTypes()[i];
            var t = DB.getEventTypes();
            t[i] = nv.trim();
            DB.setEventTypes(t);
            var evts = DB.getEvents();
            for(var j=0;j<evts.length;j++) { if(evts[j].type === old) evts[j].type = nv.trim(); }
            DB.setEvents(evts);
            this.renderAdminEvtTypes();
            this.showToast('Modifié');
        }
    },

    delEvtTypeItem: function(i) {
        this.showConfirm('Supprimer?', DB.getEventTypes()[i], function(){
            var t = DB.getEventTypes();
            t.splice(i, 1);
            DB.setEventTypes(t);
            App.renderAdminEvtTypes();
            App.showToast('Supprimé');
        });
    },

    renderAdminDocTypes: function() {
        document.querySelectorAll('[id^="tab"]').forEach(function(b){b.classList.remove('tab-active');});
        document.getElementById('tabDocTypes').classList.add('tab-active');
        var c = document.getElementById('adminContent');
        var types = DB.getDocTypes();
        var h = '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;"><h4 style="font-weight:600;">Types documents</h4><div style="display:flex;gap:8px;"><input type="text" id="newDocTypeInput" placeholder="Nouveau..." style="border-radius:8px;padding:8px 12px;font-size:13px;outline:none;width:180px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><button onclick="App.addDocType()" style="padding:8px 12px;border-radius:8px;font-size:13px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Ajouter</button></div></div><div style="display:flex;flex-direction:column;gap:8px;">';
        for(var i=0;i<types.length;i++) h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-radius:8px;background:var(--bg-input);"><span>'+types[i]+'</span><div style="display:flex;gap:4px;"><button onclick="App.editDocTypeItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">✏️</button><button onclick="App.delDocTypeItem('+i+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">🗑️</button></div></div>';
        h += '</div></div>';
        c.innerHTML = h;
    },

    addDocType: function() {
        var inp = document.getElementById('newDocTypeInput');
        if(!inp) return;
        var v = inp.value.trim();
        if(!v) return;
        if(DB.getDocTypes().indexOf(v) > -1) { this.showToast('Existant'); return; }
        var t = DB.getDocTypes();
        t.push(v);
        DB.setDocTypes(t);
        inp.value = '';
        this.renderAdminDocTypes();
        this.showToast('Ajouté');
    },

    editDocTypeItem: function(i) {
        var nv = prompt('Modifier:', DB.getDocTypes()[i]);
        if(nv && nv.trim()) {
            var old = DB.getDocTypes()[i];
            var t = DB.getDocTypes();
            t[i] = nv.trim();
            DB.setDocTypes(t);
            var docs = DB.getDocs();
            for(var j=0;j<docs.length;j++) { if(docs[j].type === old) docs[j].type = nv.trim(); }
            DB.setDocs(docs);
            this.renderAdminDocTypes();
            this.showToast('Modifié');
        }
    },

    delDocTypeItem: function(i) {
        this.showConfirm('Supprimer?', DB.getDocTypes()[i], function(){
            var t = DB.getDocTypes();
            t.splice(i, 1);
            DB.setDocTypes(t);
            App.renderAdminDocTypes();
            App.showToast('Supprimé');
        });
    },

    renderAdminManagers: function() {
        document.querySelectorAll('[id^="tab"]').forEach(function(b){b.classList.remove('tab-active');});
        document.getElementById('tabManagers').classList.add('tab-active');
        var c = document.getElementById('adminContent');
        var mgrs = DB.getManagers();
        var h = '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><h4 style="font-weight:600;">Gestionnaires</h4><button onclick="App.openAddManager()" style="padding:8px 12px;border-radius:8px;font-size:13px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">+ Ajouter</button></div>';
        for(var i=0;i<mgrs.length;i++) {
            var m = mgrs[i];
            var photoHtml = m.photo ? '<img src="'+m.photo+'" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">' : '<div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;background:var(--accent);color:white;">'+m.first[0]+m.last[0]+'</div>';
            h += '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid var(--border);">'+photoHtml+
            '<div style="flex:1;"><p style="font-weight:500;">'+m.first+' '+m.last+'</p><p style="font-size:12px;color:var(--text-dim);">'+m.email+' | '+m.role+'</p></div>'+
            '<div style="display:flex;gap:8px;align-items:center;">'+
            '<span class="copy-btn" style="opacity:1;font-size:16px;" onclick="App.copyToClipboard(\''+m.email+'\')" title="Copier email">📧</span>'+
            (m.phone?'<span class="copy-btn" style="opacity:1;font-size:16px;" onclick="App.copyToClipboard(\''+m.phone+'\')" title="Copier téléphone">📞</span>':'')+
            '<button onclick="App.openEditManager('+m.id+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">✏️</button>'+
            '<button onclick="App.delManager('+m.id+')" style="padding:6px;background:none;border:none;cursor:pointer;color:var(--text-dim);">️</button>'+
            '</div></div>';
        }
        h += '</div>';
        c.innerHTML = h;
    },

    openAddManager: function() {
        var h = '<form onsubmit="App.handleManagerSave(event)" style="display:flex;flex-direction:column;gap:16px;"><input type="hidden" id="mgrEditId">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Prénom *</label><input type="text" id="mgrfFirst" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div><div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Nom *</label><input type="text" id="mgrfLast" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Email *</label><input type="email" id="mgrfEmail" required style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Téléphone</label><input type="tel" id="mgrfPhone" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Photo</label><input type="file" id="mgrfPhoto" accept="image/*" style="width:100%;border-radius:8px;padding:8px;font-size:13px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Rôle</label><select id="mgrfRole" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><option>Administrateur</option><option>Trésorier</option><option>Secrétaire</option><option>Gestionnaire</option><option>Lecteur seul</option></select></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Statut</label><select id="mgrfStatus" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><option>Actif</option><option>Inactif</option></select></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;"><button type="button" onclick="App.closeAllModals()" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Annuler</button><button type="submit" style="padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Ajouter</button></div></form>';
        this.showGenericModal('Gestionnaire', h);
    },

    openEditManager: function(id) {
        var m = DB.getManagers().find(function(x){return x.id===id;});
        if(!m) return;
        var h = '<form onsubmit="App.handleManagerSave(event)" style="display:flex;flex-direction:column;gap:16px;"><input type="hidden" id="mgrEditId" value="'+m.id+'">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;"><div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Prénom *</label><input type="text" id="mgrfFirst" required value="'+m.first+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div><div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Nom *</label><input type="text" id="mgrfLast" required value="'+m.last+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Email *</label><input type="email" id="mgrfEmail" required value="'+m.email+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Téléphone</label><input type="tel" id="mgrfPhone" value="'+(m.phone||'')+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Photo</label><input type="file" id="mgrfPhoto" accept="image/*" style="width:100%;border-radius:8px;padding:8px;font-size:13px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+(m.photo?'<img src="'+m.photo+'" style="width:48px;height:48px;border-radius:50%;margin-top:8px;object-fit:cover;">':'')+'</div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Rôle</label><select id="mgrfRole" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+'Administrateur,Trésorier,Secrétaire,Gestionnaire,Lecteur seul'.split(',').map(function(r){return '<option'+(r===m.role?' selected':'')+'>'+r+'</option>';}).join('')+'</select></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Statut</label><select id="mgrfStatus" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"><option'+(m.status==='Actif'?' selected':'')+'>Actif</option><option'+(m.status==='Inactif'?' selected':'')+'>Inactif</option></select></div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;"><button type="button" onclick="App.closeAllModals()" style="padding:8px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:none;cursor:pointer;">Annuler</button><button type="submit" style="padding:8px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Sauvegarder</button></div></form>';
        this.showGenericModal('Gestionnaire', h);
    },

    handleManagerSave: function(e) {
        e.preventDefault();
        var eid = document.getElementById('mgrEditId').value;
        var photoFile = document.getElementById('mgrfPhoto');
        var self = this;
        var processSave = function(photoData) {
            var d = {
                first: document.getElementById('mgrfFirst').value.trim(),
                last: document.getElementById('mgrfLast').value.trim(),
                email: document.getElementById('mgrfEmail').value.trim(),
                phone: document.getElementById('mgrfPhone') ? document.getElementById('mgrfPhone').value.trim() : '',
                role: document.getElementById('mgrfRole').value,
                status: document.getElementById('mgrfStatus').value,
                photo: photoData
            };
            var mgrs = DB.getManagers();
            if(eid) {
                for(var i=0;i<mgrs.length;i++) {
                    if(mgrs[i].id === parseInt(eid)) {
                        for(var k in d) { if(d[k] !== null && d[k] !== undefined) mgrs[i][k] = d[k]; }
                        break;
                    }
                }
                DB.setManagers(mgrs);
                self.showToast(d.first+' '+d.last+' modifié');
            } else {
                var mx = 0;
                for(var i=0;i<mgrs.length;i++) { if(mgrs[i].id > mx) mx = mgrs[i].id; }
                d.id = mx + 1;
                mgrs.push(d);
                DB.setManagers(mgrs);
                self.showToast(d.first+' '+d.last+' ajouté');
            }
            self.closeAllModals();
            self.renderAdminManagers();
        };
        if(photoFile && photoFile.files && photoFile.files[0]) {
            var reader = new FileReader();
            reader.onload = function(ev) { processSave(ev.target.result); };
            reader.readAsDataURL(photoFile.files[0]);
        } else {
            if(eid) {
                var old = DB.getManagers().find(function(x){return x.id===parseInt(eid);});
                processSave(old ? old.photo : null);
            } else {
                processSave(null);
            }
        }
    },

    delManager: function(id) {
        var m = DB.getManagers().find(function(x){return x.id===id;});
        if(!m) return;
        this.showConfirm('Supprimer ?', m.first+' '+m.last, function(){
            DB.setManagers(DB.getManagers().filter(function(x){return x.id!==id;}));
            App.renderAdminManagers();
            App.showToast('Supprimé');
        });
    },

    renderAdminCards: function() {
        document.querySelectorAll('[id^="tab"]').forEach(function(b){b.classList.remove('tab-active');});
        document.getElementById('tabCards').classList.add('tab-active');
        var c = document.getElementById('adminContent');
        var cfg = DB.getConfig();
        var mgrs = DB.getManagers();
        var natName='', depName='', secName='';
        if(cfg.cardPresNat) { var mgr = mgrs.find(function(m){return m.id==cfg.cardPresNat;}); if(mgr) natName = mgr.first+' '+mgr.last; }
        if(cfg.cardPresDep) { var mgr = mgrs.find(function(m){return m.id==cfg.cardPresDep;}); if(mgr) depName = mgr.first+' '+mgr.last; }
        if(cfg.cardPresSec) { var mgr = mgrs.find(function(m){return m.id==cfg.cardPresSec;}); if(mgr) secName = mgr.first+' '+mgr.last; }
        
        var sigPreview = function(sig, id, label){
            return '<div style="text-align:center;">'+
            '<label style="display:block;font-size:11px;color:var(--text-dim);margin-bottom:4px;">'+label+'</label>'+
            '<div style="width:150px;height:50px;border:1px dashed var(--border);margin:0 auto 4px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg-input);">'+
            (sig ? '<img src="'+sig+'" style="max-height:40px;">' : '<span style="font-size:10px;color:#aaa;">Aucune signature</span>')+
            '</div>'+
            '<input type="file" id="'+id+'" accept="image/*" style="display:none;" onchange="App.uploadSignature(\''+id+'\', \''+label.replace(/ /g,'_')+'\')">'+
            '<button onclick="document.getElementById(\''+id+'\').click()" style="font-size:11px;background:var(--bg-input);border:1px solid var(--border);padding:2px 8px;cursor:pointer;border-radius:4px;">Changer</button>'+
            (sig ? '<button onclick="App.removeSignature(\''+label.replace(/ /g,'_')+'\')" style="font-size:11px;background:rgba(239,68,68,.1);color:#ef4444;border:none;padding:2px 8px;cursor:pointer;border-radius:4px;margin-left:4px;">X</button>' : '')+
            '</div>';
        };

        var h = '<div style="border-radius:12px;border:1px solid var(--border);padding:20px;background:var(--bg-card);">'+
        '<h4 style="font-weight:600;margin-bottom:16px;">Configuration des cartes de membre</h4>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Nom de l\'association</label><input type="text" id="cardOrgName" value="'+(cfg.cardOrgName||'')+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Adresse</label><input type="text" id="cardOrgAddr" value="'+(cfg.cardOrgAddr||'')+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Téléphone</label><input type="text" id="cardOrgPhone" value="'+(cfg.cardOrgPhone||'')+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Décret</label><input type="text" id="cardOrgDecret" value="'+(cfg.cardOrgDecret||'')+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '</div>'+
        '<div style="margin-top:16px;"><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Logo de l\'association</label><input type="file" id="cardLogo" accept="image/*" style="width:100%;border-radius:8px;padding:8px;font-size:13px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);">'+(cfg.cardLogo?'<img src="'+cfg.cardLogo+'" style="width:60px;height:60px;margin-top:8px;object-fit:contain;border:1px solid var(--border);border-radius:4px;">':'')+'</div>'+
        
        '<h4 style="font-weight:600;margin:20px 0 12px;">Présidents et signatures</h4>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">'+
        
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Président National</label>'+
        '<select id="cardPresNat" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);margin-bottom:8px;"><option value="">-- Aucun --</option>'+mgrs.filter(function(m){return m.status==='Actif';}).map(function(m){return '<option value="'+m.id+'"'+(m.id==cfg.cardPresNat?' selected':'')+'>'+m.first+' '+m.last+'</option>';}).join('')+'</select>'+
        sigPreview(cfg.cardSigNat, 'sigNatInput', 'Signature Nat.')+
        '</div>'+
        
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Président Départemental</label>'+
        '<select id="cardPresDep" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);margin-bottom:8px;"><option value="">-- Aucun --</option>'+mgrs.filter(function(m){return m.status==='Actif';}).map(function(m){return '<option value="'+m.id+'"'+(m.id==cfg.cardPresDep?' selected':'')+'>'+m.first+' '+m.last+'</option>';}).join('')+'</select>'+
        sigPreview(cfg.cardSigDep, 'sigDepInput', 'Signature Dép.')+
        '</div>'+
        
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Président de Section</label>'+
        '<select id="cardPresSec" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);margin-bottom:8px;"><option value="">-- Aucun --</option>'+mgrs.filter(function(m){return m.status==='Actif';}).map(function(m){return '<option value="'+m.id+'"'+(m.id==cfg.cardPresSec?' selected':'')+'>'+m.first+' '+m.last+'</option>';}).join('')+'</select>'+
        sigPreview(cfg.cardSigSec, 'sigSecInput', 'Signature Sec.')+
        '</div>'+
        
        '</div>'+
        '<div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px;"><button onclick="App.saveCardConfigFromAdmin()" style="padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Sauvegarder la configuration</button></div>'+
        '</div>';
        c.innerHTML = h;
    },

    uploadSignature: function(inputId, type) {
        var input = document.getElementById(inputId);
        if(input && input.files && input.files[0]) {
            var reader = new FileReader();
            var self = this;
            reader.onload = function(e) {
                var cfg = DB.getConfig();
                if(type === 'Signature_Nat.') cfg.cardSigNat = e.target.result;
                else if(type === 'Signature_Dép.') cfg.cardSigDep = e.target.result;
                else if(type === 'Signature_Sec.') cfg.cardSigSec = e.target.result;
                DB.setConfig(cfg);
                self.renderAdminCards();
                self.showToast('Signature mise à jour');
            };
            reader.readAsDataURL(input.files[0]);
        }
    },

    removeSignature: function(type) {
        var cfg = DB.getConfig();
        if(type === 'Signature_Nat.') cfg.cardSigNat = null;
        else if(type === 'Signature_Dép.') cfg.cardSigDep = null;
        else if(type === 'Signature_Sec.') cfg.cardSigSec = null;
        DB.setConfig(cfg);
        this.renderAdminCards();
        this.showToast('Signature supprimée');
    },

    saveCardConfigFromAdmin: function() {
        var cfg = DB.getConfig();
        cfg.cardOrgName = document.getElementById('cardOrgName').value;
        cfg.cardOrgAddr = document.getElementById('cardOrgAddr').value;
        cfg.cardOrgPhone = document.getElementById('cardOrgPhone').value;
        cfg.cardOrgDecret = document.getElementById('cardOrgDecret').value;
        cfg.cardPresNat = document.getElementById('cardPresNat').value;
        cfg.cardPresDep = document.getElementById('cardPresDep').value;
        cfg.cardPresSec = document.getElementById('cardPresSec').value;
        
        var logoFile = document.getElementById('cardLogo');
        var self = this;
        var save = function() {
            DB.setConfig(cfg);
            self.showToast('Configuration des cartes sauvegardée');
        };
        if(logoFile && logoFile.files && logoFile.files[0]) {
            var reader = new FileReader();
            reader.onload = function(ev) { cfg.cardLogo = ev.target.result; save(); };
            reader.readAsDataURL(logoFile.files[0]);
        } else {
            save();
        }
    },

    // ==================== PARAMÈTRES ====================
    renderSettings: function() {
        var cfg = DB.getConfig(), area = document.getElementById('contentArea');
        var customColors = cfg.customColors || {};
        area.innerHTML = '<div style="max-width:768px;display:flex;flex-direction:column;gap:24px;">'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:24px;background:var(--bg-card);"><h3 style="font-size:18px;font-weight:600;margin-bottom:20px;">Informations</h3>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Nom</label><input type="text" id="settName" value="'+(cfg.appName||'MILASSOC PRO')+'" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">RNA / SIRET</label><input type="text" value="W751234567890" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Email</label><input type="email" value="contact@milassoc.fr" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Téléphone</label><input type="tel" value="+33 1 42 68 53 00" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '<div style="grid-column:1/-1;"><label style="display:block;font-size:13px;margin-bottom:4px;color:var(--text-dim);">Adresse</label><input type="text" value="12 Rue de la Paix, 75002 Paris" style="width:100%;border-radius:8px;padding:10px 14px;font-size:14px;outline:none;background:var(--bg-input);border:1px solid var(--border);color:var(--text);"></div>'+
        '</div><div style="margin-top:20px;display:flex;justify-content:flex-end;"><button onclick="App.saveSettings()" style="padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;">Sauvegarder</button></div></div>'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:24px;background:var(--bg-card);"><h3 style="font-size:18px;font-weight:600;margin-bottom:20px;">Apparence</h3>'+
        '<div style="display:flex;flex-direction:column;gap:20px;">'+
        '<div><label style="display:block;font-size:14px;margin-bottom:12px;color:var(--text-dim);">Thème prédéfini</label><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">'+
        Object.keys(this.THEMES).map(function(key){
            if(key==='custom') return '';
            var t = App.THEMES[key], active = key===cfg.theme;
            return '<button onclick="App.applyTheme(\''+key+'\');App.renderSettings();" style="border-radius:8px;padding:12px;border:2px solid '+(active?'var(--accent)':'transparent')+';transition:all .2s;cursor:pointer;background:'+t.bgDark+';"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:16px;height:16px;border-radius:50%;background:'+t.accent+';"></div><div style="width:16px;height:16px;border-radius:50%;background:'+t.accentLight+';"></div></div><p style="font-size:12px;color:'+t.text+';">'+t.name+(t.light?' (Clair)':'')+'</p></button>';
        }).join('')+
        '</div></div>'+
        '<div><label style="display:block;font-size:14px;margin-bottom:12px;color:var(--text-dim);">Couleurs personnalisées</label>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Fond principal</label><input type="color" id="customBgDark" value="'+(customColors.bgDark||cfg.bgDark||'#0f1a0f')+'" onchange="App.updateCustomColor(\'bgDark\',this.value)"></div>'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Fond carte</label><input type="color" id="customBgCard" value="'+(customColors.bgCard||'#1a2a1a')+'" onchange="App.updateCustomColor(\'bgCard\',this.value)"></div>'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Couleur accent</label><input type="color" id="customAccent" value="'+(customColors.accent||'#4f7a3f')+'" onchange="App.updateCustomColor(\'accent\',this.value)"></div>'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Accent clair</label><input type="color" id="customAccentLight" value="'+(customColors.accentLight||'#6b9e55')+'" onchange="App.updateCustomColor(\'accentLight\',this.value)"></div>'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Texte</label><input type="color" id="customText" value="'+(customColors.text||'#e0e8d8')+'" onchange="App.updateCustomColor(\'text\',this.value)"></div>'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Texte dim</label><input type="color" id="customTextDim" value="'+(customColors.textDim||'#8a9a80')+'" onchange="App.updateCustomColor(\'textDim\',this.value)"></div>'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Bordure</label><input type="color" id="customBorder" value="'+(customColors.border||'#2d402d')+'" onchange="App.updateCustomColor(\'border\',this.value)"></div>'+
        '<div class="color-picker-wrapper"><label style="font-size:13px;color:var(--text-dim);min-width:100px;">Fond input</label><input type="color" id="customBgInput" value="'+(customColors.bgInput||'#243524')+'" onchange="App.updateCustomColor(\'bgInput\',this.value)"></div>'+
        '</div>'+
        '<button onclick="App.applyTheme(\'custom\')" style="padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;color:white;background:var(--accent);border:none;cursor:pointer;margin-top:8px;">Appliquer couleurs personnalisées</button>'+
        '</div>'+
        '<div><label style="display:block;font-size:14px;margin-bottom:12px;color:var(--text-dim);">Logo du site</label><div style="display:flex;align-items:center;gap:16px;">'+
        '<div style="width:64px;height:64px;border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg-input);border:1px solid var(--border);">'+(cfg.logo?'<img src="'+cfg.logo+'" style="width:100%;height:100%;object-fit:cover;">':'<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>')+'</div>'+
        '<div><label style="display:inline-block;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;color:white;background:var(--accent);cursor:pointer;" for="logoUpload">Choisir</label><input type="file" id="logoUpload" accept="image/*" style="display:none;" onchange="App.handleLogoUpload(this)"><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">PNG, JPG — Max 2MB</p>'+(cfg.logo?'<button onclick="App.removeLogo()" style="font-size:12px;margin-top:8px;color:var(--danger);background:none;border:none;cursor:pointer;">Supprimer</button>':'')+'</div></div></div>'+
        '<div><label style="display:block;font-size:14px;margin-bottom:12px;color:var(--text-dim);">Favicon</label><div style="display:flex;align-items:center;gap:16px;">'+
        '<div style="width:32px;height:32px;border-radius:4px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:var(--bg-input);border:1px solid var(--border);">'+(cfg.favicon?'<img src="'+cfg.favicon+'" style="width:100%;height:100%;object-fit:cover;">':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2"><path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/></svg>')+'</div>'+
        '<div><label style="display:inline-block;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;color:white;background:var(--accent);cursor:pointer;" for="faviconUpload">Choisir</label><input type="file" id="faviconUpload" accept="image/*" style="display:none;" onchange="App.handleFaviconUpload(this)"><p style="font-size:12px;margin-top:4px;color:var(--text-dim);">PNG, ICO — 32×32 recommandé</p>'+(cfg.favicon?'<button onclick="App.removeFavicon()" style="font-size:12px;margin-top:8px;color:var(--danger);background:none;border:none;cursor:pointer;">Supprimer</button>':'')+'</div></div></div>'+
        '<div><label style="display:block;font-size:14px;margin-bottom:12px;color:var(--text-dim);">Couleur de fond du logo</label><div class="color-picker-wrapper"><input type="color" id="logoBgColor" value="'+(cfg.logoBg||'#4f7a3f')+'" onchange="App.updateLogoBg(this.value)"><span style="font-size:13px;color:var(--text-dim);">Utilisé quand aucun logo n\'est défini</span></div></div>'+
        '</div></div>'+
        '<div style="border-radius:12px;border:1px solid var(--border);padding:24px;background:var(--bg-card);"><h3 style="font-size:18px;font-weight:600;margin-bottom:20px;">Données</h3><div style="display:flex;flex-wrap:wrap;gap:12px;">'+
        '<button onclick="App.exportAllData()" style="padding:10px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:1px solid var(--border);cursor:pointer;">Exporter JSON</button>'+
        '<button onclick="App.importAllData()" style="padding:10px 16px;border-radius:8px;font-size:14px;background:var(--bg-input);color:var(--text);border:1px solid var(--border);cursor:pointer;">Importer JSON</button>'+
        '<button onclick="App.clearAllData()" style="padding:10px 16px;border-radius:8px;font-size:14px;background:rgba(239,68,68,.2);color:#ef4444;border:1px solid rgba(239,68,68,.3);cursor:pointer;">Réinitialiser</button>'+
        '</div></div></div>';
    },

    saveSettings: function() {
        var cfg = DB.getConfig();
        var nameEl = document.getElementById('settName');
        if(nameEl) { cfg.appName = nameEl.value.trim() || 'MILASSOC PRO'; }
        DB.setConfig(cfg);
        document.getElementById('loginAppTitle').textContent = cfg.appName;
        document.getElementById('appTitle').textContent = cfg.appName;
        document.getElementById('pageTitleMeta').textContent = cfg.appName;
        this.showToast('Paramètres sauvegardés');
    },

    handleLogoUpload: function(input) {
        var file = input.files[0]; if(!file) return;
        if(file.size > 2*1024*1024) { this.showToast('Trop volumineux'); return; }
        var self = this;
        var reader = new FileReader();
        reader.onload = function(e) { self.applyLogo(e.target.result); self.renderSettings(); self.showToast('Logo mis à jour'); };
        reader.readAsDataURL(file);
    },

    removeLogo: function() { this.applyLogo(null); this.renderSettings(); this.showToast('Logo supprimé'); },

    handleFaviconUpload: function(input) {
        var file = input.files[0]; if(!file) return;
        if(file.size > 2*1024*1024) { this.showToast('Trop volumineux'); return; }
        var self = this;
        var reader = new FileReader();
        reader.onload = function(e) { self.applyFavicon(e.target.result); self.renderSettings(); self.showToast('Favicon mis à jour'); };
        reader.readAsDataURL(file);
    },

    removeFavicon: function() {
        var cfg = DB.getConfig(); cfg.favicon = null; DB.setConfig(cfg);
        document.getElementById('favicon').href = '';
        this.renderSettings(); this.showToast('Favicon supprimé');
    },

    updateCustomColor: function(key, value) {
        var cfg = DB.getConfig();
        if(!cfg.customColors) cfg.customColors = {};
        cfg.customColors[key] = value;
        DB.setConfig(cfg);
    },

    applyTheme: function(key) {
        var t = this.THEMES[key];
        if(!t) return;
        var cfg = DB.getConfig();
        if(key==='custom' && cfg.customColors) {
            for(var k in cfg.customColors) { t[k] = cfg.customColors[k]; }
        }
        cfg.theme = key;
        DB.setConfig(cfg);
        this.applyThemeObject(t);
        this.renderSettings();
        this.showToast('Thème "'+t.name+'" appliqué');
    },

    updateLogoBg: function(color) {
        var cfg = DB.getConfig(); cfg.logoBg = color; DB.setConfig(cfg);
        if(!cfg.logo) {
            var ids = ['sidebarLogo','loginLogoContainer','headerLogo'];
            for(var i=0;i<ids.length;i++) {
                var el = document.getElementById(ids[i]);
                if(el) el.style.background = color;
            }
        }
        this.showToast('Couleur de fond mise à jour');
    },

    exportAllData: function() {
        var data = DB.exportAll();
        var blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}), url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = 'milassoc_'+new Date().toISOString().split('T')[0]+'.json'; a.click(); URL.revokeObjectURL(url);
        this.showToast('Données exportées');
    },

    importAllData: function() {
        var input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
        var self = this;
        input.onchange = function(e) {
            var file = e.target.files[0]; if(!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                try {
                    var data = JSON.parse(ev.target.result);
                    if(DB.importAll(data)) {
                        self.showToast('Données importées avec succès');
                        location.reload();
                    } else {
                        self.showToast('Erreur: fichier invalide');
                    }
                } catch(err) { self.showToast('Erreur de lecture du fichier'); }
            };
            reader.readAsText(file);
        };
        input.click();
    },

    clearAllData: function() {
        this.showConfirm('Réinitialiser toutes les données ?', 'Cette action est irréversible. Toutes les données seront perdues.', function(){
            DB.resetAll();
            location.reload();
        });
    },

    exportMembersToCSV: function() {
        this.exportTableToCSV(DB.getMembers(), 'membres.csv');
    },

    exportTableToCSV: function(data, filename) {
        if(!data || data.length===0) { this.showToast('Aucune donnée à exporter'); return; }
        var keys = Object.keys(data[0]);
        var csv = keys.join(';') + '\n';
        data.forEach(function(row) {
            csv += keys.map(function(key) {
                var val = row[key];
                if(val === null || val === undefined) val = '';
                return '"' + String(val).replace(/"/g, '""') + '"';
            }).join(';') + '\n';
        });
        var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Exporté: ' + filename);
    },

    importTableFromCSV: function(filename, callback) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        var self = this;
        input.onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                var text = ev.target.result;
                var lines = text.split('\n');
                if(lines.length < 2) { self.showToast('Fichier vide ou invalide'); return; }
                var headers = lines[0].split(';').map(function(h){ return h.trim().replace(/^"|"$/g, ''); });
                var data = [];
                for(var i=1; i<lines.length; i++) {
                    if(!lines[i].trim()) continue;
                    var values = lines[i].split(';').map(function(v){ return v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'); });
                    var obj = {};
                    headers.forEach(function(h, idx) {
                        obj[h] = values[idx] || '';
                    });
                    data.push(obj);
                }
                callback(data);
            };
            reader.readAsText(file);
        };
        input.click();
    },

    handleImportTx: function(data) {
        var currentTx = DB.getTx();
        var maxId = currentTx.length > 0 ? Math.max.apply(Math, currentTx.map(function(t){return t.id||0;})) : 0;
        data.forEach(function(item) {
            maxId++;
            var amt = parseFloat(item['Montant'] || item['amount'] || 0);
            var type = amt >= 0 ? 'income' : 'expense';
            var newTx = {
                id: maxId,
                desc: item['Description'] || item['desc'] || 'Import',
                category: item['Catégorie'] || item['category'] || 'Divers',
                date: item['Date'] || item['date'] || new Date().toISOString().split('T')[0],
                amt: Math.abs(amt),
                type: type
            };
            currentTx.push(newTx);
        });
        DB.setTx(currentTx);
        this.showToast('Import réussi : ' + data.length + ' transactions');
        this.renderFinance();
    },

    openQuickAction: function() {
        var cm=this.canEdit(), cf=this.canFinance();
        var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">';
        if(cm) h += '<button onclick="App.closeAllModals();App.openAddMember()" style="padding:16px;border-radius:8px;text-align:center;background:var(--bg-input);border:1px solid var(--border);cursor:pointer;color:var(--text);">➕ Membre</button>';
        if(cm) h += '<button onclick="App.closeAllModals();App.openAddEvent()" style="padding:16px;border-radius:8px;text-align:center;background:var(--bg-input);border:1px solid var(--border);cursor:pointer;color:var(--text);">📅 Événement</button>';
        if(cf) h += '<button onclick="App.closeAllModals();App.openAddTx()" style="padding:16px;border-radius:8px;text-align:center;background:var(--bg-input);border:1px solid var(--border);cursor:pointer;color:var(--text);">💰 Transaction</button>';
        h += '<button onclick="App.closeAllModals();App.openUploadDoc()" style="padding:16px;border-radius:8px;text-align:center;background:var(--bg-input);border:1px solid var(--border);cursor:pointer;color:var(--text);">📄 Document</button>';
        h += '</div>';
        this.showGenericModal('Action rapide', h);
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});