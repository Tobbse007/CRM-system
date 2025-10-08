/**
 * Formatiert eine Dauer in Sekunden als lesbare Zeichenkette
 * @param seconds Dauer in Sekunden
 * @returns Formatierte Zeichenkette (z.B. "2h 30m" oder "45m" oder "30s")
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds === 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  
  if (secs > 0 && hours === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(' ') || '0m';
}

/**
 * Berechnet die verstrichene Zeit seit einem Startzeitpunkt
 * @param startTime ISO-Zeitstempel des Starts
 * @returns Verstrichene Zeit in Sekunden
 */
export function calculateElapsed(startTime: string): number {
  const start = new Date(startTime).getTime();
  const now = Date.now();
  return Math.floor((now - start) / 1000);
}

/**
 * Konvertiert Sekunden in Stunden (Dezimalzahl)
 * @param seconds Dauer in Sekunden
 * @returns Dauer in Stunden (z.B. 1.5 für 90 Minuten)
 */
export function getDurationInHours(seconds: number | null | undefined): number {
  if (seconds == null) return 0;
  return Number((seconds / 3600).toFixed(2));
}

/**
 * Formatiert eine Dauer in Stunden und Minuten
 * @param seconds Dauer in Sekunden
 * @returns Formatierte Zeichenkette (z.B. "02:30" für 2 Stunden 30 Minuten)
 */
export function formatTimeHHMM(seconds: number | null | undefined): string {
  if (seconds == null) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Formatiert eine Dauer in Stunden, Minuten und Sekunden
 * @param seconds Dauer in Sekunden
 * @returns Formatierte Zeichenkette (z.B. "02:30:45")
 */
export function formatTimeHHMMSS(seconds: number | null | undefined): string {
  if (seconds == null) return '00:00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Aggregiert Zeiteinträge nach Eigenschaft
 * @param entries Array von Zeiteinträgen
 * @param groupBy Eigenschaft zum Gruppieren ('projectId' | 'taskId' | 'userId')
 * @returns Map mit aggregierten Dauern
 */
export function aggregateTimeEntries<T extends { duration: number | null }>(
  entries: T[],
  groupBy: keyof T
): Map<string, number> {
  const aggregated = new Map<string, number>();

  entries.forEach((entry) => {
    if (entry.duration == null) return;
    
    const key = String(entry[groupBy] || 'unknown');
    const current = aggregated.get(key) || 0;
    aggregated.set(key, current + entry.duration);
  });

  return aggregated;
}

/**
 * Berechnet die Gesamtdauer aller Zeiteinträge
 * @param entries Array von Zeiteinträgen
 * @returns Gesamtdauer in Sekunden
 */
export function getTotalDuration<T extends { duration: number | null }>(
  entries: T[]
): number {
  return entries.reduce((sum, entry) => {
    return sum + (entry.duration || 0);
  }, 0);
}

/**
 * Prüft, ob ein Zeiteintrag aktuell läuft
 * @param entry Zeiteintrag
 * @returns true, wenn der Timer läuft (kein endTime gesetzt)
 */
export function isTimerRunning(entry: { endTime: string | null }): boolean {
  return entry.endTime === null;
}

/**
 * Formatiert ein Datum als relative Zeit (z.B. "vor 2 Stunden")
 * @param dateString ISO-Zeitstempel
 * @returns Relative Zeitangabe
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  
  return date.toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}
