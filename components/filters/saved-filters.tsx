'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2, FolderOpen, Star } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SavedFilter {
  id: string;
  name: string;
  config: Record<string, any>;
  createdAt: string;
}

interface SavedFiltersProps {
  onLoad: (config: Record<string, any>) => void;
  currentConfig: Record<string, any>;
  storageKey?: string;
}

export function SavedFilters({
  onLoad,
  currentConfig,
  storageKey = 'crm-saved-filters',
}: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Load saved filters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  }, [storageKey]);

  const saveFilter = () => {
    if (!filterName.trim()) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      config: currentConfig,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    setFilterName('');
    setIsSaving(false);
  };

  const loadFilter = (filter: SavedFilter) => {
    onLoad(filter.config);
    setIsOpen(false);
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const hasActiveConfig = Object.keys(currentConfig).length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'relative transition-all duration-300',
            savedFilters.length > 0 &&
              'hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
          )}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Gespeicherte Filter
          {savedFilters.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs"
            >
              {savedFilters.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-600" />
            Gespeicherte Filter
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Speichere und lade deine Filter-Konfigurationen
          </p>
        </div>

        <div className="p-4 space-y-4">
          {/* Save current filter */}
          {hasActiveConfig && (
            <div className="space-y-2">
              {!isSaving ? (
                <Button
                  size="sm"
                  onClick={() => setIsSaving(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Aktuellen Filter speichern
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Filter-Name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveFilter();
                      if (e.key === 'Escape') setIsSaving(false);
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={saveFilter}
                      disabled={!filterName.trim()}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Speichern
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsSaving(false);
                        setFilterName('');
                      }}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved filters list */}
          {savedFilters.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Gespeicherte Filter ({savedFilters.length})
              </p>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {savedFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="group flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                  >
                    <button
                      onClick={() => loadFilter(filter)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium truncate">
                        {filter.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(filter.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </p>
                    </button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteFilter(filter.id)}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FolderOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Noch keine gespeicherten Filter
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
