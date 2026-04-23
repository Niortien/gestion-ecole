# API Reference — École Primaire Backend

## Base URL & Configuration

| Property | Value |
|---|---|
| **Base URL** | `http://localhost:8000/api` |
| **Port** | `8000` (env: `PORT`) |
| **Global prefix** | `/api` |
| **Swagger UI** | `http://localhost:8000/docs` |
| **Database** | PostgreSQL (TypeORM) |
| **Rate limit** | 100 req / 60 s |
| **Static files** | `GET /uploads/*` served statically |

## Authentication

Two passport strategies are configured:

| Strategy | Guard class | Usage |
|---|---|---|
| `local` | `LocalAuthGuard` | `POST /api/auth/login` only |
| `jwt` (Bearer) | `JwtAuthGuard` | Applied per-controller / per-route |

> **Note**: Most business-logic controllers access `req.user` but carry **no explicit `@UseGuards`** decorator in the current code — authentication enforcement is expected to be wired as a global guard or added per route. The `@ApiBearerAuth()` annotation on the Notifications module signals JWT requirement.

### User Roles (enum `UserRole`)

```
ADMIN | DIRECTEUR | MAITRE | PARENT | COMPTABLE
```

A `RolesGuard` + `@Roles(...roles)` decorator is available for role-based access control.

---

## Modules

### 1. `auth` — Authentication

**Base route**: `/api/auth`

| Method | Path | Guard | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | `LocalAuthGuard` | Login with email+password |
| `POST` | `/api/auth/register` | None | Register a new user |

#### DTO: `LoginDto`
| Field | Type | Constraints |
|---|---|---|
| `email` | `string` | `@IsEmail` |
| `password` | `string` | `@MinLength(8)` |

#### DTO: `CreateUserDto` (used for register)
| Field | Type | Constraints |
|---|---|---|
| `email` | `string` | `@IsEmail` |
| `password` | `string` | `@MinLength(8)` |
| `role` | `UserRole` (optional) | `@IsEnum(UserRole)` |

#### Response: `User` entity
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `email` | `string` | unique |
| `password` | `string` | **`@Exclude`** — never serialized |
| `role` | `UserRole` | default `PARENT` |
| `isActive` | `boolean` | default `true` |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

Login response: `{ access_token: string }` (JWT).

---

### 2. `annees-scolaires` — School Years

**Base route**: `/api/annees-scolaires`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/annees-scolaires` | Create a school year |
| `GET` | `/api/annees-scolaires` | List all school years |
| `GET` | `/api/annees-scolaires/active` | Get current active year |
| `GET` | `/api/annees-scolaires/:id` | Get one by id |
| `PUT` | `/api/annees-scolaires/:id` | Full update |
| `PATCH` | `/api/annees-scolaires/:id/activate` | Set as active year |
| `DELETE` | `/api/annees-scolaires/:id` | Delete |

#### DTO: `CreateAnneeScolaireDto`
| Field | Type | Constraints |
|---|---|---|
| `libelle` | `string` | `@Matches(/^\d{4}-\d{4}$/)` e.g. `"2025-2026"` |
| `dateDebut` | `string` (ISO date) | `@IsDateString` |
| `dateFin` | `string` (ISO date) | `@IsDateString` |
| `estActive` | `boolean` (optional) | default `false` |

`UpdateAnneeScolaireDto` = `PartialType(CreateAnneeScolaireDto)` (all fields optional).

#### Entity: `AnneeScolaire`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `libelle` | `string` | unique, e.g. `"2025-2026"` |
| `dateDebut` | `Date` | date column |
| `dateFin` | `Date` | date column |
| `estActive` | `boolean` | default `false` |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 3. `classes` — Classes

**Base route**: `/api/classes`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/classes` | — | Create a class |
| `GET` | `/api/classes` | `anneeScolaireId?` | List classes (optional filter) |
| `GET` | `/api/classes/:id` | — | Get one class |
| `PUT` | `/api/classes/:id` | — | Full update |
| `DELETE` | `/api/classes/:id` | — | Delete |

