# Datenbankstruktur

> **⚡ Optimiert mit Prisma ORM**  
> Diese Struktur nutzt Prisma für Type-Safety, einfache Migrations und bessere Developer Experience.

## Übersicht
Die Datenbank besteht aus 4 Haupttabellen, die miteinander verknüpft sind:
- **clients** (Kunden)
- **projects** (Projekte)
- **tasks** (Aufgaben)
- **notes** (Notizen)

## Entity-Relationship Diagramm
```
clients (1) ──→ (n) projects
projects (1) ──→ (n) tasks
projects (1) ──→ (n) notes
```

## 🔧 Setup mit Prisma

### Installation
```bash
npm install prisma @prisma/client
npx prisma init
```

### Konfiguration
```env
# .env.local
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:port/database"
```

> **Tipp:** Bei Supabase benötigen Sie beide URLs - `DATABASE_URL` für Connection Pooling und `DIRECT_URL` für Migrations.

---

## 📋 Prisma Schema

### Vollständiges Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// MODELS
// ============================================

model Client {
  id        String       @id @default(uuid())
  name      String
  email     String       @unique
  phone     String?
  company   String?
  website   String?
  status    ClientStatus @default(ACTIVE)
  
  // Relations
  projects  Project[]
  
  // Soft Delete (für zukünftige Erweiterung)
  deletedAt DateTime?    @map("deleted_at")
  
  // Timestamps
  createdAt DateTime     @default(now()) @map("created_at")
  updatedAt DateTime     @updatedAt @map("updated_at")

  @@index([email])
  @@index([status])
  @@map("clients")
}

enum ClientStatus {
  ACTIVE    @map("active")
  INACTIVE  @map("inactive")
  POTENTIAL @map("potential")
}

model Project {
  id          String        @id @default(uuid())
  name        String
  description String?       @db.Text
  status      ProjectStatus @default(PLANNING)
  budget      Decimal?      @db.Decimal(10, 2)
  startDate   DateTime?     @map("start_date") @db.Date
  endDate     DateTime?     @map("end_date") @db.Date
  
  // Relations
  clientId    String        @map("client_id")
  client      Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  tasks       Task[]
  notes       Note[]
  
  // Soft Delete (für zukünftige Erweiterung)
  deletedAt   DateTime?     @map("deleted_at")
  
  // Timestamps
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@index([clientId])
  @@index([status])
  @@map("projects")
}

enum ProjectStatus {
  PLANNING     @map("planning")
  IN_PROGRESS  @map("in_progress")
  REVIEW       @map("review")
  COMPLETED    @map("completed")
  ON_HOLD      @map("on_hold")
}

model Task {
  id          String       @id @default(uuid())
  title       String
  description String?      @db.Text
  status      TaskStatus   @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?    @map("due_date") @db.Date
  
  // Relations
  projectId   String       @map("project_id")
  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  @@index([projectId])
  @@index([status])
  @@index([dueDate])
  @@map("tasks")
}

enum TaskStatus {
  TODO        @map("todo")
  IN_PROGRESS @map("in_progress")
  DONE        @map("done")
}

enum TaskPriority {
  LOW    @map("low")
  MEDIUM @map("medium")
  HIGH   @map("high")
}

model Note {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  
  // Relations
  projectId String   @map("project_id")
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([projectId])
  @@map("notes")
}
```

---

## 🚀 Prisma Befehle

### Datenbank initialisieren
```bash
# Schema zu Datenbank pushen (für Development)
npx prisma db push

# Oder: Migration erstellen (für Production)
npx prisma migrate dev --name init

# Prisma Client generieren
npx prisma generate

# Prisma Studio öffnen (DB GUI)
npx prisma studio
```

### Seed-Daten erstellen
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clients erstellen
  const client1 = await prisma.client.create({
    data: {
      name: 'Max Mustermann',
      email: 'max@example.com',
      phone: '+49 123 456789',
      company: 'Mustermann GmbH',
      website: 'https://mustermann.de',
      status: 'ACTIVE',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Anna Schmidt',
      email: 'anna@example.com',
      phone: '+49 987 654321',
      company: 'Schmidt Marketing',
      website: 'https://schmidt-marketing.de',
      status: 'ACTIVE',
    },
  });

  // Projekte erstellen
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Relaunch',
      description: 'Kompletter Relaunch der Unternehmenswebsite',
      status: 'IN_PROGRESS',
      budget: 5000.00,
      startDate: new Date('2025-01-15'),
      clientId: client1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Online Shop',
      description: 'E-Commerce Lösung mit Shopify',
      status: 'PLANNING',
      budget: 8000.00,
      startDate: new Date('2025-02-01'),
      clientId: client2.id,
    },
  });

  // Tasks erstellen
  await prisma.task.createMany({
    data: [
      {
        title: 'Design Mockups erstellen',
        description: 'Figma Mockups für alle Hauptseiten',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2025-01-20'),
        projectId: project1.id,
      },
      {
        title: 'Frontend Development',
        description: 'Next.js Implementierung',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2025-02-15'),
        projectId: project1.id,
      },
      {
        title: 'Produktdatenbank aufbauen',
        description: 'Alle Produkte in Shopify importieren',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2025-02-10'),
        projectId: project2.id,
      },
    ],
  });

  // Notes erstellen
  await prisma.note.createMany({
    data: [
      {
        title: 'Kickoff Meeting Notizen',
        content: 'Kunde möchte moderne, minimalistische Designs. Hauptfarbe: Blau (#0066CC)',
        projectId: project1.id,
      },
      {
        title: 'Zahlungsanbieter',
        content: 'Stripe als Payment Provider gewünscht',
        projectId: project2.id,
      },
    ],
  });

  console.log('✅ Seed-Daten erfolgreich erstellt!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Seed ausführen
```bash
# In package.json hinzufügen:
# "db:seed": "tsx prisma/seed.ts"

