'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock } from 'lucide-react';

interface TeamPerformanceTableProps {
  team: Array<{
    name: string;
    email: string;
    totalTasks: number;
    doneTasks: number;
    completionRate: number;
    hoursLogged: number;
  }>;
}

export function TeamPerformanceTable({ team }: TeamPerformanceTableProps) {
  if (team.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-rose-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Team-Daten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-rose-50/30 hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Team Performance
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Top 5 produktivste Teammitglieder
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100">
            <Trophy className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-semibold text-rose-700">
              Bestenliste
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {team.map((member, index) => {
            const initials = member.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase();

            const isTopPerformer = index === 0;

            return (
              <div 
                key={member.email}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                  isTopPerformer 
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300' 
                    : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar & Rank */}
                  <div className="relative flex-shrink-0">
                    <Avatar className={`h-14 w-14 ${isTopPerformer ? 'ring-4 ring-yellow-300' : ''}`}>
                      <AvatarFallback className={`text-lg font-bold ${
                        isTopPerformer 
                          ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' 
                          : 'bg-gradient-to-br from-rose-400 to-pink-500 text-white'
                      }`}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -top-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isTopPerformer 
                        ? 'bg-yellow-400 text-yellow-900 border-2 border-white' 
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    {isTopPerformer && (
                      <div className="absolute -bottom-1 -right-1">
                        <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {member.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/80">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span className="text-xs font-semibold text-blue-700">
                          {member.hoursLogged}h
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white/50 rounded-lg p-2">
                        <div className="text-xs text-gray-600 mb-0.5">Aufgaben</div>
                        <div className="font-bold text-gray-900">
                          {member.doneTasks} / {member.totalTasks}
                        </div>
                      </div>
                      <div className="bg-white/50 rounded-lg p-2">
                        <div className="text-xs text-gray-600 mb-0.5">Completion</div>
                        <div className={`font-bold ${
                          member.completionRate >= 80 ? 'text-green-600' :
                          member.completionRate >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {member.completionRate}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Progress 
                        value={member.completionRate} 
                        className={`h-2 ${
                          member.completionRate >= 80 ? 'bg-green-100' :
                          member.completionRate >= 50 ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
