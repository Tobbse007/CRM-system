'use client';

import { useState } from 'react';
import { ActivityTimeline } from '@/components/activities/activity-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ActivitiesPage() {
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('');

  return (
    <div className="space-y-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 min-h-[72px] w-full">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8" />
            Aktivitäts-Log
          </h1>
          <p className="text-gray-600 mt-1">
            Alle Änderungen und Aktivitäten im System
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Entity Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Objekttyp</label>
              <Select
                value={entityTypeFilter}
                onValueChange={setEntityTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Typen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Typen</SelectItem>
                  <SelectItem value="client">👤 Kunden</SelectItem>
                  <SelectItem value="project">📁 Projekte</SelectItem>
                  <SelectItem value="task">📋 Aufgaben</SelectItem>
                  <SelectItem value="note">📝 Notizen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Activity Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aktivitätstyp</label>
              <Select
                value={activityTypeFilter}
                onValueChange={setActivityTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Alle Aktivitäten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Aktivitäten</SelectItem>
                  <SelectItem value="CREATED">✨ Erstellt</SelectItem>
                  <SelectItem value="UPDATED">✏️ Aktualisiert</SelectItem>
                  <SelectItem value="DELETED">🗑️ Gelöscht</SelectItem>
                  <SelectItem value="STATUS_CHANGED">🔄 Status geändert</SelectItem>
                  <SelectItem value="ASSIGNED">👥 Zugewiesen</SelectItem>
                  <SelectItem value="COMMENTED">💬 Kommentiert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setEntityTypeFilter('');
                  setActivityTypeFilter('');
                }}
                className="w-full"
              >
                Filter zurücksetzen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline
            entityType={entityTypeFilter === 'all' || !entityTypeFilter ? undefined : entityTypeFilter}
            type={activityTypeFilter === 'all' || !activityTypeFilter ? undefined : activityTypeFilter}
            limit={50}
          />
        </CardContent>
      </Card>
    </div>
  );
}
