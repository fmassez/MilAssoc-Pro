import { CONFIG } from './config.js';

class Database {
    constructor(prefix = CONFIG.APP.storagePrefix) {
        this.prefix = prefix;
        this.defaults = {
            users: CONFIG.DEFAULT_USERS,
            members: [], events: [], docs: [], tx: [], units: [], convs: [],
            grades: ['Général','Colonel','Commandant','Capitaine','Lieutenant','Sous-Lieutenant','Adjudant','Sergent-Chef','Sergent','Caporal-Chef','Caporal','Soldat'],
            sections: ['Alpha','Bravo','Charlie','Delta'],
            evtTypes: ['Cérémonie','Réunion','Formation','Social'],
            docTypes: ['PV','Rapport','Circulaire','Statut'],
            notifs: [],
            config: { theme:'clair_bleu', logo:null, logoBg:'#4f7a3f', appName:'MILASSOC PRO' }
        };
    }

    _get(key, def = null) {
        try {
            const v = localStorage.getItem(this.prefix + key);
            return v !== null ? JSON.parse(v) : def;
        } catch(e) { console.warn('[DB] Erreur lecture '+key, e); return def; }
    }

    _set(key, v) {
        try { localStorage.setItem(this.prefix + key, JSON.stringify(v)); return true; }
        catch(e) { console.error('[DB] Erreur écriture '+key, e); return false; }
    }

    getAll(collection) { return this._get(collection, this.defaults[collection] || []); }
    getById(collection, id) { return this.getAll(collection).find(item => item.id === id) || null; }
    
    add(collection, item) {
        const items = this.getAll(collection);
        item.id = item.id || Date.now();
        item.createdAt = item.createdAt || new Date().toISOString();
        items.unshift(item);
        this._set(collection, items);
        return item;
    }
    
    update(collection, id, updates) {
        const items = this.getAll(collection);
        const idx = items.findIndex(i => i.id === id);
        if(idx === -1) return false;
        items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
        this._set(collection, items);
        return true;
    }
    
    remove(collection, id) {
        const items = this.getAll(collection);
        const filtered = items.filter(i => i.id !== id);
        if(filtered.length === items.length) return false;
        this._set(collection, filtered);
        return true;
    }

    // Méthodes spécifiques
    getUsers() { return this.getAll('users'); }
    setUsers(v) { this._set('users', v); }
    getMembers() { return this.getAll('members'); }
    setMembers(v) { this._set('members', v); }
    getEvents() { return this.getAll('events'); }
    setEvents(v) { this._set('events', v); }
    getDocs() { return this.getAll('docs'); }
    setDocs(v) { this._set('docs', v); }
    getTx() { return this.getAll('tx'); }
    setTx(v) { this._set('tx', v); }
    getUnits() { return this.getAll('units'); }
    setUnits(v) { this._set('units', v); }
    getConvs() { return this.getAll('convs'); }
    setConvs(v) { this._set('convs', v); }
    getGrades() { return this.getAll('grades'); }
    setGrades(v) { this._set('grades', v); }
    getSections() { return this.getAll('sections'); }
    setSections(v) { this._set('sections', v); }
    getEventTypes() { return this.getAll('evtTypes'); }
    setEventTypes(v) { this._set('evtTypes', v); }
    getDocTypes() { return this.getAll('docTypes'); }
    setDocTypes(v) { this._set('docTypes', v); }
    getNotifs() { return this.getAll('notifs'); }
    setNotifs(v) { this._set('notifs', v); }
    getConfig() { return this._get('config', this.defaults.config); }
    setConfig(v) { this._set('config', v); }
    
    exportAll() {
        const data = {};
        Object.keys(this.defaults).forEach(k => { data[k] = this._get(k, this.defaults[k]); });
        return data;
    }
    
    importAll(data) {
        if(!data || typeof data !== 'object') return false;
        Object.keys(this.defaults).forEach(k => { if(data[k] !== undefined) this._set(k, data[k]); });
        if(data.config) this.setConfig(data.config);
        return true;
    }
    
    resetAll() { Object.keys(this.defaults).forEach(k => localStorage.removeItem(this.prefix + k)); }
}

export const db = new Database();
export default db;
