'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectStatusChartProps {
  planning: number;
  inProgress: number;
  review: number;
  completed: number;
  onHold: number;
}

const COLORS = {
  planning: '#3b82f6',    // blue
  inProgress: '#f59e0b',  // amber
  review: '#8b5cf6',      // purple
  completed: '#10b981',   // green
  onHold: '#6b7280',      // gray
};

const STATUS_LABELS = {
  planning: 'Planung',
  inProgress: 'In Arbeit',
  review: 'Review',
  completed: 'Abgeschlossen',
  onHold: 'Pausiert',
};

export function ProjectStatusChart({
  planning,
  inProgress,
  review,
  completed,
  onHold,
}: ProjectStatusChartProps) {
  const data = [
    { name: STATUS_LABELS.planning, value: planning, color: COLORS.planning },
    { name: STATUS_LABELS.inProgress, value: inProgress, color: COLORS.inProgress },
    { name: STATUS_LABELS.review, value: review, color: COLORS.review },
    { name: STATUS_LABELS.completed, value: completed, color: COLORS.completed },
    { name: STATUS_LABELS.onHold, value: onHold, color: COLORS.onHold },
  ].filter(item => item.value > 0);

  const total = planning + inProgress + review + completed + onHold;

  if (total === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Projekt-Status Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Projekte vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-gray-600">
            <span className="font-bold text-lg">{payload[0].value}</span> Projekt{payload[0].value !== 1 ? 'e' : ''}
          </p>
          <p className="text-sm text-gray-500">{percentage}% der Projekte</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50/30 hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Projekt-Status Verteilung
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Übersicht aller {total} Projekte nach Status
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
