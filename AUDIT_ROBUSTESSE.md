# Audit de robustesse – GameJam Match

**Date** : 2 mars 2025  
**Objectif** : Vérification avant lancement public

---

## 1. Vérification des flux utilisateur (User Flows)

### 1.1 Création de profil (`/create-profile`)

| Point vérifié | Statut | Détails |
|---------------|--------|---------|
| Champs vides | ⚠️ Partiel | Les champs requis (username, role, level, engine, language, about) ont l’attribut HTML `required`. En cas de bypass (DevTools, API directe), des valeurs vides peuvent être envoyées. |
| Gestion des erreurs | ✅ OK | `try/catch` présent, `toast.error` en cas d’échec Supabase, pas de crash. |
| État non connecté | ✅ OK | Message clair "You must be signed in!" affiché. |
| Avatar Discord | ✅ OK | `existingProfile?.avatar_url ?? user.user_metadata?.avatar_url ?? null` — si pas d’avatar Discord, `null` est stocké. |

**Recommandation** : Ajouter une validation explicite côté client avant `upsert` (vérifier `role`, `level`, `engine`, `language` non vides).

---

### 1.2 Création d’équipe (`/create-team`)

| Point vérifié | Statut | Détails |
|---------------|--------|---------|
| `jam_style` / `team_vibe` | ✅ OK | Envoyé via `team_vibe: teamVibe \|\| null` (ligne 106). La colonne BDD est `team_vibe` (migration 20250302140000). |
| `experience_required` | ✅ OK | Envoyé via `experience_required: experienceRequired && experienceRequired !== "any" ? experienceRequired : null` (ligne 107). |
| Validation Discord link | ✅ OK | Regex `^https:\/\/discord\.(gg|com\/invite)\/` avant soumission. |
| Gestion des erreurs | ✅ OK | `try/catch`, toasts d’erreur. |

---

## 2. Audit base de données (Supabase)

### 2.1 Politiques RLS (Row Level Security)

| Table | Politique | Vérification |
|-------|-----------|--------------|
| `profiles` | SELECT : tous, INSERT/UPDATE/DELETE : `auth.uid() = id` | ✅ Un utilisateur ne peut pas modifier le profil d’un autre. |
| `teams` | SELECT : tous, INSERT/UPDATE/DELETE : `auth.uid() = user_id` | ✅ Seul le propriétaire peut modifier/supprimer. |
| `team_members` | INSERT : propriétaire ou soi-même, DELETE : propriétaire ou soi-même | ✅ OK. |
| `join_requests` | SELECT : sender ou propriétaire équipe, INSERT : selon type, UPDATE/DELETE : sender ou propriétaire | ✅ OK. |

**Conclusion** : Les RLS sont correctement configurées.

---

### 2.2 Race conditions

| Scénario | Risque | Détails |
|----------|--------|---------|
| Deux candidats pour la dernière place | 🔴 Critique | `handleAcceptApplication` insère dans `team_members` sans vérifier si le rôle est déjà rempli. Deux propriétaires (ou un double-clic) peuvent accepter plusieurs candidats pour le même rôle. |
| Deux utilisateurs rejoignant en même temps | 🔴 Critique | Même problème : aucune vérification du nombre de places restantes avant `INSERT`. |

**Correctif proposé** : Avant d’accepter une candidature, vérifier que le nombre de membres acceptés pour ce `target_role` est inférieur au nombre de places demandées pour ce rôle dans `looking_for`.

---

### 2.3 Suppression d’équipe avec demandes en attente

| Point vérifié | Statut | Détails |
|---------------|--------|---------|
| Contrainte FK `join_requests.team_id` | ⚠️ À vérifier | Si `ON DELETE RESTRICT`, la suppression échouera. Si `ON DELETE CASCADE`, les `join_requests` seront supprimées. Si pas de FK, données orphelines. |
| UX côté sender | ⚠️ | Si l’équipe est supprimée, les demandes "pending" peuvent pointer vers une équipe inexistante. Le dashboard affiche "Unknown team" via `app.teams?.team_name`. |

**Recommandation** : Migration avec `ON DELETE CASCADE` sur `join_requests.team_id` et `team_members.team_id` pour éviter les orphelins et permettre la suppression.

---

## 3. Erreurs cachées et performance

### 3.1 `console.log` / `console.error`

| Fichier | Ligne | Verdict |
|---------|-------|---------|
| `app/auth/callback/route.ts` | 21 | `console.error` — acceptable pour le serveur en cas d’erreur auth. Peut être remplacé par un logger en production. |

---

### 3.2 Variables `any`