#### Enums

**`NomClasse`**: `PS | MS | GS | CP | CE1 | CE2 | CM1 | CM2`

**`NiveauClasse`**: `MATERNELLE | PRIMAIRE`

#### DTO: `CreateClasseDto`
| Field | Type | Constraints |
|---|---|---|
| `nom` | `NomClasse` | required |
| `libelle` | `string` (optional) | e.g. `"CE2 A"` |
| `niveau` | `NiveauClasse` | required |
| `capacite` | `number` (optional) | `@Min(1)`, default `30` |
| `anneeScolaireId` | `number` | required |

`UpdateClasseDto` = `PartialType(CreateClasseDto)`.

#### Entity: `Classe`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `nom` | `NomClasse` | enum |
| `libelle` | `string` | nullable |
| `niveau` | `NiveauClasse` | enum |
| `capacite` | `number` | default 30 |
| `anneeScolaire` | `AnneeScolaire` | eager |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 4. `matieres` — Subjects

**Base route**: `/api/matieres`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/matieres` | Create |
| `GET` | `/api/matieres` | List all |
| `GET` | `/api/matieres/:id` | Get one |
| `PUT` | `/api/matieres/:id` | Full update |
| `DELETE` | `/api/matieres/:id` | Delete |

#### Enum: `NiveauMatiere`
`MATERNELLE | PRIMAIRE | TOUS`

#### DTO: `CreateMatiereDto`
| Field | Type | Constraints |
|---|---|---|
| `nom` | `string` | required, e.g. `"Mathématiques"` |
| `code` | `string` | required, unique, e.g. `"MATH"` |
| `coefficient` | `number` (optional) | `@Min(0.5)`, default `1` |
| `niveau` | `NiveauMatiere` (optional) | default `TOUS` |

`UpdateMatiereDto` = `PartialType(CreateMatiereDto)`.

#### Entity: `Matiere`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `nom` | `string` | — |
| `code` | `string` | unique |
| `coefficient` | `decimal(4,2)` | default 1 |
| `niveau` | `NiveauMatiere` | default `TOUS` |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 5. `parents` — Parents

**Base route**: `/api/parents`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/parents` | Create (also creates linked User) |
| `GET` | `/api/parents` | List all |
| `GET` | `/api/parents/mon-profil` | Get own profile (from `req.user.id`) |
| `GET` | `/api/parents/:id` | Get one |
| `PUT` | `/api/parents/:id` | Full update |
| `DELETE` | `/api/parents/:id` | Delete |

#### DTO: `CreateParentDto`
| Field | Type | Constraints |
|---|---|---|
| `nom` | `string` | required |
| `prenom` | `string` | required |
| `email` | `string` | `@IsEmail` — used to create User account |
| `password` | `string` | `@MinLength(8)` — used to create User account |
| `telephone` | `string` (optional) | — |
| `telephoneUrgence` | `string` (optional) | — |
| `profession` | `string` (optional) | — |
| `adresse` | `string` (optional) | — |

`UpdateParentDto` = `PartialType(CreateParentDto)`.

#### Entity: `Parent`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `user` | `User` | eager, OneToOne |
| `nom` | `string` | — |
| `prenom` | `string` | — |
| `telephone` | `string` | nullable |
| `telephoneUrgence` | `string` | nullable |
| `profession` | `string` | nullable |
| `adresse` | `string` | nullable |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 6. `maitres` — Teachers

