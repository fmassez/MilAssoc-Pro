/**
 * MilAssoc Pro - Application Principale
 * Version globale (sans modules ES6) - Compatible GitHub Pages
 * @version 5.2.0
 */

(function(global) {
    'use strict';
    
    // Référence aux objets globaux
    var DB = global.DB;
    var Utils = global.Utils;
    var Themes = global.Themes;
    
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
        
        // Thèmes (copie locale pour éviter les dépendances)
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
            console.log('[App] Initialisation...');
            
            // Vérification des dépendances
            if (!DB) {
                console.error('[App] ERREUR: DB non défini - database.js doit être chargé avant app.js');
                return;
            }
            
            this.setupEventListeners();
            this.checkAuth();
        },
        
        setupEventListeners: function() {
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) resetBtn.addEventListener('click', () => { 
                if(confirm('Réinitialiser toutes les données ?')){ 
                    DB.resetAll(); 
                    location.reload(); 
                }
            });
            
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
            } catch (e) { 
                console.error('[App] checkAuth:', e); 
            }
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appShell').style.display = 'none';
            return false;
        },
        
        handleLogin: function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value.trim();
            const pass = document.getElementById('loginPass')?.value;
            const errEl = document.getElementById('loginError');
            
            if (!email || !pass) { 
                if(errEl){errEl.style.display='block';errEl.textContent='Champs requis';} 
                return; 
            }
            
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
            
            // Application du thème
            const cfg = DB.getConfig();
            const theme = this.THEMES[cfg.theme] || this.THEMES.clair_bleu;
            this.applyTheme(theme);
            
            // Mise à jour UI
            this.updateUserInfo();
            this.buildSidebar();
            this.renderNotifs();
            this.responsive();
            this.navigateTo('dashboard');
        },
        
        applyTheme: function(theme) {
            const root = document.documentElement.style;
            Object.entries(theme).forEach(([k,v]) => { 
                if(!['name','light'].includes(k)) root.setProperty(`--${k}`, v); 
            });
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
            else { 
                const ini = name.split(' ').map(w=>w[0]).join('').slice(0,2); 
                avatar.textContent = ini; 
            }
        },
        
        buildSidebar: function() {
            const nav = document.getElementById('sidebarNav'); if(!nav) return;
            const items = [
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
            let h = '';
            for(const item of items){
                if(!this.hasRole(item.roles)) continue;
                const active = item.id===this.curPage;
                const badge = item.badge ? this.getBadgeValue(item.badge) : '';
                const bg = active ? 'background:rgba(37,99,235,.1);color:var(--accent);font-weight:600;' : 'background:transparent;color:var(--text-dim);';
                h += `<a href="#" onclick="App.navigateTo('${item.id}');return false;" data-nav="${item.id}" style="display:flex;align-items:center;gap:12px;padding:10px 16px;font-size:14px;border-radius:8px;transition:all .2s;cursor:pointer;text-decoration:none;${bg}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg><span>${item.label}</span>${badge ? `<span style="margin-left:auto;font-size:11px;padding:2px 8px;border-radius:9999px;background:var(--accent);color:var(--bg-dark);">${badge}</span>` : ''}</a>`;
            }
            nav.innerHTML = h;
        },
        
        hasRole: function(roles) { 
            return this.currentUser && roles.includes(this.currentUser.role); 
        },
        
        getBadgeValue: function(id) { 
            if(id==='navMemCount') return DB.getMembers().length; 
            if(id==='navMsgBadge'){ 
                let t=0;const cs=DB.getConvs();
                for(const c of cs) t+=c.unread; 
                return t>0?t:''; 
            } 
            return ''; 
        },
        
        navigateTo: function(page) {
            this.curPage = page;
            this.buildSidebar();
            const titles = {dashboard:'Tableau de Bord',members:'Membres',events:'Événements',finance:'Finances',documents:'Documents',messages:'Messages',units:'Unités',admin:'Administration',settings:'Paramètres',cards:'Cartes Membres',txReleve:'Relevé de Transactions'};
            document.getElementById('pageTitle').textContent = titles[page]||page;
            const area = document.getElementById('contentArea');
            const fn = {dashboard:this.renderDashboard,members:this.renderMembers,events:this.renderEvents,finance:this.renderFinance,documents:this.renderDocuments,messages:this.renderMessages,units:this.renderUnits,admin:this.renderAdmin,settings:this.renderSettings,cards:this.renderCards,txReleve:this.renderTxReleve};
            area.innerHTML = '';
            if(fn[page]) fn[page].call(this);
            area.classList.remove('fade-in'); void area.offsetWidth; area.classList.add('fade-in');
            this.closeSidebar();
        },
        
        showToast: function(msg) { 
            if (Utils && Utils.showToast) {
                Utils.showToast(msg);
            } else {
                // Fallback simple
                const t = document.getElementById('toast');
                const tm = document.getElementById('toastMsg');
                if(t && tm) {
                    tm.textContent = msg;
                    t.style.transform='translateY(0)'; t.style.opacity='1';
                    clearTimeout(window._toastT);
                    window._toastT = setTimeout(()=>{ t.style.transform='translateY(100px)'; t.style.opacity='0'; }, 3000);
                }
            }
        },
        
        // === Rendu Dashboard (version simplifiée) ===
        renderDashboard: function() {
            const members=DB.getMembers(),events=DB.getEvents(),docs=DB.getDocs(),tx=DB.getTx();
            let active=0,inc=0,exp=0;
            for(const m of members){if(m.status==='Actif')active++;}
            for(const t of tx){if(t.type==='income')inc+=t.amt;else exp+=t.amt;}
            const total=members.length,pct=total>0?Math.min(100,Math.round((active/total)*100)):0;
            
            const area=document.getElementById('contentArea');
            area.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
                <div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo('members')">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                        <div style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(37,99,235,.1);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        </div>
                        <span style="font-size:11px;padding:2px 8px;border-radius:4px;background:var(--accent);color:white;">${members.length} total</span>
                    </div>
                    <p style="font-size:24px;font-weight:700;">${total}</p>
                    <p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Membres (${active} actifs)</p>
                    <div style="margin-top:12px;width:100%;border-radius:9999px;height:6px;background:var(--bg-input);">
                        <div class="progress-fill" style="height:100%;width:${pct}%;background:var(--accent);border-radius:9999px;"></div>
                    </div>
                </div>
                <div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo('finance')">
                    <p style="font-size:24px;font-weight:700;color:var(--accent-light);">€ ${(inc-exp).toLocaleString('fr-FR')}</p>
                    <p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Solde net</p>
                </div>
                <div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo('events')">
                    <p style="font-size:24px;font-weight:700;">${events.length}</p>
                    <p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Événements</p>
                </div>
                <div style="border-radius:12px;padding:20px;border:1px solid var(--border);background:var(--bg-card);cursor:pointer;" onclick="App.navigateTo('documents')">
                    <p style="font-size:24px;font-weight:700;">${docs.length}</p>
                    <p style="font-size:14px;margin-top:4px;color:var(--text-dim);">Documents</p>
                </div>
            </div>`;
        },
        
        // === Autres méthodes de rendu (placeholders) ===
        renderMembers: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Membres - En développement</p>'; },
        renderEvents: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Événements - En développement</p>'; },
        renderFinance: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Finances - En développement</p>'; },
        renderDocuments: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Documents - En développement</p>'; },
        renderMessages: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Messages - En développement</p>'; },
        renderUnits: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Unités - En développement</p>'; },
        renderAdmin: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Administration - En développement</p>'; },
        renderSettings: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Paramètres - En développement</p>'; },
        renderCards: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Cartes - En développement</p>'; },
        renderTxReleve: function() { document.getElementById('contentArea').innerHTML='<p style="padding:24px;text-align:center;color:var(--text-dim);">Page Relevé - En développement</p>'; },
        
        // === Utilitaires ===
        responsive: function() {
            const sw=document.getElementById('searchWrap'),mb=document.getElementById('menuBtn'),ql=document.getElementById('qaLabel');
            if(window.innerWidth>=640){
                if(sw)sw.style.display='';if(mb)mb.style.display='none';if(ql)ql.style.display='';
            } else {
                if(sw)sw.style.display='none';if(mb)mb.style.display='';if(ql)ql.style.display='none';
            }
        },
        
        doGlobalSearch: function(val) {
            if(val.length<2)return;
            const v=val.toLowerCase();
            const mc=DB.getMembers().filter(m=>(m.first+' '+m.last+' '+m.grade).toLowerCase().indexOf(v)>-1).length;
            const ec=DB.getEvents().filter(e=>e.title.toLowerCase().indexOf(v)>-1).length;
            const dc=DB.getDocs().filter(d=>d.title.toLowerCase().indexOf(v)>-1).length;
            this.showToast(mc+' membres, '+ec+' événements, '+dc+' documents');
        },
        
        copyToClipboard: function(text) {
            if (Utils && Utils.copyToClipboard) {
                Utils.copyToClipboard(text);
            } else if(navigator.clipboard){
                navigator.clipboard.writeText(text).then(()=>this.showToast('Copié !'));
            }
        },
        
        getAssociationName: function() {
            const cfg = DB.getConfig();
            return cfg.cardOrgName || cfg.appName || 'MilAssoc Pro';
        },
        
        // === Modals ===
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
        closeAllModals: function() { 
            const c=document.getElementById('modalsContainer'); 
            if(c)c.innerHTML=''; 
        },
        showGenericModal: function(title,html) {
            const id='m'+(Date.now());
            let c = document.getElementById('modalsContainer');
            if(!c){c=document.createElement('div');c.id='modalsContainer';document.body.appendChild(c);}
            c.innerHTML+=`<div id="${id}" style="position:fixed;inset:0;z-index:100;">
                <div style="position:absolute;inset:0;background:rgba(0,0,0,.4);" onclick="App.closeModal('${id}')"></div>
                <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:12px;border:1px solid var(--border);width:100%;max-width:600px;margin:0 16px;padding:24px;max-height:90vh;overflow-y:auto;background:var(--bg-card);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
                        <h3 style="font-size:18px;font-weight:600;color:var(--text);">${title}</h3>
                        <button onclick="App.closeModal('${id}')" style="padding:4px;background:none;border:none;cursor:pointer;color:var(--text-dim);">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    </div>${html}
                </div>
            </div>`;
        },
        
        // === Sidebar ===
        toggleSidebar: function() {
            const sb=document.getElementById('sidebar'),ov=document.getElementById('sidebarOverlay');
            sb.classList.toggle('sidebar-open');
            ov.style.display=sb.classList.contains('sidebar-open')?'block':'none';
        },
        closeSidebar: function() {
            if(window.innerWidth<1024){
                document.getElementById('sidebar').classList.remove('sidebar-open');
                document.getElementById('sidebarOverlay').style.display='none';
            }
        },
        
        // === Notifications ===
        toggleNotifPanel: function() {
            const p=document.getElementById('notifPanel');
            p.style.display=p.style.display==='none'?'':'none';
        },
        clearNotifs: function() {
            const ns=DB.getNotifs(); for(let i=0;i<ns.length;i++)ns[i].read=true; DB.setNotifs(ns);
            document.getElementById('notifDot').style.display='none';
            this.renderNotifs(); this.showToast('Notifications lues');
        },
        renderNotifs: function() {
            const ns=DB.getNotifs();let unread=0;
            for(const n of ns){if(!n.read)unread++;}
            document.getElementById('notifDot').style.display=unread>0?'':'none';
            const el=document.getElementById('notifList');
            if(!ns.length){el.innerHTML='<div style="padding:24px;text-align:center;font-size:14px;color:var(--text-dim);">Aucune notification</div>';return;}
            let h='';
            for(const n of ns){
                h+=`<div style="padding:12px 16px;border-bottom:1px solid var(--border);${n.read?'':'border-left:3px solid var(--accent);'}">
                    <p style="font-size:14px;color:var(--text);">${n.text}</p>
                    <p style="font-size:12px;margin-top:4px;color:var(--text-dim);">${n.time}</p>
                </div>`;
            }
            el.innerHTML=h;
        },
        
        // === Permissions ===
        canEdit: function() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Secrétaire'); },
        canFinance: function() { return this.currentUser&&(this.currentUser.role==='Administrateur'||this.currentUser.role==='Trésorier'); },
        
        // === Logout ===
        handleLogout: function() {
            this.currentUser = null;
            sessionStorage.removeItem('milassoc_session');
            document.getElementById('appShell').style.display='none';
            document.getElementById('loginScreen').style.display='flex';
            document.getElementById('loginEmail').value='';
            document.getElementById('loginPass').value='';
            document.getElementById('loginError').style.display='none';
            const mc = document.getElementById('modalsContainer'); if(mc) mc.innerHTML='';
        }
    };
    
    // Exposition globale
    global.App = App;
    
    // Initialisation automatique
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }
    
})(typeof window !== 'undefined' ? window : this);