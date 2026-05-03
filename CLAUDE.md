# Upsun Manager — Dashboard de gestion Upsun

## Présentation

Dashboard web pour gérer les projets Upsun (Platform.sh) : environnements, ressources, autoscaling, backups, domaines, variables, activités. Frontend Nuxt 3 SPA + backend Nitro qui proxifie l'API Upsun.

## Stack technique

- **Framework** : Nuxt 3.21 (SSR désactivé, mode SPA)
- **State** : Pinia (composition API stores)
- **Styling** : Tailwind CSS + thème dark custom (Graphite)
- **Fonts** : Manrope (sans), JetBrains Mono (mono)
- **Backend** : Nitro server routes proxifiant l'API Upsun avec OAuth2
- **Autoscaling** : moteur serveur autonome (Nitro plugin, évaluation toutes les 60s)
- **Persistance autoscaling** : Nitro `useStorage('data')` → fichiers `.data/kv/`
- **Langue** : TypeScript strict, composants Vue 3 `<script setup lang="ts">`

## Architecture

```
pages/                    # 2 pages (index, projet detail)
components/               # ~32 composants Vue (panels, cards, modals, charts)
composables/              # useToast()
stores/                   # 9 Pinia stores (composition API)
types/                    # Interfaces TypeScript pour chaque domaine
server/
  api/                    # ~31 routes Nitro (GET/POST/PATCH/DELETE)
  utils/                  # upsun-auth.ts, upsun-client.ts, autoscaling-engine.ts
  plugins/                # Plugin démarrant le moteur d'autoscaling
assets/css/main.css       # Tailwind base + composants (.card, .btn-primary, .input-field)
```

## Commandes

```bash
npm run dev               # Serveur dev (peut échouer si NUXT_VITE_NODE_OPTIONS manque)
npm run build             # Build production
npm run preview           # Preview du build (charge le .env)
npx nuxt preview --port 3002  # Preview sur un port spécifique
```

## Variables d'environnement

```
NUXT_UPSUN_API_TOKEN=     # Token API Upsun (obligatoire)
```

Le `nuxt.config.ts` définit aussi `upsunApiBaseUrl` (https://api.upsun.com) et `upsunAuthUrl` (https://auth.api.platform.sh/oauth2/token).

## Conventions de code

### Stores Pinia

Pattern composition API systématique :
```ts
export const useXxxStore = defineStore('xxx', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { show } = useToast()
  // ...
  return { items, loading, error, fetchXxx, ... }
})
```

### Routes serveur API

- Les IDs d'environnement contiennent des `/` (ex: `feat/user-documentation`) → toujours utiliser `getQuery(event).environmentId` au lieu d'un paramètre d'URL
- Pattern : `server/api/{domaine}/[projectId].{method}.ts`
- Client API : `upsunFetch<T>(path, options?)` dans `server/utils/upsun-client.ts`
- Gestion 401 automatique avec refresh token

### Composants

- Props typées via `defineProps<{...}>()`
- Emits typés via `defineEmits<{...}>()`
- Classes CSS utilitaires : `.card`, `.card-hover`, `.btn-primary`, `.btn-ghost`, `.input-field`
- Animations : `.animate-in`, `.delay-1` à `.delay-4`
- Couleurs sémantiques : `text-accent`, `text-success`, `text-warning`, `text-danger`, `text-dim`, `text-muted`

### Watchers d'initialisation

Quand un composant dépend d'un `selectedEnvId` :
```ts
watch(() => props.environments, (envs) => {
  if (envs.length && !selectedEnvId.value) {
    selectedEnvId.value = envs.find(e => e.is_main)?.id || envs[0].id
  }
}, { immediate: true })

watch(selectedEnvId, async (envId) => {
  if (!envId) return
  await store.fetchXxx(props.projectId, envId)
}, { immediate: true })
```

Les deux watchers doivent avoir `{ immediate: true }` pour que le second voie la valeur définie par le premier.

## API Upsun

Base URL : `https://api.upsun.com`

Endpoints principaux utilisés :
- `GET /projects/{pid}/environments` — lister les environnements
- `GET /projects/{pid}/environments/{eid}` — détail (inclut `sizing`, `resources_overrides`)
- `POST /projects/{pid}/environments/{eid}/{action}` — pause/resume/activate/deactivate/redeploy
- `GET /projects/{pid}/environments/{eid}/observability/resources/overview` — métriques (params: from, to, grain, types[], aggs[])
- `GET /projects/{pid}/environments/{eid}/backups` — sauvegardes
- `GET /projects/{pid}/environments/{eid}/domains` — domaines
- `GET /projects/{pid}/environments/{eid}/variables` — variables

### Endpoint autoscaling

L'API Upsun **n'a pas** d'endpoint autoscaling natif. Les configurations sont stockées localement via Nitro storage. Le moteur d'autoscaling tente de modifier les ressources via :
```
PATCH /projects/{pid}/environments/{eid}
Body: { resources: { "service_name": { instance_count: N } } }
```

## Moteur d'autoscaling

Fichier : `server/utils/autoscaling-engine.ts`

- Démarré automatiquement au lancement du serveur via `server/plugins/autoscaling.ts`
- Évalue toutes les 60 secondes tous les services avec autoscaling activé
- Métriques évaluées : **CPU**, **RAM**, **Disque**
- Actions : scale_up/scale_down instances, disk_increase
- Respecte le cooldown configuré entre chaque action
- Logs stockés dans `autoscaling:logs:{projectId}:{envId}`
- Storage des configs dans `autoscaling:{projectId}:{envId}`

## Points d'attention

- `nuxt dev` peut échouer avec "NUXT_VITE_NODE_OPTIONS.socketPath is not defined" → utiliser `nuxt preview` après build
- RTK (Rust Token Killer) est installé sur la machine dev — il masque les sorties curl dans le terminal (types au lieu de valeurs). Le navigateur reçoit le vrai JSON.
- Toujours tuer les anciens processus serveur avant de relancer (`pkill -f "nuxt preview"`)
- Le port 3000 est occupé par une autre app → utiliser le port 3002
- Les fichiers `.data/kv/` contiennent les configs autoscaling persistées — ne pas les supprimer
