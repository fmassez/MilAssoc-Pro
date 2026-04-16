/**
 * Gestion de la persistance des données via localStorage
 * @module database
 */

import { CONFIG } from './config.js';

class Database {
    constructor(prefix = CONFIG.APP.storagePrefix) {
        this.prefix = prefix;
        this.defaults = CONFIG.DEFAULT_DATA;
    }

    /**
     * Récupère une clé du localStorage
     * @param {string} key - Clé à récupérer
     * @param {*} defaultValue - Valeur par défaut si non trouvée
     * @returns {*} Données parsées ou valeur par défaut
     */
    _get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.prefix + key);
            return value !== null ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error(`[DB] Erreur lecture ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Stocke une valeur dans localStorage
     * @param {string} key - Clé de stockage
     * @param {*} value - Valeur à stocker
     * @returns {boolean} Succès de l'opération
     */
    _set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`[DB] Erreur écriture ${key}:`, error);
            return false;
        }
    }

    /**
     * Réinitialise toute la base de données
     */
    resetAll() {
        Object.keys(this.defaults).forEach(key => {
            localStorage.removeItem(this.prefix + key);
        });
        console.log('[DB] Base de données réinitialisée');
    }

    /**
     * Exporte toutes les données en JSON
     * @returns {Object} Toutes les données de l'application
     */
    exportAll() {
        const data = {};
        Object.keys(this.defaults).forEach(key => {
            data[key] = this._get(key, this.defaults[key]);
        });
        data.config = this._get('config', {});
        return data;
    }

    /**
     * Importe des données depuis un objet JSON
     * @param {Object} data - Données à importer
     * @returns {boolean} Succès de l'import
     */
    importAll(data) {
        if (!data || typeof data !== 'object') return false;
        
        Object.keys(this.defaults).forEach(key => {
            if (data[key] !== undefined) {
                this._set(key, data[key]);
            }
        });
        
        if (data.config) {
            this._set('config', data.config);
        }
        
        return true;
    }

    // === CRUD Génériques ===
    
    create(collection, item) {
        const items = this._get(collection, []);
        item.id = item.id || Date.now();
        item.createdAt = item.createdAt || new Date().toISOString();
        items.unshift(item);
        this._set(collection, items);
        return item;
    }

    read(collection, id = null) {
        const items = this._get(collection, []);
        return id ? items.find(i => i.id === id) : items;
    }

    update(collection, id, updates) {
        const items = this._get(collection, []);
        const index = items.findIndex(i => i.id === id);
        if (index === -1) return false;
        
        items[index] = {
            ...items[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this._set(collection, items);
        return true;
    }

    delete(collection, id) {
        const items = this._get(collection, []);
        const filtered = items.filter(i => i.id !== id);
        if (filtered.length === items.length) return false;
        this._set(collection, filtered);
        return true;
    }
}

// Export singleton
export const db = new Database();
export default db;