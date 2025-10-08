'use client';

import { useState } from 'react';
import { FileText, TrendingUp, Clock, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportSelector } from '@/components/reports/report-selector';
import { ReportDateRangeSelector } from '@/components/reports/report-date-range-selector';
import { ExportButton, type ExportFormat } from '@/components/reports/export-button';
import { useProjects } from '@/hooks/use-projects';
import { useClients } from '@/hooks/use-clients';
import { exportProjectsToPDF } from '@/lib/export-pdf';
import { exportProjectsToExcel, exportProjectsToCSV, exportClientsToExcel, exportClientsToCSV } from '@/lib/export-excel';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: projects, isLoading: loadingProjects } = useProjects();
  const { data: clients, isLoading: loadingClients } = useClients();

  const handleExport = async (format: ExportFormat) => {
    if (!selectedReportId) {
      toast.error('Bitte wähle zuerst einen Report aus');
      return;
    }

    // Simulate delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      switch (selectedReportId) {
        case 'project-overview':
          if (!projects || projects.length === 0) {
            toast.error('Keine Projekte zum Exportieren vorhanden');
            return;
          }
          if (format === 'pdf') {
            await exportProjectsToPDF(projects);
          } else if (format === 'excel') {
            await exportProjectsToExcel(projects);
          } else if (format === 'csv') {
            await exportProjectsToCSV(projects);
          }
          break;

        case 'client-summary':
          if (!clients || clients.length === 0) {
            toast.error('Keine Kunden zum Exportieren vorhanden');
            return;
          }
          if (format === 'excel') {
            await exportClientsToExcel(clients);
          } else if (format === 'csv') {
            await exportClientsToCSV(clients);
          } else {
            toast.error('PDF-Export für Kunden noch nicht implementiert');
          }
          break;

        default:
          toast.info('Dieser Report-Typ ist noch in Entwicklung');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const stats = [
    {
      title: 'Verfügbare Reports',
      value: '5',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Exportierte Reports',
      value: '0',
      icon: Download,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Letzte Aktualisierung',
      value: 'Jetzt',
      icon: Clock,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Reports & Export
          </h1>
          <p className="text-muted-foreground mt-1">
            Generiere detaillierte Reports und exportiere Daten
          </p>
        </div>
        <ExportButton
          onExport={handleExport}
          disabled={!selectedReportId || loadingProjects || loadingClients}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}
              />

              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Section */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <CardTitle>Filter & Optionen</CardTitle>
          </div>
          <CardDescription>
            Wähle einen Zeitraum und weitere Optionen für deinen Report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReportDateRangeSelector value={dateRange} onChange={setDateRange} />
            <div className="space-y-2">
              <label className="text-sm font-medium">Report-Status</label>
              <div className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground">
                {selectedReportId
                  ? '✓ Report ausgewählt - Bereit zum Export'
                  : 'Wähle unten einen Report aus'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Selector */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle>Report auswählen</CardTitle>
          </div>
          <CardDescription>
            Wähle einen Report-Typ aus und exportiere ihn in dein gewünschtes Format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReportSelector
            selectedReportId={selectedReportId}
            onSelectReport={setSelectedReportId}
            showCategories
          />
        </CardContent>
      </Card>

      {/* Info Box */}
      {selectedReportId && (
        <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Report bereit</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Klicke auf "Exportieren" oben rechts, um deinen Report als PDF, Excel oder CSV herunterzuladen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