| Fichier | Occurrences | Impact |
|---------|-------------|--------|
| `availability-form.tsx` | `user: any` (ligne 52) | Risque faible, mais préférable d’utiliser `User \| null` de Supabase. |
| `create-team-form.tsx` | `user: any` (ligne 50) | Idem. |
| `team-grid.tsx` | `formatTeam(t: any)`, `parsedRoles: any[]`, etc. | Risque moyen — bugs TypeScript possibles si la structure change. |
| `members-grid.tsx` | `formatMember(m: any)`, `teamsData as any[]` | Idem. |
| `dashboard-client.tsx` | `mapTeamRow`, `mapProfileRow`, etc. | Idem. |
| `use-notifications.ts` | `(a.teams as any)` | Risque faible. |

**Recommandation** : Typer correctement avec `TeamRow`, `ProfileRow` ou types Supabase générés.

---

### 3.3 Gestion des dates

| Point vérifié | Statut | Détails |
|---------------|--------|---------|
| `availability-form.tsx` | ✅ OK | `dateRange?.from` vérifié, `format()` de date-fns utilisé. Les dates viennent du Calendar (Date objets valides). |
| `player-card.tsx` `parseAvailability` | ✅ OK | `try/catch` autour de `parseISO()`. En cas de format invalide, retourne `{ label: trimmed, isWarning: false }` — pas de crash. |

---

### 3.4 Images (avatars)

| Point vérifié | Statut | Détails |
|---------------|--------|---------|
| `UserAvatar` | ✅ OK | Radix UI Avatar affiche automatiquement `AvatarFallback` si l’image échoue (404, chargement lent). |
| `members-grid` / `player-card` | ✅ OK | Fallback DiceBear si pas d’`avatar_url`. |
| URL cassée | ✅ OK | AvatarFallback avec initiales affichées. |

---

## 4. Edge cases (cas limites)

### 4.1 Utilisateur sans avatar Discord

**Statut** : ✅ Géré  
- `availability-form` : `avatar_url: ... ?? null`  
- `dashboard-client` `mapProfileRow` : `fallbackUrl` DiceBear si pas d’avatar  
- `UserAvatar` : ordre profile → discord → fallback → initiales  

---

### 4.2 Équipe supprimée avec demandes en attente

**Statut** : ⚠️ Selon FK  

- Si `ON DELETE CASCADE` : les `join_requests` sont supprimées. Les senders ne les verront plus.  
- Si `ON DELETE RESTRICT` : la suppression peut échouer.  
- Si pas de FK : orphelins, "Unknown team" affiché.  

**Recommandation** : S’assurer que les FK ont `ON DELETE CASCADE`.

---

### 4.3 Candidature vers une équipe inexistante

**Statut** : ⚠️  
- `JoinTeamModal` n’ vérifie pas si l’équipe existe avant l’insert.  
- Si l’équipe a été supprimée entre l’affichage de la grille et le clic "Apply", l’insert peut échouer (FK) ou créer une ligne orpheline.  

**Recommandation** : Vérifier l’existence de l’équipe avant insert, ou gérer l’erreur FK avec un message explicite.

---

## 5. Correctifs appliqués

### ✅ Correctifs critiques (effectués)

1. **Race condition sur acceptation** (`dashboard-client.tsx`) : Vérification que le rôle n’est pas déjà rempli avant d’accepter (comptage des `join_requests` acceptés pour ce `target_role`).  
2. **Validation profil** (`availability-form.tsx`) : Validation explicite de `role`, `level`, `engine`, `language`, `username`, `bio` avant upsert.  
3. **Migration FK** (`supabase/migrations/20250302150000_add_fk_cascade.sql`) : `ON DELETE CASCADE` pour `join_requests.team_id` et `team_members.team_id`.  
4. **Typage** : `user: any` remplacé par `User | null` dans `availability-form` et `create-team-form`.  
5. **JoinTeamModal** : Message d’erreur explicite en cas d’échec FK (équipe supprimée) : "This team may have been removed. Please refresh the page."

### ⏳ À faire (non critiques)

6. Typer `formatTeam`, `formatMember`, etc. avec des types Supabase/DB.  
7. Vérifier les noms des contraintes FK dans la migration si l’exécution échoue (noms peuvent varier selon Supabase).

---

## 6. Synthèse

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| Flux utilisateur | 8/10 | Bonne gestion globale, validation à renforcer. |
| Base de données | 7/10 | RLS OK, race condition à corriger. |
| Erreurs cachées | 7/10 | Peu de console.log, plusieurs `any` à typer. |
| Dates | 9/10 | Parsing robuste avec try/catch. |
| Images | 9/10 | Fallbacks et Radix bien utilisés. |
| Edge cases | 7/10 | Avatar Discord OK, équipe supprimée à clarifier. |

**Verdict** : Correction de la race condition et de la validation profil recommandée avant lancement public. Le reste peut suivre en post-lancement.