npm install -D tsx
npm run db:seed
```

---

## 📊 Tabellen-Details

### Tabelle: `clients`
Verwaltung aller Kunden der Agentur.

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | UUID | Eindeutige ID | PRIMARY KEY |
| `name` | VARCHAR(255) | Kundenname | NOT NULL |
| `email` | VARCHAR(255) | E-Mail-Adresse | UNIQUE, NOT NULL |
| `phone` | VARCHAR(50) | Telefonnummer | NULLABLE |
| `company` | VARCHAR(255) | Firmenname | NULLABLE |
| `website` | VARCHAR(255) | Website-URL | NULLABLE |
| `status` | ENUM | Status: 'active', 'inactive', 'potential' | DEFAULT 'active' |
| `created_at` | TIMESTAMP | Erstellungsdatum | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Letzte Änderung | DEFAULT NOW() |

### Indizes
- `idx_clients_email` auf `email`
- `idx_clients_status` auf `status`

---

## Tabelle: `projects`
Verwaltung aller Projekte pro Kunde.

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | UUID | Eindeutige ID | PRIMARY KEY |
| `client_id` | UUID | Referenz auf Kunde | FOREIGN KEY → clients(id), NOT NULL |
| `name` | VARCHAR(255) | Projektname | NOT NULL |
| `description` | TEXT | Projektbeschreibung | NULLABLE |
| `status` | ENUM | Status: 'planning', 'in_progress', 'review', 'completed', 'on_hold' | DEFAULT 'planning' |
| `budget` | DECIMAL(10,2) | Budget in EUR | NULLABLE |
| `start_date` | DATE | Startdatum | NULLABLE |
| `end_date` | DATE | Enddatum | NULLABLE |
| `created_at` | TIMESTAMP | Erstellungsdatum | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Letzte Änderung | DEFAULT NOW() |

### Indizes
- `idx_projects_client_id` auf `client_id`
- `idx_projects_status` auf `status`

### Beziehungen
- `client_id` → `clients.id` (ON DELETE CASCADE)

---

## Tabelle: `tasks`
Aufgaben pro Projekt.

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | UUID | Eindeutige ID | PRIMARY KEY |
| `project_id` | UUID | Referenz auf Projekt | FOREIGN KEY → projects(id), NOT NULL |
| `title` | VARCHAR(255) | Aufgabentitel | NOT NULL |
| `description` | TEXT | Aufgabenbeschreibung | NULLABLE |
| `status` | ENUM | Status: 'todo', 'in_progress', 'done' | DEFAULT 'todo' |
| `priority` | ENUM | Priorität: 'low', 'medium', 'high' | DEFAULT 'medium' |
| `due_date` | DATE | Fälligkeitsdatum | NULLABLE |
| `created_at` | TIMESTAMP | Erstellungsdatum | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Letzte Änderung | DEFAULT NOW() |

### Indizes
- `idx_tasks_project_id` auf `project_id`
- `idx_tasks_status` auf `status`
- `idx_tasks_due_date` auf `due_date`

### Beziehungen
- `project_id` → `projects.id` (ON DELETE CASCADE)

---

## Tabelle: `notes`
Notizen pro Projekt.

| Feld | Typ | Beschreibung | Constraints |
|------|-----|--------------|-------------|
| `id` | UUID | Eindeutige ID | PRIMARY KEY |
| `project_id` | UUID | Referenz auf Projekt | FOREIGN KEY → projects(id), NOT NULL |
| `title` | VARCHAR(255) | Notiz-Titel | NOT NULL |
| `content` | TEXT | Notiz-Inhalt | NOT NULL |
| `created_at` | TIMESTAMP | Erstellungsdatum | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Letzte Änderung | DEFAULT NOW() |

### Indizes
- `idx_notes_project_id` auf `project_id`

### Beziehungen
- `project_id` → `projects.id` (ON DELETE CASCADE)

---

## 💡 Prisma Client Verwendung

### Setup in Next.js
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Query-Beispiele

#### Clients abrufen
```typescript
// Alle Clients
const clients = await prisma.client.findMany({
  orderBy: { createdAt: 'desc' },
});

