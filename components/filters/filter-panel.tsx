'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, Save, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface FilterConfig {
  id: string;
  label: string;
  value: any;
  type: 'text' | 'multi-select' | 'date-range' | 'single-select';
  component: React.ReactNode;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  activeFiltersCount: number;
  onReset: () => void;
  onApply?: () => void;
  onSave?: () => void;
  className?: string;
  defaultOpen?: boolean;
}

export function FilterPanel({
  filters,
  activeFiltersCount,
  onReset,
  onApply,
  onSave,
  className,
  defaultOpen = false,
}: FilterPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className={cn('relative', className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            'relative rounded-xl border-2 transition-all duration-300 overflow-hidden',
            open
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl'
              : hasActiveFilters
              ? 'border-blue-300 bg-white shadow-md hover:shadow-lg'
              : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm hover:shadow-md'
          )}
        >
          {/* Header */}
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 group">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg transition-all duration-300',
                    open
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-110'
                      : hasActiveFilters
                      ? 'bg-blue-100 group-hover:bg-blue-200'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  )}
                >
                  <Filter
                    className={cn(
                      'h-5 w-5 transition-colors',
                      open ? 'text-white' : hasActiveFilters ? 'text-blue-600' : 'text-gray-600'
                    )}
                  />
                </div>
                <div className="text-left">
                  <h3
                    className={cn(
                      'font-semibold transition-colors',
                      open
                        ? 'text-blue-700'
                        : hasActiveFilters
                        ? 'text-blue-600'
                        : 'text-gray-700'
                    )}
                  >
                    Filter & Suche
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {hasActiveFilters
                      ? `${activeFiltersCount} aktive${activeFiltersCount === 1 ? 'r' : ''} Filter`
                      : 'Keine Filter aktiv'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasActiveFilters && !open && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold animate-pulse"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-gray-500 transition-transform duration-300',
                    open && 'rotate-180 text-blue-600'
                  )}
                />
              </div>
            </button>
          </CollapsibleTrigger>

          {/* Content */}
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-blue-200">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Aktive Filter:</span>
                  {filters
                    .filter((f) => {
                      if (f.type === 'text') return f.value;
                      if (f.type === 'multi-select') return f.value?.length > 0;
                      if (f.type === 'date-range') return f.value?.from || f.value?.to;
                      if (f.type === 'single-select') return f.value;
                      return false;
                    })
                    .map((filter) => (
                      <Badge
                        key={filter.id}
                        variant="secondary"
                        className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200"
                      >
                        {filter.label}
                      </Badge>
                    ))}
                </div>
              )}

              {/* Filter Components Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.id} className="animate-in fade-in-0 duration-500">
                    {filter.component}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-blue-200">
                <Button
                  onClick={onReset}
                  variant="outline"
                  disabled={!hasActiveFilters}
                  className={cn(
                    'flex-1 gap-2 transition-all duration-300',
                    hasActiveFilters
                      ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                      : 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  Zurücksetzen
                </Button>

                {onSave && (
                  <Button
                    onClick={onSave}
                    variant="outline"
                    disabled={!hasActiveFilters}
                    className={cn(
                      'flex-1 gap-2 transition-all duration-300',
                      hasActiveFilters
                        ? 'hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                        : 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Save className="h-4 w-4" />
                    Speichern
                  </Button>
                )}

                {onApply && (
                  <Button
                    onClick={onApply}
                    className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Filter className="h-4 w-4" />
                    Anwenden
                  </Button>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Glow effect when open */}
      {open && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-2xl animate-pulse" />
      )}
    </div>
  );
}
