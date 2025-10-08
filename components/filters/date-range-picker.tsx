'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange: (range?: { from?: Date; to?: Date }) => void;
  placeholder?: string;
  label?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Datumsbereich wählen',
  label,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const hasValue = value?.from || value?.to;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal h-11 border-2 transition-all duration-300',
              'hover:border-blue-400 hover:shadow-md',
              open && 'border-blue-500 ring-2 ring-blue-200',
              hasValue && 'border-blue-300',
              !hasValue && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
            {value?.from ? (
              value.to ? (
                <span className="font-medium">
                  {format(value.from, 'dd.MM.yyyy', { locale: de })} -{' '}
                  {format(value.to, 'dd.MM.yyyy', { locale: de })}
                </span>
              ) : (
                <span className="font-medium">
                  ab {format(value.from, 'dd.MM.yyyy', { locale: de })}
                </span>
              )
            ) : (
              placeholder
            )}
            {hasValue && (
              <button
                onClick={handleClear}
                className="ml-auto hover:bg-red-100 rounded-full p-1 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
              </button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={{ from: value?.from, to: value?.to }}
            onSelect={(range) => {
              onChange(range);
              if (range?.from && range?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
            locale={de}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
