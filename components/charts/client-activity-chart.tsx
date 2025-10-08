'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface ClientActivityChartProps {
  clients: Array<{
    name: string;
    projects: number;
    tasks: number;
  }>;
}

export function ClientActivityChart({ clients }: ClientActivityChartProps) {
  if (clients.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-amber-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Top Kunden nach Aktivität
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Keine Kundendaten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-4">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-gray-600">Projekte:</span>
              <span className="font-bold text-gray-900">{payload[0].value}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">Aufgaben:</span>
              <span className="font-bold text-gray-900">{payload[1].value}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalProjects = clients.reduce((sum, c) => sum + c.projects, 0);
  const totalTasks = clients.reduce((sum, c) => sum + c.tasks, 0);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-amber-50/30 hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Top Kunden nach Aktivität
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Top 5 aktivste Kunden
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100">
            <Users className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              {totalProjects}P / {totalTasks}A
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={clients}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={80}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '14px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar 
              dataKey="projects" 
              fill="#f59e0b" 
              name="Projekte"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
            <Bar 
              dataKey="tasks" 
              fill="#f97316" 
              name="Aufgaben"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
