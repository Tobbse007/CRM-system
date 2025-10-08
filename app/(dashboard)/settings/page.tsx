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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <SettingsIcon className="h-10 w-10 text-blue-600" />
          Einstellungen
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          System-Informationen und Verwaltungsoptionen
        </p>
      </div>

      {/* Database Statistics */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-blue-100">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            Datenbank-Statistiken
          </CardTitle>
          <CardDescription className="text-base">
            Übersicht über die Anzahl der Datensätze in der Datenbank
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-3" />
              <span className="text-muted-foreground">Lade Statistiken...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="group p-5 border-2 rounded-xl hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
                <div className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform">
                  {stats?.clients.total || 0}
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">Kunden gesamt</div>
                <div className="mt-3 flex gap-2">
                  <Badge className="text-xs bg-green-100 text-green-700 border-green-300 hover:bg-green-200">
                    {stats?.clients.active || 0} Aktiv
                  </Badge>
                  <Badge className="text-xs bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200">
                    {stats?.clients.inactive || 0} Inaktiv
                  </Badge>
                </div>
              </div>

              <div className="group p-5 border-2 rounded-xl hover:border-purple-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
                <div className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform">
                  {stats?.projects.total || 0}
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">
                  Projekte gesamt
                </div>
                <div className="mt-3">
                  <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200">
                    {stats?.projects.planning || 0} Planung
                  </Badge>
                </div>
              </div>

              <div className="group p-5 border-2 rounded-xl hover:border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-green-50/30">
                <div className="text-3xl font-bold text-green-600 group-hover:scale-110 transition-transform">
                  {stats?.tasks.total || 0}
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">
                  Aufgaben gesamt
                </div>
                <div className="mt-3 flex gap-2">
                  <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200">
                    {stats?.tasks.todo || 0} Offen
                  </Badge>
                  <Badge className="text-xs bg-green-100 text-green-700 border-green-300 hover:bg-green-200">
                    {stats?.tasks.done || 0} Erledigt
                  </Badge>
                </div>
              </div>

              <div className="group p-5 border-2 rounded-xl hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
                <div className="text-3xl font-bold text-orange-600 group-hover:scale-110 transition-transform">
                  {new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(stats?.budget.total || 0)}
                </div>
                <div className="text-sm font-semibold text-slate-700 mt-1">
                  Gesamt-Budget
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-slate-100">
              <Info className="h-5 w-5 text-slate-600" />
            </div>
            System-Informationen
          </CardTitle>
          <CardDescription className="text-base">Technische Details und Versionen</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-0">
            <div className="flex justify-between items-center py-4 border-b-2 hover:bg-slate-50 px-4 rounded-lg transition-colors">
              <span className="text-sm font-semibold">CRM Version</span>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">1.0.0</Badge>
            </div>
            <div className="flex justify-between items-center py-4 border-b-2 hover:bg-slate-50 px-4 rounded-lg transition-colors">
              <span className="text-sm font-semibold">Framework</span>
              <span className="text-sm text-muted-foreground font-medium">
                Next.js 15.5.4
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b-2 hover:bg-slate-50 px-4 rounded-lg transition-colors">
              <span className="text-sm font-semibold">Datenbank</span>
              <span className="text-sm text-muted-foreground font-medium">
                SQLite (Prisma 6.17.0)
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b-2 hover:bg-slate-50 px-4 rounded-lg transition-colors">
              <span className="text-sm font-semibold">UI-Bibliothek</span>
              <span className="text-sm text-muted-foreground font-medium">
                Shadcn/UI + TailwindCSS
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b-2 hover:bg-slate-50 px-4 rounded-lg transition-colors">
              <span className="text-sm font-semibold">State Management</span>
              <span className="text-sm text-muted-foreground font-medium">
                TanStack Query v5
              </span>
            </div>
            <div className="flex justify-between items-center py-4 hover:bg-slate-50 px-4 rounded-lg transition-colors">
              <span className="text-sm font-semibold">Entwickelt für</span>
              <span className="text-sm text-muted-foreground font-medium">
                Webdesign-Agenturen
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-transparent border-b-2">
          <CardTitle className="text-xl">Datenverwaltung</CardTitle>
          <CardDescription className="text-base">
            Export, Import und Reset-Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="group flex items-center justify-between p-5 border-2 rounded-xl hover:border-blue-300 hover:shadow-md hover:-translate-x-1 transition-all duration-300 bg-gradient-to-r from-blue-50/50 to-transparent">
              <div>
                <div className="font-semibold text-lg group-hover:text-blue-600 transition-colors">Daten exportieren</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Exportieren Sie alle Daten als JSON-Datei
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                className="border-2 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="group flex items-center justify-between p-5 border-2 rounded-xl hover:border-orange-300 hover:shadow-md hover:-translate-x-1 transition-all duration-300 bg-gradient-to-r from-orange-50/50 to-transparent">
              <div>
                <div className="font-semibold text-lg group-hover:text-orange-600 transition-colors">Cache leeren</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Löscht lokale Einstellungen und lädt die Seite neu
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleClearCache}
                className="border-2 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Cache leeren
              </Button>
            </div>

            <div className="group flex items-center justify-between p-5 border-2 border-red-200 rounded-xl bg-gradient-to-r from-red-50 to-red-100/50 hover:shadow-lg hover:border-red-300 hover:-translate-x-1 transition-all duration-300">
              <div>
                <div className="font-semibold text-lg text-red-900 group-hover:text-red-700 transition-colors">
                  Datenbank zurücksetzen
                </div>
                <div className="text-sm text-red-700 font-medium mt-1">
                  Löscht alle Daten und erstellt die Datenbank neu
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={handleResetDatabase}
                className="bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/20">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b-2">
          <CardTitle className="text-xl">Über dieses System</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="text-base leading-relaxed">
              Dieses CRM-System wurde speziell für Webdesign-Agenturen
              entwickelt und bietet eine umfassende Lösung zur Verwaltung von
              Kunden, Projekten, Aufgaben und Notizen.
            </p>
            <p className="font-semibold text-foreground text-base">
              Hauptfeatures:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-base">
              <li className="hover:text-blue-600 transition-colors">Kunden-Verwaltung mit Status-Tracking</li>
              <li className="hover:text-blue-600 transition-colors">Projekt-Management mit Budget und Zeitplanung</li>
              <li className="hover:text-blue-600 transition-colors">Aufgaben mit Prioritäten und Fälligkeitsdatum</li>
              <li className="hover:text-blue-600 transition-colors">Projektbezogene Notizen</li>
              <li className="hover:text-blue-600 transition-colors">Live-Dashboard mit Statistiken</li>
              <li className="hover:text-blue-600 transition-colors">Responsive Design für alle Geräte</li>
            </ul>
            <div className="mt-6 pt-6 border-t-2">
              <p className="text-xs text-slate-600 font-medium">
                © 2025 CRM System - Entwickelt mit ❤️ und TypeScript
              </p>
              <p className="text-xs mt-2">
                <span className="font-semibold text-slate-700">GitHub:</span>{' '}
                <a
                  href="https://github.com/Tobbse007/CRM-system"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-300"
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
