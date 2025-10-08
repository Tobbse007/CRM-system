'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskProgressChartProps {
  todo: number;
  inProgress: number;
  done: number;
}

export function TaskProgressChart({ todo, inProgress, done }: TaskProgressChartProps) {
  const data = [
    {
      name: 'Aufgaben',
      Offen: todo,
      'In Arbeit': inProgress,
      Erledigt: done,
    },
  ];

  const total = todo + inProgress + done;

  if (total === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Aufgaben-Fortschritt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Aufgaben vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  const completionRate = ((done / total) * 100).toFixed(1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-3">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-bold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Aufgaben-Fortschritt
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {total} Aufgaben insgesamt · {completionRate}% erledigt
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              style={{ fontSize: '14px', fontWeight: 500 }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '14px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="Offen" 
              fill="#3b82f6" 
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
            <Bar 
              dataKey="In Arbeit" 
              fill="#f59e0b" 
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
            <Bar 
              dataKey="Erledigt" 
              fill="#10b981" 
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
