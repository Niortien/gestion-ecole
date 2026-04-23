# TODO — Frontend Developer: Gestion École Primaire

## Context

- **Framework**: Next.js 16 (App Router) + React 19
- **Backend**: NestJS REST API @ `http://localhost:8000/api` (JWT Bearer auth)
- **UI library**: shadcn/ui (Tailwind v4-based) + Tabler Icons (`@tabler/icons-react`)
- **Data fetching**: TanStack Query v5 (`@tanstack/react-query`)
- **Tables**: TanStack Table v8 (`@tanstack/react-table`)
- **Auth**: JWT stored in `httpOnly` cookie (or `localStorage`), role-based (ADMIN | DIRECTEUR | MAITRE | PARENT | COMPTABLE)
- **Design spec**: Written requirements below — school management system
- **Performance budget**: FCP < 1.8s, CLS < 0.1, bundle < 200 KB gzipped initial load
- **Accessibility**: WCAG 2.1 AA

---

## Implementation Plan

- [x] **FE-PLAN-1.1 Authentication & Session**
  - **Scope**: Login page, JWT storage, auth context, route guards
  - **Components**: `LoginForm`, `AuthProvider`, `ProtectedRoute`
  - **State**: Zustand auth store (user + token)
  - **Responsive**: Full-page centered card on all breakpoints

- [x] **FE-PLAN-1.2 App Shell & Navigation**
  - **Scope**: Sidebar layout with collapsible nav, top header, breadcrumbs
  - **Components**: `AppShell`, `Sidebar`, `TopBar`, `Breadcrumb`, `UserMenu`
  - **State**: Sidebar open/close state (local)
  - **Responsive**: Sidebar hidden on mobile (drawer), visible on ≥ lg

- [x] **FE-PLAN-1.3 Dashboard**
  - **Scope**: Stats overview, quick charts, recent activity
  - **Components**: `StatCard`, `RevenueChart`, `AbsenceChart`, `RecentPayments`
  - **State**: TanStack Query (rapports/directeur, rapports/comptable)
  - **Responsive**: 1-col on mobile → 4-col grid on desktop

- [x] **FE-PLAN-1.4 Élèves (Students)**
  - **Scope**: List, create, edit, delete, status change
  - **Components**: `ElevesPage`, `EleveTable`, `EleveFormDialog`, `StatutBadge`
  - **State**: TanStack Query + Table
  - **Responsive**: Stacked cards on mobile, table on desktop

- [x] **FE-PLAN-1.5 Classes**
  - **Scope**: List, create, edit, delete
  - **Components**: `ClassesPage`, `ClasseTable`, `ClasseFormDialog`
  - **State**: TanStack Query
  - **Responsive**: Table

- [x] **FE-PLAN-1.6 Maîtres (Teachers)**
  - **Scope**: List, create, edit, delete, class assignment
  - **Components**: `MaitresPage`, `MaitreTable`, `MaitreFormDialog`, `AffectClassesDialog`
  - **State**: TanStack Query
  - **Responsive**: Table

- [x] **FE-PLAN-1.7 Parents**
  - **Scope**: List, create, edit, delete
  - **Components**: `ParentsPage`, `ParentTable`, `ParentFormDialog`
  - **State**: TanStack Query
  - **Responsive**: Table

- [x] **FE-PLAN-1.8 Notes**
  - **Scope**: Enter grades per class/sequence, view by student
  - **Components**: `NotesPage`, `NotesSaisieTable`, `NotesEleveView`
  - **State**: TanStack Query + Table
  - **Responsive**: Scrollable table, sticky column for student name

- [x] **FE-PLAN-1.9 Bulletins**
  - **Scope**: Generate, list, publish, view PDF link
  - **Components**: `BulletinsPage`, `BulletinGenerateDialog`, `BulletinTable`
  - **State**: TanStack Query
  - **Responsive**: Table + action buttons

- [x] **FE-PLAN-1.10 Présences (Attendance)**
  - **Scope**: Roll-call form (bulk), history view, stats
  - **Components**: `PresencesPage`, `AppelForm`, `PresenceHistoryTable`, `StatsPresence`
  - **State**: TanStack Query + mutations
  - **Responsive**: Mobile-friendly roll-call cards

- [x] **FE-PLAN-1.11 Examens & Devoirs**
  - **Scope**: Create/edit/delete exams and homework
  - **Components**: `ExamensPage`, `ExamenFormDialog`, `DevoirsPage`, `DevoirFormDialog`
  - **State**: TanStack Query
  - **Responsive**: Table

- [x] **FE-PLAN-1.12 Frais de Scolarité**
  - **Scope**: Manage fee schedules per class/year
  - **Components**: `FraisPage`, `FraisTable`, `FraisFormDialog`
  - **State**: TanStack Query
  - **Responsive**: Table

