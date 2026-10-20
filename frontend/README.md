# PrêtMatériel — Frontend

## Rôle

Ce dossier contient l'interface web de PrêtMatériel, une application de gestion du prêt de matériel. Il est développé avec React, TypeScript et Vite.

Le frontend constitue la couche de présentation de l'application. L'API REST et la base de données sont des composants distincts du projet et ne sont pas initialisés dans cette user story.

## Prérequis

- Node.js
- npm

## Installation

Depuis ce dossier, installer les dépendances du projet :

```bash
npm install
```

Le fichier `package-lock.json` est versionné afin de verrouiller les versions des dépendances.

## Démarrage en développement

Lancer le serveur de développement :

```bash
npm run dev
```

Ouvrir dans le navigateur l'adresse indiquée par Vite, généralement `http://localhost:5173/`.

## Vérifications

Vérifier le code avec ESLint :

```bash
npm run lint
```

Vérifier les types TypeScript et produire le build de production :

```bash
npm run build
```

Les fichiers compilés sont générés dans `dist/`, un dossier qui n'a pas à être versionné.

Pour prévisualiser le build localement :

```bash
npm run preview
```

## Technologies

- React
- TypeScript
- Vite
- ESLint

## Portée actuelle

Cette initialisation fournit une interface web de base et son environnement de développement. Les fonctionnalités métier de gestion des équipements, des emprunteurs et des prêts seront développées dans les user stories correspondantes.
