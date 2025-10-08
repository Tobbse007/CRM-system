# API-Routen

> **⚡ Optimiert mit Prisma & Next.js 14+ App Router**

## Übersicht
Alle API-Routen befinden sich im `/app/api` Verzeichnis und nutzen Next.js API Routes mit TypeScript.  
Base URL: `http://localhost:3000/api` (Development)

## 🔒 Authentifizierung
Für das MVP wird **Clerk Auth** verwendet. Alle geschützten Routen benötigen Authentifizierung:

```typescript
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ...
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 📋 Clients (Kunden)

### GET `/api/clients`
Alle Kunden abrufen.

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Max Mustermann",
      "email": "max@example.com",
      "phone": "+49 123 456789",
      "company": "Mustermann GmbH",
      "website": "https://mustermann.de",
      "status": "active",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/clients/[id]`
Einzelnen Kunden abrufen.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "phone": "+49 123 456789",
    "company": "Mustermann GmbH",
    "website": "https://mustermann.de",
    "status": "active",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
}
```

**Response (404)**
```json
{
  "success": false,
  "error": "Client not found"
}
```

---

### POST `/api/clients`
Neuen Kunden erstellen.

**Request Body**
```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "phone": "+49 123 456789",
  "company": "Mustermann GmbH",
  "website": "https://mustermann.de",
  "status": "active"
}
```

**Required Fields:** `name`, `email`

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "phone": "+49 123 456789",
    "company": "Mustermann GmbH",
    "website": "https://mustermann.de",
    "status": "active",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
}
```

**Response (400)**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### PUT `/api/clients/[id]`
Kunden aktualisieren.

**Request Body**
```json
{
  "name": "Max Mustermann",
  "email": "max@example.com",
  "phone": "+49 123 456789",
  "company": "Mustermann GmbH",
  "website": "https://mustermann.de",
  "status": "inactive"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Max Mustermann",
    "email": "max@example.com",
    "phone": "+49 123 456789",
    "company": "Mustermann GmbH",
    "website": "https://mustermann.de",
    "status": "inactive",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-08T10:00:00Z"
  }
}
```

---

### DELETE `/api/clients/[id]`
Kunden löschen (inkl. aller zugehörigen Projekte durch CASCADE).

**Response (200)**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

**Response (404)**
```json
{
  "success": false,
  "error": "Client not found"
}
```

---

## 🚀 Projects (Projekte)

### GET `/api/projects`
Alle Projekte abrufen.

**Query Parameters:**
- `client_id` (optional) - Filter nach Kunden-ID
- `status` (optional) - Filter nach Status

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "client": {
        "id": "uuid",
        "name": "Max Mustermann",
        "email": "max@example.com"
      },
      "name": "Website Relaunch",
      "description": "Kompletter Relaunch der Unternehmenswebsite",
      "status": "in_progress",
      "budget": 5000.00,
      "start_date": "2025-01-15",
      "end_date": null,
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/projects/[id]`
Einzelnes Projekt abrufen (inkl. Kunden-Info, Tasks und Notes).

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "client_id": "uuid",
    "client": {
      "id": "uuid",
      "name": "Max Mustermann",
      "email": "max@example.com"
    },
    "name": "Website Relaunch",
    "description": "Kompletter Relaunch der Unternehmenswebsite",
    "status": "in_progress",
    "budget": 5000.00,
    "start_date": "2025-01-15",
    "end_date": null,
    "tasks": [...],
    "notes": [...],
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
}
```

---

### POST `/api/projects`
Neues Projekt erstellen.

**Request Body**
```json
{
  "client_id": "uuid",
  "name": "Website Relaunch",
  "description": "Kompletter Relaunch der Unternehmenswebsite",
  "status": "planning",
  "budget": 5000.00,
  "start_date": "2025-01-15",
  "end_date": null
}
```

