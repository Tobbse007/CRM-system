import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectWithClient } from '@/types';

interface PDFExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  data: any[];
  columns: Array<{ header: string; dataKey: string }>;
  orientation?: 'portrait' | 'landscape';
}

export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const { filename, title, subtitle, data, columns, orientation = 'portrait' } = options;

  // Create PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // blue-600
  doc.text(title, 14, 20);

  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // gray-500
    doc.text(subtitle, 14, 28);
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, subtitle ? 35 : 28);

  // Table
  autoTable(doc, {
    startY: subtitle ? 42 : 35,
    head: [columns.map((col) => col.header)],
    body: data.map((row) => columns.map((col) => row[col.dataKey] || '-')),
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55], // gray-800
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251], // gray-50
    },
    margin: { top: 10 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175); // gray-400
    doc.text(
      `Seite ${i} von ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`${filename}.pdf`);
}

// Project Report Export
export async function exportProjectsToPDF(projects: ProjectWithClient[]): Promise<void> {
  await exportToPDF({
    filename: `projekte-bericht-${new Date().toISOString().split('T')[0]}`,
    title: 'Projekt-Übersicht',
    subtitle: `${projects.length} Projekt${projects.length !== 1 ? 'e' : ''}`,
    data: projects.map((p) => ({
      name: p.name,
      client: p.client.name,
      status: getStatusLabel(p.status),
      budget: p.budget ? formatCurrency(p.budget) : '-',
      startDate: p.startDate ? formatDate(p.startDate) : '-',
    })),
    columns: [
      { header: 'Projekt', dataKey: 'name' },
      { header: 'Kunde', dataKey: 'client' },
      { header: 'Status', dataKey: 'status' },
      { header: 'Budget', dataKey: 'budget' },
      { header: 'Startdatum', dataKey: 'startDate' },
    ],
  });
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100);
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
