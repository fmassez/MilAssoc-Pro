/**
 * Fonctions utilitaires pour MilAssoc Pro
 * @module utils
 */

export class Utils {
    /**
     * Affiche un toast de notification
     * @param {string} msg - Message à afficher
     */
    static showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMsg');
        if (toast && toastMsg) {
            toastMsg.textContent = msg;
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
            clearTimeout(window._toastT);
            window._toastT = setTimeout(() => {
                toast.style.transform = 'translateY(100px)';
                toast.style.opacity = '0';
            }, 3000);
        }
    }

    /**
     * Affiche une erreur dans un élément
     * @param {string} msg - Message d'erreur
     * @param {HTMLElement} el - Élément pour afficher l'erreur
     */
    static showError(msg, el) {
        if (el) {
            el.style.display = 'block';
            el.textContent = msg;
        }
    }

    /**
     * Cache un élément d'erreur
     * @param {HTMLElement} el - Élément à cacher
     */
    static hideError(el) {
        if (el) {
            el.style.display = 'none';
        }
    }

    /**
     * Fonction debounce pour limiter les appels
     * @param {Function} func - Fonction à débouncer
     * @param {number} wait - Délai en ms
     * @returns {Function} Fonction débouncée
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Copie du texte dans le presse-papiers
     * @param {string} text - Texte à copier
     * @returns {Promise<boolean>} Succès de la copie
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback pour anciens navigateurs
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                return true;
            }
        } catch (err) {
            console.error('Erreur copie:', err);
            return false;
        }
    }

    /**
     * Formate une date en français
     * @param {string|Date} date - Date à formater
     * @returns {string} Date formatée
     */
    static formatDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    /**
     * Génère un ID unique
     * @returns {number} ID unique
     */
    static generateId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }
}

export default Utils;
window.Utils = Utils;