**Required Fields:** `client_id`, `name`

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "client_id": "uuid",
    "name": "Website Relaunch",
    "description": "Kompletter Relaunch der Unternehmenswebsite",
    "status": "planning",
    "budget": 5000.00,
    "start_date": "2025-01-15",
    "end_date": null,
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
}
```

---

### PUT `/api/projects/[id]`
Projekt aktualisieren.

**Request Body**
```json
{
  "name": "Website Relaunch",
  "description": "Kompletter Relaunch der Unternehmenswebsite",
  "status": "completed",
  "budget": 5500.00,
  "start_date": "2025-01-15",
  "end_date": "2025-03-01"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE `/api/projects/[id]`
Projekt löschen (inkl. aller Tasks und Notes durch CASCADE).

**Response (200)**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## ✅ Tasks (Aufgaben)

### GET `/api/tasks`
Alle Aufgaben abrufen.

**Query Parameters:**
- `project_id` (optional) - Filter nach Projekt-ID
- `status` (optional) - Filter nach Status

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "project": {
        "id": "uuid",
        "name": "Website Relaunch"
      },
      "title": "Design Mockups erstellen",
      "description": "Figma Mockups für alle Hauptseiten",
      "status": "done",
      "priority": "high",
      "due_date": "2025-01-20",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/tasks/[id]`
Einzelne Aufgabe abrufen.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "project_id": "uuid",
    "title": "Design Mockups erstellen",
    "description": "Figma Mockups für alle Hauptseiten",
    "status": "done",
    "priority": "high",
    "due_date": "2025-01-20",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
}
```

---

### POST `/api/tasks`
Neue Aufgabe erstellen.

**Request Body**
```json
{
  "project_id": "uuid",
  "title": "Design Mockups erstellen",
  "description": "Figma Mockups für alle Hauptseiten",
  "status": "todo",
  "priority": "high",
  "due_date": "2025-01-20"
}
```

**Required Fields:** `project_id`, `title`

**Response (201)**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PUT `/api/tasks/[id]`
Aufgabe aktualisieren.

**Request Body**
```json
{
  "title": "Design Mockups erstellen",
  "description": "Figma Mockups für alle Hauptseiten",
  "status": "done",
  "priority": "high",
  "due_date": "2025-01-20"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE `/api/tasks/[id]`
Aufgabe löschen.

**Response (200)**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 📝 Notes (Notizen)

### GET `/api/notes`
Alle Notizen abrufen.

**Query Parameters:**
- `project_id` (optional) - Filter nach Projekt-ID

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "project": {
        "id": "uuid",
        "name": "Website Relaunch"
      },
      "title": "Kickoff Meeting Notizen",
      "content": "Kunde möchte moderne, minimalistische Designs. Hauptfarbe: Blau (#0066CC)",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-01T10:00:00Z"
    }
  ]
}
```

---

### GET `/api/notes/[id]`
Einzelne Notiz abrufen.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "project_id": "uuid",
    "title": "Kickoff Meeting Notizen",
    "content": "Kunde möchte moderne, minimalistische Designs. Hauptfarbe: Blau (#0066CC)",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  }
}
```

---

### POST `/api/notes`
Neue Notiz erstellen.

**Request Body**
```json
{
  "project_id": "uuid",
  "title": "Kickoff Meeting Notizen",
  "content": "Kunde möchte moderne, minimalistische Designs. Hauptfarbe: Blau (#0066CC)"
}
```

**Required Fields:** `project_id`, `title`, `content`

**Response (201)**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### PUT `/api/notes/[id]`
Notiz aktualisieren.

**Request Body**
```json
{
  "title": "Kickoff Meeting Notizen",
  "content": "Kunde möchte moderne, minimalistische Designs. Hauptfarbe: Blau (#0066CC)"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### DELETE `/api/notes/[id]`
Notiz löschen.

**Response (200)**
```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

---

## 📊 Dashboard

### GET `/api/dashboard`
Dashboard-Statistiken abrufen.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_clients": 15,
      "active_clients": 12,
      "total_projects": 28,
      "active_projects": 8,
      "total_tasks": 145,
      "open_tasks": 42,
      "tasks_due_soon": 5
    },
    "recent_projects": [...],
    "upcoming_tasks": [...]
  }
}
```

---

## Error Handling

Alle API-Routen nutzen ein einheitliches Error-Format:

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## 💻 Implementierung mit Prisma

### API Route Structure

```
app/api/
├── clients/
│   ├── route.ts           # GET /api/clients, POST /api/clients
│   └── [id]/
│       └── route.ts       # GET, PUT, DELETE /api/clients/[id]
├── projects/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── tasks/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── notes/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
└── dashboard/
    └── route.ts
```

---

### Beispiel: `/app/api/clients/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { clientSchema } from '@/lib/validations/client';
import { z } from 'zod';

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clients = await prisma.client.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: clients });
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validation mit Zod
    const validated = clientSchema.parse(body);

    // Check if email exists
    const existingClient = await prisma.client.findUnique({
      where: { email: validated.email },
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: validated,
    });

    return NextResponse.json(
      { success: true, data: client },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: error.errors },
        { status: 400 }
      );
    }
    
    console.error('POST /api/clients error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
```

---

### Beispiel: `/app/api/clients/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { clientSchema } from '@/lib/validations/client';
import { z } from 'zod';

// GET /api/clients/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id, deletedAt: null },
      include: {
        projects: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = clientSchema.parse(body);

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id, deletedAt: null },
    });

    if (!existingClient) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Check email uniqueness (if email changed)
    if (validated.email !== existingClient.email) {
      const emailExists = await prisma.client.findUnique({
        where: { email: validated.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 400 }
        );
      }
    }

    const client = await prisma.client.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json({ success: true, data: client });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('PUT /api/clients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Soft Delete (optional)
    // await prisma.client.update({
    //   where: { id: params.id },
    //   data: { deletedAt: new Date() },
    // });

    // Hard Delete (CASCADE löscht auch Projekte, Tasks, Notes)
    await prisma.client.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
```

---

## 🔍 Validation Schemas

### `/lib/validations/client.ts`

```typescript
import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Ungültige URL').optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'POTENTIAL']).default('ACTIVE'),
});

