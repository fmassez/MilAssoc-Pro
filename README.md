# 🎖️ MilAssoc Pro

> Application de gestion d'association militaire - Version 5.2

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/Node-%3E%3D18-green.svg)](https://nodejs.org)

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Structure du projet](#-structure-du-projet)
- [Tests](#-tests)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

## ✨ Fonctionnalités

### 👥 Gestion des membres
- Fiche membre complète (grade, section, cotisation, contact)
- Import/Export CSV
- Recherche et filtres avancés
- Génération de cartes de membre UNC

### 📅 Événements
- Calendrier interactif
- Gestion des types d'événements
- Feuilles d'émargement imprimables

### 💰 Finances
- Suivi des recettes et dépenses
- Catégories personnalisables
- État des comptes imprimable
- Relevé de transactions

### 📄 Documents
- Dépôt et organisation des documents
- Prévisualisation et téléchargement
- Envoi par email

### 💬 Messagerie interne
- Conversations entre gestionnaires
- Notifications en temps réel

### ⚙️ Administration
- Gestion des utilisateurs et rôles
- Personnalisation des thèmes
- Configuration des cartes membres
- Backup/Restore des données

## 🛠️ Prérequis

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- Navigateur moderne (Chrome 90+, Firefox 88+, Safari 14+)

## 🚀 Installation

### Développement local

```bash
# Cloner le dépôt
git clone https://github.com/fmassez/MilAssoc-Pro.git
cd MilAssoc-Pro

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev