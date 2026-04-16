/**
 * Gestion des thèmes - Version globale
 */

window.Themes = class Themes {
    constructor() {
        this.themes = {
            kaki: {name:'Kaki Militaire',bgDark:'#0f1a0f',bgCard:'#1a2a1a',accent:'#4f7a3f',text:'#e0e8d8'},
            clair_bleu: {name:'Clair - Bleu Ciel',bgDark:'#e8edf2',bgCard:'#ffffff',accent:'#2563eb',text:'#112030'}
        };
    }
    
    apply(themeName) {
        const theme = this.themes[themeName] || this.themes.clair_bleu;
        const root = document.documentElement.style;
        
        Object.entries(theme).forEach(([key, value]) => {
            if (!['name'].includes(key)) {
                root.setProperty(`--${key}`, value);
            }
        });
        
        document.body.style.background = theme.bgDark;
        document.body.style.color = theme.text;
    }
};