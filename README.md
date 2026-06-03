# 🦁 Le Choc des Totems

> Application web de pronostics pour la **Coupe du Monde FIFA 2026** où chaque nation est représentée par un animal totem légendaire.

Mobile-first · Multilingue (FR / EN / ES) · PWA · Mode sombre exclusif · Optimisée TikTok

---

## 📋 Sommaire

- [Concept](#-concept)
- [Stack technique](#-stack-technique)
- [Fonctionnalités](#-fonctionnalités)
- [Démarrage rapide](#-démarrage-rapide)
- [Structure du projet](#-structure-du-projet)
- [Variables d'environnement](#-variables-denvironnement)
- [Base de données](#-base-de-données)
- [API publique](#-api-publique)
- [API admin](#-api-admin)
- [Tests](#-tests)
- [Sécurité](#-sécurité)
- [Monétisation](#-monétisation)
- [Déploiement](#-déploiement)
- [Configuration manuelle](#-configuration-manuelle)

---

## 🎯 Concept

Chaque équipe nationale est représentée par un **animal totem** :

| Nation | Totem |
|---|---|
| 🇫🇷 France | 🐓 Le Coq Gaulois |
| 🇸🇳 Sénégal | 🦁 Le Lion Royal |
| 🇧🇷 Brésil | 🐆 A Onça Pintada (Jaguar) |
| 🇦🇷 Argentine | 🐾 La Albiceleste (Puma) |
| 🇲🇦 Maroc | 🦁 L'Atlas Totem |
| ... | ... 48 nations qualifiées |

Les utilisateurs pronostiquent les matchs, accumulent des points, débloquent des badges et grimpent dans le classement.

---

## 🛠 Stack technique

### Frontend
- **Next.js 16** (App Router, Turbopack)
- **TypeScript** strict
- **React 19**
- **Tailwind CSS 4** (config via `@theme` dans `globals.css`)
- **Framer Motion** (animations)
- **Zustand** (state global utilisateur)
- **React Query** (cache serveur)
- **React Hook Form** + **Zod v4** (formulaires)
- **next-intl** (i18n FR/EN/ES)
- **react-icons** + **lucide-react**

### Backend
- **Next.js Server Actions & API Routes**
- **Prisma 7** (ORM, adapter `@prisma/adapter-pg`)
- **Supabase PostgreSQL** (BDD managée)

### Intégrations
- **API-Football** (sync automatique scores WC 2026)
- **Vercel Cron** (sync toutes les 15 min)
- Affiliés paris : **Stake / 1xBet / Betclic / Winamax / Premier Bet / bet365**
- Affiliés streaming : **Canal+ / beIN / DAZN / Fubo / SuperSport / FIFA+**
- **Amazon Associates** (20 marketplaces géo-ciblés)

### Tests & qualité
- **Vitest** (tests unitaires, 57 tests)
- **ESLint** + **TypeScript strict**

### Auth
- Connexion **anonyme par pseudo** (UUID local)
- LocalStorage — aucun mot de passe
- Email optionnel pour newsletter

### Déploiement
- **Vercel** (recommandé)
- Cron jobs natifs
- PWA installable (manifest + service worker)

---

## ✨ Fonctionnalités

### Côté public
- ✅ Pronostics sur 72+ matchs de la phase de groupes
- ✅ Vote en 1 clic : Victoire A / Match nul / Victoire B
- ✅ Statistiques communauté en temps réel
- ✅ Classement live avec podium animé Top 3
- ✅ Profil avec badges, séries, taux de réussite
- ✅ Historique avec filtres (Gagnés / Perdus / En attente)
- ✅ Pages match SEO-optimisées (`/match/<slug>`)
- ✅ Partage natif (Web Share API + clipboard fallback)
- ✅ PWA installable Android / iOS
- ✅ Mode sombre exclusif

### Côté admin (`/admin`)
- ✅ Dashboard avec stats globales
- ✅ Gestion des matchs (créer / modifier / supprimer / score)
- ✅ Gestion des totems
- ✅ Gestion des utilisateurs (suspendre, voir détails)
- ✅ **Édition inline des groupes** (changer la composition d'un groupe)
- ✅ Synchronisation manuelle API-Football
- ✅ Export newsletter CSV
- ✅ Régénération du calendrier officiel FIFA

### Gamification
- **+1 point** par pronostic correct
- **+5 points** bonus à 3 bons pronostics d'affilée
- **+10 points** bonus à 5 bons pronostics d'affilée
- **+25 points** bonus à 10 bons pronostics d'affilée
- **6 badges** : Oracle, Prédateur, Alpha, Légende, Champion Totem, Invincible

---

## 🚀 Démarrage rapide

### Pré-requis

- Node.js **20+**
- Compte Supabase (gratuit)
- Compte Vercel (gratuit) pour le déploiement

### Installation

```bash
# 1. Cloner le projet
git clone <repo-url> le-choc-des-totems
cd le-choc-des-totems

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Édite .env (voir section "Variables d'environnement")

# 4. Initialiser la base de données
npm run db:push
npm run db:seed

# 5. Lancer en développement
npm run dev
```

L'app est disponible sur [http://localhost:3000](http://localhost:3000).
L'admin sur [http://localhost:3000/admin](http://localhost:3000/admin) (mot de passe = `ADMIN_SECRET`).

---

## 📁 Structure du projet

```
le-choc-des-totems/
├── prisma/
│   ├── schema.prisma          # Modèles BDD
│   └── seed.ts                # Données initiales WC 2026
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # Icônes PWA
├── messages/                  # i18n FR/EN/ES
├── src/
│   ├── app/
│   │   ├── [locale]/          # Pages localisées
│   │   │   ├── page.tsx       # Accueil
│   │   │   ├── matchs/        # Liste matchs
│   │   │   ├── match/[slug]/  # Page match SEO
│   │   │   ├── groupes/       # 12 groupes WC
│   │   │   ├── classement/    # Leaderboard
│   │   │   ├── historique/    # Historique votes
│   │   │   ├── profil/        # Profil user
│   │   │   └── admin/         # Espace admin
│   │   ├── api/               # API routes
│   │   ├── robots.ts          # SEO
│   │   └── sitemap.ts         # SEO dynamique
│   ├── components/
│   │   ├── auth/              # LoginModal
│   │   ├── home/              # Hero, MatchOfTheDay, ...
│   │   ├── match/             # MatchCard, VoteSection, ...
│   │   ├── monetization/      # CTAs affiliés
│   │   ├── providers/         # AuthProvider
│   │   └── ui/                # Flag, ...
│   ├── lib/
│   │   ├── prisma.ts          # Client Prisma
│   │   ├── auth.ts            # LocalUser (UUID)
│   │   ├── utils.ts           # Helpers
│   │   ├── scoring.ts         # Calcul points/badges
│   │   ├── football-api.ts    # Client API-Football
│   │   ├── match-sync.ts      # Sync scores
│   │   ├── affiliates.ts      # Affiliés paris
│   │   ├── streaming.ts       # Diffuseurs TV
│   │   └── gear.ts            # Amazon Associates
│   ├── store/                 # Zustand stores
│   ├── i18n/                  # next-intl config
│   ├── types/                 # TypeScript types
│   └── proxy.ts               # Next 16 = proxy
├── next.config.ts             # + security headers
├── vercel.json                # Cron config
├── vitest.config.ts           # Tests config
└── configuration.md           # ← Guide manuel
```

---

## 🔐 Variables d'environnement

Toutes les variables (avec exemples) sont dans `.env.example`.

| Variable | Description | Obligatoire |
|---|---|:-:|
| `DATABASE_URL` | URL Postgres Supabase (session mode pour `db:push`) | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | ✅ |
| `ADMIN_SECRET` | Mot de passe admin (rotation prod) | ✅ |
| `CRON_SECRET` | Auth du cron Vercel (`openssl rand -hex 32`) | ✅ |
| `FOOTBALL_API_KEY` | Clé api-sports.io (100 req/jour gratuit) | ⚠️ Sync auto |
| `NEXT_PUBLIC_SITE_URL` | URL canonique (pour SEO/sitemap) | ✅ Prod |

⚠️ **Ne jamais commiter `.env`** — déjà dans `.gitignore`.

---

## 🗄 Base de données

### Schéma

7 modèles principaux :

- **User** — pseudo, email (optionnel), points, streak, suspended
- **Totem** — nation, animal, description, image
- **Match** — homeTotem / awayTotem, scheduledAt, status, scores, group, round
- **Vote** — userId + matchId unique, prediction, isCorrect
- **Badge** + **UserBadge** — gamification
- **AdBanner** — bannières publicitaires (admin)

### Commandes

```bash
npm run db:push        # Synchronise schema → BDD (sans migration)
npm run db:migrate     # Crée une migration versionnée
npm run db:seed        # Charge les 48 nations + 72 matchs
npm run db:studio      # UI Prisma Studio
```

---

## 🌐 API publique

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/matches` | Liste tous les matchs |
| `GET` | `/api/matches/[slug]` | Détails d'un match |
| `GET` | `/api/groups` | Composition + classement des 12 groupes |
| `GET` | `/api/leaderboard` | Top utilisateurs |
| `GET` | `/api/totems` | Les 48 totems |
| `GET` | `/api/votes?userId=X&matchId=Y` | Vote d'un user pour un match |
| `POST` | `/api/votes` | Voter (rate-limited 1/2s) |
| `GET` | `/api/users/[id]` | Profil public (sans email) |
| `GET` | `/api/users/[id]/history` | Historique des votes |
| `POST` | `/api/users` | Créer / mettre à jour user |

Validation **Zod** systématique. Réponses **JSON**.

---

## 🔒 API admin

Toutes les routes admin requièrent le header :

```
x-admin-secret: <ADMIN_SECRET>
```

| Méthode | Route | Description |
|---|---|---|
| `GET POST` | `/api/admin/matches` | CRUD matchs |
| `PATCH DELETE` | `/api/admin/matches/[id]` | Update score / supprimer |
| `PATCH` | `/api/admin/groups/[letter]` | **Modifier composition d'un groupe** |
| `GET POST PATCH DELETE` | `/api/admin/totems` | CRUD totems |
| `GET` | `/api/admin/users` | Liste users |
| `PATCH` | `/api/admin/users/[id]` | Suspendre |
| `POST` | `/api/admin/seed-worldcup` | Régénérer tout le calendrier |
| `POST` | `/api/admin/sync-fixtures` | Sync manuelle API-Football |
| `GET` | `/api/admin/newsletter?format=csv` | Export newsletter |
| `GET` | `/api/admin/stats` | Dashboard stats |

### Cron Vercel

| Méthode | Route | Auth |
|---|---|---|
| `GET` | `/api/cron/sync-matches` | `Authorization: Bearer <CRON_SECRET>` |

Schedule : `*/15 * * * *` (toutes les 15 minutes).

---

## 🧪 Tests

```bash
npm test                  # Lance la suite (57 tests)
npm run test:watch        # Mode watch (dev)
npm run test:coverage     # Avec couverture
```

**Couverture actuelle** : utilitaires purs (`utils`, `football-api`, `affiliates`, `streaming`, `gear`).

> Les routes API et logique Prisma ne sont pas testées en unitaire (nécessite Postgres) — tests d'intégration à ajouter avec Testcontainers le cas échéant.

---

## 🛡 Sécurité

### Mesures actives

- ✅ **Prisma ORM** → pas d'injection SQL
- ✅ **Zod** valide tous les inputs POST/PATCH
- ✅ **React** échappe le XSS par défaut
- ✅ **Liens externes** : `rel="sponsored noopener noreferrer"`
- ✅ **Rate limiting** votes (1 / 2s par user+match)
- ✅ **Vote unique** par user+match (contrainte BDD)
- ✅ **Headers HTTP** : HSTS, CSP basique, X-Frame-Options DENY, etc. (cf. `next.config.ts`)
- ✅ **Endpoint utilisateur public ne leak pas email** (select Prisma restrictif)
- ✅ **Admin secret par header**, pas de cookie
- ✅ **CRON_SECRET** séparé pour Vercel Cron
- ✅ `robots.txt` bloque `/admin` et `/api`

### À surveiller

- Le rate limiter votes est **in-memory** → ne couvre pas le multi-instance Vercel
- Considérer **Upstash Redis** ou **Vercel KV** en cas de trafic massif
- `next-pwa` a des transitives vulnérables (`workbox-build`, `serialize-javascript`) — **build-time uniquement**, pas exploitable runtime. Migration future vers `@serwist/next` recommandée.

---

## 💰 Monétisation

3 leviers intégrés :

### 1. Affiliation paris sportifs
- 6 bookmakers géo-ciblés
- Carte discrète après vote (`PostVoteAffiliate`)
- Dismiss 24h via localStorage

### 2. Affiliation streaming
- 6 diffuseurs (Canal+, beIN, DAZN, Fubo, SuperSport, FIFA+)
- Bandeau "Regarder en direct" sur page match

### 3. Amazon Associates
- 20 marketplaces (FR, US, DE, ES, UK, JP, BR, MX...)
- Popup **"Équipe-toi pour ce duel"** : maillots, ballons, drapeaux, TV 4K
- Tag par marketplace (Amazon impose 1 compte par pays)

➡️ Tracking links à remplir dans `src/lib/affiliates.ts`, `streaming.ts`, `gear.ts`.

Détails complets → [configuration.md](./configuration.md).

---

## 🚢 Déploiement

### Vercel (recommandé)

```bash
# 1. Pusher sur GitHub/GitLab
git push origin main

# 2. Importer dans Vercel
# https://vercel.com/new

# 3. Configurer les Environment Variables (cf. configuration.md)

# 4. Déployer
# → automatique au push, cron activé via vercel.json
```

### Checklist avant prod

- [ ] `npm test` passe (57/57)
- [ ] `npm run build` passe sans warning
- [ ] **Tous les `YOUR_XXX`** remplacés dans `src/lib/{affiliates,streaming,gear}.ts`
- [ ] `ADMIN_SECRET` rotation (différent de `kelenix`)
- [ ] `CRON_SECRET` généré (`openssl rand -hex 32`)
- [ ] `FOOTBALL_API_KEY` rempli
- [ ] `DATABASE_URL` pointe sur Supabase **pgbouncer** (port 6543) en prod
- [ ] `NEXT_PUBLIC_SITE_URL` à l'URL canonique
- [ ] Domaine custom configuré dans Vercel
- [ ] `npm run db:seed` lancé contre la BDD prod
- [ ] Programme Amazon Associates approuvé pour chaque marketplace
- [ ] Comptes affiliés activés (Stake, 1xBet, Canal+, DAZN…)

➡️ Guide pas-à-pas → [configuration.md](./configuration.md).

---

## 📚 Configuration manuelle

Tout ce que tu dois faire **manuellement** (créer comptes, copier clés, etc.) est listé dans :

📄 [**configuration.md**](./configuration.md)

---

## 📄 Licence

Projet privé — © 2026 LeChocDesTotems.

---

## 🤝 Contribuer

Pull requests bienvenues. Avant de PR :

```bash
npm test          # Doit passer
npm run lint      # Doit passer
npm run build     # Doit passer
```
