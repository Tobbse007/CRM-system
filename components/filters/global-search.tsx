'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Loader2, FileText, FolderKanban, Users, CheckSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Debounce hook for performance
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'client' | 'note';
  title: string;
  subtitle?: string;
  status?: string;
  metadata?: Record<string, any>;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Debounce search query for performance (300ms)
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/global?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use debounced query for search
  useEffect(() => {
    search(debouncedQuery);
  }, [debouncedQuery, search]);

  // Show loading immediately when typing
  useEffect(() => {
    if (query.length >= 2 && query !== debouncedQuery) {
      setLoading(true);
    }
  }, [query, debouncedQuery]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    let path = '/';
    switch (result.type) {
      case 'project':
        path = `/projects/${result.id}`;
        break;
      case 'task':
        path = `/tasks`;
        break;
      case 'client':
        path = `/clients`;
        break;
      case 'note':
        path = `/projects/${result.metadata?.projectId}`;
        break;
    }
    router.push(path);
    onOpenChange(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="h-4 w-4 text-purple-600" />;
      case 'task':
        return <CheckSquare className="h-4 w-4 text-blue-600" />;
      case 'client':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'note':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project':
        return 'Projekt';
      case 'task':
        return 'Aufgabe';
      case 'client':
        return 'Kunde';
      case 'note':
        return 'Notiz';
      default:
        return type;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 text-yellow-900 font-semibold">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="relative border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Suche nach Projekten, Aufgaben, Kunden..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-12 pr-4 border-0 text-base focus-visible:ring-0 bg-transparent"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600 animate-spin" />
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Gib mindestens 2 Zeichen ein, um zu suchen
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">↑↓</kbd> navigieren •{' '}
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd> auswählen
              </p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin" />
              <p className="text-sm text-muted-foreground mt-3">Suche läuft...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Keine Ergebnisse für "{query}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Versuche es mit anderen Suchbegriffen
              </p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                    'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50',
                    index === selectedIndex &&
                      'bg-gradient-to-r from-blue-100 to-purple-100 ring-2 ring-blue-300 scale-[1.02]'
                  )}
                >
                  <div className="flex-shrink-0">{getIcon(result.type)}</div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm truncate">
                      {highlightMatch(result.title, query)}
                    </div>
                    {result.subtitle && (
                      <div className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {getTypeLabel(result.type)}
                  </Badge>
                  {index === selectedIndex && (
                    <ArrowRight className="h-4 w-4 text-blue-600 flex-shrink-0 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {results.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
            <p className="text-xs text-muted-foreground text-center">
              {results.length} Ergebnis{results.length !== 1 ? 'se' : ''} gefunden
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
