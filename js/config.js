export const CONFIG = {
    APP: { name: 'MILASSOC PRO', version: '5.2.0', storagePrefix: 'milassoc_' },
    DEFAULT_USERS: [
        {id:1,email:'admin@milassoc.fr',pass:'admin123',name:'Cdt. Lefebvre',role:'Administrateur',status:'Actif',phone:'06 12 34 56 78',photo:null},
        // ... autres utilisateurs
    ],
    CARD: {
        orgName: 'Union Nationale des Combattants',
        orgAddr: '18, rue Vezelay - 75008 PARIS',
        orgPhone: '01 53 89 04 04',
        orgDecret: "Reconnue d'utilité publique par décret du 20 Mai 1920."
    }
};
export default CONFIG;