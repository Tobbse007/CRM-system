# Frontend-Struktur (MVP)

## Übersicht
Das Frontend wird mit **Next.js 14+ (App Router)** und **TailwindCSS** gebaut.  
Für UI-Komponenten verwenden wir **Shadcn/UI** - eine Sammlung von wiederverwendbaren, zugänglichen Komponenten.

---

## 📁 Verzeichnisstruktur

```
app/
├── (dashboard)/           # Dashboard Layout Group
│   ├── layout.tsx        # Dashboard Layout mit Sidebar
│   ├── page.tsx          # Dashboard Homepage
│   ├── clients/          
│   │   ├── page.tsx      # Kundenliste
│   │   ├── [id]/         
│   │   │   └── page.tsx  # Einzelner Kunde
│   │   └── new/          
│   │       └── page.tsx  # Neuen Kunden erstellen
│   ├── projects/         
│   │   ├── page.tsx      # Projektliste
│   │   ├── [id]/         
│   │   │   └── page.tsx  # Einzelnes Projekt (mit Tasks & Notes)
│   │   └── new/          
│   │       └── page.tsx  # Neues Projekt erstellen
│   └── tasks/            
│       └── page.tsx      # Alle Aufgaben (gefiltert)
├── api/                  # API Routes (siehe API_ROUTES.md)
├── auth/                 # Auth-Seiten (Login, Register)
│   ├── login/            
│   │   └── page.tsx      
│   └── register/         
│       └── page.tsx      
├── layout.tsx            # Root Layout
└── globals.css           # Globale Styles + Tailwind

components/
├── ui/                   # Shadcn/UI Komponenten
│   ├── button.tsx        
│   ├── card.tsx          
│   ├── table.tsx         
│   ├── dialog.tsx        
│   ├── input.tsx         
│   ├── select.tsx        
│   └── badge.tsx         
├── layout/               
│   ├── Sidebar.tsx       # Sidebar Navigation
│   ├── Header.tsx        # Top Header
│   └── PageHeader.tsx    # Seitenkopf mit Titel
├── clients/              
│   ├── ClientTable.tsx   # Kunden-Tabelle
│   ├── ClientForm.tsx    # Formular (Create/Edit)
│   └── ClientCard.tsx    # Kunden-Karte (optional)
├── projects/             
│   ├── ProjectTable.tsx  # Projekt-Tabelle
│   ├── ProjectForm.tsx   # Formular (Create/Edit)
│   ├── ProjectCard.tsx   # Projekt-Karte
│   └── StatusBadge.tsx   # Status Badge
├── tasks/                
│   ├── TaskList.tsx      # Aufgabenliste
│   ├── TaskItem.tsx      # Einzelne Aufgabe
│   ├── TaskForm.tsx      # Formular (Create/Edit)
│   └── PriorityBadge.tsx # Prioritäts-Badge
├── notes/                
│   ├── NoteList.tsx      # Notizenliste
│   ├── NoteCard.tsx      # Einzelne Notiz
│   └── NoteForm.tsx      # Formular (Create/Edit)
└── dashboard/            
    ├── StatsCard.tsx     # Statistik-Karte
    ├── RecentProjects.tsx # Letzte Projekte
    └── UpcomingTasks.tsx  # Anstehende Aufgaben

lib/
├── supabase.ts           # Supabase Client Setup
├── api.ts                # API Helper Functions
└── utils.ts              # Utility Functions (cn, formatDate, etc.)

types/
└── index.ts              # TypeScript Typen/Interfaces
```

---

## 📄 Seiten

### 1. Dashboard (`/`)
**Beschreibung:** Übersicht über alle wichtigen Metriken und aktuelle Aktivitäten.

**Komponenten:**
- `StatsCard` - Anzahl Kunden, Projekte, offene Tasks
- `RecentProjects` - Letzte 5 Projekte
- `UpcomingTasks` - Nächste fällige Aufgaben

**Layout:**
```
┌─────────────────────────────────────────┐
│  Stats: Kunden | Projekte | Tasks       │
├─────────────────────────────────────────┤
│  Letzte Projekte          │ Aufgaben    │
│  - Website Relaunch       │ - Design    │
│  - Online Shop            │ - Frontend  │
└─────────────────────────────────────────┘
```

---

### 2. Kunden (`/clients`)
**Beschreibung:** Liste aller Kunden mit CRUD-Funktionen.

**Komponenten:**
- `ClientTable` - Tabelle mit Name, E-Mail, Firma, Status
- `ClientForm` - Dialog/Modal für Create/Edit
- Button: "Neuer Kunde"

**Features:**
- Sortierung nach Name, Datum
- Filter nach Status (active, inactive, potential)
- Suche nach Name/E-Mail
- Inline-Edit oder Modal
- Löschen mit Bestätigung

**Tabellen-Spalten:**
| Name | E-Mail | Firma | Status | Aktionen |
|------|--------|-------|--------|----------|
| Max Mustermann | max@example.com | Mustermann GmbH | 🟢 Active | ✏️ 🗑️ |

---

