# CRM System für Webdesign-Agentur

Ein modernes, vollständiges Customer Relationship Management (CRM) System, speziell entwickelt für Webdesign-Agenturen. Verwalten Sie Kunden, Projekte, Aufgaben und Notizen an einem zentralen Ort.

## 🚀 Features

### Kunden-Verwaltung
- ✅ Vollständiges CRUD (Create, Read, Update, Delete)
- 🔍 Suche nach Name, E-Mail oder Firma
- 🏷️ Status-Filter (Lead, Aktiv, Inaktiv)
- 📧 Kontaktdaten mit E-Mail und Telefon
- 🌐 Website-URLs mit Validierung

### Projekt-Verwaltung
- ✅ Vollständiges CRUD für Projekte
- 💰 Budget-Tracking mit Währungsformatierung
- 📅 Start- und Enddatum mit Datepicker
- 🎯 5 Projektstatus (Planung, In Arbeit, Review, Abgeschlossen, Pausiert)
- 🔗 Verknüpfung mit Kunden
- 🔍 Suche und Statusfilter

### Aufgaben-Management
- ✅ Aufgaben pro Projekt
- 📊 3 Status: Offen, In Arbeit, Erledigt
- ⚡ Prioritäten: Niedrig, Mittel, Hoch
- 📅 Fälligkeitsdatum
- ✏️ Inline-Bearbeitung und Löschen

### Notizen-System
- 📝 Projektbezogene Notizen
- ⏰ Automatische Zeitstempel
- ✏️ Erstellen, Bearbeiten, Löschen
- 📄 Mehrzeilige Textfelder

### Dashboard
- 📈 Live-Statistiken (Kunden, Projekte, Aufgaben, Gesamt-Budget)
- 📋 Aktuelle Projekte
- ⏰ Fällige Aufgaben mit Priorisierung
- 🎨 Übersichtliche Karten-Ansicht

### Projekt-Detailseite
- 🏢 Kunden-Informationen mit Kontaktdaten
- 💰 Budget-Anzeige
- 📅 Zeitraum-Übersicht
- 📊 Fortschritts-Anzeige basierend auf erledigten Aufgaben
- 📋 Aufgabenliste mit Status und Priorität
- 📝 Notizenliste mit Timestamps

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.4** - React Framework mit App Router
- **TypeScript** - Typ-sichere Entwicklung
- **TailwindCSS** - Utility-First CSS Framework
- **Shadcn/UI** - Hochwertige UI-Komponenten
- **Lucide React** - Icon-Library

### Backend & Datenbank
- **Prisma 6.17.0** - ORM für Datenbank
- **SQLite** - Entwicklungsdatenbank
- **Next.js API Routes** - RESTful API

### State Management & Forms
- **TanStack Query v5** - Server State Management
- **React Hook Form** - Formular-Handling
- **Zod** - Schema-Validierung

### Weitere Tools
- **date-fns** - Datum-Formatierung (deutsch)
- **Sonner** - Toast-Notifications
- **Turbopack** - Schneller Bundler

## 📦 Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder pnpm

### Schritt-für-Schritt

1. **Repository klonen**
```bash
git clone https://github.com/Tobbse007/CRM-system.git
cd CRM-system
```

2. **Dependencies installieren**
```bash
npm install
```

3. **Datenbank einrichten**
```bash
# Prisma Client generieren
npx prisma generate

# Datenbank-Schema erstellen
npx prisma db push

# Testdaten einfügen (optional)
npm run db:seed
```

4. **Development Server starten**
```bash
npm run dev
```

5. **Applikation öffnen**
Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser

## 📝 Verfügbare Scripts

```bash
# Development Server mit Turbopack
npm run dev

# Production Build
npm run build

# Production Server starten
npm start

# Prisma Studio (Datenbank GUI)
npm run db:studio

# Prisma Client generieren
npm run db:generate

# Datenbank-Schema aktualisieren
npm run db:push

# Testdaten einfügen
npm run db:seed
```

## 🗄️ Datenbank-Schema

### Client (Kunde)
- Name, E-Mail (unique), Telefon, Firma, Website
- Status: LEAD, ACTIVE, INACTIVE
- Timestamps, Soft Delete

### Project (Projekt)
- Name, Beschreibung, Budget
- Status: PLANNING, IN_PROGRESS, REVIEW, COMPLETED, ON_HOLD
- Start- und Enddatum
- Relation zu Client (N:1)

### Task (Aufgabe)
- Titel, Beschreibung
- Status: TODO, IN_PROGRESS, DONE
- Priorität: LOW, MEDIUM, HIGH
- Fälligkeitsdatum
- Relation zu Project (N:1)

