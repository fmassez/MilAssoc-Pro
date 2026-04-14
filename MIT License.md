
## 📄 INSTALL.md

```markdown
# Guide d'Installation — MilAssoc Pro

## Méthode 1 : GitHub Pages (Gratuit)

1. Créez un compte sur https://github.com
2. Créez un nouveau repository (public)
3. Uploadez le fichier `index.html`
4. Settings > Pages > Source: Deploy from branch > main > /root
5. Attendez 2-3 minutes
6. Votre application est accessible à l'URL affichée

## Méthode 2 : Netlify

1. https://app.netlify.com/drop
2. Glissez-déposez le fichier `index.html`
3. L'application est en ligne immédiatement

## Méthode 3 : Hébergement local

### Avec Python
```bash
# Dans le dossier contenant index.html
python -m http.server 8000
# Ouvrez http://localhost:8000
