# CRM System - Features Übersicht

## 🎯 Hauptfunktionen

### 1. Dashboard (/)

Das Dashboard bietet einen schnellen Überblick über alle wichtigen Metriken:

**Live-Statistiken:**
- **Kunden-Anzahl:** Gesamtzahl aktiver und inaktiver Kunden
- **Projekte:** Aufschlüsselung nach Status (Planung, In Arbeit, Review, Abgeschlossen, Pausiert)
- **Aufgaben:** Anzahl nach Status (Offen, In Arbeit, Erledigt)
- **Gesamt-Budget:** Summe aller Projektbudgets mit Währungsformatierung

**Aktuelle Projekte:**
- Liste der 5 neuesten Projekte
- Anzeige von Projektname, Kunde, Status und Zeitraum
- Direkte Links zur Projekt-Detailseite

**Fällige Aufgaben:**
- Übersicht über anstehende und überfällige Aufgaben
- Prioritätskennzeichnung (Hoch, Mittel, Niedrig)
- Hervorhebung von überfälligen Aufgaben
- Projekt- und Kundenzuordnung

### 2. Kunden-Verwaltung (/clients)

**Übersicht:**
- Tabellarische Darstellung aller Kunden
- Sortierung nach Erstellungsdatum
- Such-Funktion (Name, E-Mail, Firma)
- Status-Filter (Alle, Lead, Aktiv, Inaktiv)

**Kunde erstellen/bearbeiten:**
- Name (Pflichtfeld, 2-100 Zeichen)
- E-Mail (Pflichtfeld, Validierung, eindeutig)
- Telefon (optional)
- Firma (optional)
- Website (optional, URL-Validierung)
- Status (Lead, Aktiv, Inaktiv)

**Aktionen:**
- ✏️ Bearbeiten: Öffnet Dialog mit vorausgefüllten Daten
- 🗑️ Löschen: Mit Bestätigungsdialog (Soft Delete)
- 🔍 Suche: Echtzeit-Suche über alle Felder

### 3. Projekt-Verwaltung (/projects)

**Übersicht:**
- Tabellarische Darstellung aller Projekte
- Anzeige von Kunde, Status, Budget, Zeitraum
- Such-Funktion (Projektname, Beschreibung)
- Status-Filter
- Budget-Formatierung (€)

**Projekt erstellen/bearbeiten:**
- Name (Pflichtfeld, 2-255 Zeichen)
- Kunde (Pflichtfeld, Dropdown-Auswahl)
- Beschreibung (optional, Textarea)
- Status (5 Optionen: Planung, In Arbeit, Review, Abgeschlossen, Pausiert)
- Budget (optional, Zahlenfeld in €)
- Startdatum (Datepicker mit deutscher Lokalisierung)
- Enddatum (Datepicker mit deutscher Lokalisierung)

**Aktionen:**
- 👁️ Details: Öffnet Projekt-Detailseite
- ✏️ Bearbeiten: Öffnet Dialog mit vorausgefüllten Daten
- 🗑️ Löschen: Mit Bestätigungsdialog (CASCADE delete)

### 4. Projekt-Detailseite (/projects/[id])

**Header-Bereich:**
- Projektname und Status-Badge
- Beschreibung
- Zurück-Button zur Projektübersicht
- Bearbeiten-Button

**Info-Karten:**

**Kunden-Karte:**
- Kundenname mit Link zur Kundenübersicht
- Firma
- E-Mail mit Icon
- Telefon mit Icon

**Budget-Karte:**
- Gesamtbudget in €
- Große Schriftgröße für bessere Lesbarkeit

**Zeitraum-Karte:**
- Startdatum formatiert (z.B. "15. Jan. 2024")
- Enddatum formatiert
- Deutsche Datumsformatierung

**Fortschritts-Karte:**
- Prozentanzeige basierend auf erledigten Aufgaben
- Anzahl erledigte / Gesamt-Aufgaben
- Visueller Fortschrittsbalken (grün)

**Aufgaben-Sektion:**
- Liste aller Projektaufgaben
- Anzeige: Titel, Beschreibung, Fälligkeitsdatum
- Status-Badge (Offen, In Arbeit, Erledigt)
- Prioritäts-Badge (Niedrig, Mittel, Hoch = rot)
- ➕ "Aufgabe hinzufügen" Button
- ✏️ Bearbeiten-Button pro Aufgabe
- 🗑️ Löschen-Button pro Aufgabe

**Notizen-Sektion:**
- Liste aller Projektnotizen
- Anzeige: Titel, Inhalt, Erstellungsdatum
- ➕ "Notiz hinzufügen" Button
- ✏️ Bearbeiten-Button pro Notiz
- 🗑️ Löschen-Button pro Notiz

### 5. Aufgaben-Management

**Aufgabe erstellen/bearbeiten (Dialog):**
- Titel (Pflichtfeld, 2-255 Zeichen)
- Beschreibung (optional, Textarea)
- Status (TODO, IN_PROGRESS, DONE)
- Priorität (LOW, MEDIUM, HIGH)
- Fälligkeitsdatum (optional, Datepicker)
- Automatische Zuordnung zum aktuellen Projekt

