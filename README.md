# Upsun Manager

Dashboard de gestion pour les projets [Upsun](https://upsun.com) (Platform.sh). Surveillez vos environnements, ressources, activités et configurez l'autoscaling depuis une interface unifiée.

![Dashboard](docs/screenshots/readme-dashboard.png)

## Fonctionnalités

### Dashboard global

Vue d'ensemble de tous vos projets et environnements avec :
- Statistiques en temps réel (environnements actifs, en pause, inactifs)
- Consommation agrégée CPU / Mémoire / Disque avec donut charts
- Graphes de time series sur 10min, 1h, 6h ou 24h
- Détail par projet avec barres de progression

![Dashboard complet](docs/screenshots/readme-dashboard-full.png)

### Gestion des environnements

- Liste des environnements avec statut, type et actions rapides
- Activation, mise en pause, reprise, redéploiement, suppression
- Création de branches (nouvel environnement)
- Polling automatique pendant les opérations

![Environnements](docs/screenshots/readme-envs.png)

### Monitoring des ressources

- Jauges CPU, mémoire et disque par environnement
- Graphes d'utilisation interactifs avec tooltip au survol
- Détail par service (app, worker, service) avec profil et instances
- Accès rapide aux URLs, SSH et Git de l'environnement

![Ressources](docs/screenshots/readme-resources.png)

### Historique des activités

- Timeline des déploiements, crons, backups, modifications de variables
- Filtres par environnement et type d'activité
- Logs détaillés accessibles au clic
- Pagination infinie

![Activités](docs/screenshots/readme-activities.png)

### Variables d'environnement

- Visualisation et gestion des variables par environnement
- Création, modification et suppression
- Support des flags : JSON, sensible, visible au build/runtime

![Variables](docs/screenshots/readme-variables.png)

### Sauvegardes

- Liste des backups avec statut et date
- Création de nouvelles sauvegardes
- Restauration avec confirmation

### Domaines

- Gestion des domaines par environnement
- Ajout et suppression de domaines
- Indicateur SSL

### Autoscaling

- Moteur d'autoscaling intégré (pas d'API Upsun native)
- Configuration par service : CPU, mémoire, disque
- Presets rapides : Conservateur, Equilibre, Agressif
- Analyse intelligente avec recommandations basées sur 24h de données
- Historique des actions de scaling

![Autoscaling](docs/screenshots/readme-autoscaling.png)

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | Nuxt 3.21 (SPA) |
| State management | Pinia (composition API) |
| Styling | Tailwind CSS + theme dark Graphite |
| Fonts | Manrope (sans) + JetBrains Mono (mono) |
| Backend | Nitro server routes (proxy API Upsun) |
| Auth | OAuth2 token exchange via Platform.sh |
| Desktop | Electron (optionnel) |
| Build desktop | Docker + Makefile |

## Téléchargement

Les binaires pré-compilés sont disponibles sur la page [Releases](https://github.com/tdubuffet-lephare/upsun-manager/releases).

### Linux

| Format | Distributions cibles | Installation |
|---|---|---|
| `.AppImage` | Toutes (universel) | `chmod +x Upsun-Manager-*.AppImage && ./Upsun-Manager-*.AppImage` |
| `.deb` | Debian, Ubuntu, Mint, Pop!_OS | `sudo dpkg -i Upsun-Manager-*.deb` |
| `.rpm` | Fedora, RHEL, Rocky, openSUSE | `sudo rpm -i Upsun-Manager-*.rpm` |

### Windows

1. Télécharger `Upsun-Manager-Setup-*.exe` (installeur) ou `Upsun-Manager-*-portable.exe` (sans installation).
2. Au premier lancement, Windows SmartScreen affiche un avertissement : cliquer **Plus d'infos** puis **Exécuter quand même**.
3. L'exécutable n'est pas signé par un certificat EV payant — l'avertissement est normal.

### macOS

1. Télécharger `Upsun-Manager-*.dmg` et glisser l'app dans le dossier Applications.
2. Au premier lancement : **clic-droit sur l'icône > Ouvrir** (au lieu d'un double-clic).
3. Confirmer dans la boîte de dialogue Gatekeeper.
4. L'app n'est pas notarisée Apple — le clic-droit est nécessaire uniquement la première fois.

L'auto-update est intégré : à chaque démarrage, l'app vérifie si une nouvelle version existe et la télécharge en arrière-plan.

## Installation depuis les sources

```bash
git clone https://github.com/tdubuffet-lephare/upsun-manager.git
cd upsun-manager
npm install
```

## Configuration

Creer un fichier `.env` a la racine :

```env
NUXT_UPSUN_API_TOKEN=your-upsun-api-token
```

Le token API Upsun se genere depuis [console.upsun.com](https://console.upsun.com) > Account Settings > API Tokens.

## Utilisation

### Mode web

```bash
# Developpement
npm run build && npx nuxt preview --port 3002

# Production
npm run build
node .output/server/index.mjs
```

### Mode Electron (desktop)

```bash
# Dev
npm run electron:dev

# Package (repertoire)
npm run electron:pack

# Distribution (installeur)
npm run electron:dist
```

### Docker (compilation multi-plateforme locale)

```bash
# Linux (AppImage + deb + rpm)
make dist-linux

# Windows (via Wine)
make dist-windows

# Les deux
make dist-all
```

### Release multi-plateforme automatisée

Le workflow GitHub Actions `.github/workflows/release.yml` build automatiquement Linux, Windows et macOS en parallèle quand un tag `v*.*.*` est poussé :

```bash
npm version 1.1.0 --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: release v1.1.0"
git tag v1.1.0
git push origin main --tags
```

Les artifacts sont publiés automatiquement sur la page Releases du repo.

## Architecture

```
pages/                          # Dashboard + page projet
components/                     # ~35 composants Vue
  LoadingState.vue              # Etats partagés
  EmptyState.vue
  ErrorState.vue
  AreaChart.vue                 # Graphes SVG interactifs
  DonutChart.vue                # Jauges circulaires
  ...
composables/                    # Logique reutilisable
  useClipboard.ts
  useEnvironmentSelection.ts
  useToast.ts
  useElectron.ts
stores/                         # 9 Pinia stores
  dashboard.ts                  # Agregation multi-projets
  metrics.ts                    # Metriques par environnement
  environments.ts               # CRUD + polling
  autoscaling.ts                # Config + recommandations
  ...
utils/                          # Fonctions utilitaires
  format.ts                     # formatBytes, formatCpu, formatPercent
  date.ts                       # formatDate, formatRelativeTime
  error.ts                      # extractErrorMessage
  metrics.ts                    # parseMetricsResponse, summarizeServices
server/
  api/                          # ~31 routes Nitro
  utils/
    upsun-auth.ts               # OAuth2 token exchange
    upsun-client.ts             # Client HTTP avec retry 401
    env-action-handler.ts       # Factory pour les actions env
    autoscaling-engine.ts       # Moteur d'evaluation periodique
  plugins/
    autoscaling.ts              # Demarrage automatique du moteur
electron/                       # Process Electron (optionnel)
  main.ts
  preload.ts
  token-store.ts                # Stockage chiffre via safeStorage
  nitro-server.ts               # Serveur Nitro embarque
```

## Licence

ISC
