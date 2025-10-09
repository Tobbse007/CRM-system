'use client';

import { 
  ComposedChart,
  Bar,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Target, Zap } from 'lucide-react';

interface TaskCompletionData {
  week: string;
  completed: number;
  created: number;
  completionRate: number;
}

interface TaskCompletion3DProps {
  data: TaskCompletionData[];
  isLoading?: boolean;
}

export function TaskCompletion3D({ data, isLoading }: TaskCompletion3DProps) {
  if (isLoading) {
    return (
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-gradient-to-br from-white via-green-50/30 to-teal-50/30">
        <CardHeader>
          <div className="h-6 w-48 skeleton rounded" />
          <div className="h-4 w-64 skeleton rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="h-[400px] skeleton rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-gradient-to-br from-white via-green-50/30 to-teal-50/30">
        <CardHeader>
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            ✅ Task Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Keine Task-Daten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const totalCreated = data.reduce((sum, item) => sum + item.created, 0);
  const avgCompletionRate = data.length > 0
    ? (data.reduce((sum, item) => sum + item.completionRate, 0) / data.length).toFixed(1)
    : '0';
  
  // Velocity (tasks completed per week)
  const velocity = data.length > 0 ? (totalCompleted / data.length).toFixed(1) : '0';

  // Trend
  const lastWeek = data[data.length - 1]?.completionRate || 0;
  const previousWeek = data[data.length - 2]?.completionRate || 0;
  const trend = previousWeek > 0 
    ? ((lastWeek - previousWeek)).toFixed(1)
    : '0';
  const isTrendPositive = parseFloat(trend) >= 0;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const completed = payload.find((p: any) => p.dataKey === 'completed')?.value || 0;
      const created = payload.find((p: any) => p.dataKey === 'created')?.value || 0;
      const rate = payload.find((p: any) => p.dataKey === 'completionRate')?.value || 0;

      return (
        <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl shadow-2xl p-5 min-w-[220px]">
          <p className="font-bold text-gray-900 mb-3 text-base pb-2 border-b border-gray-200">
            {label}
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg" />
                <span className="text-sm text-gray-600 font-medium">Completed</span>
              </div>
              <span className="font-bold text-gray-900">
                {completed}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg" />
                <span className="text-sm text-gray-600 font-medium">Created</span>
              </div>
              <span className="font-bold text-gray-900">
                {created}
              </span>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-2.5 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Completion Rate</span>
                <span className="text-base font-bold text-green-600">
                  {rate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-gradient-to-br from-white via-green-50/30 to-teal-50/30 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-teal-500/5 to-cyan-500/5 pointer-events-none" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg shadow-green-500/30">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Task Completion Trend
              </CardTitle>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Wöchentliche Aufgaben-Performance
            </p>
          </div>
          
          {/* Stats badges */}
          <div className="flex flex-col gap-2">
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-white" />
                <div>
                  <div className="text-xs text-white/90 font-medium">Avg. Rate</div>
                  <div className="text-lg font-bold text-white">{avgCompletionRate}%</div>
                </div>
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-white" />
                <div>
                  <div className="text-xs text-white/90 font-medium">Velocity</div>
                  <div className="text-lg font-bold text-white">{velocity}/week</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="text-xs text-gray-600 font-semibold mb-1">Total Completed</div>
            <div className="text-lg font-bold text-green-700">
              {totalCompleted}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="text-xs text-gray-600 font-semibold mb-1">Total Created</div>
            <div className="text-lg font-bold text-blue-700">
              {totalCreated}
            </div>
          </div>
          <div className={`text-center p-3 rounded-xl ${
            isTrendPositive
              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
              : 'bg-gradient-to-br from-amber-50 to-amber-100/50'
          }`}>
            <div className="text-xs text-gray-600 font-semibold mb-1">Trend</div>
            <div className={`text-lg font-bold ${
              isTrendPositive ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {isTrendPositive ? '+' : ''}{trend}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-4">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart 
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {/* 3D Gradient for Completed Bar */}
              <linearGradient id="completedBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
              </linearGradient>
              
              {/* 3D Gradient for Created Bar */}
              <linearGradient id="createdBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.7}/>
              </linearGradient>

              {/* Area gradient for completion rate */}
              <linearGradient id="rateAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05}/>
              </linearGradient>

              {/* Shadow effects */}
              <filter id="barShadow" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="1" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              strokeOpacity={0.5}
              vertical={false}
            />
            
            <XAxis 
              dataKey="week" 
              stroke="#9ca3af"
              style={{ 
                fontSize: '12px', 
                fontWeight: 600,
                fill: '#6b7280'
              }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 2 }}
            />
            
            <YAxis 
              yAxisId="left"
              stroke="#9ca3af"
              style={{ 
                fontSize: '12px', 
                fontWeight: 600,
                fill: '#6b7280'
              }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 2 }}
              label={{ value: 'Tasks', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />

            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ 
                fontSize: '12px', 
                fontWeight: 600,
                fill: '#6b7280'
              }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 2 }}
              tickFormatter={(value) => `${value}%`}
              label={{ value: 'Rate %', angle: 90, position: 'insideRight', fill: '#6b7280' }}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
            
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '13px',
                fontWeight: 600
              }}
              iconType="circle"
            />

            {/* Background area for completion rate */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="completionRate"
              name="Completion Rate"
              fill="url(#rateAreaGradient)"
              stroke="none"
              animationDuration={1000}
            />

            {/* Created Bar - Behind */}
            <Bar
              yAxisId="left"
              dataKey="created"
              name="Created"
              fill="url(#createdBarGradient)"
              radius={[8, 8, 0, 0]}
              filter="url(#barShadow)"
              animationDuration={1200}
              animationBegin={0}
            />

            {/* Completed Bar - Front */}
            <Bar
              yAxisId="left"
              dataKey="completed"
              name="Completed"
              fill="url(#completedBarGradient)"
              radius={[8, 8, 0, 0]}
              filter="url(#barShadow)"
              animationDuration={1200}
              animationBegin={200}
            />

            {/* Completion Rate Line - on top */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="completionRate"
              name="Completion Rate"
              stroke="#14b8a6"
              strokeWidth={4}
              dot={{ 
                fill: '#14b8a6', 
                strokeWidth: 3, 
                r: 6,
                stroke: '#fff'
              }}
              activeDot={{ 
                r: 8, 
                fill: '#14b8a6',
                stroke: '#fff',
                strokeWidth: 3
              }}
              animationDuration={1500}
              animationBegin={400}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
