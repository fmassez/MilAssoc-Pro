# Guide d'Installation - MilAssoc Pro

## Méthode 1 : GitHub Pages (Gratuit - Recommandé)

### Étape 1 : Créer un compte GitHub
1. Rendez-vous sur https://github.com
2. Cliquez sur "Sign up"
3. Créez votre compte

### Étape 2 : Créer un repository
1. Cliquez sur le "+" en haut à droite
2. Sélectionnez "New repository"
3. Nommez-le (ex: milassoc-pro)
4. Choisissez "Public"
5. Cliquez sur "Create repository"

### Étape 3 : Uploader les fichiers
1. Cliquez sur "uploading an existing file"
2. Glissez-déposez `index.html`
3. Cliquez sur "Commit changes"

### Étape 4 : Activer GitHub Pages
1. Allez dans "Settings" du repository
2. Cliquez sur "Pages" dans le menu gauche
3. Source : sélectionnez "main branch"
4. Dossier : "/ (root)"
5. Cliquez sur "Save"
6. Attendez 2-3 minutes
7. Votre URL sera : `https://votre-nom.github.io/milassoc-pro`

## Méthode 2 : Netlify (Gratuit - Plus simple)

### Étape 1 : Créer un compte Netlify
1. Rendez-vous sur https://www.netlify.com
2. Cliquez sur "Sign up"
3. Choisissez "Sign up with email"

### Étape 2 : Déployer
1. Une fois connecté, allez dans "Sites"
2. Glissez-déposez votre dossier contenant `index.html`
3. Attendez le déploiement (30 secondes)
4. Votre URL est générée automatiquement

### Étape 3 : Personnaliser l'URL (optionnel)
1. Cliquez sur "Site settings"
2. "Change site name"
3. Choisissez un nom unique

## Méthode 3 : Hébergement local

### Avec XAMPP (Windows/Mac/Linux)

1. **Télécharger XAMPP**
   - https://www.apachefriends.org
   - Installez le logiciel

2. **Placer les fichiers**
   - Ouvrez le dossier `C:\xampp\htdocs` (Windows) ou `/Applications/XAMPP/htdocs` (Mac)
   - Copiez `index.html` dans un dossier `milassoc`

3. **Démarrer le serveur**
   - Lancez XAMPP Control Panel
   - Cliquez sur "Start" pour Apache

4. **Accéder à l'application**
   - Ouvrez votre navigateur
   - Tapez : `http://localhost/milassoc`

### Avec Python (Simple)

1. **Ouvrir un terminal** dans le dossier contenant `index.html`

2. **Lancer le serveur** :
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000