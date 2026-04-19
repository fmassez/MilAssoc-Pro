// js/database.js

const DB = {
    PREFIX: 'milassoc_',
    DEFAULTS: {
        users: [
            { id: 1, email: 'admin@milassoc.fr', pass: 'admin123', name: 'Cdt. Lefebvre', role: 'Administrateur', status: 'Actif', phone: '06 12 34 56 78', photo: null },
            // ... (Vos autres utilisateurs par défaut)
        ],
        members: [
            { id: 1, first: 'Sophie', last: 'Bernard', grade: 'Lieutenant', section: 'Bravo', status: 'Actif', cot: 'À jour', email: 's.bernard@mil.fr', mat: 'FR-2021-0042', phone: '06 23 45 67 89', photo: null, address: '' },
            // ... (Vos autres membres par défaut)
        ],
        // ... (Events, Docs, Tx, Units, Convs, Grades, etc.)
    },

    // Méthodes de lecture/écriture LocalStorage
    _get: function (key, def) {
        try {
            var v = localStorage.getItem(this.PREFIX + key);
            return v !== null ? JSON.parse(v) : def;
        } catch (e) { return def; }
    },
    _set: function (key, v) {
        try { localStorage.setItem(this.PREFIX + key, JSON.stringify(v)); } catch (e) { }
    },
    _def: function (key) { return this.DEFAULTS[key]; },

    // API Publique
    getUsers: function () { return this._get('users', this._def('users')); },
    setUsers: function (v) { this._set('users', v); },
    getMembers: function () { return this._get('members', this._def('members')); },
    setMembers: function (v) { this._set('members', v); },

    // ... (Copiez toutes les autres fonctions get/set ici) ...

    exportAll: function () {
        return {
            users: this.getUsers(), members: this.getMembers(), events: this.getEvents(),
            docs: this.getDocs(), tx: this.getTx(), units: this.getUnits(),
            convs: this.getConvs(), grades: this.getGrades(), sections: this.getSections(),
            evtTypes: this.getEventTypes(), docTypes: this.getDocTypes(),
            managers: this.getManagers(), notifs: this.getNotifs(), config: this.getConfig()
        };
    },
    importAll: function (data) {
        if (!data || typeof data !== 'object') return false;
        if (data.users) this.setUsers(data.users);
        if (data.members) this.setMembers(data.members);
        // ... (Copiez la logique d'importation ici) ...
        return true;
    },
    resetAll: function () {
        ['users', 'members', 'events', 'docs', 'tx', 'units', 'convs', 'grades', 'sections', 'evtTypes', 'docTypes', 'managers', 'notifs', 'config'].forEach(function (k) {
            localStorage.removeItem('milassoc_' + k);
        });
    }
};