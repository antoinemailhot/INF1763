# PrêtMatériel — Frontend

## Rôle

Interface web de PrêtMatériel développée avec React, TypeScript et Vite. Le frontend constitue la couche de présentation; l'API REST est un composant distinct.

## Prérequis et installation

- Node.js
- npm

Depuis la racine du dépôt, installer les dépendances :

    npm --prefix frontend install
    npm --prefix backend install

Les fichiers `package-lock.json` sont versionnés pour verrouiller les versions des dépendances.

## Configuration

Créer les fichiers de configuration locaux à partir des exemples, depuis la racine du dépôt :

    Copy-Item frontend/.env.example frontend/.env
    Copy-Item backend/.env.example backend/.env

Les fichiers `.env` locaux sont ignorés par Git.

Le frontend utilise `VITE_API_BASE_URL` pour déterminer l'URL de base de l'API. En développement local, sa valeur `/api` utilise le proxy Vite, qui transmet les requêtes à `http://localhost:3000` en retirant le préfixe `/api`.

Le frontend utilise le port `5173` et refuse de démarrer si celui-ci est occupé. Le backend utilise le port `3000` par défaut, configurable avec `PORT`.

Pour une compilation destinée à la production, définir `VITE_API_BASE_URL` avec l'URL accessible de l'API avant de lancer le build. Cette variable doit être définie en production. Le proxy Vite est uniquement destiné au développement.

Ne place aucun secret dans une variable `VITE_` : ces valeurs sont intégrées au code client.

## Démarrage en développement

Dans un premier terminal, démarrer le backend :

    npm --prefix backend run dev

Dans un deuxième terminal, démarrer le frontend :

    npm --prefix frontend run dev

Ouvrir `http://localhost:5173/`.

L'indicateur de statut de la page confirme si l'API répond correctement à la route `/health`.

## Appels à l'API

Tous les appels réseau à l'API doivent passer par `src/api.ts`, qui expose `apiFetch` :

    import { apiFetch } from './api'

    const response = await apiFetch('/health')

## Vérifications

Depuis la racine du dépôt :

    npm --prefix frontend run lint
    npm --prefix frontend run build
    npm --prefix backend test
    npm --prefix backend run typecheck
    npm --prefix backend run build

Pour prévisualiser le build du frontend :

    npm --prefix frontend run preview

Les fichiers compilés sont générés dans `dist/` et ne doivent pas être versionnés.

## Technologies

- React
- TypeScript
- Vite
- ESLint
- Express
