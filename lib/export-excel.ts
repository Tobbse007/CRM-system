import * as XLSX from 'xlsx';
import type { ProjectWithClient, Client } from '@/types';

interface ExcelExportOptions {
  filename: string;
  sheets: Array<{
    name: string;
    data: any[];
    columns?: string[];
  }>;
}

export async function exportToExcel(options: ExcelExportOptions): Promise<void> {
  const { filename, sheets } = options;

  // Create workbook
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(sheet.data);

    // Auto-width columns
    const maxWidth = 50;
    const colWidths = Object.keys(sheet.data[0] || {}).map((key) => {
      const maxLength = Math.max(
        key.length,
        ...sheet.data.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, maxWidth) };
    });
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  // Save file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export async function exportToCSV(data: any[], filename: string): Promise<void> {
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Convert to CSV
  const csv = XLSX.utils.sheet_to_csv(worksheet, {
    FS: ';', // Use semicolon for German Excel compatibility
    RS: '\n',
  });

  // Create Blob
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });

  // Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Project Export Functions
export async function exportProjectsToExcel(projects: ProjectWithClient[]): Promise<void> {
  const projectData = projects.map((p) => ({
    Projekt: p.name,
    Beschreibung: p.description || '-',
    Kunde: p.client.name,
    Status: getStatusLabel(p.status),
    Budget: p.budget ? p.budget / 100 : 0,
    Startdatum: p.startDate ? formatDateForExcel(p.startDate) : '-',
    Enddatum: p.endDate ? formatDateForExcel(p.endDate) : '-',
    Erstellt: formatDateForExcel(p.createdAt),
  }));

  const summary = [
    { Metrik: 'Gesamt Projekte', Wert: projects.length },
    {
      Metrik: 'Gesamt Budget',
      Wert: projects.reduce((sum, p) => sum + (p.budget || 0), 0) / 100,
    },
    {
      Metrik: 'In Arbeit',
      Wert: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    },
    {
      Metrik: 'Abgeschlossen',
      Wert: projects.filter((p) => p.status === 'COMPLETED').length,
    },
  ];

  await exportToExcel({
    filename: `projekte-bericht-${new Date().toISOString().split('T')[0]}`,
    sheets: [
      { name: 'Zusammenfassung', data: summary },
      { name: 'Alle Projekte', data: projectData },
    ],
  });
}

export async function exportProjectsToCSV(projects: ProjectWithClient[]): Promise<void> {
  const data = projects.map((p) => ({
    Projekt: p.name,
    Beschreibung: p.description || '-',
    Kunde: p.client.name,
    Status: getStatusLabel(p.status),
    'Budget (EUR)': p.budget ? p.budget / 100 : 0,
    Startdatum: p.startDate ? formatDateForExcel(p.startDate) : '-',
    Enddatum: p.endDate ? formatDateForExcel(p.endDate) : '-',
  }));

  await exportToCSV(data, `projekte-export-${new Date().toISOString().split('T')[0]}`);
}

// Client Export Functions
export async function exportClientsToExcel(clients: Client[]): Promise<void> {
  const clientData = clients.map((c) => ({
    Name: c.name,
    Email: c.email,
    Telefon: c.phone || '-',
    Firma: c.company || '-',
    Website: c.website || '-',
    Status: getClientStatusLabel(c.status),
    Erstellt: formatDateForExcel(c.createdAt),
  }));

  await exportToExcel({
    filename: `kunden-export-${new Date().toISOString().split('T')[0]}`,
    sheets: [{ name: 'Kunden', data: clientData }],
  });
}

export async function exportClientsToCSV(clients: Client[]): Promise<void> {
  const data = clients.map((c) => ({
    Name: c.name,
    Email: c.email,
    Telefon: c.phone || '-',
    Firma: c.company || '-',
    Website: c.website || '-',
    Status: getClientStatusLabel(c.status),
  }));

  await exportToCSV(data, `kunden-export-${new Date().toISOString().split('T')[0]}`);
}

// Helper Functions
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLANNING: 'Planung',
    IN_PROGRESS: 'In Arbeit',
    REVIEW: 'Review',
    COMPLETED: 'Abgeschlossen',
    ON_HOLD: 'Pausiert',
  };
  return labels[status] || status;
}

function getClientStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Aktiv',
    INACTIVE: 'Inaktiv',
    POTENTIAL: 'Potentiell',
  };
  return labels[status] || status;
}

function formatDateForExcel(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
