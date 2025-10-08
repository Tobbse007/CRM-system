# Feature #9: Echtzeit-Benachrichtigungssystem 🔔

> **Status:** IN PROGRESS  
> **Priorität:** HIGH  
> **Geschätzte Entwicklungszeit:** 6-8 Stunden

## 🎯 Ziel

Ein vollständiges Echtzeit-Benachrichtigungssystem, das Benutzer über wichtige Events informiert:
- ✅ Neue Projekte, Aufgaben, Kunden
- ✅ Überfällige Tasks
- ✅ Status-Änderungen
- ✅ Budget-Warnungen
- ✅ Team-Aktivitäten
- ✅ System-Nachrichten

**Perfektes Design + Geile Funktionen + Smooth Animations!**

---

## 📋 Notification Types

### 1. **PROJECT** (Projekt-bezogen)
- 🎨 **Icon:** Folder
- 🎨 **Color:** Blue-600
- **Events:**
  - Neues Projekt erstellt
  - Projekt-Status geändert
  - Projekt abgeschlossen
  - Budget-Warnung (>90% verbraucht)

### 2. **TASK** (Aufgaben-bezogen)
- 🎨 **Icon:** CheckSquare
- 🎨 **Color:** Purple-600
- **Events:**
  - Neue Aufgabe zugewiesen
  - Aufgabe abgeschlossen
  - Aufgabe überfällig
  - Priorität geändert

### 3. **CLIENT** (Kunden-bezogen)
- 🎨 **Icon:** Users
- 🎨 **Color:** Green-600
- **Events:**
  - Neuer Kunde erstellt
  - Kunde aktualisiert
  - Kunde-Status geändert (aktiv/inaktiv)

### 4. **TEAM** (Team-bezogen)
- 🎨 **Icon:** UserPlus
- 🎨 **Color:** Indigo-600
- **Events:**
  - Team-Mitglied hinzugefügt
  - Zuweisungen geändert
  - Team-Update

### 5. **DEADLINE** (Fristen)
- 🎨 **Icon:** Clock
- 🎨 **Color:** Orange-600
- **Events:**
  - Task-Deadline morgen
  - Task-Deadline heute
  - Task überfällig (täglich)
  - Projekt-Enddatum bald

### 6. **SYSTEM** (System-Nachrichten)
- 🎨 **Icon:** Bell
- 🎨 **Color:** Gray-600
- **Events:**
  - System-Updates
  - Wartungsarbeiten
  - Feature-Ankündigungen
  - Wichtige Hinweise

---

## 🗄️ Datenbank-Schema

```prisma
model Notification {
  id         String   @id @default(cuid())
  type       NotificationType
  title      String
  message    String
  read       Boolean  @default(false)
  
  // Related Entities (optional)
  projectId  String?
  project    Project? @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  taskId     String?
  task       Task?    @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  clientId   String?
  client     Client?  @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  // Metadata
  link       String?  // Deep-link zur Entity (z.B. /projects/[id])
  priority   Priority @default(NORMAL)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  @@index([read])
  @@index([createdAt])
  @@index([type])
}

enum NotificationType {
  PROJECT
  TASK
  CLIENT
  TEAM
  DEADLINE
  SYSTEM
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

---

## 🎨 Design System

### Color Palette (Type-basiert)
```css
PROJECT:  bg-blue-50    border-blue-200    text-blue-700
TASK:     bg-purple-50  border-purple-200  text-purple-700
CLIENT:   bg-green-50   border-green-200   text-green-700
TEAM:     bg-indigo-50  border-indigo-200  text-indigo-700
DEADLINE: bg-orange-50  border-orange-200  text-orange-700
SYSTEM:   bg-gray-50    border-gray-200    text-gray-700
```

### Priority Colors
```css
LOW:     text-gray-500
NORMAL:  text-blue-600
HIGH:    text-orange-600
URGENT:  text-red-600 + animate-pulse
```

### States
- **Ungelesen:** Bold text, Blue dot, Subtle glow
- **Gelesen:** Normal text, Muted colors, Reduced opacity
- **Hover:** Scale 1.01, Shadow-md
- **Active:** Border-primary, Scale 0.99

### Animations
- **Badge Bounce:** Neue Notification → Badge pulsiert
- **Bell Shake:** Bei neuer Notification → Bell wackelt
- **Slide In:** Neue Notification → Von rechts einschieben
- **Fade Out:** Als gelesen markieren → Sanft ausblenden
- **Glow Pulse:** Ungelesene → Subtiler Glow-Effekt

---

## 🏗️ Komponenten-Architektur

### 1. NotificationBell (Sidebar/Header)
```tsx
<NotificationBell>
  <Bell icon with badge />
  <DropdownMenu>
    <NotificationList preview={5} />
    <MarkAllAsRead button />
    <ViewAll link to /notifications />
  </DropdownMenu>
