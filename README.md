# GestiTâches

> INF1763 – Techniques et outils professionnels de développement logiciel

## Description

GestiTâches est une application web simple de gestion de tâches personnelles. Elle permet de créer une tâche (titre, description, date d'échéance), de la marquer comme complétée et de la supprimer.

Le projet vise à offrir un outil rapide et sans complexité pour organiser ses tâches au quotidien, tout en servant de terrain de pratique, dans le cadre du cours INF1763, pour le travail d'équipe professionnel avec Git et GitHub : branches, Pull Requests, revues de code et gestion d'un backlog.

## Équipe

| Membre | Utilisateur GitHub | Rôle |
|---|---|---|
| Micael Racine Leblanc | [@Racm30uqo](https://github.com/Racm30uqo) | Responsable frontend et responsable qualité / revue |
| Antoine Mailhot | [@antoinemailhot](https://github.com/antoinemailhot) | Responsable technique et responsable backend |

Les responsabilités par dossier sont aussi définies dans [`.github/CODEOWNERS`](.github/CODEOWNERS) : le responsable d'un dossier est ajouté automatiquement comme réviseur des PR qui le modifient.

## Structure du projet

```
.
├── .github/    # Modèles de PR et d'issues, CODEOWNERS
├── frontend/   # Interface utilisateur (React + Vite + TypeScript)
└── backend/    # API REST et stockage des tâches (Node.js + Express + TypeScript + SQLite)
```

## Installation et démarrage

### Prérequis
- Node.js 20 ou plus récent (testé avec Node.js 22)
- npm

### Backend
```bash
cd backend
cp .env.example .env   # PORT et chemin de la base SQLite
npm install
npm run dev            # API sur http://localhost:3000
npm test               # tests
```

### Frontend
```bash
cd frontend
cp .env.example .env   # URL de l'API (proxy Vite)
npm install
npm run dev            # application sur http://localhost:5173
npm run lint           # vérification ESLint
```

Le backend doit être démarré pour que le frontend puisse afficher et créer des tâches.

## Stratégie de branchement

Nous utilisons **GitHub Flow**. C'est la stratégie la plus simple pour un petit projet scolaire de courte durée : une seule branche stable (`main`) et des branches courtes pour chaque changement, sans la lourdeur des branches `develop` et `release` de Gitflow.

- `main` est toujours stable et protégée : aucun push direct.
- Chaque changement se fait sur une branche dédiée, créée à partir de `main`.
- Toute fusion vers `main` passe par une Pull Request approuvée par au moins 1 membre.
- Les PR sont fusionnées avec **« Merge pull request »** (merge commit).
- La branche est supprimée après la fusion.

### Convention de nommage des branches

| Préfixe | Usage | Exemple |
|---|---|---|
| `feature/` | Nouvelle fonctionnalité (user story) | `feature/us7-creation-tache` |
| `fix/` | Correction de bogue | `fix/emplacement-template-pr` |
| `docs/` | Documentation | `docs/readme-complet` |
| `test/` | Branche temporaire de test | `test/prenom` |

Format : `type/usNUMÉRO-nom-court` pour une user story, sinon `type/nom-court` (minuscules, mots séparés par des tirets).

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
5. Assigner un réviseur et ajouter le label `en revue`.
6. Le réviseur laisse au moins un commentaire substantiel dans « Files changed », puis approuve ou demande des changements.
7. Une fois la PR approuvée, la fusionner, puis supprimer la branche.

## Organisation du travail

- **Backlog** : les user stories sont dans les [Issues](https://github.com/antoinemailhot/INF1763/issues), au format « En tant que…, je veux…, afin de… » avec au moins 2 critères d'acceptation.
- **Jalons** :

| Jalon | Échéance | User stories |
|---|---|---|
| Livrable 1 | 2 novembre 2026 | US1 à US5 |
| Livrable 2 | 3 novembre 2026 | US6 à US10 |
| Livrable 3 | 24 novembre 2026 | US11 à US15 |
| Livrable 4 | 8 décembre 2026 | US16 à US20 |

- **Labels** :

| Catégorie | Labels | Signification |
|---|---|---|
| Type | `user story`, `enhancement`, `bug`, `documentation` | Nature de l'issue |
| Priorité | `priorité : haute`, `priorité : moyenne`, `priorité : basse` | Ordre de traitement (teintes rouge, orange, jaune) |
| Partie du projet | `frontend`, `backend` | Dossier touché (teintes de bleu) |
| État | `en revue`, `bloqué` | PR en attente de revue / travail qui attend autre chose |
