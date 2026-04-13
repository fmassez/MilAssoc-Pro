// ==========================================
// BASE DE DONNÉES INDÉPENDANTE - MilAssoc Pro
// ==========================================

const DB = {
    // Clé de stockage
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
        members: [
            {id:1,first:'Sophie',last:'Bernard',grade:'Lieutenant',section:'Bravo',status:'Actif',cot:'À jour',email:'s.bernard@mil.fr',mat:'FR-2021-0042',phone:'06 23 45 67 89',photo:null},
            {id:2,first:'Claire',last:'Dubois',grade:'Lieutenant',section:'Bravo',status:'Actif',cot:'Non payée',email:'c.dubois@mil.fr',mat:'FR-2023-0071',phone:'',photo:null},
            {id:3,first:'Martin',last:'Durand',grade:'Sergent',section:'Alpha',status:'Actif',cot:'À jour',email:'m.durand@mil.fr',mat:'FR-2026-0248',phone:'06 34 56 78 90',photo:null},
            {id:4,first:'Luc',last:'Fabre',grade:'Caporal',section:'Charlie',status:'Actif',cot:'À jour',email:'l.fabre@mil.fr',mat:'FR-2023-0091',phone:'',photo:null},
            {id:5,first:'Henri',last:'Garcia',grade:'Général',section:'Alpha',status:'Actif',cot:'Exonéré',email:'h.garcia@mil.fr',mat:'FR-2010-0001',phone:'',photo:null},
            {id:6,first:'Philippe',last:'Girard',grade:'Colonel',section:'Delta',status:'Actif',cot:'À jour',email:'p.girard@mil.fr',mat:'FR-2015-0012',phone:'',photo:null},
            {id:7,first:'Antoine',last:'Laurent',grade:'Sergent',section:'Charlie',status:'Actif',cot:'À jour',email:'a.laurent@mil.fr',mat:'FR-2022-0056',phone:'',photo:null},
            {id:8,first:'Marie',last:'Leroy',grade:'Caporal',section:'Delta',status:'Actif',cot:'À jour',email:'m.leroy@mil.fr',mat:'FR-2022-0088',phone:'',photo:null},
            {id:9,first:'Pierre',last:'Moreau',grade:'Colonel',section:'Alpha',status:'Actif',cot:'À jour',email:'p.moreau@mil.fr',mat:'FR-2020-0001',phone:'06 12 34 56 78',photo:null},
            {id:10,first:'Thomas',last:'Michel',grade:'Soldat',section:'Delta',status:'Inactif',cot:'Non payée',email:'t.michel@mil.fr',mat:'FR-2024-0134',phone:'',photo:null},
            {id:11,first:'François',last:'Roux',grade:'Commandant',section:'Alpha',status:'Actif',cot:'À jour',email:'f.roux@mil.fr',mat:'FR-2018-0033',phone:'',photo:null},
            {id:12,first:'Isabelle',last:'Simon',grade:'Capitaine',section:'Alpha',status:'Actif',cot:'À jour',email:'i.simon@mil.fr',mat:'FR-2017-0022',phone:'',photo:null},
            {id:13,first:'Nathalie',last:'Thomas',grade:'Sergent',section:'Bravo',status:'Actif',cot:'À jour',email:'n.thomas@mil.fr',mat:'FR-2021-0067',phone:'',photo:null},
            {id:14,first:'Emma',last:'Rousseau',grade:'Lieutenant',section:'Alpha',status:'Actif',cot:'En retard',email:'e.rousseau@mil.fr',mat:'FR-2022-0045',phone:'',photo:null},
            {id:15,first:'Jean',last:'Petit',grade:'Capitaine',section:'Charlie',status:'Actif',cot:'En retard',email:'j.petit@mil.fr',mat:'FR-2019-0105',phone:'',photo:null}
        ],
        events: [
            {id:1,title:'Commémoration Armistice 11 Novembre',date:'2026-11-11',time:'09:00',loc:'Place de l\'Étoile, Paris',type:'Cérémonie',desc:'Cérémonie annuelle de commémoration de l\'Armistice de 1918.'},
            {id:2,title:'Assemblée Générale Trimestrielle',date:'2026-11-18',time:'14:00',loc:'Salle de conférence, Siège',type:'Réunion',desc:'Bilan trimestriel et vote des résolutions.'},
            {id:3,title:'Stage Secourisme Militaire',date:'2026-11-25',time:'08:30',loc:'Base de Camp, Fontainebleau',type:'Formation',desc:'Formation aux premiers secours en environnement militaire.'},
            {id:4,title:'Fête de l\'Armée de Terre',date:'2026-06-24',time:'10:00',loc:'Esplanade des Invalides',type:'Cérémonie',desc:'Célébration officielle de la Saint-Louis.'},
            {id:5,title:'Repas cohésion Section Alpha',date:'2026-05-15',time:'19:30',loc:'Restaurant Le Bastion',type:'Social',desc:'Dîner de cohésion annuel.'},
            {id:6,title:'Réunion Bureau Exécutif',date:'2026-04-22',time:'10:00',loc:'Salle du Conseil, Siège',type:'Réunion',desc:'Budget T3, planning été.'},
            {id:7,title:'Commémoration 8 Mai 1945',date:'2026-05-08',time:'09:30',loc:'Arc de Triomphe, Paris',type:'Cérémonie',desc:'Commémoration de la Victoire 1945.'},
            {id:8,title:'Formation Gestion de Conflit',date:'2026-06-10',time:'09:00',loc:'CNFPT, Paris',type:'Formation',desc:'Formation continue chefs de section.'},
            {id:9,title:'Journée Portes Ouvertes',date:'2026-05-30',time:'10:00',loc:'Siège de l\'association',type:'Social',desc:'Présentation au grand public.'}
        ],
        docs: [
            {id:1,title:'PV Assemblée Générale 2025',type:'PV',date:'2026-01-15',size:'2.4 MB',author:'Cdt. Lefebvre',file:null},
            {id:2,title:'Rapport Financier Annuel 2025',type:'Rapport',date:'2026-02-01',size:'5.1 MB',author:'Lt. Bernard',file:null},
            {id:3,title:'Circulaire N°2026-03',type:'Circulaire',date:'2026-03-10',size:'840 KB',author:'Col. Moreau',file:null},
            {id:4,title:'Statuts Association v3.2',type:'Statut',date:'2026-01-01',size:'1.2 MB',author:'Secrétariat',file:null},
            {id:5,title:'Règlement Intérieur',type:'Statut',date:'2025-06-15',size:'680 KB',author:'Secrétariat',file:null},
            {id:6,title:'Rapport activité T1 2026',type:'Rapport',date:'2026-04-05',size:'3.3 MB',author:'Cne. Petit',file:null},
            {id:7,title:'Planning Cérémonies 2026',type:'Circulaire',date:'2026-01-20',size:'450 KB',author:'Sgt. Durand',file:null},
            {id:8,title:'PV Réunion Mars 2026',type:'PV',date:'2026-03-28',size:'1.1 MB',author:'Cdt. Lefebvre',file:null}
        ],
        tx: [
            {id:1,desc:'Cotisation — Sgt. Durand',amt:45,type:'income',date:'2026-04-08',category:'Cotisation'},
            {id:2,desc:'Location salle',amt:850,type:'expense',date:'2026-04-07',category:'Location'},
            {id:3,desc:'Subvention Ministère',amt:25000,type:'income',date:'2026-04-01',category:'Subvention'},
            {id:4,desc:'Matériel formation',amt:1200,type:'expense',date:'2026-03-28',category:'Matériel'},
            {id:5,desc:'Don anonyme',amt:500,type:'income',date:'2026-03-25',category:'Don'},
            {id:6,desc:'Test transaction',amt:120,type:'income',date:'2026-04-13',category:'Autre'}
        ],
        units: [
            {id:1,name:'Section Alpha',chief:'Col. Pierre Moreau',members:82,desc:'Officiers et sous-officiers seniors'},
            {id:2,name:'Section Bravo',chief:'Cne. Sophie Bernard',members:67,desc:'Sous-officiers et caporaux'},
            {id:3,name:'Section Charlie',chief:'Lt. Jean Petit',members:58,desc:'Jeunes militaires et réservistes'},
            {id:4,name:'Section Delta',chief:'Sgt. Marie Leroy',members:40,desc:'Entraide et action humanitaire'}
        ],
        convs: [
            {name:'Sgt. Martin Durand',init:'MD',online:true,unread:2,msgs:[{from:'me',text:'Bonjour Sergent, planning reçu ?',time:'14:00'},{from:'them',text:'Oui Cdt, section Alpha au complet.',time:'14:15'},{from:'them',text:'Arrivée à 08h30.',time:'14:16'},{from:'me',text:'Parfait, confirmez les tenues.',time:'14:30'}]},
            {name:'Lt. Sophie Bernard',init:'SB',online:true,unread:1,msgs:[{from:'them',text:'Rapport financier prêt.',time:'11:15'}]},
            {name:'Cne. Jean Petit',init:'JP',online:false,unread:0,msgs:[{from:'me',text:'Planning mai validé ?',time:'Hier'},{from:'them',text:'OK, même calendrier.',time:'Hier'}]},
            {name:'Cpl. Marie Leroy',init:'ML',online:false,unread:2,msgs:[{from:'them',text:'Besoin autorisation stage.',time:'Lun'},{from:'them',text:'Pouvez-vous signer ?',time:'Lun'}]}
        ],
        grades: ['Général','Colonel','Commandant','Capitaine','Lieutenant','Sous-Lieutenant','Adjudant','Sergent-Chef','Sergent','Caporal-Chef','Caporal','Soldat'],
        sections: ['Alpha','Bravo','Charlie','Delta'],
        evtTypes: ['Cérémonie','Réunion','Formation','Social'],
        docTypes: ['PV','Rapport','Circulaire','Statut'],
        managers: [
            {id:1,first:'Charles',last:'Lefebvre',email:'c.lefebvre@milassoc.fr',role:'Administrateur',status:'Actif',phone:'06 12 34 56 78',photo:null},
            {id:2,first:'Sophie',last:'Bernard',email:'s.bernard@milassoc.fr',role:'Trésorier',status:'Actif',phone:'06 23 45 67 89',photo:null},
            {id:3,first:'Pierre',last:'Moreau',email:'p.moreau@milassoc.fr',role:'Secrétaire',status:'Actif',phone:'',photo:null},
            {id:4,first:'Frederic',last:'Massez',email:'frederic.massez@gmail.com',role:'Administrateur',status:'Actif',phone:'06 45 67 89 01',photo:null}
        ],
        notifs: [
            {id:1,text:'Nouvelle inscription : <strong>Sgt. M. Durand</strong>',time:'Il y a 15 min',read:false},
            {id:2,text:'<strong>31 cotisations</strong> en retard',time:'Il y a 1 heure',read:false},
            {id:3,text:'AG dans <strong>7 jours</strong>',time:'Il y a 3 heures',read:false}
        ],
        config: {theme:'kaki',logo:null,logoBg:'#4f7a3f',appName:'MILASSOC PRO',bgColor:'#0f1a0f'}
    },

    // Fonctions de base
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

    // Getters
    getUsers: function() { return this._get('users', this._def('users')); },
    getMembers: function() { return this._get('members', this._def('members')); },
    getEvents: function() { return this._get('events', this._def('events')); },
    getDocs: function() { return this._get('docs', this._def('docs')); },
    getTx: function() { return this._get('tx', this._def('tx')); },
    getUnits: function() { return this._get('units', this._def('units')); },
    getConvs: function() { return this._get('convs', this._def('convs')); },
    getGrades: function() { return this._get('grades', this._def('grades')); },
    getSections: function() { return this._get('sections', this._def('sections')); },
    getEventTypes: function() { return this._get('evtTypes', this._def('evtTypes')); },
    getDocTypes: function() { return this._get('docTypes', this._def('docTypes')); },
    getManagers: function() { return this._get('managers', this._def('managers')); },
    getNotifs: function() { return this._get('notifs', this._def('notifs')); },
    getConfig: function() { return this._get('config', this._def('config')); },

    // Setters
    setUsers: function(v) { this._set('users', v); },
    setMembers: function(v) { this._set('members', v); },
    setEvents: function(v) { this._set('events', v); },
    setDocs: function(v) { this._set('docs', v); },
    setTx: function(v) { this._set('tx', v); },
    setUnits: function(v) { this._set('units', v); },
    setConvs: function(v) { this._set('convs', v); },
    setGrades: function(v) { this._set('grades', v); },
    setSections: function(v) { this._set('sections', v); },
    setEventTypes: function(v) { this._set('evtTypes', v); },
    setDocTypes: function(v) { this._set('docTypes', v); },
    setManagers: function(v) { this._set('managers', v); },
    setNotifs: function(v) { this._set('notifs', v); },
    setConfig: function(v) { this._set('config', v); },

    // Import/Export complet
    exportAll: function() {
        return {
            users: this.getUsers(),
            members: this.getMembers(),
            events: this.getEvents(),
            docs: this.getDocs(),
            tx: this.getTx(),
            units: this.getUnits(),
            convs: this.getConvs(),
            grades: this.getGrades(),
            sections: this.getSections(),
            evtTypes: this.getEventTypes(),
            docTypes: this.getDocTypes(),
            managers: this.getManagers(),
            notifs: this.getNotifs(),
            config: this.getConfig()
        };
    },
    importAll: function(data) {
        if (!data || typeof data !== 'object') return false;
        if (data.users) this.setUsers(data.users);
        if (data.members) this.setMembers(data.members);
        if (data.events) this.setEvents(data.events);
        if (data.docs) this.setDocs(data.docs);
        if (data.tx) this.setTx(data.tx);
        if (data.units) this.setUnits(data.units);
        if (data.convs) this.setConvs(data.convs);
        if (data.grades) this.setGrades(data.grades);
        if (data.sections) this.setSections(data.sections);
        if (data.evtTypes) this.setEventTypes(data.evtTypes);
        if (data.docTypes) this.setDocTypes(data.docTypes);
        if (data.managers) this.setManagers(data.managers);
        if (data.notifs) this.setNotifs(data.notifs);
        if (data.config) this.setConfig(data.config);
        return true;
    },
    resetAll: function() {
        var keys = ['users','members','events','docs','tx','units','convs','grades','sections','evtTypes','docTypes','managers','notifs','config'];
        for (var i = 0; i < keys.length; i++) {
            localStorage.removeItem(this.PREFIX + keys[i]);
        }
    }
};

// Export pour utilisation globale
window.MilAssocDB = DB;