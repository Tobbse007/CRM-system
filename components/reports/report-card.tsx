'use client';

import { FileText, TrendingUp, Users, DollarSign, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  category: 'project' | 'client' | 'time' | 'financial' | 'team';
  popular?: boolean;
}

interface ReportCardProps {
  report: ReportType;
  onSelect: (reportId: string) => void;
  selected?: boolean;
  showQuickExport?: boolean;
}

export function ReportCard({ report, onSelect, selected, showQuickExport }: ReportCardProps) {
  const Icon = report.icon;

  return (
    <Card
      className={cn(
        'group relative cursor-pointer transition-all duration-300 hover:shadow-xl',
        'border-2 hover:scale-[1.02]',
        selected
          ? `border-${report.color} ring-2 ring-${report.color}/20 bg-gradient-to-br ${report.gradient}`
          : 'border-gray-200 hover:border-blue-300'
      )}
      onClick={() => onSelect(report.id)}
    >
      {/* Popular Badge */}
      {report.popular && (
        <Badge
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-lg"
        >
          Beliebt
        </Badge>
      )}

      {/* Glow Effect */}
      {selected && (
        <div
          className={cn(
            'absolute -inset-px rounded-lg blur-xl opacity-50 animate-pulse -z-10',
            `bg-gradient-to-r ${report.gradient}`
          )}
        />
      )}

      <CardHeader>
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'p-3 rounded-lg transition-all duration-300',
              selected
                ? `bg-white/20 scale-110`
                : `bg-${report.color}/10 group-hover:scale-110`
            )}
          >
            <Icon
              className={cn(
                'h-6 w-6 transition-colors',
                selected ? 'text-white' : `text-${report.color}`
              )}
            />
          </div>

          {showQuickExport && (
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-opacity',
                selected && 'opacity-100'
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Quick export logic
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CardTitle className={cn('mt-4 transition-colors', selected && 'text-white')}>
          {report.title}
        </CardTitle>
        <CardDescription className={cn(selected && 'text-white/80')}>
          {report.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              'capitalize',
              selected ? 'border-white/30 text-white' : 'border-gray-300'
            )}
          >
            {report.category}
          </Badge>

          {selected && (
            <span className="text-sm font-medium text-white">Ausgewählt ✓</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Vordefinierte Report-Typen
export const reportTypes: ReportType[] = [
  {
    id: 'project-overview',
    title: 'Projekt-Übersicht',
    description: 'Vollständiger Überblick über Projekte mit Status, Budget und Fortschritt',
    icon: FileText,
    color: 'blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    category: 'project',
    popular: true,
  },
  {
    id: 'time-tracking',
    title: 'Zeiterfassung',
    description: 'Detaillierte Zeiteinträge nach Projekt, Mitarbeiter und Zeitraum',
    icon: Clock,
    color: 'purple-600',
    gradient: 'from-purple-500 to-pink-500',
    category: 'time',
    popular: true,
  },
  {
    id: 'client-summary',
    title: 'Kunden-Übersicht',
    description: 'Alle Kunden mit Projekten, Umsatz und Status-Verteilung',
    icon: Users,
    color: 'green-600',
    gradient: 'from-green-500 to-emerald-500',
    category: 'client',
  },
  {
    id: 'financial-report',
    title: 'Finanz-Report',
    description: 'Umsatz, Budget-Auslastung und Profit-Analyse',
    icon: DollarSign,
    color: 'yellow-600',
    gradient: 'from-yellow-500 to-orange-500',
    category: 'financial',
    popular: true,
  },
  {
    id: 'team-performance',
    title: 'Team-Performance',
    description: 'Mitarbeiter-Produktivität und Aufgaben-Verteilung',
    icon: TrendingUp,
    color: 'indigo-600',
    gradient: 'from-indigo-500 to-purple-500',
    category: 'team',
  },
];
