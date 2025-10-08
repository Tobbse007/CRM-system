'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Database,
  Info,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function SettingsPage() {
  // Fetch database stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const result = await response.json();
      return result.data;
    },
  });

  const handleExportData = () => {
    alert('Export-Funktion wird in einer zukünftigen Version verfügbar sein.');
  };

  const handleClearCache = () => {
    if (confirm('Möchten Sie den Cache wirklich leeren?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleResetDatabase = () => {
    alert(
      'Datenbank-Reset ist aus Sicherheitsgründen nur über die Kommandozeile möglich.\nVerwenden Sie: npm run db:push'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Einstellungen
        </h1>
        <p className="text-muted-foreground mt-1">
          System-Informationen und Verwaltungsoptionen
        </p>
      </div>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datenbank-Statistiken
          </CardTitle>
          <CardDescription>
            Übersicht über die Anzahl der Datensätze in der Datenbank
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-muted-foreground">Lade Statistiken...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {stats?.clients.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">Kunden gesamt</div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {stats?.clients.active || 0} Aktiv
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats?.clients.inactive || 0} Inaktiv
                  </Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {stats?.projects.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Projekte gesamt
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {stats?.projects.planning || 0} Planung
                  </Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {stats?.tasks.total || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  Aufgaben gesamt
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {stats?.tasks.todo || 0} Offen
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats?.tasks.done || 0} Erledigt
                  </Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(stats?.budget.total || 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Gesamt-Budget
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            System-Informationen
          </CardTitle>
          <CardDescription>Technische Details und Versionen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">CRM Version</span>
              <Badge>1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Framework</span>
              <span className="text-sm text-muted-foreground">
                Next.js 15.5.4
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Datenbank</span>
              <span className="text-sm text-muted-foreground">
                SQLite (Prisma 6.17.0)
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">UI-Bibliothek</span>
              <span className="text-sm text-muted-foreground">
                Shadcn/UI + TailwindCSS
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">State Management</span>
              <span className="text-sm text-muted-foreground">
                TanStack Query v5
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Entwickelt für</span>
              <span className="text-sm text-muted-foreground">
                Webdesign-Agenturen
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Datenverwaltung</CardTitle>
          <CardDescription>
            Export, Import und Reset-Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Daten exportieren</div>
                <div className="text-sm text-muted-foreground">
                  Exportieren Sie alle Daten als JSON-Datei
                </div>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">Cache leeren</div>
                <div className="text-sm text-muted-foreground">
                  Löscht lokale Einstellungen und lädt die Seite neu
                </div>
              </div>
              <Button variant="outline" onClick={handleClearCache}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Cache leeren
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
              <div>
                <div className="font-medium text-red-900">
                  Datenbank zurücksetzen
                </div>
                <div className="text-sm text-red-700">
                  Löscht alle Daten und erstellt die Datenbank neu
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleResetDatabase}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle>Über dieses System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Dieses CRM-System wurde speziell für Webdesign-Agenturen
              entwickelt und bietet eine umfassende Lösung zur Verwaltung von
              Kunden, Projekten, Aufgaben und Notizen.
            </p>
            <p>
              <strong className="text-foreground">Hauptfeatures:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Kunden-Verwaltung mit Status-Tracking</li>
              <li>Projekt-Management mit Budget und Zeitplanung</li>
              <li>Aufgaben mit Prioritäten und Fälligkeitsdatum</li>
              <li>Projektbezogene Notizen</li>
              <li>Live-Dashboard mit Statistiken</li>
              <li>Responsive Design für alle Geräte</li>
            </ul>
            <div className="mt-6 pt-4 border-t">
              <p className="text-xs">
                © 2025 CRM System - Entwickelt mit ❤️ und TypeScript
              </p>
              <p className="text-xs mt-1">
                GitHub:{' '}
                <a
                  href="https://github.com/Tobbse007/CRM-system"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Tobbse007/CRM-system
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