**Base route**: `/api/maitres`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/maitres` | Create (also creates linked User with role MAITRE) |
| `GET` | `/api/maitres` | List all |
| `GET` | `/api/maitres/mon-profil` | Get own profile (from `req.user.id`) |
| `GET` | `/api/maitres/:id` | Get one |
| `PUT` | `/api/maitres/:id` | Full update |
| `PATCH` | `/api/maitres/:id/classes` | Assign classes to teacher |
| `DELETE` | `/api/maitres/:id` | Delete |

#### DTO: `CreateMaitreDto`
| Field | Type | Constraints |
|---|---|---|
| `nom` | `string` | required |
| `prenom` | `string` | required |
| `email` | `string` | `@IsEmail` — creates User account |
| `password` | `string` | `@MinLength(8)` |
| `telephone` | `string` (optional) | — |
| `diplome` | `string` (optional) | — |
| `specialite` | `string` (optional) | — |
| `dateEmbauche` | `string` ISO date (optional) | — |

`UpdateMaitreDto` = `PartialType(CreateMaitreDto)`.

#### DTO: `AffectClassesDto`
| Field | Type | Constraints |
|---|---|---|
| `classeIds` | `number[]` | `@IsArray`, `@IsInt({ each: true })` |

#### Entity: `Maitre`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `user` | `User` | eager, OneToOne |
| `nom` | `string` | — |
| `prenom` | `string` | — |
| `telephone` | `string` | nullable |
| `diplome` | `string` | nullable |
| `specialite` | `string` | nullable |
| `dateEmbauche` | `Date` | nullable |
| `classes` | `Classe[]` | ManyToMany, lazy |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 7. `eleves` — Students

**Base route**: `/api/eleves`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/eleves` | — | Create |
| `GET` | `/api/eleves` | `classeId?`, `parentId?` | List (filterable) |
| `GET` | `/api/eleves/:id` | — | Get one |
| `PUT` | `/api/eleves/:id` | — | Full update |
| `PATCH` | `/api/eleves/:id/statut` | — | Change student status |
| `DELETE` | `/api/eleves/:id` | — | Delete |

#### Enums

**`Sexe`**: `M | F`

**`StatutEleve`**: `INSCRIT | TRANSFERE | ABANDONNE`

#### DTO: `CreateEleveDto`
| Field | Type | Constraints |
|---|---|---|
| `nom` | `string` | required |
| `prenom` | `string` | required |
| `dateNaissance` | `string` ISO date | required |
| `lieuNaissance` | `string` (optional) | — |
| `sexe` | `Sexe` | required |
| `numeroDossier` | `string` (optional) | — |
| `classeId` | `number` (optional) | — |
| `parentId` | `number` (optional) | — |

`UpdateEleveDto` = `PartialType(CreateEleveDto)`.

Body for `PATCH /:id/statut`: `{ statut: StatutEleve }`

#### Entity: `Eleve`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `nom` | `string` | — |
| `prenom` | `string` | — |
| `dateNaissance` | `Date` | date column |
| `lieuNaissance` | `string` | nullable |
| `sexe` | `Sexe` | enum |
| `photo` | `string` | nullable (URL) |
| `numeroDossier` | `string` | nullable |
| `statut` | `StatutEleve` | default `INSCRIT` |
| `classe` | `Classe` | eager, nullable |
| `parent` | `Parent` | eager, nullable |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 8. `presences` — Attendance

**Base route**: `/api/presences`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/presences/appel` | — | Record full class roll-call |
| `GET` | `/api/presences/classe/:classeId` | `date?` (YYYY-MM-DD) | Attendance for a class on a date |
| `GET` | `/api/presences/eleve/:eleveId` | `mois?` (YYYY-MM) | Attendance for a student by month |
| `GET` | `/api/presences/stats/classe/:classeId` | `anneeScolaireId` | Absence stats for a class |

#### Enum: `StatutPresence`
`PRESENT | ABSENT | RETARD | EXCUSE`

#### DTO: `AppelClasseDto` (body for `POST /appel`)
| Field | Type | Constraints |
|---|---|---|
| `classeId` | `number` | `@IsInt` |
| `date` | `string` ISO date | `@IsDateString` |
| `presences` | `Array<{ eleveId: number; statut: StatutPresence; motif?: string }>` | array |

#### Entity: `Presence`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `eleve` | `Eleve` | eager |
| `classe` | `Classe` | eager |
| `date` | `Date` | date column |
| `statut` | `StatutPresence` | default `PRESENT` |
| `motif` | `string` | nullable |
| `createdBy` | `User` | lazy, nullable |
| `createdAt` | `Date` | auto |

---

### 9. `notes` — Grades

**Base route**: `/api/notes`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/notes` | — | Create a grade |
| `GET` | `/api/notes/classe/:classeId` | `periode`, `anneeScolaireId` | Grades by class/period |
| `GET` | `/api/notes/eleve/:eleveId` | `anneeScolaireId` | Grades for a student |
| `PUT` | `/api/notes/:id` | — | Update grade |
| `DELETE` | `/api/notes/:id` | — | Delete grade |