// Client mit Projekten
const client = await prisma.client.findUnique({
  where: { id: clientId },
  include: {
    projects: {
      orderBy: { createdAt: 'desc' },
    },
  },
});

// Client erstellen
const newClient = await prisma.client.create({
  data: {
    name: 'Max Mustermann',
    email: 'max@example.com',
    status: 'ACTIVE',
  },
});

// Client aktualisieren
const updatedClient = await prisma.client.update({
  where: { id: clientId },
  data: { status: 'INACTIVE' },
});

// Client löschen
await prisma.client.delete({
  where: { id: clientId },
});
```

#### Projects mit Relations
```typescript
// Project mit allen Relations
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    client: true,
    tasks: {
      orderBy: { createdAt: 'desc' },
    },
    notes: {
      orderBy: { createdAt: 'desc' },
    },
  },
});

// Projekte filtern
const activeProjects = await prisma.project.findMany({
  where: {
    status: 'IN_PROGRESS',
    client: {
      status: 'ACTIVE',
    },
  },
  include: {
    client: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});
```

#### Tasks & Aggregation
```typescript
// Offene Tasks
const openTasks = await prisma.task.findMany({
  where: {
    status: { in: ['TODO', 'IN_PROGRESS'] },
  },
  include: {
    project: {
      include: {
        client: true,
      },
    },
  },
});

// Task-Statistiken
const taskStats = await prisma.task.groupBy({
  by: ['status'],
  _count: {
    status: true,
  },
});
```

---

## 🔄 Migration & Erweiterung

### Zukünftige Erweiterungen
Für spätere Features können folgende Models hinzugefügt werden:

#### User Management (Multi-User)
```prisma
model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique @map("clerk_id")
  email     String   @unique
  name      String
  role      UserRole @default(USER)
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("users")
}

enum UserRole {
  ADMIN
  USER
  CLIENT
}
```

#### Tags/Labels
```prisma
model Tag {
  id       String        @id @default(uuid())
  name     String        @unique
  color    String        @default("#6B7280")
  
  projects ProjectTag[]
  
  @@map("tags")
}

model ProjectTag {
  projectId String  @map("project_id")
  tagId     String  @map("tag_id")
  
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tag       Tag     @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([projectId, tagId])
  @@map("project_tags")
}
```

#### Zeiterfassung
```prisma
model TimeEntry {
  id          String   @id @default(uuid())
  description String?
  hours       Decimal  @db.Decimal(5, 2)
  date        DateTime @db.Date
  
  projectId   String   @map("project_id")
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now()) @map("created_at")
  
  @@index([projectId])
  @@index([date])
  @@map("time_entries")
}
```

### Migration durchführen
```bash
# Änderungen am Schema vornehmen, dann:
npx prisma migrate dev --name add_user_management

# Production:
npx prisma migrate deploy
```

---

## 🔍 Best Practices

### 1. Type-Safety nutzen
```typescript
import { Prisma } from '@prisma/client';

// Type-safe includes
const projectWithRelations = Prisma.validator<Prisma.ProjectDefaultArgs>()({
  include: {
    client: true,
    tasks: true,
    notes: true,
  },
});

type ProjectWithRelations = Prisma.ProjectGetPayload<typeof projectWithRelations>;
```

### 2. Reusable Queries
```typescript
// lib/queries/projects.ts
export const getProjectWithDetails = (id: string) =>
  prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      tasks: { where: { status: { not: 'DONE' } } },
      notes: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
```

### 3. Transactions
```typescript
// Client mit Projekt erstellen (atomisch)
const result = await prisma.$transaction(async (tx) => {
  const client = await tx.client.create({
    data: { name: 'Test', email: 'test@example.com' },
  });

  const project = await tx.project.create({
    data: {
      name: 'Erstes Projekt',
      clientId: client.id,
    },
  });

  return { client, project };
});
```

---

## 📝 Zusammenfassung

### Vorteile von Prisma:
- ✅ **Type-Safety**: Automatisch generierte Types
- ✅ **Migrations**: Versionierte DB-Änderungen
- ✅ **Prisma Studio**: Grafisches DB-Tool
- ✅ **Performance**: Optimierte Queries
- ✅ **Developer Experience**: IntelliSense & Auto-Complete
- ✅ **Relations**: Einfaches Arbeiten mit verknüpften Daten

### Nächste Schritte:
1. ✅ Prisma installieren und initialisieren
2. ✅ Schema in `prisma/schema.prisma` einfügen
3. ✅ `npx prisma db push` ausführen
4. ✅ Seed-Daten erstellen
5. ✅ Prisma Client in API-Routen nutzen