### Note (Notiz)
- Titel, Inhalt
- Timestamps
- Relation zu Project (N:1)

## 🔌 API-Endpunkte

### Clients
- `GET /api/clients` - Alle Kunden (mit Suche & Filter)
- `POST /api/clients` - Neuen Kunden erstellen
- `GET /api/clients/:id` - Einzelnen Kunden abrufen
- `PUT /api/clients/:id` - Kunden aktualisieren
- `DELETE /api/clients/:id` - Kunden löschen

### Projects
- `GET /api/projects` - Alle Projekte (mit Suche & Filter)
- `POST /api/projects` - Neues Projekt erstellen
- `GET /api/projects/:id` - Einzelnes Projekt mit Tasks & Notes
- `PUT /api/projects/:id` - Projekt aktualisieren
- `DELETE /api/projects/:id` - Projekt löschen (CASCADE)

### Tasks
- `GET /api/tasks` - Alle Aufgaben (mit Projekt-Filter)
- `POST /api/tasks` - Neue Aufgabe erstellen
- `GET /api/tasks/:id` - Einzelne Aufgabe abrufen
- `PUT /api/tasks/:id` - Aufgabe aktualisieren
- `DELETE /api/tasks/:id` - Aufgabe löschen

### Notes
- `GET /api/notes` - Alle Notizen (mit Projekt-Filter)
- `POST /api/notes` - Neue Notiz erstellen
- `GET /api/notes/:id` - Einzelne Notiz abrufen
- `PUT /api/notes/:id` - Notiz aktualisieren
- `DELETE /api/notes/:id` - Notiz löschen

### Stats
- `GET /api/stats` - Dashboard-Statistiken

## 📂 Projektstruktur

```
CRM-system/
├── app/
│   ├── (dashboard)/           # Dashboard Layout
│   │   ├── clients/          # Kunden-Seite
│   │   ├── projects/         # Projekte-Seite
│   │   │   └── [id]/        # Projekt-Detail
│   │   └── page.tsx         # Dashboard
│   ├── api/                  # API Routes
│   │   ├── clients/         # Client-Endpunkte
│   │   ├── projects/        # Project-Endpunkte
│   │   ├── tasks/           # Task-Endpunkte
│   │   ├── notes/           # Note-Endpunkte
│   │   └── stats/           # Statistics-Endpunkt
│   └── layout.tsx           # Root Layout
├── components/
│   ├── clients/             # Client-Komponenten
│   ├── projects/            # Project-Komponenten
│   ├── tasks/               # Task-Komponenten
│   ├── notes/               # Note-Komponenten
│   ├── navigation/          # Navigation
│   └── ui/                  # Shadcn UI Komponenten
├── hooks/
│   ├── use-clients.ts       # Client-Hooks
│   ├── use-projects.ts      # Project-Hooks
│   ├── use-tasks.ts         # Task-Hooks
│   └── use-notes.ts         # Note-Hooks
├── lib/
│   ├── prisma.ts            # Prisma Client
│   ├── utils.ts             # Utility-Funktionen
│   └── validations/         # Zod Schemas
├── prisma/
│   ├── schema.prisma        # Datenbank-Schema
│   ├── seed.ts              # Seed-Script
│   └── dev.db               # SQLite Datenbank
└── types/
    └── index.ts             # TypeScript Types
```

## 🎨 UI-Komponenten

Das Projekt verwendet Shadcn/UI mit folgenden Komponenten:
- Button, Badge, Card
- Dialog, Form, Input, Textarea, Select
- Table, Dropdown Menu
- Calendar, Popover, Sonner (Toasts)

## 🌐 Features im Detail

### Responsive Design
- Vollständig responsive auf Desktop, Tablet und Mobile
- Grid-Layouts mit TailwindCSS
- Mobile-optimierte Navigation

### Formular-Validierung
- Client-side Validierung mit Zod
- Server-side Validierung in API-Routes
- Deutsche Fehlermeldungen
- Real-time Feedback

### Datenbank-Features
- Prisma ORM für type-safe Queries
- Automatische Timestamps
- Cascade Delete bei Relationen
- SQLite für schnelle Entwicklung

### State Management
- TanStack Query für Server State
- Automatisches Caching
- Optimistic Updates
- Query Invalidation

## 📄 Lizenz

Dieses Projekt wurde für Bildungszwecke erstellt.

## 👤 Autor

**Tobias**
- GitHub: [@Tobbse007](https://github.com/Tobbse007)

## 🙏 Danksagungen

- Next.js Team für das großartige Framework
- Shadcn für die UI-Komponenten
- Prisma Team für das ORM
- TanStack für React Query

---

**Entwickelt mit ❤️ und TypeScript**
