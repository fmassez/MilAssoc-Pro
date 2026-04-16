/**
 * Fonctions utilitaires pour MilAssoc Pro
 * MilAssoc Pro - Module Utils
 * @version 5.2.0
 */

(function(global) {
    'use strict';

    const Utils = {
        /**
         * Affiche un toast de notification
         * @param {string} msg - Message à afficher
         * @param {string} type - Type: 'success', 'error', 'info' (défaut: 'success')
         */
        showToast: function(msg, type) {
            type = type || 'success';
            var toast = document.getElementById('toast');
            var toastMsg = document.getElementById('toastMsg');
            
            if (!toast || !toastMsg) {
                console.warn('[Utils] Toast non trouvé dans le DOM');
                alert(msg);
                return;
            }
            
            // Configuration des couleurs par type
            var colors = {
                success: { bg: 'var(--accent)', icon: '✓' },
                error: { bg: '#ef4444', icon: '✕' },
                info: { bg: '#3b82f6', icon: 'ℹ' },
                warning: { bg: '#f59e0b', icon: '⚠' }
            };
            var cfg = colors[type] || colors.success;
            
            // Mise à jour du toast
            toastMsg.textContent = msg;
            toast.style.background = cfg.bg;
            toast.style.color = 'white';
            toast.querySelector('svg')?.setAttribute('style', 'display:none');
            
            // Animation d'apparition
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
            
            // Auto-disparition
            clearTimeout(window._toastTimer);
            window._toastTimer = setTimeout(function() {
                toast.style.transform = 'translateY(100px)';
                toast.style.opacity = '0';
            }, 3000);
        },

        /**
         * Affiche une erreur dans un élément
         * @param {string} msg - Message d'erreur
         * @param {HTMLElement} el - Élément pour afficher l'erreur
         */
        showError: function(msg, el) {
            if (el) {
                el.style.display = 'block';
                el.textContent = msg;
                // Animation de shake
                el.animate([
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-5px)' },
                    { transform: 'translateX(5px)' },
                    { transform: 'translateX(0)' }
                ], { duration: 200, iterations: 1 });
            }
        },

        /**
         * Cache un élément d'erreur
         * @param {HTMLElement} el - Élément à cacher
         */
        hideError: function(el) {
            if (el) {
                el.style.display = 'none';
                el.textContent = '';
            }
        },

        /**
         * Fonction debounce pour limiter les appels fréquents
         * @param {Function} func - Fonction à débouncer
         * @param {number} wait - Délai en ms
         * @returns {Function} Fonction débouncée
         */
        debounce: function(func, wait) {
            var timeout;
            return function executedFunction() {
                var context = this;
                var args = arguments;
                var later = function() {
                    timeout = null;
                    func.apply(context, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Fonction throttle pour limiter la fréquence d'exécution
         * @param {Function} func - Fonction à throttler
         * @param {number} limit - Intervalle en ms
         * @returns {Function} Fonction throttled
         */
        throttle: function(func, limit) {
            var inThrottle;
            return function() {
                var args = arguments;
                var context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(function() { inThrottle = false; }, limit);
                }
            };
        },

        /**
         * Copie du texte dans le presse-papiers
         * @param {string} text - Texte à copier
         * @param {Function} callback - Callback optionnel (succès/échec)
         * @returns {Promise<boolean>} Succès de la copie
         */
        copyToClipboard: function(text, callback) {
            var self = this;
            
            if (navigator.clipboard && window.isSecureContext) {
                // Méthode moderne
                return navigator.clipboard.writeText(text)
                    .then(function() {
                        if (callback) callback(true);
                        return true;
                    })
                    .catch(function(err) {
                        console.error('[Utils] Erreur copie:', err);
                        // Fallback
                        return self._copyFallback(text, callback);
                    });
            } else {
                // Fallback pour anciens navigateurs
                return this._copyFallback(text, callback);
            }
        },

        /**
         * Fallback pour la copie (méthode ancienne)
         * @private
         */
        _copyFallback: function(text, callback) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                ta.style.top = '0';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                var success = document.execCommand('copy');
                document.body.removeChild(ta);
                if (callback) callback(success);
                return success;
            } catch (err) {
                console.error('[Utils] Erreur fallback copie:', err);
                if (callback) callback(false);
                return false;
            }
        },

        /**
         * Formate une date en français
         * @param {string|Date} date - Date à formater
         * @param {Object} options - Options de formatage
         * @returns {string} Date formatée
         */
        formatDate: function(date, options) {
            var d = new Date(date);
            if (isNaN(d.getTime())) return 'Date invalide';
            
            var opts = Object.assign({
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }, options);
            
            return d.toLocaleDateString('fr-FR', opts);
        },

        /**
         * Formate une heure
         * @param {string|Date} date - Date/heure à formater
         * @returns {string} Heure formatée HH:MM
         */
        formatTime: function(date) {
            var d = new Date(date);
            if (isNaN(d.getTime())) return '--:--';
            return String(d.getHours()).padStart(2, '0') + ':' + 
                   String(d.getMinutes()).padStart(2, '0');
        },

        /**
         * Formate un montant en euros
         * @param {number} amount - Montant
         * @param {boolean} showSign - Afficher le signe + ou -
         * @returns {string} Montant formaté
         */
        formatEuro: function(amount, showSign) {
            var sign = showSign ? (amount >= 0 ? '+' : '') : '';
            return sign + '€ ' + Math.abs(amount).toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        /**
         * Génère un ID unique
         * @returns {number} ID unique basé sur timestamp + random
         */
        generateId: function() {
            return Date.now() + Math.floor(Math.random() * 10000);
        },

        /**
         * Génère un UUID v4 simplifié
         * @returns {string} UUID au format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
         */
        generateUUID: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0;
                var v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /**
         * Tronque un texte avec ellipsis
         * @param {string} text - Texte à tronquer
         * @param {number} maxLength - Longueur maximale
         * @returns {string} Texte tronqué
         */
        truncate: function(text, maxLength) {
            if (!text || text.length <= maxLength) return text || '';
            return text.substring(0, maxLength - 3) + '...';
        },

        /**
         * Échappe les caractères HTML pour éviter les injections XSS
         * @param {string} str - Chaîne à échapper
         * @returns {string} Chaîne échappée
         */
        escapeHtml: function(str) {
            if (!str) return '';
            var div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },

        /**
         * Vérifie si une valeur est vide
         * @param {*} value - Valeur à tester
         * @returns {boolean} True si vide
         */
        isEmpty: function(value) {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string' && value.trim() === '') return true;
            if (Array.isArray(value) && value.length === 0) return true;
            if (typeof value === 'object' && Object.keys(value).length === 0) return true;
            return false;
        },

        /**
         * Parse un fichier CSV en tableau d'objets
         * @param {string} csv - Contenu CSV
         * @param {string} delimiter - Délimiteur (défaut: ',')
         * @returns {Array} Tableau d'objets
         */
        parseCSV: function(csv, delimiter) {
            delimiter = delimiter || ',';
            var lines = csv.trim().split('\n');
            if (lines.length < 2) return [];
            
            var headers = lines[0].split(delimiter).map(function(h) {
                return h.trim().replace(/^"|"$/g, '');
            });
            
            var result = [];
            for (var i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                var values = lines[i].split(delimiter).map(function(v) {
                    return v.trim().replace(/^"|"$/g, '');
                });
                var obj = {};
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = values[j] || '';
                }
                result.push(obj);
            }
            return result;
        },

        /**
         * Convertit un tableau d'objets en CSV
         * @param {Array} data - Données à convertir
         * @param {Array} headers - En-têtes à inclure
         * @param {string} delimiter - Délimiteur
         * @returns {string} Contenu CSV
         */
        toCSV: function(data, headers, delimiter) {
            delimiter = delimiter || ',';
            if (!data || data.length === 0) return '';
            
            headers = headers || Object.keys(data[0]);
            var escape = function(val) {
                if (val === null || val === undefined) return '""';
                val = String(val);
                if (val.indexOf(delimiter) >= 0 || val.indexOf('"') >= 0) {
                    return '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            };
            
            var lines = [headers.map(escape).join(delimiter)];
            for (var i = 0; i < data.length; i++) {
                var row = headers.map(function(h) {
                    return escape(data[i][h]);
                });
                lines.push(row.join(delimiter));
            }
            return lines.join('\n');
        },

        /**
         * Télécharge un fichier
         * @param {string} content - Contenu du fichier
         * @param {string} filename - Nom du fichier
         * @param {string} mimeType - Type MIME
         */
        downloadFile: function(content, filename, mimeType) {
            mimeType = mimeType || 'application/octet-stream';
            var blob = new Blob([content], { type: mimeType });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        /**
         * Valide un email
         * @param {string} email - Email à valider
         * @returns {boolean} Email valide
         */
        isValidEmail: function(email) {
            if (!email) return false;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        /**
         * Valide un téléphone français
         * @param {string} phone - Téléphone à valider
         * @returns {boolean} Téléphone valide
         */
        isValidPhoneFR: function(phone) {
            if (!phone) return false;
            // Accepte: 06 12 34 56 78, +33612345678, 0612345678
            return /^(\+33|0)[1-9](\s?\d{2}){4}$/.test(phone.replace(/[\s.-]/g, ''));
        },

        /**
         * Attend un délai (Promise)
         * @param {number} ms - Délai en millisecondes
         * @returns {Promise} Promise résolue après le délai
         */
        sleep: function(ms) {
            return new Promise(function(resolve) {
                setTimeout(resolve, ms);
            });
        },

        /**
         * Charge une image en base64
         * @param {File} file - Fichier image
         * @param {Function} callback - Callback avec le résultat
         */
        loadImageAsBase64: function(file, callback) {
            if (!file || !file.type.startsWith('image/')) {
                if (callback) callback(null, 'Fichier invalide');
                return;
            }
            
            var reader = new FileReader();
            reader.onload = function(e) {
                if (callback) callback(e.target.result, null);
            };
            reader.onerror = function() {
                if (callback) callback(null, 'Erreur de lecture');
            };
            reader.readAsDataURL(file);
        },

        /**
         * Redimensionne une image (canvas)
         * @param {string} src - URL ou base64 de l'image
         * @param {number} maxWidth - Largeur max
         * @param {number} maxHeight - Hauteur max
         * @returns {Promise<string>} Promise avec l'image redimensionnée en base64
         */
        resizeImage: function(src, maxWidth, maxHeight) {
            return new Promise(function(resolve, reject) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    
                    // Calcul des dimensions
                    var width = img.width;
                    var height = img.height;
                    var ratio = Math.min(maxWidth / width, maxHeight / height, 1);
                    
                    canvas.width = width * ratio;
                    canvas.height = height * ratio;
                    
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.9));
                };
                img.onerror = reject;
                img.src = src;
            });
        }
    };

    // Exposition globale
    global.Utils = Utils;

})(typeof window !== 'undefined' ? window : this);