</NotificationBell>
```

**Features:**
- Badge mit Anzahl ungelesener (max 99+)
- Dropdown mit 5 neuesten Notifications
- "Alle als gelesen markieren" Button
- "Alle anzeigen" Link
- Sound-Toggle
- Settings-Icon

### 2. NotificationItem
```tsx
<NotificationItem>
  <Icon type={type} />
  <Content>
    <Title bold={!read} />
    <Message truncated />
    <Timestamp relative />
  </Content>
  <Actions>
    <MarkRead />
    <Delete />
  </Actions>
</NotificationItem>
```

**Features:**
- Type-basiertes Icon mit Color
- Read/Unread State
- Relative Zeit ("vor 2 Min", "vor 1 Std")
- Click → Mark as read + Navigate to entity
- Hover → Show actions
- Swipe-to-delete (Mobile)

### 3. NotificationCenter (Page)
```tsx
<NotificationCenter>
  <Header>
    <Title />
    <Actions>
      <MarkAllRead />
      <DeleteAll />
      <Settings />
    </Actions>
  </Header>
  
  <Filters>
    <TypeFilter />
    <ReadFilter />
    <DateFilter />
  </Filters>
  
  <NotificationList>
    <DateGroup>
      <NotificationItem />
      ...
    </DateGroup>
  </NotificationList>
  
  <LoadMore />
</NotificationCenter>
```

**Features:**
- Gruppierung nach Datum (Heute, Gestern, Diese Woche, Älter)
- Filter nach Type
- Filter nach Read/Unread
- Search-Funktionalität
- Infinite Scroll / Pagination
- Empty State mit Animation

### 4. NotificationSettingsDialog
```tsx
<NotificationSettings>
  <EnableNotifications switch />
  <SoundEnabled switch />
  <DesktopNotifications switch />
  <EmailNotifications switch (future) />
  
  <TypeSettings>
    <TypeToggle type="PROJECT" />
    <TypeToggle type="TASK" />
    <TypeToggle type="CLIENT" />
    ...
  </TypeSettings>
  
  <TestNotification button />
</NotificationSettings>
```

---

## 🔗 API Endpoints

### GET `/api/notifications`
Alle Notifications abrufen (mit Filtern).

**Query Params:**
- `read`: boolean (filter by read status)
- `type`: NotificationType
- `limit`: number (default: 50)
- `offset`: number (pagination)

**Response:**
```json
{
  "notifications": [
    {
      "id": "clx123...",
      "type": "PROJECT",
      "title": "Neues Projekt erstellt",
      "message": "Website Relaunch für Kunde Max Mustermann",
      "read": false,
      "link": "/projects/clx456",
      "priority": "NORMAL",
      "createdAt": "2025-10-08T10:30:00Z",
      "project": { "name": "Website Relaunch" }
    }
  ],
  "unreadCount": 12,
  "total": 156
}
```

### POST `/api/notifications`
Neue Notification erstellen.

**Body:**
```json
{
  "type": "TASK",
  "title": "Aufgabe überfällig",
  "message": "Design Mockups ist seit 2 Tagen überfällig",
  "taskId": "clx789",
  "link": "/projects/clx456",
  "priority": "HIGH"
}
```

### PATCH `/api/notifications/:id/read`
Notification als gelesen markieren.

### PATCH `/api/notifications/mark-all-read`
Alle Notifications als gelesen markieren.

### DELETE `/api/notifications/:id`
Notification löschen.

### DELETE `/api/notifications/all`
Alle gelesenen Notifications löschen.

---

## 🔧 Notification Service

### Trigger-Funktionen
```typescript
// lib/notifications/create-notification.ts
export async function createNotification({
  type,
  title,
  message,
  projectId,
  taskId,
  clientId,
  link,
  priority = 'NORMAL'
}: CreateNotificationInput) {
  return prisma.notification.create({
    data: { ... }
  });
}

