# 🔧 Guide de Configuration — Le Choc des Totems

> Toutes les actions **manuelles** à effectuer avant la mise en production.
> Suis l'ordre, tout est checkbox ✅.

---

## 📋 Sommaire

1. [Base de données — Supabase](#1-base-de-données--supabase)
2. [Hébergement — Vercel](#2-hébergement--vercel)
3. [Secrets de production](#3-secrets-de-production)
4. [API-Football (sync automatique)](#4-api-football-sync-automatique)
5. [Cron Vercel](#5-cron-vercel)
6. [Domaine custom](#6-domaine-custom)
7. [Affiliation paris sportifs](#7-affiliation-paris-sportifs)
8. [Affiliation streaming](#8-affiliation-streaming)
9. [Amazon Associates (boutique)](#9-amazon-associates-boutique)
10. [Plateforme email / Newsletter](#10-plateforme-email--newsletter)
11. [SEO & réseaux sociaux](#11-seo--réseaux-sociaux)
12. [Analytics](#12-analytics)
13. [TikTok / Marketing](#13-tiktok--marketing)
14. [Récapitulatif Environment Variables](#14-récapitulatif-environment-variables)
15. [Vérifications finales](#15-vérifications-finales)

---

## 1. Base de données — Supabase

> ⏱ ~10 min · 💰 Gratuit (free tier 500 MB)

### Étapes

- [ ] **Créer un compte** : [supabase.com](https://supabase.com)
- [ ] **Créer un nouveau projet**
  - Region : choisir la plus proche (`eu-west-1` pour FR/Afrique, `us-east-1` pour USA)
  - Mot de passe BDD : **fort** (à conserver dans un gestionnaire de mots de passe)
- [ ] **Récupérer 2 URLs** dans `Project Settings → Database → Connection string` :
  - **Session mode (port 5432)** pour `db:push` et migrations
  - **Transaction pooler (port 6543, pgbouncer)** pour la prod
- [ ] **Copier l'URL d'API + clé anon** : `Project Settings → API`

### Remplir `.env` local

```env
# Pour les commandes db:push / db:migrate / db:seed (port 5432)
DATABASE_URL="postgresql://postgres.xxxxx:VOTRE_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Initialiser la base

```bash
npm run db:push      # Crée toutes les tables
npm run db:seed      # Charge les 48 nations + 72 matchs
```

✅ **Test** : Va sur Supabase → `Table Editor` → tu dois voir `Totem` (48 lignes), `Match` (72), `Badge` (6).

---

## 2. Hébergement — Vercel

> ⏱ ~5 min · 💰 Gratuit (Hobby tier)

- [ ] **Créer un compte** : [vercel.com](https://vercel.com)
- [ ] **Pusher le code sur GitHub/GitLab/Bitbucket** :
  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin <ton-repo>
  git push -u origin main
  ```
- [ ] **Importer le projet** : Vercel → `New Project` → sélectionner le repo
- [ ] **Framework preset** : Next.js (auto-détecté)
- [ ] **Build command** : `npm run build` (par défaut)
- [ ] **Ne pas déployer encore** — d'abord remplir les Environment Variables (étape 3)

---

## 3. Secrets de production

### 3.1 Rotation `ADMIN_SECRET`

Le secret par défaut `kelenix` est **public** dans le repo — **change-le obligatoirement** :

```bash
# Génère un secret fort
openssl rand -hex 32
# Exemple : 7c3f9a... (32 chars hex)
```

### 3.2 Générer `CRON_SECRET`

```bash
openssl rand -hex 32
```

### 3.3 Remplir dans Vercel

Vercel → ton projet → `Settings → Environment Variables` :

| Variable | Valeur | Environnement |
|---|---|---|
| `DATABASE_URL` | `postgresql://...:6543/postgres?pgbouncer=true` (transaction pooler) | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | All |
| `ADMIN_SECRET` | (32 chars hex générés) | All |
| `CRON_SECRET` | (32 chars hex générés) | Production |
| `FOOTBALL_API_KEY` | (étape 4) | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://lechocdestotems.com` | Production |

⚠️ **N'utilise pas le pooler (port 6543) en local** pour `db:push` car pgbouncer ne supporte pas les schemas DDL.

---

## 4. API-Football (sync automatique)

> ⏱ ~5 min · 💰 Gratuit (100 req/jour)

- [ ] **Inscription** : [dashboard.api-football.com/register](https://dashboard.api-football.com/register)
- [ ] **Vérifier l'email**, te connecter
- [ ] **My Access → API Key** — copier la clé
- [ ] **Coller dans Vercel** : `FOOTBALL_API_KEY` (étape 3)
- [ ] **Coller aussi en local** : `.env` → `FOOTBALL_API_KEY="ta_clé"`

### Test

```bash
curl -X POST -H "x-admin-secret: TON_ADMIN_SECRET" http://localhost:3000/api/admin/sync-fixtures
```

Tu dois voir : `{ ok: true, totalFixtures: 72, matched: 72, ... }` *(quand la WC sera créée côté API)*.

> 💡 Le plan gratuit suffit largement : avec 1 sync toutes les 15 min → 96 req/jour.

---

## 5. Cron Vercel

> Activé automatiquement via `vercel.json` au déploiement.

Vérifie :
- [ ] **Vercel → ton projet → `Settings → Cron Jobs`** → tu dois voir `/api/cron/sync-matches` (`*/15 * * * *`)
- [ ] **Logs** : Vercel → `Deployments → Functions → /api/cron/sync-matches` après 15 min

⚠️ **Hobby tier limite** : 2 crons par projet, 1 exécution / jour. Pour notre cas (sync toutes les 15 min), il faut **Pro tier (20$/mois)** sinon le cron ne tournera que 1× / jour.

**Alternative gratuite** si Hobby suffit :
- Utiliser [cron-job.org](https://cron-job.org) (gratuit, illimité) qui appelle `/api/cron/sync-matches` avec le header `Authorization: Bearer <CRON_SECRET>` toutes les 15 min

---

## 6. Domaine custom

> ⏱ ~30 min (propagation DNS) · 💰 ~10 €/an

- [ ] **Acheter un domaine** chez OVH, Namecheap, Cloudflare, etc.
  - Suggestions : `lechocdestotems.com`, `lechocdestotems.app`, `chocdestotems.com`
- [ ] **Vercel → Settings → Domains** → `Add Domain`
- [ ] **Suivre les instructions DNS** :
  - Type A : `76.76.21.21`
  - Ou CNAME `cname.vercel-dns.com`
- [ ] **Attendre propagation** (5-30 min)
- [ ] **Mettre à jour** `NEXT_PUBLIC_SITE_URL` dans Vercel avec ton nouveau domaine

---

## 7. Affiliation paris sportifs

> 💰 Potentiel : 50-200 € par inscription convertie

### 7.1 Stake (recommandé international)

- [ ] [stake.com/affiliate-program](https://stake.com/affiliate-program) → inscription
- [ ] Récupère ton **affiliate code** ou tracking link
- [ ] **Édite** [src/lib/affiliates.ts](src/lib/affiliates.ts) ligne ~30 :
  ```ts
  signupUrl: "https://stake.com/?c=TON_CODE&offer=lechocdestotems",
  ```

### 7.2 1xPartners (Afrique francophone + Russie + LATAM)

- [ ] [1xpartners.com](https://1xpartners.com) → inscription
- [ ] Récupère ton **tag**
- [ ] **Édite** [src/lib/affiliates.ts](src/lib/affiliates.ts) :
  ```ts
  signupUrl: "https://1xbet.com/?tag=TON_TAG",
  ```

### 7.3 Betclic (France/Portugal/Italie)

- [ ] [partner.betclic.com](https://partner.betclic.com) → inscription
- [ ] **Édite** [src/lib/affiliates.ts](src/lib/affiliates.ts) :
  ```ts
  signupUrl: "https://www.betclic.fr/?prm=TON_PRM",
  ```

### 7.4 Winamax (France/Espagne)

- [ ] [winamax-partenaires.com](https://www.winamax-partenaires.com) → inscription
- [ ] **Édite** :
  ```ts
  signupUrl: "https://www.winamax.fr/?ref=TON_REF",
  ```

### 7.5 Premier Bet (Afrique francophone — TRÈS lucratif)

- [ ] Contact via [premierbet.com](https://premierbet.com) section affiliés (varie par pays)
- [ ] **Édite** :
  ```ts
  signupUrl: "https://premierbet.com/?aff=TON_AFF",
  ```

### 7.6 bet365 (Royaume-Uni + global)

- [ ] [members.bet365affiliates.com](https://members.bet365affiliates.com) → inscription (approbation manuelle)
- [ ] **Édite** :
  ```ts
  signupUrl: "https://www.bet365.com/?affiliate=TON_AFF",
  ```

> 💡 Tu n'es **pas obligé** de t'inscrire aux 6 — au minimum **2-3** (1 pour ton pays + 1 international). Le code fonctionne avec les autres en placeholder ; ils ne s'afficheront simplement pas si l'utilisateur clique car les URLs ne convertissent pas.

---

## 8. Affiliation streaming

> 💰 Potentiel : 10-50 € par abonnement

### 8.1 Canal+ (FR + Afrique francophone)

- [ ] [partenaires.canalplus.com](https://partenaires.canalplus.com) → demande de partenariat
- [ ] **Édite** [src/lib/streaming.ts](src/lib/streaming.ts) :
  ```ts
  signupUrl: "https://www.canalplus.com/?utm_source=TON_TAG",
  ```

### 8.2 DAZN (DE/IT/ES/JP/BR)

- [ ] [dazngroup.com](https://www.dazngroup.com) → contact partenariat
- [ ] **Édite** :
  ```ts
  signupUrl: "https://www.dazn.com/?ref=TON_REF",
  ```

### 8.3 beIN SPORTS

- [ ] [beinmediagroup.com](https://www.beinmediagroup.com) → contact affiliation
- [ ] **Édite** : `signupUrl: "https://www.beinsports.com/?aff=TON_AFF",`

### 8.4 Fubo (USA/Canada)

- [ ] [fubo.tv/partners](https://www.fubo.tv/partners) (programme Impact)
- [ ] **Édite** : `signupUrl: "https://www.fubo.tv/?irad=TON_IRAD",`

### 8.5 SuperSport (Afrique anglophone)

- [ ] Contact via [supersport.com](https://www.supersport.com)
- [ ] **Édite** : `signupUrl: "https://www.supersport.com/?aff=TON_AFF",`

### 8.6 FIFA+ (fallback gratuit)

- [ ] **Pas d'affiliation** — c'est gratuit
- [ ] **Laisser tel quel** dans [streaming.ts](src/lib/streaming.ts)

---

## 9. Amazon Associates (boutique)

> 💰 Potentiel : 3-10% commission

⚠️ **Amazon impose UN COMPTE PAR MARKETPLACE** (Amazon.fr ≠ Amazon.com ≠ Amazon.de).

### Plan d'action

Commence par ton pays principal :

| Pays | URL inscription | Quand t'inscrire |
|---|---|---|
| 🇫🇷 France | [partenaires.amazon.fr](https://partenaires.amazon.fr) | **Prioritaire** si audience FR/BE/AF francophone |
| 🇺🇸 USA | [affiliate-program.amazon.com](https://affiliate-program.amazon.com) | Si audience anglophone |
| 🇩🇪 Allemagne | [partnernet.amazon.de](https://partnernet.amazon.de) | Si trafic DACH |
| 🇪🇸 Espagne | [afiliados.amazon.es](https://afiliados.amazon.es) | Si trafic ES/LATAM |
| 🇬🇧 UK | [affiliate-program.amazon.co.uk](https://affiliate-program.amazon.co.uk) | Si trafic UK |
| 🇮🇹 Italie | [programma-affiliazione.amazon.it](https://programma-affiliazione.amazon.it) | Si trafic IT |
| 🇧🇷 Brésil | [associados.amazon.com.br](https://associados.amazon.com.br) | Si trafic BR |
| 🇯🇵 Japon | [affiliate.amazon.co.jp](https://affiliate.amazon.co.jp) | Si trafic JP |

### Étapes par marketplace

- [ ] **Inscription** sur le site Associates du pays
- [ ] **Site web** : `https://lechocdestotems.com` (ou ton domaine custom)
- [ ] **Catégorie** : Sport / Loisirs
- [ ] **Description** : "Application de pronostics Coupe du Monde FIFA 2026"
- [ ] **Récupérer ton Tracking ID** (format `nom-21` pour EU, `nom-20` pour US)
- [ ] **Édite** [src/lib/gear.ts](src/lib/gear.ts) → remplace `YOUR_AMAZON_XX_TAG-XX` :
  ```ts
  FR: { host: "amazon.fr", tag: "lechocdes-21", lang: "fr" },
  US: { host: "amazon.com", tag: "lechocdes-20", lang: "en" },
  // ...
  ```

⚠️ **Conditions Amazon** :
- Tu dois faire **3 ventes qualifiées en 180 jours** pour rester actif
- **Disclaimer obligatoire** : déjà intégré dans `GearShopModal.tsx`
- **Ne jamais utiliser** de raccourcisseur (bit.ly) ou cache de prix

---

## 10. Plateforme email / Newsletter

> 💰 Gratuit jusqu'à 2-3k abonnés selon plateforme

### Choisir une plateforme

| Plateforme | Plan gratuit | Recommandé pour |
|---|---|---|
| **Brevo** (ex-Sendinblue) | 300 emails/jour | ⭐ FR + automation |
| **Mailchimp** | 500 contacts | Simple, interface |
| **Buttondown** | 100 abonnés | Minimaliste, dev-friendly |
| **MailerLite** | 1000 abonnés + 12k emails/mois | Best free tier |

### Workflow

- [ ] **Créer un compte** chez le provider choisi
- [ ] **Créer une liste** "Le Choc des Totems"
- [ ] **Pour ajouter les abonnés**, 2 options :

#### Option A — Manuel (simple, 1× / semaine)

```bash
# Télécharge le CSV depuis l'admin
curl -H "x-admin-secret: TON_SECRET" \
  "https://lechocdestotems.com/api/admin/newsletter?format=csv" \
  -o subscribers.csv

# Importe dans Brevo/Mailchimp via leur UI
```

#### Option B — Sync automatique via webhook

À ajouter plus tard si volume important — pas critique au lancement.

### Premier email recommandé

> **Objet** : 🔥 Le Choc des Totems — le tournoi de pronostics commence !
> **Contenu** : présentation + lien vers le 1er match + invitation à voter

---

## 11. SEO & réseaux sociaux

### Open Graph / Twitter Card

Vérifie/édite **[src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx)** :

```ts
export const metadata: Metadata = {
  title: "Le Choc des Totems — Pronostics Coupe du Monde 2026",
  description: "...",
  openGraph: {
    title: "Le Choc des Totems",
    images: ["/og-image.png"],   // ← À créer
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};
```

### Image Open Graph

- [ ] **Créer une image 1200×630 px** : logo + nom + tagline
- [ ] **Déposer dans `public/og-image.png`**
- [ ] **Tester** : [opengraph.xyz](https://www.opengraph.xyz)

### Google Search Console

- [ ] [search.google.com/search-console](https://search.google.com/search-console)
- [ ] Ajouter ta propriété → vérifier via meta tag ou DNS
- [ ] Soumettre `https://lechocdestotems.com/sitemap.xml`

### Bing Webmaster

- [ ] [bing.com/webmasters](https://www.bing.com/webmasters) → import depuis Google

---

## 12. Analytics

### Vercel Analytics (recommandé)

- [ ] Vercel → ton projet → `Analytics` → `Enable`
- [ ] Gratuit jusqu'à 2500 events/mois

### Google Analytics 4

- [ ] [analytics.google.com](https://analytics.google.com) → créer propriété GA4
- [ ] Récupérer `G-XXXXXXXXXX`
- [ ] **Ajouter dans `src/app/[locale]/layout.tsx`** :
  ```tsx
  <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
  ```

> 💡 Les composants `PostVoteAffiliate`, `StreamingCTA`, `GearShopModal` envoient déjà des events `affiliate_click`, `streaming_click`, `gear_click` à `gtag` s'il est présent.

### Plausible / Umami (alternative privacy-friendly)

- [ ] [plausible.io](https://plausible.io) ou self-host Umami
- [ ] Plus respectueux RGPD que GA4

---

## 13. TikTok / Marketing

### Création compte TikTok

- [ ] **Username suggéré** : `@lechocdestotems`
- [ ] **Bio** : `🏆 Pronostique les duels de la Coupe du Monde 2026 · Lien dans la bio ⬇`
- [ ] **Lien bio** : ton domaine
- [ ] **Photo de profil** : logo doré sur fond noir

### Contenu type (idées virales)

- "Le Lion vs Le Coq — qui gagne selon vous ?"
- "Tu pronostiques ce match correct ? +100 points"
- Stats du jour : "Top 5 favoris selon vous"
- Récap résultats avec animations totems

### Autres canaux

- [ ] **Compte Instagram** `@lechocdestotems` (reposte les TikToks)
- [ ] **Twitter/X** `@lechocdestotems` (live tweets pendant les matchs)
- [ ] **WhatsApp Business** (pour groupes communauté)
- [ ] **Telegram** (chaîne de notifications)

---

## 14. Récapitulatif Environment Variables

À la fin de ta configuration, ton `.env` local et Vercel doivent contenir :

```env
# Base de données (Supabase)
DATABASE_URL="postgresql://...:5432/postgres"    # local (session)
# DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"  # Vercel

NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Secrets
ADMIN_SECRET="ton_secret_admin_32_chars_hex"
CRON_SECRET="ton_cron_secret_32_chars_hex"

# API-Football
FOOTBALL_API_KEY="ta_clé_api_football"

# URL prod (pour sitemap/robots/OG)
NEXT_PUBLIC_SITE_URL="https://lechocdestotems.com"
```

---

## 15. Vérifications finales

Avant d'annoncer le lancement, fais ce checklist :

### Tests techniques

- [ ] `npm test` → **57/57 passing**
- [ ] `npm run build` → **0 erreur**
- [ ] Lighthouse mobile > **90** (Performance, Accessibility, SEO)
- [ ] **PWA installable** sur Android + iOS (`Ajouter à l'écran d'accueil`)
- [ ] **Pages match SEO** : ouvrir [opengraph.xyz](https://www.opengraph.xyz) avec une URL match → preview OK

### Tests fonctionnels

- [ ] Créer un user, voter sur un match → vote enregistré
- [ ] Voir l'historique → vote présent
- [ ] Page admin accessible avec ton nouveau `ADMIN_SECRET`
- [ ] Cron Vercel → 1 exécution visible dans les logs après 15 min
- [ ] **CTA paris affilié** s'affiche après vote (et "Plus tard" cache 24h)
- [ ] **CTA streaming** s'affiche sur page match
- [ ] **Popup "Équipe-toi"** s'ouvre via le bouton 🛍 → produits Amazon affichent ton tag
- [ ] Newsletter export CSV téléchargeable

### Légal

- [ ] **Mentions légales** créées (`/mentions-legales`)
- [ ] **Politique de confidentialité** (mentionner email newsletter optionnel, RGPD)
- [ ] **CGU** simples
- [ ] **Cookies banner** si tu actives Google Analytics
- [ ] **Disclaimer +18** sur les CTA paris **déjà présent** ✅
- [ ] **Disclaimer Amazon Associates** **déjà présent** dans la modale ✅

### Monitoring post-lancement

- [ ] **Sentry** ou **Vercel Error Tracking** activé
- [ ] **Uptime monitoring** : [betterstack.com](https://betterstack.com) (gratuit)
- [ ] **Backup Supabase** : auto-activé en free tier (7 jours)

---

## 🆘 Support

Si tu bloques sur une étape :
- 📖 Re-lis la section concernée
- 🔍 Vérifie les logs Vercel (`Deployments → Functions → Logs`)
- 💬 Ouvre une issue dans le repo

---

## 🎉 C'est parti !

Une fois ce guide complété, tu peux **annoncer le lancement** :
- Post TikTok + Instagram + Twitter
- Email à ta liste (si tu en as déjà une)
- Demander à 10 amis de tester + partager

**Bonne Coupe du Monde 2026 !** 🏆🦁🐅
