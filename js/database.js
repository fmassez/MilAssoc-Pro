/**
 * Gestion de la persistance des données via localStorage
 * MilAssoc Pro - Module Database
 * @version 5.2.0
 */

(function(global) {
    'use strict';

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
            members: [
                {id:1,first:'Sophie',last:'Bernard',grade:'Lieutenant',section:'Bravo',status:'Actif',cot:'À jour',email:'s.bernard@mil.fr',mat:'FR-2021-0042',phone:'06 23 45 67 89',photo:null,address:''},
                {id:2,first:'Claire',last:'Dubois',grade:'Lieutenant',section:'Bravo',status:'Actif',cot:'Non payée',email:'c.dubois@mil.fr',mat:'FR-2023-0071',phone:'',photo:null,address:''},
                {id:3,first:'Martin',last:'Durand',grade:'Sergent',section:'Alpha',status:'Actif',cot:'À jour',email:'m.durand@mil.fr',mat:'FR-2026-0248',phone:'06 34 56 78 90',photo:null,address:'31 Rue de Tourcoing, 02100 St Quentin'},
                {id:4,first:'Luc',last:'Fabre',grade:'Caporal',section:'Charlie',status:'Actif',cot:'À jour',email:'l.fabre@mil.fr',mat:'FR-2023-0091',phone:'',photo:null,address:''},
                {id:5,first:'Henri',last:'Garcia',grade:'Général',section:'Alpha',status:'Actif',cot:'Exonéré',email:'h.garcia@mil.fr',mat:'FR-2010-0001',phone:'',photo:null,address:''},
                {id:6,first:'Philippe',last:'Girard',grade:'Colonel',section:'Delta',status:'Actif',cot:'À jour',email:'p.girard@mil.fr',mat:'FR-2015-0012',phone:'',photo:null,address:''},
                {id:7,first:'Antoine',last:'Laurent',grade:'Sergent',section:'Charlie',status:'Actif',cot:'À jour',email:'a.laurent@mil.fr',mat:'FR-2022-0056',phone:'',photo:null,address:''},
                {id:8,first:'Marie',last:'Leroy',grade:'Caporal',section:'Delta',status:'Actif',cot:'À jour',email:'m.leroy@mil.fr',mat:'FR-2022-0088',phone:'',photo:null,address:''},
                {id:9,first:'Pierre',last:'Moreau',grade:'Colonel',section:'Alpha',status:'Actif',cot:'À jour',email:'p.moreau@mil.fr',mat:'FR-2020-0001',phone:'06 12 34 56 78',photo:null,address:''},
                {id:10,first:'Thomas',last:'Michel',grade:'Soldat',section:'Delta',status:'Inactif',cot:'Non payée',email:'t.michel@mil.fr',mat:'FR-2024-0134',phone:'',photo:null,address:''},
                {id:11,first:'François',last:'Roux',grade:'Commandant',section:'Alpha',status:'Actif',cot:'À jour',email:'f.roux@mil.fr',mat:'FR-2018-0033',phone:'',photo:null,address:''},
                {id:12,first:'Isabelle',last:'Simon',grade:'Capitaine',section:'Alpha',status:'Actif',cot:'À jour',email:'i.simon@mil.fr',mat:'FR-2017-0022',phone:'',photo:null,address:''},
                {id:13,first:'Nathalie',last:'Thomas',grade:'Sergent',section:'Bravo',status:'Actif',cot:'À jour',email:'n.thomas@mil.fr',mat:'FR-2021-0067',phone:'',photo:null,address:''},
                {id:14,first:'Emma',last:'Rousseau',grade:'Lieutenant',section:'Alpha',status:'Actif',cot:'En retard',email:'e.rousseau@mil.fr',mat:'FR-2022-0045',phone:'',photo:null,address:''},
                {id:15,first:'Jean',last:'Petit',grade:'Capitaine',section:'Charlie',status:'Actif',cot:'En retard',email:'j.petit@mil.fr',mat:'FR-2019-0105',phone:'',photo:null,address:''},
                {id:16,first:'Frederic',last:'Massez',grade:'Soldat',section:'Delta',status:'Actif',cot:'À jour',email:'frederic.massez@gmail.com',mat:'FR-2026-5534',phone:'06 45 67 89 01',photo:null,address:'14 rue le serrurier - Appartement 103'}
            ],
            events: [
                {id:1,title:'Commémoration Armistice 11 Novembre',date:'2026-11-11',time:'09:00',loc:"Place de l'Étoile, Paris",type:'Cérémonie',desc:'Cérémonie annuelle.'},
                {id:2,title:'Assemblée Générale Trimestrielle',date:'2026-11-18',time:'14:00',loc:'Salle de conférence',type:'Réunion',desc:'Bilan trimestriel.'},
                {id:3,title:'Stage Secourisme Militaire',date:'2026-11-25',time:'08:30',loc:'Base de Camp, Fontainebleau',type:'Formation',desc:'Formation premiers secours.'},
                {id:4,title:"Fête de l'Armée de Terre",date:'2026-06-24',time:'10:00',loc:'Esplanade des Invalides',type:'Cérémonie',desc:'Saint-Louis.'},
                {id:5,title:'Repas cohésion Section Alpha',date:'2026-05-15',time:'19:30',loc:'Restaurant Le Bastion',type:'Social',desc:'Dîner annuel.'},
                {id:6,title:'Réunion Bureau Exécutif',date:'2026-04-22',time:'10:00',loc:'Salle du Conseil',type:'Réunion',desc:'Budget T3.'},
                {id:7,title:'Commémoration 8 Mai 1945',date:'2026-05-08',time:'09:30',loc:'Arc de Triomphe',type:'Cérémonie',desc:'Victoire 1945.'},
                {id:8,title:'Formation Gestion de Conflit',date:'2026-06-10',time:'09:00',loc:'CNFPT, Paris',type:'Formation',desc:'Formation continue.'},
                {id:9,title:'Journée Portes Ouvertes',date:'2026-05-30',time:'10:00',loc:'Siège association',type:'Social',desc:'Présentation publique.'}
            ],
            docs: [
                {id:1,title:'PV AG 2025',type:'PV',date:'2026-01-15',size:'2.4 MB',author:'Cdt. Lefebvre',file:null},
                {id:2,title:'Rapport Financier 2025',type:'Rapport',date:'2026-02-01',size:'5.1 MB',author:'Lt. Bernard',file:null},
                {id:3,title:'Circulaire N°2026-03',type:'Circulaire',date:'2026-03-10',size:'840 KB',author:'Col. Moreau',file:null},
                {id:4,title:'Statuts Association v3.2',type:'Statut',date:'2026-01-01',size:'1.2 MB',author:'Secrétariat',file:null},
                {id:5,title:'Règlement Intérieur',type:'Statut',date:'2025-06-15',size:'680 KB',author:'Secrétariat',file:null}
            ],
            tx: [
                {id:1,desc:'Cotisation — Sgt. Durand',amt:45,type:'income',date:'2026-04-08',category:'Cotisation'},
                {id:2,desc:'Location salle',amt:850,type:'expense',date:'2026-04-07',category:'Location'},
                {id:3,desc:'Subvention Ministère',amt:25000,type:'income',date:'2026-04-01',category:'Subvention'},
                {id:4,desc:'Matériel formation',amt:1200,type:'expense',date:'2026-03-28',category:'Matériel'},
                {id:5,desc:'Don anonyme',amt:500,type:'income',date:'2026-03-25',category:'Don'}
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
                {id:1,first:'Charles',last:'Lefebvre',email:'c.lefebvre@milassoc.fr',role:'Administrateur',status:'Actif',phone:'06 12 34 56 78',photo:null,sigNat:null,sigDep:null,sigSec:null},
                {id:2,first:'Sophie',last:'Bernard',email:'s.bernard@milassoc.fr',role:'Trésorier',status:'Actif',phone:'06 23 45 67 89',photo:null,sigNat:null,sigDep:null,sigSec:null},
                {id:3,first:'Pierre',last:'Moreau',email:'p.moreau@milassoc.fr',role:'Secrétaire',status:'Actif',phone:'',photo:null,sigNat:null,sigDep:null,sigSec:null},
                {id:4,first:'Frederic',last:'Massez',email:'frederic.massez@gmail.com',role:'Administrateur',status:'Actif',phone:'06 45 67 89 01',photo:null,sigNat:null,sigDep:null,sigSec:null}
            ],
            notifs: [
                {id:1,text:'Nouvelle inscription : <strong>Sgt. M. Durand</strong>',time:'Il y a 15 min',read:false},
                {id:2,text:'<strong>31 cotisations</strong> en retard',time:'Il y a 1 heure',read:false},
                {id:3,text:'AG dans <strong>7 jours</strong>',time:'Il y a 3 heures',read:false}
            ],
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

        // === Méthodes privées ===
        _get: function(key, def) {
            try {
                var v = localStorage.getItem(this.PREFIX + key);
                return v !== null ? JSON.parse(v) : def;
            } catch(e) {
                console.warn('[DB] Erreur lecture ' + key + ':', e);
                return def;
            }
        },

        _set: function(key, v) {
            try {
                localStorage.setItem(this.PREFIX + key, JSON.stringify(v));
                return true;
            } catch(e) {
                console.error('[DB] Erreur écriture ' + key + ':', e);
                return false;
            }
        },

        _def: function(key) {
            return this.DEFAULTS[key];
        },

        // === CRUD Génériques ===

        /**
         * Récupère tous les éléments d'une collection
         * @param {string} collection - Nom de la collection
         * @returns {Array} Liste des éléments
         */
        getAll: function(collection) {
            return this._get(collection, this._def(collection) || []);
        },

        /**
         * Récupère un élément par son ID
         * @param {string} collection - Nom de la collection
         * @param {number} id - ID de l'élément
         * @returns {Object|null} L'élément ou null
         */
        getById: function(collection, id) {
            var items = this.getAll(collection);
            return items.find(function(item) { return item.id === id; }) || null;
        },

        /**
         * Ajoute un nouvel élément
         * @param {string} collection - Nom de la collection
         * @param {Object} item - Élément à ajouter
         * @returns {Object} L'élément ajouté avec son ID
         */
        add: function(collection, item) {
            var items = this.getAll(collection);
            var maxId = 0;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id > maxId) maxId = items[i].id;
            }
            item.id = item.id || (maxId + 1);
            item.createdAt = item.createdAt || new Date().toISOString();
            items.unshift(item);
            this._set(collection, items);
            return item;
        },

        /**
         * Met à jour un élément existant
         * @param {string} collection - Nom de la collection
         * @param {number} id - ID de l'élément
         * @param {Object} updates - Champs à mettre à jour
         * @returns {boolean} Succès de l'opération
         */
        update: function(collection, id, updates) {
            var items = this.getAll(collection);
            var index = -1;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) {
                    index = i;
                    break;
                }
            }
            if (index === -1) return false;
            items[index] = Object.assign({}, items[index], updates, {
                updatedAt: new Date().toISOString()
            });
            this._set(collection, items);
            return true;
        },

        /**
         * Supprime un élément
         * @param {string} collection - Nom de la collection
         * @param {number} id - ID de l'élément
         * @returns {boolean} Succès de l'opération
         */
        remove: function(collection, id) {
            var items = this.getAll(collection);
            var filtered = items.filter(function(item) { return item.id !== id; });
            if (filtered.length === items.length) return false;
            this._set(collection, filtered);
            return true;
        },

        // === Méthodes spécifiques par collection ===

        getUsers: function() { return this.getAll('users'); },
        setUsers: function(v) { this._set('users', v); },

        getMembers: function() { return this.getAll('members'); },
        setMembers: function(v) { this._set('members', v); },

        getEvents: function() { return this.getAll('events'); },
        setEvents: function(v) { this._set('events', v); },

        getDocs: function() { return this.getAll('docs'); },
        setDocs: function(v) { this._set('docs', v); },

        getTx: function() { return this.getAll('tx'); },
        setTx: function(v) { this._set('tx', v); },

        getUnits: function() { return this.getAll('units'); },
        setUnits: function(v) { this._set('units', v); },

        getConvs: function() { return this.getAll('convs'); },
        setConvs: function(v) { this._set('convs', v); },

        getGrades: function() { return this.getAll('grades'); },
        setGrades: function(v) { this._set('grades', v); },

        getSections: function() { return this.getAll('sections'); },
        setSections: function(v) { this._set('sections', v); },

        getEventTypes: function() { return this.getAll('evtTypes'); },
        setEventTypes: function(v) { this._set('evtTypes', v); },

        getDocTypes: function() { return this.getAll('docTypes'); },
        setDocTypes: function(v) { this._set('docTypes', v); },

        getManagers: function() { return this.getAll('managers'); },
        setManagers: function(v) { this._set('managers', v); },

        getNotifs: function() { return this.getAll('notifs'); },
        setNotifs: function(v) { this._set('notifs', v); },

        getConfig: function() { return this._get('config', this._def('config')); },
        setConfig: function(v) { this._set('config', v); },

        // === Export/Import ===

        /**
         * Exporte toutes les données en un objet JSON
         * @returns {Object} Toutes les données de l'application
         */
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

        /**
         * Importe des données depuis un objet JSON
         * @param {Object} data - Données à importer
         * @returns {boolean} Succès de l'import
         */
        importAll: function(data) {
            if (!data || typeof data !== 'object') return false;
            
            var collections = ['users','members','events','docs','tx','units','convs','grades','sections','evtTypes','docTypes','managers','notifs'];
            for (var i = 0; i < collections.length; i++) {
                var key = collections[i];
                if (data[key] !== undefined) {
                    this._set(key, data[key]);
                }
            }
            if (data.config) {
                this.setConfig(data.config);
            }
            return true;
        },

        /**
         * Réinitialise toute la base de données aux valeurs par défaut
         */
        resetAll: function() {
            var collections = ['users','members','events','docs','tx','units','convs','grades','sections','evtTypes','docTypes','managers','notifs','config'];
            for (var i = 0; i < collections.length; i++) {
                localStorage.removeItem(this.PREFIX + collections[i]);
            }
            console.log('[DB] Base de données réinitialisée');
        },

        /**
         * Efface le localStorage de l'application
         */
        clearStorage: function() {
            var keys = Object.keys(localStorage);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf(this.PREFIX) === 0) {
                    localStorage.removeItem(keys[i]);
                }
            }
        }
    };

    // Exposition globale
    global.DB = DB;

})(typeof window !== 'undefined' ? window : this);