// Trigger bei Events
export async function notifyProjectCreated(project: Project) {
  await createNotification({
    type: 'PROJECT',
    title: 'Neues Projekt erstellt',
    message: `${project.name} für ${project.client.name}`,
    projectId: project.id,
    link: `/projects/${project.id}`,
    priority: 'NORMAL'
  });
}

export async function notifyTaskOverdue(task: Task) {
  await createNotification({
    type: 'DEADLINE',
    title: 'Aufgabe überfällig',
    message: `${task.title} ist seit ${daysOverdue} Tagen überfällig`,
    taskId: task.id,
    link: `/projects/${task.projectId}#task-${task.id}`,
    priority: 'HIGH'
  });
}
```

### Auto-Triggers
```typescript
// Integration in API Routes
// app/api/projects/route.ts
export async function POST(req: Request) {
  const project = await prisma.project.create({ ... });
  
  // 🔔 Notification erstellen
  await notifyProjectCreated(project);
  
  return NextResponse.json({ ... });
}
```

---

## ⚡ Echtzeit-Updates

### Polling-Strategie (Simple, ohne WebSocket)
```typescript
// hooks/use-notifications.ts
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Alle 30 Sekunden
    refetchOnWindowFocus: true
  });
}
```

### Mit SSE (Future Enhancement)
```typescript
// app/api/notifications/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // Send notifications as SSE
      const interval = setInterval(async () => {
        const newNotifications = await checkNewNotifications();
        if (newNotifications.length > 0) {
          controller.enqueue(`data: ${JSON.stringify(newNotifications)}\n\n`);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

---

## 🔊 Sound & Desktop Notifications

### Browser Notification API
```typescript
// lib/notifications/browser-notifications.ts
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function showDesktopNotification({
  title,
  message,
  icon = '/logo.png',
  link
}: DesktopNotificationInput) {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: message,
      icon,
      badge: icon,
      tag: 'crm-notification',
      requireInteraction: false
    });
    
    notification.onclick = () => {
      window.focus();
      if (link) window.location.href = link;
      notification.close();
    };
  }
}
```

### Sound Effects
```typescript
// lib/notifications/sounds.ts
export function playNotificationSound() {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {
    // User hasn't interacted yet
  });
}
```

---

## 🎁 Bonus Features

### 1. Notification Gruppierung
Mehrere ähnliche Notifications zusammenfassen:
```
"3 neue Aufgaben wurden erstellt" statt 3 einzelne
```

### 2. Snooze-Funktion
Notification für X Minuten/Stunden ausblenden.

### 3. Do Not Disturb
Zeitplan für stille Stunden (z.B. 22:00 - 08:00).

### 4. Rich Notifications
Mit Bildern, Buttons, Action-Links.

### 5. Notification History Export
Export als PDF/Excel für Audit-Trail.

---

## 🚀 Implementation Steps

1. ✅ **Planning & Todo-Liste** (CURRENT)
2. **Notification Schema & Migration**
3. **API Endpoints erstellen**
4. **Notification Service & Hooks**
5. **NotificationBell Component**
6. **NotificationItem Component**
7. **Notification Center Page**
8. **Notification Triggers**
9. **Push Notification Support**
10. **Notification Settings**
11. **Real-time Updates**
12. **Testing, Polish & Commit**

---

## 📊 Success Metrics

- ✅ Alle Notification-Types funktionieren
- ✅ Badge zeigt korrekte Anzahl
- ✅ Mark-as-read funktioniert instant
- ✅ Desktop Notifications funktionieren
- ✅ Sound kann an/ausgestellt werden
- ✅ Responsive auf Mobile
- ✅ Smooth Animations (< 300ms)
- ✅ Polling funktioniert (alle 30s)
- ✅ Keine TypeScript Errors
- ✅ Perfektes Design 🎨

---

## 🎨 Design Inspiration

- **Notification Bell:** Discord, Slack, GitHub
- **Dropdown Menu:** LinkedIn, Twitter/X
- **Notification Items:** Apple, Material Design
- **Animations:** Framer Motion style
- **Colors:** Tailwind CSS extended palette

---

**Let's build this! 🚀**
