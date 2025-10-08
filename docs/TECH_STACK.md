# Tech-Stack Empfehlungen & Optimierungen

## 🎯 Optimierter Tech-Stack für MVP

### ✅ Core Technologies (Perfekt!)
- **Next.js 14+** - App Router, Server Components
- **TypeScript** - Type-Safety
- **TailwindCSS** - Utility-First CSS
- **Shadcn/UI** - Accessible, Customizable Components
- **Lucide React** - Icons

### 🔄 Optimierungen

#### 1. Datenbank & ORM
**VORHER:** Supabase direkt → später Prisma  
**NACHHER:** Prisma von Anfang an mit Supabase PostgreSQL

**Warum?**
- ✅ End-to-end Type-Safety
- ✅ Einfache Migrations
- ✅ Bessere Developer Experience
- ✅ Prisma Studio für DB-Management
- ✅ Auto-Generated Types

**Setup:**
```bash
npm install prisma @prisma/client
npx prisma init
```

---

#### 2. State Management & Data Fetching
**VORHER:** SWR  
**NACHHER:** TanStack Query v5 (React Query)

**Warum?**
- ✅ Bessere DevTools
- ✅ Optimistic Updates
- ✅ Mehr Features (Infinite Queries, Prefetching)
- ✅ Aktiver Support & Community
- ✅ Bessere TypeScript Integration

**Installation:**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

#### 3. Form Handling & Validation
**NEU:** React Hook Form + Zod

**Warum?**
- ✅ Performant (weniger Re-Renders)
- ✅ Type-Safe Validation mit Zod
- ✅ Einfache Integration mit Shadcn/UI
- ✅ Built-in Error Handling

**Installation:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Beispiel:**
```typescript
// lib/validations/client.ts
import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Ungültige URL').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'potential']),
});

export type ClientFormData = z.infer<typeof clientSchema>;
```

---

#### 4. Authentication
**VORHER:** Supabase Auth ODER Clerk  
**NACHHER:** Clerk.dev (Empfehlung)

**Warum Clerk?**
- ✅ Einfachste Integration mit Next.js
- ✅ Schöne, fertige UI-Komponenten
- ✅ Multi-Factor Authentication out-of-the-box
- ✅ User Management Dashboard
- ✅ Webhooks für User-Events
- ✅ Kostenlos bis 5.000 Users

**Alternative:** NextAuth.js (kostenlos, mehr Kontrolle)

**Installation (Clerk):**
```bash
npm install @clerk/nextjs
```

---

#### 5. API-Ansatz
**AKTUELL:** REST mit Next.js API Routes  
**ALTERNATIVE:** tRPC (für später)

**Für MVP:** REST ist völlig ausreichend!  
**Für Zukunft:** tRPC bietet End-to-end Type-Safety ohne Code-Generation

---

## 📦 Komplette Package.json (Optimiert)

```json
{
  "name": "webdesign-crm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    
    "@prisma/client": "^5.18.0",
    "@clerk/nextjs": "^5.3.0",
    
    "@tanstack/react-query": "^5.51.0",
    "@tanstack/react-query-devtools": "^5.51.0",
    
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    
    "date-fns": "^3.6.0",
    "lucide-react": "^0.429.0",
    
    "sonner": "^1.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    
    "prisma": "^5.18.0",
    "tsx": "^4.16.0",
    
    "typescript": "^5.5.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    
    "@tailwindcss/typography": "^0.5.0"
  }
}
```

---

## 🗄️ Prisma Schema (Optimiert)

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

model Client {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  phone     String?
  company   String?
  website   String?
  status    ClientStatus @default(ACTIVE)
  
  // Relations
  projects  Project[]
  
  // Soft Delete
  deletedAt DateTime? @map("deleted_at")
  
  // Timestamps
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

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
  
  // Soft Delete
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

## 🎨 Zusätzliche Empfehlungen

### 1. Toast Notifications
**Empfehlung:** Sonner (bereits in package.json)
```bash
npm install sonner
```

Besser als react-hot-toast:
- ✅ Schöneres Design
- ✅ Bessere UX
- ✅ Mehr Optionen

### 2. Loading States
**Empfehlung:** React Suspense + Loading.tsx (Next.js)
```tsx
// app/(dashboard)/clients/loading.tsx
export default function Loading() {
  return <div>Loading...</div>
}
```

### 3. Error Handling
**Empfehlung:** Error Boundaries + error.tsx (Next.js)
```tsx
// app/(dashboard)/clients/error.tsx
'use client'
export default function Error({ error, reset }) {
  return <div>Error: {error.message}</div>
}
```

---

## 🚀 Migration Strategy

### Phase 1: Setup (Woche 1)
1. ✅ Next.js Projekt initialisieren
2. ✅ Prisma Setup mit Supabase
3. ✅ Clerk Auth Setup
4. ✅ Shadcn/UI Installation
5. ✅ TanStack Query Setup

### Phase 2: Core Features (Woche 2-3)
1. ✅ Datenbank Schema + Migrations
2. ✅ API Routes mit Prisma
3. ✅ Client CRUD
4. ✅ Project CRUD
5. ✅ Task & Notes CRUD

### Phase 3: Polish (Woche 4)
1. ✅ Dashboard mit Stats
2. ✅ Filter & Suche
3. ✅ Loading States
4. ✅ Error Handling
5. ✅ Mobile Responsive

---

## 📊 Performance-Optimierungen

### 1. Server Components (Next.js 14)
Nutze Server Components wo möglich:
- ✅ Weniger JavaScript zum Client
- ✅ Schnellere Initial Loads
- ✅ Bessere SEO

### 2. Optimistic Updates (TanStack Query)
```typescript
const mutation = useMutation({
  mutationFn: updateClient,
  onMutate: async (newClient) => {
    // Optimistic Update
    await queryClient.cancelQueries({ queryKey: ['clients'] })
    const previous = queryClient.getQueryData(['clients'])
    queryClient.setQueryData(['clients'], (old) => [...old, newClient])
    return { previous }
  },
})
```

### 3. Prisma Query Optimization
```typescript
// Inkludiere Relations nur wenn nötig
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    client: true,
    tasks: { where: { status: 'TODO' } },
    notes: { orderBy: { createdAt: 'desc' } }
  }
})
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
```env
# .env.local
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

### 2. Clerk Middleware
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 3. API Route Protection
```typescript
import { auth } from "@clerk/nextjs";

export async function GET() {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  // ...
}
```

---

## 🎯 Fazit

### ✅ Empfohlener Stack (Optimiert):
1. **Next.js 14+** - App Router, Server Components
2. **Prisma** - ORM mit Type-Safety
3. **Supabase PostgreSQL** - Datenbank
4. **Clerk** - Authentication
5. **TanStack Query** - Data Fetching
6. **React Hook Form + Zod** - Forms & Validation
7. **Shadcn/UI** - UI Components
8. **TailwindCSS** - Styling
9. **Sonner** - Toasts

Dieser Stack ist:
- ✅ **Modern** - Latest Best Practices
- ✅ **Type-Safe** - Von DB bis UI
- ✅ **Developer-Friendly** - Beste DX
- ✅ **Performant** - Optimiert für Speed
- ✅ **Skalierbar** - Bereit für Wachstum
