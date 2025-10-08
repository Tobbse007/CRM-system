'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ActivityTrendChartProps {
  activities: Array<{
    date: string;
    count: number;
  }>;
}

export function ActivityTrendChart({ activities }: ActivityTrendChartProps) {
  if (activities.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Aktivitäts-Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Aktivitätsdaten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3">
          <p className="font-semibold text-gray-900">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span className="text-gray-600">Aktivitäten:</span>
            <span className="font-bold text-indigo-600">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalActivities = activities.reduce((sum, day) => sum + day.count, 0);
  const avgPerDay = (totalActivities / activities.length).toFixed(1);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-indigo-50/30 hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Aktivitäts-Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Letzte {activities.length} Tage
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100">
            <Activity className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-700">
              ø {avgPerDay}/Tag
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart 
            data={activities}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '14px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#6366f1" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorActivity)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