#### Enum: `Periode`
`SEQUENCE1 | SEQUENCE2 | SEQUENCE3 | SEQUENCE4 | SEQUENCE5 | SEQUENCE6`

#### DTO: `CreateNoteDto`
| Field | Type | Constraints |
|---|---|---|
| `eleveId` | `number` | required |
| `matiereId` | `number` | required |
| `classeId` | `number` | required |
| `anneeScolaireId` | `number` | required |
| `periode` | `Periode` | required |
| `valeur` | `number` | `@Min(0)`, `@Max(20)` |
| `observation` | `string` (optional) | — |

`UpdateNoteDto` = `PartialType(CreateNoteDto)`.

#### Entity: `Note`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `eleve` | `Eleve` | eager |
| `matiere` | `Matiere` | eager |
| `classe` | `Classe` | eager |
| `anneeScolaire` | `AnneeScolaire` | eager |
| `periode` | `Periode` | enum |
| `valeur` | `decimal(5,2)` | 0–20 |
| `observation` | `string` | nullable |
| `maitre` | `Maitre` | lazy, nullable |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 10. `bulletins` — Report Cards

**Base route**: `/api/bulletins`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/bulletins/generer` | — | Generate bulletins for a class/period |
| `GET` | `/api/bulletins/classe/:classeId` | `anneeScolaireId`, `periode` | All bulletins for a class |
| `GET` | `/api/bulletins/eleve/:eleveId` | `anneeScolaireId` | All bulletins for a student |
| `PATCH` | `/api/bulletins/:id/publier` | — | Publish a bulletin |

#### DTO: `GenererBulletinsDto`
| Field | Type | Constraints |
|---|---|---|
| `classeId` | `number` | `@IsInt` |
| `anneeScolaireId` | `number` | `@IsInt` |
| `periode` | `Periode` | `@IsEnum(Periode)` |

#### Entity: `Bulletin`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `eleve` | `Eleve` | eager |
| `classe` | `Classe` | eager |
| `anneeScolaire` | `AnneeScolaire` | eager |
| `periode` | `Periode` | enum |
| `moyenne` | `decimal(5,2)` | nullable |
| `rang` | `number` | nullable |
| `appreciation` | `string` | nullable |
| `publie` | `boolean` | default `false` |
| `pdfUrl` | `string` | nullable |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 11. `examens` — Exams

**Base route**: `/api/examens`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/examens` | — | Create |
| `GET` | `/api/examens` | `classeId?`, `anneeScolaireId?` | List (filterable) |
| `GET` | `/api/examens/:id` | — | Get one |
| `PUT` | `/api/examens/:id` | — | Update |
| `DELETE` | `/api/examens/:id` | — | Delete |

#### Enum: `TypeExamen`
`DEVOIR | COMPOSITION | CEPE`

#### DTO: `CreateExamenDto`
| Field | Type | Constraints |
|---|---|---|
| `libelle` | `string` | required |
| `type` | `TypeExamen` | required |
| `classeId` | `number` | required |
| `matiereId` | `number` (optional) | — |
| `date` | `string` ISO date | required |
| `dureeMinutes` | `number` (optional) | — |
| `anneeScolaireId` | `number` | required |

`UpdateExamenDto` = `PartialType(CreateExamenDto)`.

#### Entity: `Examen`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `libelle` | `string` | — |
| `type` | `TypeExamen` | default `COMPOSITION` |
| `classe` | `Classe` | eager |
| `matiere` | `Matiere` | eager, nullable |
| `date` | `Date` | date column |
| `dureeMinutes` | `number` | nullable |
| `anneeScolaire` | `AnneeScolaire` | eager |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 12. `devoirs` — Homework