export type ClientFormData = z.infer<typeof clientSchema>;
```

### `/lib/validations/project.ts`

```typescript
import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  description: z.string().optional(),
  clientId: z.string().uuid('Ungültige Client-ID'),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'ON_HOLD']).default('PLANNING'),
  budget: z.number().positive('Budget muss positiv sein').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
```

### `/lib/validations/task.ts`

```typescript
import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(2, 'Titel muss mindestens 2 Zeichen lang sein'),
  description: z.string().optional(),
  projectId: z.string().uuid('Ungültige Project-ID'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
```

---

## 🎯 Advanced Features

### Query Parameters & Filtering

```typescript
// GET /api/projects?status=IN_PROGRESS&clientId=xxx
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');

  const projects = await prisma.project.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(clientId && { clientId }),
      deletedAt: null,
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
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: projects });
}
```

### Pagination

```typescript
// GET /api/clients?page=1&limit=10
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      skip,
      take: limit,
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.client.count({ where: { deletedAt: null } }),
  ]);

  return NextResponse.json({
    success: true,
    data: clients,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### Search

```typescript
// GET /api/clients?search=mustermann
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  const clients = await prisma.client.findMany({
    where: {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: clients });
}
```

---

## 🧪 Testing

### Mit cURL

```bash
# GET alle Clients
curl http://localhost:3000/api/clients

# POST neuer Client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "test@example.com",
    "status": "ACTIVE"
  }'

# PUT Client aktualisieren
curl -X PUT http://localhost:3000/api/clients/uuid-here \
  -H "Content-Type: application/json" \
  -d '{"status": "INACTIVE"}'

# DELETE Client löschen
curl -X DELETE http://localhost:3000/api/clients/uuid-here
```

### Mit TanStack Query (Frontend)

```typescript
// hooks/useClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json();
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
      if (!res.ok) throw new Error('Failed to create client');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};
```

---

## 📝 Best Practices

### 1. Error Handling
```typescript
try {
  // ...
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', errors: error.errors },
      { status: 400 }
    );
  }
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Unique constraint violation' },
        { status: 400 }
      );
    }
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 2. Reusable Helpers
```typescript
// lib/api/helpers.ts
export const withAuth = (handler: Function) => async (request: NextRequest, context: any) => {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  return handler(request, context);
};
```

### 3. Type-Safe Responses
```typescript
// types/api.ts
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};
```

---

## 🚀 Alternative: tRPC (für später)

Für noch bessere Type-Safety kann später auf **tRPC** migriert werden:

- ✅ End-to-end Type-Safety
- ✅ Kein manuelles API-Route-Writing
- ✅ Auto-Complete im Frontend
- ✅ Keine Validation-Schemas nötig

Aber für MVP ist REST völlig ausreichend!
      .from('clients')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 400 }
    );
  }
}
```

---

## Testing

### Mit cURL
```bash
# GET alle Clients
curl http://localhost:3000/api/clients

# POST neuer Client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Client","email":"test@example.com"}'

# PUT Client aktualisieren
curl -X PUT http://localhost:3000/api/clients/uuid-here \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# DELETE Client löschen
curl -X DELETE http://localhost:3000/api/clients/uuid-here
```