### 3. Einzelner Kunde (`/clients/[id]`)
**Beschreibung:** Detail-Ansicht eines Kunden mit allen Projekten.

**Komponenten:**
- Kunden-Details (Name, Kontakt, etc.)
- `ProjectTable` - Projekte dieses Kunden
- Button: "Neues Projekt"

**Layout:**
```
┌─────────────────────────────────────────┐
│  Max Mustermann                          │
│  max@example.com | +49 123 456789       │
│  Mustermann GmbH                         │
├─────────────────────────────────────────┤
│  Projekte (3)               [+ Neu]     │
│  - Website Relaunch      [In Progress]  │
│  - Online Shop           [Planning]     │
└─────────────────────────────────────────┘
```

---

### 4. Projekte (`/projects`)
**Beschreibung:** Liste aller Projekte mit Filter-Optionen.

**Komponenten:**
- `ProjectTable` oder `ProjectCard` (Grid-View)
- Filter: Status, Kunde
- Button: "Neues Projekt"

**Features:**
- Filter nach Status (planning, in_progress, review, completed, on_hold)
- Filter nach Kunde (Dropdown)
- Sortierung nach Datum, Name
- Grid oder Listen-Ansicht

**Projekt-Karte:**
```
┌─────────────────────────┐
│ Website Relaunch        │
│ Max Mustermann          │
│ Status: In Progress     │
│ Budget: €5.000          │
│ Start: 15.01.2025       │
└─────────────────────────┘
```

---

### 5. Einzelnes Projekt (`/projects/[id]`)
**Beschreibung:** Detail-Ansicht mit Tasks und Notes.

**Komponenten:**
- Projekt-Details (Name, Beschreibung, Budget, Daten)
- `TaskList` - Aufgaben mit Status
- `NoteList` - Notizen
- Buttons: "Neue Aufgabe", "Neue Notiz"

**Layout:**
```
┌─────────────────────────────────────────┐
│  Website Relaunch                        │
│  Kunde: Max Mustermann                   │
│  Status: In Progress | Budget: €5.000   │
│  Start: 15.01.2025                       │
├─────────────────────────────────────────┤
│  Aufgaben (5)               [+ Neu]     │
│  ☑ Design Mockups             [Done]    │
│  ☐ Frontend Development   [In Progress] │
│  ☐ Testing                    [Todo]    │
├─────────────────────────────────────────┤
│  Notizen (2)                [+ Neu]     │
│  📝 Kickoff Meeting Notizen             │
│  📝 Design Feedback                     │
└─────────────────────────────────────────┘
```

---

### 6. Aufgaben (`/tasks`)
**Beschreibung:** Übersicht aller Aufgaben (optional: Kanban-Board).

**Komponenten:**
- `TaskList` - Gruppiert nach Status oder Projekt
- Filter: Status, Projekt, Priorität, Fälligkeitsdatum

**Features:**
- Gruppierung: Nach Status (Todo, In Progress, Done)
- Filter nach Projekt
- Filter nach Priorität (Low, Medium, High)
- Sortierung nach Fälligkeitsdatum

---

## 🧩 Komponenten

### Layout-Komponenten

#### `Sidebar.tsx`
Navigation für das Dashboard.

**Links:**
- 🏠 Dashboard (`/`)
- 👥 Kunden (`/clients`)
- 🚀 Projekte (`/projects`)
- ✅ Aufgaben (`/tasks`)
- ⚙️ Einstellungen (später)

**Features:**
- Active State für aktuelle Seite
- Collapsible (später)

---

#### `Header.tsx`
Top Header mit Benutzer-Info und Logout.

**Elemente:**
- Suchleiste (später)
- Benachrichtigungen (später)
- Benutzer-Avatar + Dropdown (Profil, Logout)

---

#### `PageHeader.tsx`
Wiederverwendbarer Seitenkopf.

**Props:**
- `title`: Seitentitel
- `description`: Beschreibung (optional)
- `action`: Button (z.B. "Neuer Kunde")

```tsx
<PageHeader
  title="Kunden"
  description="Verwalte alle deine Kunden"
  action={<Button>Neuer Kunde</Button>}
/>
```

---

### Kunden-Komponenten

#### `ClientTable.tsx`
Tabelle mit allen Kunden.

**Props:**
- `clients`: Array von Kunden-Objekten

**Features:**
- Sortierung
- Inline-Actions (Edit, Delete)
- Status-Badge

---

#### `ClientForm.tsx`
Formular für Create/Edit.

**Props:**
- `client`: Kunden-Objekt (optional, für Edit)
- `onSubmit`: Callback-Funktion
- `onCancel`: Callback-Funktion

**Felder:**
- Name (required)
- E-Mail (required)
- Telefon
- Firma
- Website
- Status (Select: active, inactive, potential)

---

### Projekt-Komponenten

#### `ProjectTable.tsx`
Tabelle mit allen Projekten.

**Props:**
- `projects`: Array von Projekt-Objekten

**Spalten:**
- Projektname
- Kunde
- Status (Badge)
- Budget
- Start-/Enddatum
- Aktionen

---

#### `ProjectCard.tsx`
Projekt-Karte für Grid-Ansicht.

