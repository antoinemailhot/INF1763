# GestiTâches

> INF1763 – Techniques et outils professionnels de développement logiciel

## Description

GestiTâches est une application web simple de gestion de tâches personnelles. Elle permet de créer une tâche (titre, description, date d'échéance), de la marquer comme complétée et de la supprimer. 

## Équipe

| Membre | Utilisateur GitHub | Rôle |
|---|---|---|
| [Micael Racine Leblanc] | @[racm30] | [Responsable technique] |
| [Antoine Mailhot] | @[utilisateur] | [Responsable frontend] |
| [Prénom Nom] | @[utilisateur] | [Responsable backend] |
| [Prénom Nom] | @[utilisateur] | [Responsable qualité / revue] |

## Structure du projet

```
.
├── frontend/   # Interface utilisateur (React + Vite + TypeScript)
└── backend/    # API REST et stockage des tâches (Node.js + Express + TypeScript)
```

## Installation et démarrage

### Prérequis
- Node.js [version, ex. 20+]
- npm

### Backend
```bash
cd backend
npm install
npm run dev        # API sur http://localhost:3000
npm test           # tests
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # application sur http://localhost:5173
npm run lint       # vérification ESLint
```

## Stratégie de branchement

Nous utilisons **GitHub Flow**. [ C'est la stratégie la plus simple pour un petit projet : une seule branche stable (`main`) et des branches courtes pour chaque changement. ]

- `main` est toujours stable et protégée : aucun push direct.
- Chaque changement se fait sur une branche dédiée, créée à partir de `main`.
- Toute fusion vers `main` passe par une Pull Request approuvée par au moins 1 membre.
- La branche est supprimée après la fusion.

### Convention de nommage des branches

| Préfixe | Usage | Exemple |
|---|---|---|
| `feature/` | Nouvelle fonctionnalité (user story) | `feature/us7-creation-tache` |
| `fix/` | Correction de bogue | `fix/us8-suppression-erreur` |
| `docs/` | Documentation | `docs/readme-equipe` |
| `test/` | Branche temporaire de test | `test/prenom` |

Format : `type/usNUMÉRO-nom-court` (minuscules, mots séparés par des tirets).

### Convention de commits

Format : `type(portée): message court`, par exemple :
- `feat(frontend): ajoute le formulaire de création de tâche`
- `fix(backend): corrige la validation de la date d'échéance`
- `docs: met à jour le README`

## Processus de contribution

1. `git checkout main && git pull`
2. `git checkout -b feature/usX-nom-court`
3. Faire un seul petit changement, puis commit et push.
4. Ouvrir une Pull Request avec le modèle, en ajoutant `Closes #X`.
5. Assigner un réviseur ; au moins 1 approbation est requise.
6. Fusionner, puis supprimer la branche.

## Organisation du travail

- **Backlog** : les user stories sont dans les [Issues](https://github.com/antoinemailhot/INF1763/issues).
- **Jalons** : Livrable 1 à Livrable 4.
- **Labels** : [liste des labels et leur signification]
