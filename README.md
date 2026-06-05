# Prototype Innovation Responsable — INR

Application d'autodiagnostic de maturité numérique responsable pour les startups et leurs accompagnateurs.

## Stack technique

- **Frontend** : Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend / BDD** : Supabase (PostgreSQL + Auth + Storage)
- **Déploiement** : Vercel (recommandé)

## Installation

### 1. Cloner le repo

```bash
git clone https://github.com/[votre-repo]/prototype-innovation-responsable-inr.git
cd prototype-innovation-responsable-inr
npm install
```

### 2. Variables d'environnement

Copier `.env.example` en `.env.local` et renseigner les valeurs :

```bash
cp .env.example .env.local
```

Les clés se trouvent dans **Supabase > Project Settings > API** :
- `NEXT_PUBLIC_SUPABASE_URL` : Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : anon / public key
- `SUPABASE_SERVICE_ROLE_KEY` : service_role key (**ne jamais committer cette clé**)

### 3. Setup Supabase

Dans **Supabase > SQL Editor**, exécuter dans l'ordre :

```
supabase/schema.sql   ← Crée les 7 tables, les politiques RLS, le trigger et le bucket Storage
```

Puis importer les données de référence :
```
supabase/seed-questions.sql   ← Questionnaire de diagnostic (100 questions)
supabase/seed-resilience.sql  ← Référentiel IRN (critères de résilience)
```

### 4. Activer l'authentification email

Dans **Supabase > Authentication > Providers > Email** :
- Activer le provider Email
- En production : activer "Confirm email"
- En développement : désactiver "Confirm email" pour éviter les rate limits

### 5. Lancer en local

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/          ← Connexion + inscription
│   ├── admin/
│   │   └── users/          ← Interface d'administration (rôles, projets)
│   ├── api/
│   │   ├── admin-users/    ← Liste des utilisateurs (service_role)
│   │   └── admin-update-role/ ← Modification de rôle (service_role)
│   └── dashboard/
│       ├── etape-1/ à etape-6/  ← Parcours diagnostic
│       └── projects/       ← Liste et fiches projets
├── components/
│   └── RadarChart.tsx
├── hooks/
│   ├── useScoring.ts
│   └── useProjectGuard.ts  ← Sécurisation des pages étapes
└── lib/
    ├── supabase.ts          ← Client browser
    ├── supabase-server.ts   ← Client server (SSR)
    └── supabase-middleware.ts
supabase/
├── schema.sql               ← DDL complet + RLS + trigger
├── seed-questions.sql       ← Données questionnaire
└── seed-resilience.sql      ← Données référentiel IRN
middleware.ts                ← Protection des routes par rôle
```

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `user_startup` | Ses propres projets + parcours diagnostic |
| `user_accompagnateur` | Projets qui lui sont assignés (lecture + validation chartes) |
| `admin` | Interface d'administration complète |

## Sécurité

- **Middleware Next.js** : redirige les utilisateurs non connectés et protège `/admin/*`
- **Row Level Security (RLS)** : chaque table Supabase filtre les données selon le rôle
- **IDs non devinables** : les projets sont accessibles via un `public_id` UUID (non séquentiel)
- **Routes API** : les opérations admin utilisent la `service_role_key` côté serveur uniquement

## Déploiement sur Vercel

1. Connecter le repo GitHub à Vercel
2. Ajouter les 3 variables d'environnement dans les settings Vercel
3. Déployer — le build Next.js est automatique
