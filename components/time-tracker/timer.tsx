'use client';

import { useState, useEffect } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStartTimer, useStopTimer, useTimeEntries } from '@/hooks/use-time-entries';
import { formatTimeHHMMSS, calculateElapsed } from '@/lib/time-utils';
import { useToast } from '@/hooks/use-toast';

interface TimerProps {
  projectId: string;
  taskId?: string | null;
  userId?: string | null;
  compact?: boolean;
  onTimerStart?: () => void;
  onTimerStop?: () => void;
}

export function Timer({ 
  projectId, 
  taskId, 
  userId, 
  compact = false,
  onTimerStart,
  onTimerStop 
}: TimerProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  
  // Lade aktive Timer
  const { data: activeTimers } = useTimeEntries({ 
    projectId, 
    taskId: taskId || undefined,
    active: true 
  });
  
  const runningTimer = activeTimers?.[0];
  const isRunning = !!runningTimer;

  // Update elapsed time every second
  useEffect(() => {
    if (!isRunning || !runningTimer) {
      setElapsedSeconds(0);
      return;
    }

    // Initial calculation
    setElapsedSeconds(calculateElapsed(runningTimer.startTime));

    // Update every second
    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsed(runningTimer.startTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, runningTimer]);

  const handleStart = async () => {
    try {
      await startTimer.mutateAsync({
        projectId,
        taskId: taskId || undefined,
        userId: userId || undefined,
        description: description || undefined,
        startTime: new Date().toISOString(),
      });

      toast({
        title: 'Timer gestartet',
        description: 'Die Zeiterfassung läuft jetzt.',
      });

      setDescription('');
      onTimerStart?.();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Timer konnte nicht gestartet werden.',
        variant: 'destructive',
      });
    }
  };

  const handleStop = async () => {
    if (!runningTimer) return;

    try {
      await stopTimer.mutateAsync({
        id: runningTimer.id,
        endTime: new Date().toISOString(),
      });

      toast({
        title: 'Timer gestoppt',
        description: `Zeit erfasst: ${formatTimeHHMMSS(elapsedSeconds)}`,
      });

      onTimerStop?.();
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Timer konnte nicht gestoppt werden.',
        variant: 'destructive',
      });
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isRunning ? (
          <>
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <Clock className="h-4 w-4 text-green-600 animate-pulse" />
              <span className="text-gray-900 font-semibold">{formatTimeHHMMSS(elapsedSeconds)}</span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleStop}
              disabled={stopTimer.isPending}
              className="text-white"
            >
              <Square className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={handleStart}
            disabled={startTimer.isPending}
          >
            <Play className="h-4 w-4 mr-1" />
            Start
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`h-5 w-5 ${isRunning ? 'text-green-600 animate-pulse' : 'text-muted-foreground'}`} />
          <h3 className="font-semibold">Zeiterfassung</h3>
        </div>
        {isRunning && (
          <div className="text-2xl font-mono font-bold">
            {formatTimeHHMMSS(elapsedSeconds)}
          </div>
        )}
      </div>

      {isRunning ? (
        <div className="space-y-3">
          {runningTimer.description && (
            <div className="text-sm text-muted-foreground">
              <strong>Beschreibung:</strong> {runningTimer.description}
            </div>
          )}
          <Button
            className="w-full text-white"
            variant="destructive"
            onClick={handleStop}
            disabled={stopTimer.isPending}
          >
            <Square className="h-4 w-4 mr-2" />
            Timer stoppen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="timer-description">
              Beschreibung (optional)
            </Label>
            <Input
              id="timer-description"
              placeholder="Woran arbeitest du?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !startTimer.isPending) {
                  handleStart();
                }
              }}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleStart}
            disabled={startTimer.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            Timer starten
          </Button>
        </div>
      )}
    </div>
  );
}
