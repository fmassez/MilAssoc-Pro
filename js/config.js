export const CONFIG = {
    APP: {
        name: 'MILASSOC PRO',
        version: '5.2.0',
        storagePrefix: 'milassoc_'
    },
    DEFAULT_USERS: [
        {id:1,email:'admin@milassoc.fr',pass:'admin123',name:'Cdt. Lefebvre',role:'Administrateur',status:'Actif',phone:'06 12 34 56 78',photo:null},
        {id:2,email:'tresorier@milassoc.fr',pass:'treso123',name:'Lt. Bernard',role:'Trésorier',status:'Actif',phone:'06 23 45 67 89',photo:null},
        {id:3,email:'secretaire@milassoc.fr',pass:'secre123',name:'Cne. Petit',role:'Secrétaire',status:'Actif',phone:'06 34 56 78 90',photo:null},
        {id:4,email:'lecteur@milassoc.fr',pass:'lecteur123',name:'Sgt. Durand',role:'Lecteur seul',status:'Actif',phone:'',photo:null},
        {id:5,email:'frederic.massez@gmail.com',pass:'massez123',name:'Frederic Massez',role:'Administrateur',status:'Actif',phone:'06 45 67 89 01',photo:null}
    ],
    CARD: {
        orgName: 'Union Nationale des Combattants',
        orgAddr: '18, rue Vezelay - 75008 PARIS',
        orgPhone: '01 53 89 04 04',
        orgDecret: "Reconnue d'utilité publique par décret du 20 Mai 1920."
    }
};

export default CONFIG;
