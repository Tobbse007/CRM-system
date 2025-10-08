# Setup-Anleitung: Webdesign-CRM

## 🎯 Schritt-für-Schritt Anleitung

### Phase 1: Projekt-Setup (15 Min)

#### 1.1 Next.js Projekt erstellen
```bash
npx create-next-app@latest crm-system --typescript --tailwind --app --src-dir=false
cd crm-system
```

Auswahl bei der Installation:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes
- ✅ `src/` directory: No
- ✅ App Router: Yes
- ✅ Import alias: @/* (Standard)

#### 1.2 Dependencies installieren
```bash
# Core Dependencies
npm install @prisma/client @tanstack/react-query @tanstack/react-query-devtools
npm install react-hook-form @hookform/resolvers zod
npm install date-fns lucide-react sonner
npm install class-variance-authority clsx tailwind-merge tailwindcss-animate

# Dev Dependencies
npm install -D prisma tsx

# Auth (Clerk)
npm install @clerk/nextjs
```

#### 1.3 Shadcn/UI initialisieren
```bash
npx shadcn-ui@latest init
```

Auswahl:
- Style: Default
- Base color: Slate (oder nach Wunsch)
- CSS variables: Yes

Komponenten installieren:
```bash
npx shadcn-ui@latest add button card table dialog input select badge dropdown-menu form label textarea toast
```

---

### Phase 2: Datenbank Setup (20 Min)

#### 2.1 Supabase Projekt erstellen
1. Gehe zu [supabase.com](https://supabase.com)
2. Erstelle neues Projekt
3. Warte bis Datenbank bereit ist
4. Kopiere Connection Strings aus Settings → Database

#### 2.2 Prisma Setup
```bash
npx prisma init
```

#### 2.3 Environment Variables
Erstelle `.env.local`:
```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 2.4 Prisma Schema erstellen
Kopiere das komplette Schema aus `docs/DB_STRUCTURE.md` in `prisma/schema.prisma`

#### 2.5 Datenbank initialisieren
```bash
# Prisma Client generieren
npx prisma generate

# Schema zu DB pushen
npx prisma db push

# Prisma Studio öffnen (optional)
npx prisma studio
```

#### 2.6 Seed-Daten erstellen
Erstelle `prisma/seed.ts` (siehe DB_STRUCTURE.md für Code)

```bash
# In package.json hinzufügen:
"scripts": {
  "db:push": "prisma db push",
  "db:studio": "prisma studio",
  "db:seed": "tsx prisma/seed.ts"
}

# Seed ausführen
npm run db:seed
```

---

### Phase 3: Auth Setup (15 Min)

#### 3.1 Clerk Account erstellen
1. Gehe zu [clerk.com](https://clerk.com)
2. Erstelle neue Application
3. Kopiere API Keys

#### 3.2 Clerk Middleware
Erstelle `middleware.ts` im Root:
```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/"],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

#### 3.3 Clerk Provider
Aktualisiere `app/layout.tsx`:
```typescript
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

### Phase 4: Core Files Setup (30 Min)

#### 4.1 Prisma Client
Erstelle `lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### 4.2 Utils
Erstelle `lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
```

#### 4.3 Validation Schemas
Erstelle `lib/validations/client.ts`, `project.ts`, `task.ts` (siehe API_ROUTES.md)

#### 4.4 TypeScript Types
Erstelle `types/index.ts`:
```typescript
import { Prisma } from '@prisma/client';

// Client Types
export type Client = Prisma.ClientGetPayload<{}>;
export type ClientWithProjects = Prisma.ClientGetPayload<{
  include: { projects: true };
}>;

// Project Types
export type Project = Prisma.ProjectGetPayload<{}>;
export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: { client: true; tasks: true; notes: true };
}>;

// Task Types
export type Task = Prisma.TaskGetPayload<{}>;
export type TaskWithProject = Prisma.TaskGetPayload<{
  include: { project: true };
}>;

// Note Types
export type Note = Prisma.NoteGetPayload<{}>;
```

#### 4.5 TanStack Query Provider
Erstelle `components/providers/query-provider.tsx`:
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Dann in `app/layout.tsx` einbinden:
```typescript
import { QueryProvider } from '@/components/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

---

### Phase 5: Erste API Route (20 Min)

Erstelle `app/api/clients/route.ts` mit dem Code aus `docs/API_ROUTES.md`

Test:
```bash
# Terminal 1: Server starten
npm run dev

# Terminal 2: API testen
curl http://localhost:3000/api/clients
```

---

### Phase 6: Layout & Navigation (30 Min)

#### 6.1 Sidebar erstellen
Erstelle `components/layout/sidebar.tsx`:
```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, FolderKanban, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Kunden', href: '/clients', icon: Users },
  { name: 'Projekte', href: '/projects', icon: FolderKanban },
  { name: 'Aufgaben', href: '/tasks', icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white p-6">
      <div className="text-2xl font-bold mb-8">CRM</div>
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

#### 6.2 Header erstellen
Erstelle `components/layout/header.tsx`:
```typescript
import { UserButton } from '@clerk/nextjs';

export function Header() {
  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div className="text-xl font-semibold">Webdesign CRM</div>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
```

#### 6.3 Dashboard Layout
Erstelle `app/(dashboard)/layout.tsx`:
```typescript
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

### Phase 7: Erste Seite (Clients) (60 Min)

#### 7.1 Custom Hook
Erstelle `hooks/use-clients.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from '@/types';
import { ClientFormData } from '@/lib/validations/client';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      return data.data as Client[];
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClientFormData) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
```

#### 7.2 Clients Page
Erstelle `app/(dashboard)/clients/page.tsx`:
```typescript
'use client';

import { useClients } from '@/hooks/use-clients';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function ClientsPage() {
  const { data: clients, isLoading, error } = useClients();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Kunden</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Neuer Kunde
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">E-Mail</th>
              <th className="text-left p-4">Firma</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients?.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{client.name}</td>
                <td className="p-4">{client.email}</td>
                <td className="p-4">{client.company || '-'}</td>
                <td className="p-4">{client.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## ✅ Checkliste

### Phase 1: Projekt-Setup
- [ ] Next.js Projekt erstellt
- [ ] Dependencies installiert
- [ ] Shadcn/UI initialisiert

### Phase 2: Datenbank
- [ ] Supabase Projekt erstellt
- [ ] Prisma Schema erstellt
- [ ] Datenbank initialisiert
- [ ] Seed-Daten geladen

### Phase 3: Auth
- [ ] Clerk Account erstellt
- [ ] Middleware konfiguriert
- [ ] Provider eingebunden

### Phase 4: Core Files
- [ ] Prisma Client Setup
- [ ] Utils erstellt
- [ ] Validation Schemas
- [ ] TypeScript Types
- [ ] TanStack Query Provider

### Phase 5: API
- [ ] Erste API Route erstellt
- [ ] API getestet

### Phase 6: Layout
- [ ] Sidebar erstellt
- [ ] Header erstellt
- [ ] Dashboard Layout

### Phase 7: Erste Seite
- [ ] Custom Hook erstellt
- [ ] Clients Page erstellt
- [ ] Funktioniert!

---

## 🚀 Nächste Schritte

Nach dem Setup:
1. ✅ Client CRUD komplett (Create, Update, Delete)
2. ✅ Projects Seiten
3. ✅ Tasks Seiten
4. ✅ Dashboard mit Stats
5. ✅ Filter & Suche
6. ✅ Mobile Responsive

---

## 🆘 Troubleshooting

### Prisma Errors
```bash
# Reset DB
npx prisma migrate reset

# Regenerate Client
npx prisma generate
```

### Clerk Auth Issues
- Überprüfe API Keys in `.env.local`
- Stelle sicher dass Middleware richtig konfiguriert ist

### TypeScript Errors
```bash
# Type-Check
npx tsc --noEmit
```

---

## 📚 Weitere Ressourcen

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Shadcn/UI Docs](https://ui.shadcn.com)
