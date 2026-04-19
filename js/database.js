// js/database.js
// Gestion des données via localStorage

const DB = {
    PREFIX: 'milassoc_',
    
    // Données par défaut
    DEFAULTS: {
        users: [
            {id:1,email:'admin@milassoc.fr',pass:'admin123',name:'Cdt. Lefebvre',role:'Administrateur',status:'Actif',phone:'06 12 34 56 78',photo:null},
            {id:2,email:'tresorier@milassoc.fr',pass:'treso123',name:'Lt. Bernard',role:'Trésorier',status:'Actif',phone:'06 23 45 67 89',photo:null},
            {id:3,email:'secretaire@milassoc.fr',pass:'secre123',name:'Cne. Petit',role:'Secrétaire',status:'Actif',phone:'06 34 56 78 90',photo:null},
            {id:4,email:'lecteur@milassoc.fr',pass:'lecteur123',name:'Sgt. Durand',role:'Lecteur seul',status:'Actif',phone:'',photo:null},
            {id:5,email:'frederic.massez@gmail.com',pass:'massez123',name:'Frederic Massez',role:'Administrateur',status:'Actif',phone:'06 45 67 89 01',photo:null}
        ],
        members: [],
        events: [],
        docs: [],
        tx: [],
        units: [],
        convs: [],
        grades: ['Général','Colonel','Commandant','Capitaine','Lieutenant','Sous-Lieutenant','Adjudant','Sergent-Chef','Sergent','Caporal-Chef','Caporal','Soldat'],
        sections: ['Alpha','Bravo','Charlie','Delta'],
        evtTypes: ['Cérémonie','Réunion','Formation','Social'],
        docTypes: ['PV','Rapport','Circulaire','Statut'],
        managers: [],
        notifs: [],
        config: {
            theme:'clair_bleu',logo:null,logoBg:'#4f7a3f',favicon:null,appName:'MILASSOC PRO',bgColor:'#f0f5f8',customColors:{},
            cardOrgName:'Union Nationale des Combattants',
            cardOrgAddr:'18, rue Vezelay - 75008 PARIS',
            cardOrgPhone:'01 53 89 04 04',
            cardOrgDecret:"Reconnue d'utilité publique par décret du 20 Mai 1920.",
            cardLogo:null,
            cardPresNat:'',
            cardPresDep:'',
            cardPresSec:'',
            cardSigNat:null,
            cardSigDep:null,
            cardSigSec:null,
            cardFormat:'a6'
        }
    },

    // Méthodes privées
    _get: function(key, def) { 
        try { 
            var v = localStorage.getItem(this.PREFIX + key); 
            return v !== null ? JSON.parse(v) : def; 
        } catch(e) { return def; } 
    },
    
    _set: function(key, v) { 
        try { localStorage.setItem(this.PREFIX + key, JSON.stringify(v)); } catch(e) {} 
    },
    
    _def: function(key) { return this.DEFAULTS[key]; },

    // === MÉTHODES PUBLIQUES OBLIGATOIRES ===
    
    // Utilisateurs
    getUsers: function() { return this._get('users', this._def('users')); },
    setUsers: function(v) { this._set('users', v); },
    getUserByEmail: function(email) {
        var users = this.getUsers();
        return users.find(function(u) { return u.email === email; });
    },
    resetPassword: function(email, newPassword) {
        var users = this.getUsers();
        var user = users.find(function(u) { return u.email === email; });
        if(user) {
            user.pass = newPassword;
            this.setUsers(users);
            return true;
        }
        return false;
    },

    // Membres
    getMembers: function() { return this._get('members', this._def('members')); },
    setMembers: function(v) { this._set('members', v); },

    // Événements
    getEvents: function() { return this._get('events', this._def('events')); },
    setEvents: function(v) { this._set('events', v); },

    // Documents
    getDocs: function() { return this._get('docs', this._def('docs')); },
    setDocs: function(v) { this._set('docs', v); },

    // Transactions
    getTx: function() { return this._get('tx', this._def('tx')); },
    setTx: function(v) { this._set('tx', v); },

    // Unités
    getUnits: function() { return this._get('units', this._def('units')); },
    setUnits: function(v) { this._set('units', v); },

    // Conversations
    getConvs: function() { return this._get('convs', this._def('convs')); },
    setConvs: function(v) { this._set('convs', v); },

    // Grades
    getGrades: function() { return this._get('grades', this._def('grades')); },
    setGrades: function(v) { this._set('grades', v); },

    // Sections
    getSections: function() { return this._get('sections', this._def('sections')); },
    setSections: function(v) { this._set('sections', v); },

    // Types d'événements
    getEventTypes: function() { return this._get('evtTypes', this._def('evtTypes')); },
    setEventTypes: function(v) { this._set('evtTypes', v); },

    // Types de documents
    getDocTypes: function() { return this._get('docTypes', this._def('docTypes')); },
    setDocTypes: function(v) { this._set('docTypes', v); },

    // Gestionnaires
    getManagers: function() { return this._get('managers', this._def('managers')); },
    setManagers: function(v) { this._set('managers', v); },

    // Notifications
    getNotifs: function() { return this._get('notifs', this._def('notifs')); },
    setNotifs: function(v) { this._set('notifs', v); },

    // Configuration - MÉTHODE CRITIQUE
    getConfig: function() { return this._get('config', this._def('config')); },
    setConfig: function(v) { this._set('config', v); },

    // Export/Import
    exportAll: function() { 
        return {
            users:this.getUsers(),
            members:this.getMembers(),
            events:this.getEvents(),
            docs:this.getDocs(),
            tx:this.getTx(),
            units:this.getUnits(),
            convs:this.getConvs(),
            grades:this.getGrades(),
            sections:this.getSections(),
            evtTypes:this.getEventTypes(),
            docTypes:this.getDocTypes(),
            managers:this.getManagers(),
            notifs:this.getNotifs(),
            config:this.getConfig()
        }; 
    },
    
    importAll: function(data) {
        if (!data || typeof data !== 'object') return false;
        if(data.users) this.setUsers(data.users);
        if(data.members) this.setMembers(data.members);
        if(data.events) this.setEvents(data.events);
        if(data.docs) this.setDocs(data.docs);
        if(data.tx) this.setTx(data.tx);
        if(data.units) this.setUnits(data.units);
        if(data.convs) this.setConvs(data.convs);
        if(data.grades) this.setGrades(data.grades);
        if(data.sections) this.setSections(data.sections);
        if(data.evtTypes) this.setEventTypes(data.evtTypes);
        if(data.docTypes) this.setDocTypes(data.docTypes);
        if(data.managers) this.setManagers(data.managers);
        if(data.notifs) this.setNotifs(data.notifs);
        if(data.config) this.setConfig(data.config);
        return true;
    },

    // Réinitialisation
    resetAll: function() {
        ['users','members','events','docs','tx','units','convs','grades','sections','evtTypes','docTypes','managers','notifs','config'].forEach(function(k){ 
            localStorage.removeItem('milassoc_'+k); 
        });
    }
};