**Base route**: `/api/devoirs`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/devoirs` | Create (uses `req.user.maitreId`) |
| `GET` | `/api/devoirs/classe/:classeId` | List by class |
| `GET` | `/api/devoirs/:id` | Get one |
| `PUT` | `/api/devoirs/:id` | Update |
| `DELETE` | `/api/devoirs/:id` | Delete |

#### DTO: `CreateDevoirDto`
| Field | Type | Constraints |
|---|---|---|
| `titre` | `string` | required |
| `description` | `string` (optional) | — |
| `matiereId` | `number` | required |
| `classeId` | `number` | required |
| `dateDonnee` | `string` ISO date | required |
| `dateRendu` | `string` ISO date (optional) | — |

`UpdateDevoirDto` = `PartialType(CreateDevoirDto)`.

#### Entity: `Devoir`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `titre` | `string` | — |
| `description` | `string` | nullable |
| `matiere` | `Matiere` | eager |
| `classe` | `Classe` | eager |
| `dateDonnee` | `Date` | date column |
| `dateRendu` | `Date` | nullable |
| `maitre` | `Maitre` | lazy, nullable |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 13. `frais-scolarite` — School Fees Definitions

**Base route**: `/api/frais-scolarite`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/frais-scolarite` | — | Create a fee definition |
| `GET` | `/api/frais-scolarite` | `anneeScolaireId?` | List (filterable) |
| `GET` | `/api/frais-scolarite/:id` | — | Get one |
| `PUT` | `/api/frais-scolarite/:id` | — | Update |
| `DELETE` | `/api/frais-scolarite/:id` | — | Delete |

#### DTO: `CreateFraisScolariteDto`
| Field | Type | Constraints |
|---|---|---|
| `libelle` | `string` | required, e.g. `"Frais d'inscription"` |
| `montant` | `number` | `@Min(0)` |
| `classeId` | `number` (optional) | `null` = applies to all classes |
| `anneeScolaireId` | `number` | required |
| `obligatoire` | `boolean` (optional) | default `true` |
| `description` | `string` (optional) | — |

`UpdateFraisScolariteDto` = `PartialType(CreateFraisScolariteDto)`.

#### Entity: `FraisScolarite`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `libelle` | `string` | — |
| `montant` | `decimal(10,2)` | — |
| `classe` | `Classe` | eager, nullable |
| `anneeScolaire` | `AnneeScolaire` | eager |
| `obligatoire` | `boolean` | default `true` |
| `description` | `string` | nullable |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

---

### 14. `paiements` — Payments

**Base route**: `/api/paiements`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/paiements` | — | Record a payment (uses `req.user.id` as comptable) |
| `GET` | `/api/paiements` | `dateDebut?`, `dateFin?` | List payments (date range filter) |
| `GET` | `/api/paiements/eleve/:eleveId` | — | All payments for a student |
| `GET` | `/api/paiements/eleve/:eleveId/situation` | `anneeScolaireId` | Financial situation of student |
| `PATCH` | `/api/paiements/:id/annuler` | — | Cancel a payment |

#### Enums

**`ModePaiement`**: `ESPECES | MOBILE_MONEY | CHEQUE | VIREMENT`

**`StatutPaiement`**: `VALIDE | ANNULE`

#### DTO: `CreatePaiementDto`
| Field | Type | Constraints |
|---|---|---|
| `eleveId` | `number` | required |
| `fraisScolariteId` | `number` | required |
| `montant` | `number` | `@Min(0)` |
| `datePaiement` | `string` ISO date | required |
| `modePaiement` | `ModePaiement` (optional) | default `ESPECES` |
| `referencePaiement` | `string` (optional) | unique |
| `commentaire` | `string` (optional) | — |

#### Entity: `Paiement`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `eleve` | `Eleve` | eager |
| `fraisScolarite` | `FraisScolarite` | eager |
| `montant` | `decimal(10,2)` | — |
| `datePaiement` | `Date` | date column |
| `modePaiement` | `ModePaiement` | default `ESPECES` |
| `referencePaiement` | `string` | nullable, unique |
| `statut` | `StatutPaiement` | default `VALIDE` |
| `comptable` | `User` | lazy, nullable |
| `commentaire` | `string` | nullable |
| `createdAt` | `Date` | auto |

---

### 15. `depenses` — Expenses

**Base route**: `/api/depenses`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/depenses` | — | Create expense (uses `req.user.id` as comptable) |
| `GET` | `/api/depenses` | `dateDebut?`, `dateFin?` | List (date range filter) |
| `GET` | `/api/depenses/:id` | — | Get one |
| `DELETE` | `/api/depenses/:id` | — | Delete |

