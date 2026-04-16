/**
 * Configuration par défaut de MilAssoc Pro
 * @module config
 */

export const CONFIG = {
    APP: {
        name: 'MILASSOC PRO',
        version: '5.2.0',
        storagePrefix: 'milassoc_'
    },
    
    // Utilisateurs par défaut (à hasher en prod)
    DEFAULT_USERS: [
        {
            id: 1,
            email: 'admin@milassoc.fr',
            pass: 'admin123', // ⚠️ À hasher avec bcrypt en production
            name: 'Cdt. Lefebvre',
            role: 'Administrateur',
            status: 'Actif',
            phone: '06 12 34 56 78',
            photo: null
        }
        // ... autres utilisateurs
    ],
    
    // Données initiales
    DEFAULT_DATA: {
        members: [],
        events: [],
        docs: [],
        transactions: [],
        units: [],
        conversations: []
    },
    
    // Configuration des cartes membres
    CARD: {
        orgName: 'Union Nationale des Combattants',
        orgAddr: '18, rue Vezelay - 75008 PARIS',
        orgPhone: '01 53 89 04 04',
        orgDecret: "Reconnue d'utilité publique par décret du 20 Mai 1920.",
        formats: {
            a6: { width: 420, height: 264, label: 'A6 (105×148mm)' },
            a5: { width: 595, height: 374, label: 'A5 (148×210mm)' }
        }
    },
    
    // Rôles et permissions
    ROLES: {
        'Administrateur': ['read', 'write', 'delete', 'admin'],
        'Trésorier': ['read', 'write:finance'],
        'Secrétaire': ['read', 'write:members', 'write:events', 'write:docs'],
        'Lecteur seul': ['read']
    }
};

export default CONFIG;