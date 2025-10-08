'use client';

import { useState } from 'react';
import { Download, FileDown, FileSpreadsheet, Database, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ExportButton({
  onExport,
  disabled,
  className,
  variant = 'default',
  size = 'default',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);
  const [lastExported, setLastExported] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportingFormat(format);
    setLastExported(null);

    try {
      await onExport(format);
      setLastExported(format);
      toast.success(`Erfolgreich als ${format.toUpperCase()} exportiert!`, {
        description: 'Der Download sollte automatisch starten.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export fehlgeschlagen', {
        description: error instanceof Error ? error.message : 'Unbekannter Fehler',
      });
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const formatConfig = {
    pdf: {
      label: 'PDF exportieren',
      icon: FileDown,
      color: 'text-red-600',
      gradient: 'from-red-500 to-rose-500',
    },
    excel: {
      label: 'Excel exportieren',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
    },
    csv: {
      label: 'CSV exportieren',
      icon: Database,
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
    },
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            'hover:shadow-lg hover:scale-105',
            variant === 'default' &&
              'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
            className
          )}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportiere...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportieren
            </>
          )}

          {/* Pulse Effect beim Export */}
          {isExporting && (
            <span className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Format auswählen</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(Object.keys(formatConfig) as ExportFormat[]).map((format) => {
          const config = formatConfig[format];
          const Icon = config.icon;
          const isCurrentlyExporting = isExporting && exportingFormat === format;
          const wasLastExported = lastExported === format;

          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting}
              className={cn(
                'cursor-pointer transition-all duration-200',
                'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100',
                isCurrentlyExporting && 'bg-gradient-to-r from-blue-50 to-purple-50'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {isCurrentlyExporting ? (
                    <Loader2 className={cn('h-4 w-4 animate-spin', config.color)} />
                  ) : wasLastExported ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Icon className={cn('h-4 w-4', config.color)} />
                  )}
                  <span>{config.label}</span>
                </div>
                {wasLastExported && !isExporting && (
                  <span className="text-xs text-green-600 font-medium">✓</span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