- [x] **FE-PLAN-1.13 Paiements**
  - **Scope**: Record payments, view history, student balance
  - **Components**: `PaiementsPage`, `PaiementFormDialog`, `SituationFinanciere`
  - **State**: TanStack Query
  - **Responsive**: Table + summary cards

- [x] **FE-PLAN-1.14 Dépenses**
  - **Scope**: Record expenses, view history
  - **Components**: `DepensesPage`, `DepenseFormDialog`, `DepensesTable`
  - **State**: TanStack Query
  - **Responsive**: Table

- [x] **FE-PLAN-1.15 Caisse**
  - **Scope**: View ledger, close day
  - **Components**: `CaissePage`, `CaisseTable`, `ClotureDayButton`
  - **State**: TanStack Query
  - **Responsive**: Summary + table

- [x] **FE-PLAN-1.16 Messagerie**
  - **Scope**: Inbox, sent, compose, conversation thread
  - **Components**: `MessageriePage`, `MessageList`, `ComposeDialog`, `ThreadView`
  - **State**: TanStack Query + polling for unread count
  - **Responsive**: Split-pane on desktop, stacked on mobile

- [x] **FE-PLAN-1.17 Matières & Années Scolaires (Settings)**
  - **Scope**: CRUD for academic years and subjects
  - **Components**: `SettingsPage`, `AnneesTable`, `MatieresTable`
  - **State**: TanStack Query
  - **Responsive**: Tabbed settings page

---

## Implementation Items

### Infrastructure

- [x] **FE-ITEM-0.1 Install dependencies**
  - `@tanstack/react-query`, `@tanstack/react-table`, `@tabler/icons-react`
  - `shadcn/ui` (init), `zustand`, `axios`, `react-hook-form`, `@hookform/resolvers`, `zod`
  - `recharts` (charts on dashboard)
  - `date-fns` (date formatting)

- [x] **FE-ITEM-0.2 Tailwind v4 + shadcn/ui theming**
  - Configure CSS variables for primary (indigo/blue school theme), sidebar bg, card bg
  - Dark mode support via `prefers-color-scheme`
  - Custom color palette: primary `#4F6AF5`, success `#22c55e`, warning `#f59e0b`, danger `#ef4444`

- [x] **FE-ITEM-0.3 API client setup (`lib/api.ts`)**
  - Axios instance with base URL `http://localhost:8000/api`
  - Request interceptor: attach `Authorization: Bearer <token>` from Zustand store
  - Response interceptor: 401 → redirect to `/login`
  - Typed response helpers per resource

- [x] **FE-ITEM-0.4 TanStack Query provider (`providers/query-provider.tsx`)**
  - Wrap app with `QueryClientProvider`
  - Configure stale time: 30s, retry: 2

- [x] **FE-ITEM-0.5 Zustand auth store (`stores/auth.store.ts`)**
  - State: `user`, `token`, `isAuthenticated`
  - Actions: `login(token, user)`, `logout()`
  - Persist to `localStorage` via `zustand/middleware`

- [x] **FE-ITEM-0.6 React Hook Form + Zod schemas (`lib/schemas/`)**
  - One Zod schema per form matching backend DTOs exactly
  - Reusable `FormField` wrapper components

### Authentication

- [x] **FE-ITEM-1.1 Login Page (`app/(auth)/login/page.tsx`)**
  - **Props**: n/a (page component)
  - **State**: `useForm` (email + password), `useMutation` POST `/api/auth/login`
  - **Accessibility**: `role="main"`, labels on all inputs, error messages with `aria-describedby`
  - **Performance**: No heavy imports; inline validation with Zod

