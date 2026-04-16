import { db } from './database.js';
import { Themes } from './themes.js';
import { Utils } from './utils.js';

class App {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.themes = new Themes();
        this.utils = new Utils();
        this.init();
    }
    
    init() {
        console.log('App initialisée');
        // Reste du code d'initialisation
    }
    
    // ... toutes les autres méthodes
}

const app = new App();
window.App = app;
export default app;