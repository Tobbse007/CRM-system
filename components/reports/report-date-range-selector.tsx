'use client';

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

interface ReportDateRangeSelectorProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  label?: string;
}

export function ReportDateRangeSelector({
  value,
  onChange,
  label = 'Zeitraum',
}: ReportDateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  const formatRange = () => {
    if (!value?.from) return 'Zeitraum auswählen...';
    if (!value.to) {
      return `ab ${format(value.from, 'dd.MM.yyyy', { locale: de })}`;
    }
    return `${format(value.from, 'dd.MM.yyyy', { locale: de })} - ${format(value.to, 'dd.MM.yyyy', { locale: de })}`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-between text-left font-normal transition-all duration-300',
              'hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50',
              value?.from && 'border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50',
              !value?.from && 'text-muted-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{formatRange()}</span>
            </div>
            {value?.from && (
              <X
                className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={(range) => {
              onChange(range);
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
            numberOfMonths={2}
            className="rounded-md border"
          />
          {value?.from && (
            <div className="p-3 border-t">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleClear}
                className="w-full"
              >
                Zeitraum zurücksetzen
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
