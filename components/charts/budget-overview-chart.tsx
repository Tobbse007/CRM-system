'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface BudgetOverviewChartProps {
  projectBudgets: Array<{
    name: string;
    budget: number;
    timeSpent: number;
  }>;
}

export function BudgetOverviewChart({ projectBudgets }: BudgetOverviewChartProps) {
  if (projectBudgets.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30">
        <CardHeader>
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Budget vs. Zeitaufwand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Keine Budget-Daten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  // Konvertiere Budget von Cent in Stunden (angenommen: 1 Stunde = 100€)
  const data = projectBudgets.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    'Budget (Std)': (project.budget / 10000).toFixed(1), // Budget in Stunden
    'Verbraucht (Std)': project.timeSpent,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const budget = parseFloat(payload[0].value);
      const spent = parseFloat(payload[1].value);
      const percentage = budget > 0 ? ((spent / budget) * 100).toFixed(1) : '0';
      const isOverBudget = spent > budget;

      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-4">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">Budget:</span>
              <span className="font-bold text-gray-900">{payload[0].value} Std</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} />
              <span className="text-gray-600">Verbraucht:</span>
              <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                {payload[1].value} Std
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                {percentage}% genutzt {isOverBudget && '⚠️'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalBudget = projectBudgets.reduce((sum, p) => sum + (p.budget / 10000), 0);
  const totalSpent = projectBudgets.reduce((sum, p) => sum + p.timeSpent, 0);
  const overallPercentage = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-green-50/30 hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Budget vs. Zeitaufwand
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Vergleich Budget und tatsächlicher Zeitaufwand pro Projekt
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {overallPercentage}% gesamt
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
              label={{ value: 'Stunden', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="Budget (Std)" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 6 }}
              activeDot={{ r: 8 }}
              animationDuration={800}
            />
            <Line 
              type="monotone" 
              dataKey="Verbraucht (Std)" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 6 }}
              activeDot={{ r: 8 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
