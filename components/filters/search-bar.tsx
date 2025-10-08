'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  className?: string;
  loading?: boolean;
}

export function SearchBar({
  placeholder = 'Suchen...',
  value: controlledValue,
  onChange,
  onSearch,
  debounceMs = 300,
  className,
  loading = false,
}: SearchBarProps) {
  const [value, setValue] = useState(controlledValue || '');
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  // Debounced search
  useEffect(() => {
    if (!onSearch) return;

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      onSearch(value);
      setIsDebouncing(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      setIsDebouncing(false);
    };
  }, [value, debounceMs, onSearch]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setValue('');
    onChange?.('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative group', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={cn(
            'pl-10 pr-10 h-11 border-2 transition-all duration-300',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
            'hover:border-gray-400',
            value && 'border-blue-300'
          )}
        />
        {(value || loading || isDebouncing) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {(loading || isDebouncing) && (
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            )}
            {value && !loading && !isDebouncing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 hover:bg-red-100 rounded-full transition-colors"
              >
                <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
              </Button>
            )}
          </div>
        )}
      </div>
      {value && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl animate-pulse" />
      )}
    </div>
  );
}
