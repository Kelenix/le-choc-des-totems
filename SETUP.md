# Le Choc des Totems — Guide de Configuration

## 1. Supabase (Base de Données)

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Récupérer les credentials : Settings → Database → Connection string
3. Modifier `.env` :

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
ADMIN_SECRET="votre-secret-admin-fort"
```

## 2. Initialiser la base de données

```bash
npm run db:push    # Pousse le schéma vers Supabase
npm run db:seed    # Injecte les totems et matchs de démo
```

## 3. Déployer sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement sur vercel.com
# Settings → Environment Variables → ajouter DATABASE_URL, ADMIN_SECRET, etc.
```

## 4. Administration

- Accéder à `/admin` 
- Le secret admin est `ADMIN_SECRET` dans `.env`
- Créer des matchs, gérer les totems, publier les résultats

## 5. Ajouter des matchs

Via l'admin ou l'API :
```bash
curl -X POST /api/admin/matches \
  -H "x-admin-secret: votre-secret" \
  -H "Content-Type: application/json" \
  -d '{"homeTotemId": "...", "awayTotemId": "...", "scheduledAt": "2026-07-01T20:00:00Z", "round": "Quart de finale"}'
```

## 6. Publier un résultat

```bash
curl -X PATCH /api/admin/matches/[id] \
  -H "x-admin-secret: votre-secret" \
  -H "Content-Type: application/json" \
  -d '{"status": "FINISHED", "homeScore": 2, "awayScore": 1, "result": "HOME"}'
```
→ Les points sont calculés automatiquement pour tous les votants.

## 7. Stack utilisée

- **Next.js 16** (App Router, SSR + Static)
- **Prisma 7** + **Supabase** (PostgreSQL)
- **Tailwind CSS 4** (Dark Mode uniquement)
- **Framer Motion** (animations)
- **Zustand** (state global)
- **React Query** (fetch/cache)
- **Zod** (validation)
- **PWA** (manifest.json)
- **Vercel** (déploiement)



NB: POUR AMAZION, JE COMPTE UTILISER L'AFFILIATION AMZON
FAIT TOUS LES TEST UNITAIRE.... ET DIT MOI SI LE SITE EST SECURISE ET PRETE POUR LA MISE EN LIGNE
EN SUITE ECRIT LA DOCUMENTATION readme.md PROFESSIONNELLE, STRUCTURE ET COMPLETE.
DONNE MOI ENSUITE TOUS LES ELEMENT QUE JE DOIT FAIRE MANUELEMENT ,  SA DOIT ETRE BIEN DETAILLE DANS UN FICHIER configuration.md