**Props:**
- `project`: Projekt-Objekt

**Design:**
- Projektname (groß)
- Kundenname (klein)
- Status-Badge
- Budget & Datum
- Hover: Actions (Edit, Delete)

---

#### `StatusBadge.tsx`
Wiederverwendbares Badge für Projekt-Status.

**Props:**
- `status`: String ('planning', 'in_progress', 'review', 'completed', 'on_hold')

**Farben:**
- Planning: 🔵 Blau
- In Progress: 🟡 Gelb
- Review: 🟠 Orange
- Completed: 🟢 Grün
- On Hold: ⚪ Grau

---

### Aufgaben-Komponenten

#### `TaskList.tsx`
Liste aller Aufgaben.

**Props:**
- `tasks`: Array von Task-Objekten
- `groupBy`: 'status' | 'project' (optional)

**Features:**
- Checkbox zum Abhaken (Status ändern)
- Fälligkeitsdatum anzeigen
- Prioritäts-Badge

---

#### `TaskItem.tsx`
Einzelne Aufgabe.

**Props:**
- `task`: Task-Objekt
- `onToggle`: Callback für Status-Änderung
- `onEdit`: Callback für Edit
- `onDelete`: Callback für Delete

**Design:**
- Checkbox ☐/☑
- Titel (durchgestrichen wenn Done)
- Prioritäts-Badge
- Fälligkeitsdatum (rot wenn überfällig)

---

#### `PriorityBadge.tsx`
Badge für Task-Priorität.

**Props:**
- `priority`: 'low' | 'medium' | 'high'

**Farben:**
- Low: 🟢 Grün
- Medium: 🟡 Gelb
- High: 🔴 Rot

---

### Notiz-Komponenten

#### `NoteList.tsx`
Liste aller Notizen.

**Props:**
- `notes`: Array von Note-Objekten

---

#### `NoteCard.tsx`
Einzelne Notiz.

**Props:**
- `note`: Note-Objekt
- `onEdit`: Callback für Edit
- `onDelete`: Callback für Delete

**Design:**
- Titel (fett)
- Inhalt (Text, max. 3 Zeilen)
- Datum
- Actions (Edit, Delete)

---

### Dashboard-Komponenten

#### `StatsCard.tsx`
Statistik-Karte.

**Props:**
- `title`: Titel (z.B. "Kunden")
- `value`: Wert (z.B. 15)
- `icon`: Icon-Komponente
- `trend`: Trend (optional, z.B. "+5%")

---

## 🎨 Styling mit TailwindCSS

### Farb-Schema
```css
/* Primary Colors */
--primary: #0066CC;      /* Blau */
--secondary: #6B7280;    /* Grau */

/* Status Colors */
--success: #10B981;      /* Grün */
--warning: #F59E0B;      /* Gelb/Orange */
--danger: #EF4444;       /* Rot */
--info: #3B82F6;         /* Hellblau */

/* Background */
--bg-primary: #FFFFFF;   /* Weiß */
--bg-secondary: #F9FAFB; /* Hellgrau */
--bg-dark: #111827;      /* Dunkelgrau */

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;
```

---

### Shadcn/UI Installation
```bash
npx shadcn-ui@latest init
```

**Benötigte Komponenten:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
```

---

## 🔄 State Management

### Für MVP: React Hooks + SWR/TanStack Query
- `useState`, `useEffect` für lokalen State
- **SWR** oder **TanStack Query** für Data Fetching & Caching

**Beispiel mit SWR:**
```tsx
import useSWR from 'swr';

function ClientsPage() {
  const { data, error, isLoading } = useSWR('/api/clients', fetcher);

  if (isLoading) return <Loading />;
  if (error) return <Error />;

  return <ClientTable clients={data.data} />;
}
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)
- **sm**: 640px
- **md**: 768px (Tablet)
- **lg**: 1024px (Desktop)
- **xl**: 1280px

### Mobile-First Approach
- Sidebar: Collapsible auf Mobile (Burger-Menu)
- Tabellen: Horizontal Scroll oder Card-View
- Forms: Full-Width auf Mobile

---

## 🔒 Authentication

### Supabase Auth Integration
```tsx
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Auth Helper
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};
```

### Protected Routes
```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('supabase-auth-token');
  
  if (!token && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 🧪 Testing (später)

### Unit Tests: Jest + React Testing Library
### E2E Tests: Playwright oder Cypress

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "@supabase/supabase-js": "^2.38.0",
    "swr": "^2.2.4",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.55.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

---

## 🚀 Next Steps

1. **Setup Next.js Projekt**
2. **Supabase Datenbank erstellen** (siehe `DB_STRUCTURE.md`)
3. **Shadcn/UI installieren**
4. **API-Routen implementieren** (siehe `API_ROUTES.md`)
5. **Layout & Sidebar erstellen**
6. **Clients Page (CRUD) implementieren**
7. **Projects Page (CRUD) implementieren**
8. **Dashboard mit Stats erstellen**
9. **Tasks & Notes hinzufügen**
10. **Auth-Flow integrieren**