**Funktionen:**
- Inline-Bearbeitung in Projekt-Detailseite
- Toast-Benachrichtigungen bei Erfolg/Fehler
- Optimistic Updates mit TanStack Query
- Echtzeit-Aktualisierung der Fortschrittsanzeige

### 6. Notizen-System

**Notiz erstellen/bearbeiten (Dialog):**
- Titel (Pflichtfeld, 2-255 Zeichen)
- Inhalt (Pflichtfeld, 1-5000 Zeichen, großes Textarea)
- Automatische Zuordnung zum aktuellen Projekt
- Automatischer Timestamp bei Erstellung

**Funktionen:**
- Mehrzeilige Textfelder
- Whitespace-Erhaltung in Anzeige
- Toast-Benachrichtigungen
- Sofortige Aktualisierung nach Änderungen

## 🎨 UI/UX Features

### Design-System
- **Konsistente Farbpalette:** Blau für primäre Aktionen, Grau für sekundäre
- **Status-Colors:** 
  - Grün für "Abgeschlossen" / "Erledigt"
  - Gelb für "In Arbeit"
  - Blau für "Planung" / "Offen"
  - Lila für "Review"
  - Grau für "Pausiert" / "Inaktiv"
- **Responsive Grid-Layouts:** 1-4 Spalten je nach Bildschirmgröße
- **Hover-Effekte:** Sanfte Übergänge bei Buttons und Karten

### Interaktive Elemente
- **Dialoge/Modals:** Für Erstellen/Bearbeiten ohne Seitenwechsel
- **Toast-Notifications:** Sonner für elegante Benachrichtigungen
- **Loading States:** Spinner und Skeleton Screens
- **Error States:** Benutzerfreundliche Fehlermeldungen

### Navigation
- **Sidebar-Navigation:**
  - Dashboard-Link
  - Kunden-Link
  - Projekte-Link
  - Sticky Position
- **Breadcrumbs:** Zurück-Buttons mit Icon
- **Direct Links:** Von Projekt zu Kunde, etc.

### Formulare
- **Validierung in Echtzeit:** Sofortiges Feedback bei Eingabe
- **Deutsche Fehlermeldungen:** Klar und verständlich
- **Hilfreiche Platzhalter:** Beispiele in Input-Feldern
- **Pflichtfeld-Kennzeichnung:** Sternchen bei Required Fields

## 🔒 Datenvalidierung

### Client-Side (Zod)
- E-Mail-Format-Validierung
- URL-Format-Validierung (Website)
- String-Längen-Validierung
- Required/Optional Fields

### Server-Side (API Routes)
- Doppelte Zod-Validierung
- Eindeutigkeit (E-Mail)
- Existenz-Prüfung (Relationen)
- Fehlerhafte Requests → 400 Bad Request

## 📊 Daten-Features

### Aggregationen
- Automatische Summenberechnung (Budget)
- Anzahl-Zählung (Projekte, Tasks)
- Gruppierung nach Status
- Prozent-Berechnung (Fortschritt)

### Filterung
- Text-Suche (case-insensitive)
- Status-Filter
- Projekt-Filter für Tasks/Notes
- Datum-basierte Filter (Fälligkeitsdatum)

### Sortierung
- Standardsortierung: Neueste zuerst (createdAt DESC)
- Tasks: Nach Datum und Priorität
- Projekte: Nach Erstellungsdatum

## 🚀 Performance-Features

### TanStack Query
- Automatisches Caching (1 Minute stale time)
- Query-Invalidierung bei Mutations
- Optimistic Updates
- Background Refetching
- DevTools für Debugging

### Prisma
- Type-safe Database Queries
- Automatische Joins mit include
- Batch-Queries für Dashboard
- Connection Pooling

### Next.js
- Server Components für statische Teile
- Client Components nur wo nötig
- Turbopack für schnelles Development
- Automatisches Code Splitting

## 🔄 Workflow-Beispiel

**Neues Projekt anlegen:**
1. Kunde in Kunden-Verwaltung anlegen
2. Auf "Projekte" navigieren
3. "Projekt hinzufügen" klicken
4. Formular ausfüllen (Kunde auswählen)
5. Projekt wird erstellt → Toast-Benachrichtigung
6. Auf "Details" klicken
7. Aufgaben hinzufügen
8. Notizen hinzufügen
9. Status ändern während Projekt läuft
10. Dashboard zeigt Live-Updates

## 📱 Responsive Breakpoints

- **Desktop:** 1024px+ (4-Spalten-Grid)
- **Tablet:** 768px-1023px (2-Spalten-Grid)
- **Mobile:** < 768px (1-Spalte, Stack Layout)

## ♿ Accessibility

- Semantisches HTML
- ARIA-Labels wo nötig
- Keyboard-Navigation
- Focus-States
- Screen-Reader-freundlich

## 🔮 Zukünftige Features (Roadmap)

- [ ] Benutzer-Authentifizierung (NextAuth)
- [ ] Team-Mitglieder und Zuweisungen
- [ ] Datei-Uploads für Projekte
- [ ] E-Mail-Benachrichtigungen
- [ ] Zeiterfassung pro Aufgabe
- [ ] Rechnungsstellung
- [ ] Export zu PDF/Excel
- [ ] Erweiterte Statistiken/Charts
- [ ] Projektvorlagen
- [ ] Kommentare bei Aufgaben
