import { CONFIG } from './config.js';

export class Themes {
    constructor() {
        this.themes = {
            kaki: {name:'Kaki Militaire',bgDark:'#0f1a0f',bgCard:'#1a2a1a',bgInput:'#243524',border:'#2d402d',accent:'#4f7a3f',accentLight:'#6b9e55',text:'#e0e8d8',textDim:'#8a9a80',textMuted:'#5a6a50',light:false},
            bleu: {name:'Bleu Marine',bgDark:'#0a1520',bgCard:'#112030',bgInput:'#182a40',border:'#1e3550',accent:'#2563eb',accentLight:'#3b82f6',text:'#dce8f5',textDim:'#7a9ab8',textMuted:'#4a6a88',light:false},
            clair_bleu: {name:'Clair - Bleu Ciel',bgDark:'#e8edf2',bgCard:'#ffffff',bgInput:'#f0f4f8',border:'#c4d0de',accent:'#2563eb',accentLight:'#3b82f6',text:'#112030',textDim:'#4a6a88',textMuted:'#7a9ab8',light:true}
        };
    }
    apply(themeName) {
        const theme = this.themes[themeName] || this.themes.clair_bleu;
        const root = document.documentElement.style;
        Object.entries(theme).forEach(([k,v]) => { if(!['name','light'].includes(k)) root.setProperty(`--${k}`, v); });
        document.body.style.background = theme.bgDark;
        document.body.style.color = theme.text;
    }
    getThemes() { return Object.keys(this.themes); }
    getTheme(name) { return this.themes[name]; }
}
export default Themes;