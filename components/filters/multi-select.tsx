'use client';

import { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Auswählen...',
  label,
  maxDisplay = 3,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedOptions = options.filter((opt) => value.includes(opt.value));
  const displayCount = selectedOptions.length;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between h-auto min-h-[44px] border-2 transition-all duration-300',
              'hover:border-blue-400 hover:shadow-md',
              open && 'border-blue-500 ring-2 ring-blue-200',
              value.length > 0 && 'border-blue-300'
            )}
          >
            <div className="flex items-center gap-2 flex-wrap flex-1 mr-2">
              {value.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                <>
                  {selectedOptions.slice(0, maxDisplay).map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className={cn(
                        'gap-1 pl-2 pr-1 bg-gradient-to-r transition-all duration-300',
                        option.color || 'from-blue-100 to-blue-200 text-blue-700'
                      )}
                    >
                      {option.icon && <span className="h-3 w-3">{option.icon}</span>}
                      {option.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(option.value);
                        }}
                        className="ml-1 hover:bg-white/50 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {displayCount > maxDisplay && (
                    <Badge variant="secondary" className="bg-gray-200">
                      +{displayCount - maxDisplay} mehr
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {value.length > 0 && (
                <button
                  onClick={handleClear}
                  className="hover:bg-red-100 rounded-full p-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-500 transition-transform duration-300',
                  open && 'rotate-180'
                )}
              />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-[300px] overflow-auto">
            {options.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Keine Optionen verfügbar
              </div>
            ) : (
              <div className="p-1">
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleToggle(option.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200',
                        'hover:bg-blue-50 hover:scale-[1.02]',
                        isSelected && 'bg-blue-100 hover:bg-blue-150'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200',
                          isSelected
                            ? 'border-blue-600 bg-blue-600 scale-110'
                            : 'border-gray-300'
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </div>
                      {option.icon && (
                        <span className="h-4 w-4 flex-shrink-0">{option.icon}</span>
                      )}
                      <span className={cn(
                        'text-sm font-medium flex-1 text-left',
                        isSelected ? 'text-blue-700' : 'text-gray-700'
                      )}>
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