- [x] **FE-ITEM-1.2 Auth middleware (`middleware.ts`)**
  - Protect `/dashboard/**` routes — redirect to `/login` if no token in cookie
  - Role-based route access (MAITRE can't access finance routes)

### App Shell

- [x] **FE-ITEM-2.1 Root layout with providers (`app/layout.tsx`)**
  - Wrap with `QueryClientProvider`, `AuthProvider`, `ThemeProvider`
  - Font: Inter or Geist

- [x] **FE-ITEM-2.2 Dashboard layout (`app/(dashboard)/layout.tsx`)**
  - `<Sidebar>` + `<main>` flex layout
  - Mobile: sidebar as `<Sheet>` (shadcn drawer)

- [x] **FE-ITEM-2.3 Sidebar component (`components/layout/sidebar.tsx`)**
  - Nav groups: Académique, Élèves, Finance, Messagerie, Paramètres
  - Active link highlight, collapse support
  - Role-filtered nav items (COMPTABLE only sees Finance)
  - Icons from `@tabler/icons-react`

- [x] **FE-ITEM-2.4 TopBar component (`components/layout/topbar.tsx`)**
  - Breadcrumb, user avatar dropdown (profile, logout), notification bell with unread count

### Dashboard

- [x] **FE-ITEM-3.1 StatCard (`components/dashboard/stat-card.tsx`)**
  - **Props**: `{ title, value, delta?, icon, color }`
  - Cards: Total élèves, Classes actives, Paiements du mois, Absences du jour

- [x] **FE-ITEM-3.2 RevenueChart (`components/dashboard/revenue-chart.tsx`)**
  - Recharts BarChart of monthly payments
  - Responsive with `<ResponsiveContainer>`

- [x] **FE-ITEM-3.3 AbsenceChart (`components/dashboard/absence-chart.tsx`)**
  - Recharts PieChart for presence stats

### Reusable Components

- [x] **FE-ITEM-4.1 DataTable (`components/ui/data-table.tsx`)**
  - TanStack Table v8 wrapper
  - Column sorting, filtering, pagination
  - Loading skeleton, empty state, error state
  - Bulk selection support

- [x] **FE-ITEM-4.2 ConfirmDialog (`components/ui/confirm-dialog.tsx`)**
  - Reusable delete confirmation dialog
  - **Props**: `{ open, title, description, onConfirm, onCancel, loading }`

- [x] **FE-ITEM-4.3 FormDialog (`components/ui/form-dialog.tsx`)**
  - Reusable dialog wrapper for create/edit forms
  - **Props**: `{ open, title, children, onSubmit, loading }`

- [x] **FE-ITEM-4.4 StatusBadge (`components/ui/status-badge.tsx`)**
  - Colored badge for enums (StatutEleve, StatutPaiement, StatutPresence)

- [x] **FE-ITEM-4.5 PageHeader (`components/ui/page-header.tsx`)**
  - **Props**: `{ title, description?, action? }` — consistent page header with optional CTA

### Pages

- [x] **FE-ITEM-5.1 Élèves page (`app/(dashboard)/eleves/page.tsx`)**
  - DataTable with columns: Photo, Nom, Prénom, Classe, Statut, Date naissance, Actions
  - Filters: Classe, Statut
  - Inline statut change via dropdown
  - Create/Edit modal with `CreateEleveDto` form

- [x] **FE-ITEM-5.2 Classes page (`app/(dashboard)/classes/page.tsx`)**
  - Table: Nom, Niveau, Capacité, Année scolaire, Nb élèves, Actions
  - Form: nom (select NomClasse), niveau, capacité, anneeScolaireId

- [x] **FE-ITEM-5.3 Maîtres page (`app/(dashboard)/maitres/page.tsx`)**
  - Table: Nom, Email, Téléphone, Spécialité, Classes assignées, Actions
  - Assign classes dialog with multi-select checkboxes

- [x] **FE-ITEM-5.4 Parents page (`app/(dashboard)/parents/page.tsx`)**
  - Table: Nom, Email, Téléphone, Adresse, Enfants, Actions
  - Form: CreateParentDto fields

- [x] **FE-ITEM-5.5 Notes page (`app/(dashboard)/notes/page.tsx`)**
  - Select classe + séquence + année scolaire → load notes grid
  - Editable grid: row = élève, col = matière, cell = note input (0-20)
  - Save individual note on blur

- [x] **FE-ITEM-5.6 Bulletins page (`app/(dashboard)/bulletins/page.tsx`)**
  - Generate button (classeId + période + anneeScolaireId)
  - Table: Élève, Période, Moyenne, Rang, Appréciation, Publié, PDF link
  - Publish action per bulletin

- [x] **FE-ITEM-5.7 Présences page (`app/(dashboard)/presences/page.tsx`)**
  - Date picker + classe selector → load class roll
  - List of students with radio (Présent / Absent / Retard / Excusé)
  - Submit appel in bulk
  - Stats tab: absence chart by month

- [x] **FE-ITEM-5.8 Examens page (`app/(dashboard)/examens/page.tsx`)**
  - Table: Libellé, Type, Classe, Matière, Date, Durée, Actions
  - Form: CreateExamenDto

- [x] **FE-ITEM-5.9 Devoirs page (`app/(dashboard)/devoirs/page.tsx`)**
  - Table by class: Titre, Matière, Date donnée, Date rendu, Actions
  - Form: CreateDevoirDto

- [x] **FE-ITEM-5.10 Frais de scolarité page (`app/(dashboard)/frais-scolarite/page.tsx`)**
  - Table: Libellé, Montant, Classe (ou toutes), Obligatoire, Actions
  - Form: CreateFraisScolariteDto

- [x] **FE-ITEM-5.11 Paiements page (`app/(dashboard)/paiements/page.tsx`)**
  - Table: Élève, Frais, Montant, Date, Mode, Statut, Actions
  - Date range filter
  - Student balance view dialog (situation endpoint)
  - Cancel payment action with confirm dialog

- [x] **FE-ITEM-5.12 Dépenses page (`app/(dashboard)/depenses/page.tsx`)**
  - Table: Libellé, Montant, Catégorie, Date, Description
  - Category color badges

- [x] **FE-ITEM-5.13 Caisse page (`app/(dashboard)/caisse/page.tsx`)**
  - Solde actuel card
  - Daily ledger table: Date, Ouverture, Entrées, Sorties, Clôture
  - "Clôturer la journée" button with date picker

- [x] **FE-ITEM-5.14 Messagerie page (`app/(dashboard)/messagerie/page.tsx`)**
  - Two-panel: message list (inbox/sent toggle) + thread view
  - Compose dialog: destinataire user select, sujet, contenu
  - Mark as read on open
  - Unread badge in sidebar nav

- [x] **FE-ITEM-5.15 Paramètres page (`app/(dashboard)/parametres/page.tsx`)**
  - Tabs: Années scolaires | Matières
  - Années: Table + activate toggle + CRUD
  - Matières: Table + CRUD form

---

## Proposed Code Changes

### File Structure

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard home
│   ├── eleves/page.tsx
│   ├── classes/page.tsx
│   ├── maitres/page.tsx
│   ├── parents/page.tsx
│   ├── notes/page.tsx
│   ├── bulletins/page.tsx
│   ├── presences/page.tsx
│   ├── examens/page.tsx
│   ├── devoirs/page.tsx
│   ├── frais-scolarite/page.tsx
│   ├── paiements/page.tsx
│   ├── depenses/page.tsx
│   ├── caisse/page.tsx
│   ├── messagerie/page.tsx
│   └── parametres/page.tsx
├── layout.tsx                      # Root layout (providers)
└── globals.css                     # Tailwind v4 + shadcn CSS vars
components/
├── layout/
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   └── breadcrumb.tsx
├── dashboard/
│   ├── stat-card.tsx
│   ├── revenue-chart.tsx
│   └── absence-chart.tsx
├── ui/
│   ├── data-table.tsx
│   ├── confirm-dialog.tsx
│   ├── form-dialog.tsx
│   ├── status-badge.tsx
│   └── page-header.tsx
└── (feature)/
    ├── eleves/
    ├── classes/
    ├── maitres/
    ├── notes/
    ├── presences/
    ├── paiements/
    └── messagerie/
lib/
├── api.ts                          # Axios instance
├── api/
│   ├── eleves.ts
│   ├── classes.ts
│   ├── maitres.ts
│   ├── parents.ts
│   ├── notes.ts
│   ├── bulletins.ts
│   ├── presences.ts
│   ├── examens.ts
│   ├── devoirs.ts
│   ├── frais-scolarite.ts
│   ├── paiements.ts
│   ├── depenses.ts
│   ├── caisse.ts
│   ├── messagerie.ts
│   ├── rapports.ts
│   ├── matieres.ts
│   └── annees-scolaires.ts
├── schemas/                        # Zod schemas per DTO
└── types.ts                        # All backend entity TypeScript types
stores/
└── auth.store.ts                   # Zustand auth store
providers/
├── query-provider.tsx
└── auth-provider.tsx
middleware.ts                       # Next.js route protection
```

---

## Commands

```bash
# Install dependencies
npm install @tanstack/react-query @tanstack/react-table @tabler/icons-react zustand axios react-hook-form @hookform/resolvers zod recharts date-fns

# Initialize shadcn/ui (Tailwind v4 style)
npx shadcn@latest init

# Add required shadcn components
npx shadcn@latest add button input label card dialog table badge select checkbox tabs sheet avatar dropdown-menu form separator skeleton toast
```

---

## Quality Assurance Task Checklist

- [x] All components compile without TypeScript errors
- [x] Responsive design tested at 320px, 768px, 1024px, 1440px, and 2560px
- [x] Keyboard navigation reaches all interactive elements
- [x] Color contrast meets WCAG AA minimums (4.5:1 normal text, 3:1 large text)
- [x] Core Web Vitals: FCP < 1.8s, TTI < 3.9s, CLS < 0.1
- [x] Bundle size impact measured and within 200 KB gzipped initial load
- [x] Cross-browser testing completed on Chrome, Firefox, Safari, and Edge
- [x] Animations respect `prefers-reduced-motion`
- [x] All list renders use stable unique IDs (never array index) as `key`
- [x] All API error states handled gracefully with user-visible messages
- [x] Role-based navigation hides irrelevant sections per user role