#### Enum: `CategorieDepense`
`SALAIRE | FOURNITURES | MAINTENANCE | EAU_ELECTRICITE | COMMUNICATION | AUTRE`

#### DTO: `CreateDepenseDto`
| Field | Type | Constraints |
|---|---|---|
| `libelle` | `string` | required |
| `montant` | `number` | `@Min(0)` |
| `categorie` | `CategorieDepense` (optional) | default `AUTRE` |
| `date` | `string` ISO date | required |
| `description` | `string` (optional) | — |
| `justificatif` | `string` (optional) | URL of file |

#### Entity: `Depense`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `libelle` | `string` | — |
| `montant` | `decimal(10,2)` | — |
| `categorie` | `CategorieDepense` | default `AUTRE` |
| `date` | `Date` | date column |
| `description` | `string` | nullable |
| `justificatif` | `string` | nullable (file URL) |
| `comptable` | `User` | lazy, nullable |
| `createdAt` | `Date` | auto |

---

### 16. `caisse` — Cash Register / Daily Ledger

**Base route**: `/api/caisse`

| Method | Path | Query params | Description |
|---|---|---|---|
| `POST` | `/api/caisse/cloturer` | — | Close day (uses `req.user.id`) |
| `GET` | `/api/caisse` | `dateDebut?`, `dateFin?` | List daily records |
| `GET` | `/api/caisse/solde` | — | Current balance |

#### Inline DTO for `POST /cloturer`
| Field | Type | Constraints |
|---|---|---|
| `date` | `string` ISO date | `@IsDateString` |

#### Entity: `Caisse`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `date` | `Date` | date column, unique |
| `soldeOuverture` | `decimal(10,2)` | default `0` |
| `totalEntrees` | `decimal(10,2)` | default `0` |
| `totalSorties` | `decimal(10,2)` | default `0` |
| `soldeFermeture` | `decimal(10,2)` | default `0` |
| `comptable` | `User` | lazy, nullable |
| `createdAt` | `Date` | auto |

---

### 17. `messagerie` — Messaging

**Base route**: `/api/messagerie`

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/messagerie` | Send a message (uses `req.user.id`) |
| `GET` | `/api/messagerie/reception` | Inbox (uses `req.user.id`) |
| `GET` | `/api/messagerie/envoi` | Sent messages (uses `req.user.id`) |
| `GET` | `/api/messagerie/conversation/:conversationId` | Full thread by UUID |
| `GET` | `/api/messagerie/non-lus` | Unread count (uses `req.user.id`) |
| `PATCH` | `/api/messagerie/:id/lire` | Mark message as read |

#### DTO: `SendMessageDto`
| Field | Type | Constraints |
|---|---|---|
| `destinataireId` | `number` | required |
| `sujet` | `string` | required |
| `contenu` | `string` | required |
| `conversationId` | `string` UUID (optional) | thread grouping |

#### Entity: `Message`
| Field | Type | Notes |
|---|---|---|
| `id` | `number` | PK |
| `expediteur` | `User` | eager |
| `destinataire` | `User` | eager |
| `sujet` | `string` | — |
| `contenu` | `string` | text |
| `lu` | `boolean` | default `false` |
| `conversationId` | `string` | nullable UUID |
| `dateEnvoi` | `Date` | auto |

---

### 18. `notifications` — Email / SMS Notifications

**Base route**: `/api/notifications`
**Auth**: `@ApiBearerAuth()` (JWT required)

| Method | Path | HTTP Status | Description |
|---|---|---|---|
| `POST` | `/api/notifications/email` | `204 No Content` | Send an email |

#### DTO: `SendEmailDto`
| Field | Type | Constraints |
|---|---|---|
| `to` | `string` | `@IsEmail` |
| `subject` | `string` | `@MinLength(1)` |
| `html` | `string` (optional) | HTML body |
| `text` | `string` (optional) | Plain-text body |

#### DTO: `SendSmsDto` *(defined but no controller route exposed)*
| Field | Type | Constraints |
|---|---|---|
| `to` | `string` | E.164 format e.g. `+33612345678` |
| `body` | `string` | message text |

---

### 19. `rapports` — Reports / Dashboards

**Base route**: `/api/rapports`

| Method | Path | Query params | Description |
|---|---|---|---|
| `GET` | `/api/rapports/directeur` | `anneeScolaireId` | Director dashboard |
| `GET` | `/api/rapports/comptable` | `anneeScolaireId` | Accountant dashboard |
| `GET` | `/api/rapports/absences` | `classeId`, `annee` | Absences by month for a class |

*(No request body; all inputs via query params.)*

---

### 20. `users` — Users (internal, no controller)

No public controller. Used internally by other services.

#### Entity: `User` *(see Auth section above)*

#### DTO: `CreateUserDto` *(see Auth section above)*

---

## Global Enums Summary

| Enum | Values |
|---|---|
| `UserRole` | `ADMIN`, `DIRECTEUR`, `MAITRE`, `PARENT`, `COMPTABLE` |
| `NomClasse` | `PS`, `MS`, `GS`, `CP`, `CE1`, `CE2`, `CM1`, `CM2` |
| `NiveauClasse` | `MATERNELLE`, `PRIMAIRE` |
| `NiveauMatiere` | `MATERNELLE`, `PRIMAIRE`, `TOUS` |
| `Sexe` | `M`, `F` |
| `StatutEleve` | `INSCRIT`, `TRANSFERE`, `ABANDONNE` |
| `StatutPresence` | `PRESENT`, `ABSENT`, `RETARD`, `EXCUSE` |
| `Periode` | `SEQUENCE1`–`SEQUENCE6` |
| `TypeExamen` | `DEVOIR`, `COMPOSITION`, `CEPE` |
| `ModePaiement` | `ESPECES`, `MOBILE_MONEY`, `CHEQUE`, `VIREMENT` |
| `StatutPaiement` | `VALIDE`, `ANNULE` |
| `CategorieDepense` | `SALAIRE`, `FOURNITURES`, `MAINTENANCE`, `EAU_ELECTRICITE`, `COMMUNICATION`, `AUTRE` |

---

## Complete Endpoint Index

| Module | Method | Full Path |
|---|---|---|
| auth | POST | `/api/auth/login` |
| auth | POST | `/api/auth/register` |
| annees-scolaires | POST | `/api/annees-scolaires` |
| annees-scolaires | GET | `/api/annees-scolaires` |
| annees-scolaires | GET | `/api/annees-scolaires/active` |
| annees-scolaires | GET | `/api/annees-scolaires/:id` |
| annees-scolaires | PUT | `/api/annees-scolaires/:id` |
| annees-scolaires | PATCH | `/api/annees-scolaires/:id/activate` |
| annees-scolaires | DELETE | `/api/annees-scolaires/:id` |
| classes | POST | `/api/classes` |
| classes | GET | `/api/classes` |
| classes | GET | `/api/classes/:id` |
| classes | PUT | `/api/classes/:id` |
| classes | DELETE | `/api/classes/:id` |
| matieres | POST | `/api/matieres` |
| matieres | GET | `/api/matieres` |
| matieres | GET | `/api/matieres/:id` |
| matieres | PUT | `/api/matieres/:id` |
| matieres | DELETE | `/api/matieres/:id` |
| parents | POST | `/api/parents` |
| parents | GET | `/api/parents` |
| parents | GET | `/api/parents/mon-profil` |
| parents | GET | `/api/parents/:id` |
| parents | PUT | `/api/parents/:id` |
| parents | DELETE | `/api/parents/:id` |
| maitres | POST | `/api/maitres` |
| maitres | GET | `/api/maitres` |
| maitres | GET | `/api/maitres/mon-profil` |
| maitres | GET | `/api/maitres/:id` |
| maitres | PUT | `/api/maitres/:id` |
| maitres | PATCH | `/api/maitres/:id/classes` |
| maitres | DELETE | `/api/maitres/:id` |
| eleves | POST | `/api/eleves` |
| eleves | GET | `/api/eleves` |
| eleves | GET | `/api/eleves/:id` |
| eleves | PUT | `/api/eleves/:id` |
| eleves | PATCH | `/api/eleves/:id/statut` |
| eleves | DELETE | `/api/eleves/:id` |
| presences | POST | `/api/presences/appel` |
| presences | GET | `/api/presences/classe/:classeId` |
| presences | GET | `/api/presences/eleve/:eleveId` |
| presences | GET | `/api/presences/stats/classe/:classeId` |
| notes | POST | `/api/notes` |
| notes | GET | `/api/notes/classe/:classeId` |
| notes | GET | `/api/notes/eleve/:eleveId` |
| notes | PUT | `/api/notes/:id` |
| notes | DELETE | `/api/notes/:id` |
| bulletins | POST | `/api/bulletins/generer` |
| bulletins | GET | `/api/bulletins/classe/:classeId` |
| bulletins | GET | `/api/bulletins/eleve/:eleveId` |
| bulletins | PATCH | `/api/bulletins/:id/publier` |
| examens | POST | `/api/examens` |
| examens | GET | `/api/examens` |
| examens | GET | `/api/examens/:id` |
| examens | PUT | `/api/examens/:id` |
| examens | DELETE | `/api/examens/:id` |
| devoirs | POST | `/api/devoirs` |
| devoirs | GET | `/api/devoirs/classe/:classeId` |
| devoirs | GET | `/api/devoirs/:id` |
| devoirs | PUT | `/api/devoirs/:id` |
| devoirs | DELETE | `/api/devoirs/:id` |
| frais-scolarite | POST | `/api/frais-scolarite` |
| frais-scolarite | GET | `/api/frais-scolarite` |
| frais-scolarite | GET | `/api/frais-scolarite/:id` |
| frais-scolarite | PUT | `/api/frais-scolarite/:id` |
| frais-scolarite | DELETE | `/api/frais-scolarite/:id` |
| paiements | POST | `/api/paiements` |
| paiements | GET | `/api/paiements` |
| paiements | GET | `/api/paiements/eleve/:eleveId` |
| paiements | GET | `/api/paiements/eleve/:eleveId/situation` |
| paiements | PATCH | `/api/paiements/:id/annuler` |
| depenses | POST | `/api/depenses` |
| depenses | GET | `/api/depenses` |
| depenses | GET | `/api/depenses/:id` |
| depenses | DELETE | `/api/depenses/:id` |
| caisse | POST | `/api/caisse/cloturer` |
| caisse | GET | `/api/caisse` |
| caisse | GET | `/api/caisse/solde` |
| messagerie | POST | `/api/messagerie` |
| messagerie | GET | `/api/messagerie/reception` |
| messagerie | GET | `/api/messagerie/envoi` |
| messagerie | GET | `/api/messagerie/conversation/:conversationId` |
| messagerie | GET | `/api/messagerie/non-lus` |
| messagerie | PATCH | `/api/messagerie/:id/lire` |
| notifications | POST | `/api/notifications/email` |
| rapports | GET | `/api/rapports/directeur` |
| rapports | GET | `/api/rapports/comptable` |
| rapports | GET | `/api/rapports/absences` |
