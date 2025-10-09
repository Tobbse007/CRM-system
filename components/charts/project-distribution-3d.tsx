'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, TrendingUp } from 'lucide-react';

interface ProjectDistributionData {
  name: string;
  value: number;
  color: string;
}

interface ProjectDistribution3DProps {
  data: {
    planning: number;
    inProgress: number;
    review: number;
    completed: number;
    onHold: number;
  };
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  planning: {
    label: 'Planning',
    color: '#3b82f6', // Blue
    gradient: 'from-blue-400 to-blue-600',
    shadow: 'shadow-blue-500/30'
  },
  inProgress: {
    label: 'In Progress',
    color: '#8b5cf6', // Purple
    gradient: 'from-purple-400 to-purple-600',
    shadow: 'shadow-purple-500/30'
  },
  review: {
    label: 'Review',
    color: '#f59e0b', // Amber
    gradient: 'from-amber-400 to-amber-600',
    shadow: 'shadow-amber-500/30'
  },
  completed: {
    label: 'Completed',
    color: '#10b981', // Green
    gradient: 'from-green-400 to-green-600',
    shadow: 'shadow-green-500/30'
  },
  onHold: {
    label: 'On Hold',
    color: '#ef4444', // Red
    gradient: 'from-red-400 to-red-600',
    shadow: 'shadow-red-500/30'
  }
};

export function ProjectDistribution3D({ data, isLoading }: ProjectDistribution3DProps) {
  if (isLoading) {
    return (
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white">
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

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            📊 Project Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Keine Projekt-Daten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG].label,
      value,
      color: STATUS_CONFIG[key as keyof typeof STATUS_CONFIG].color,
    }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / total) * 100).toFixed(1);

      return (
        <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl shadow-2xl p-4 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full shadow-lg" 
              style={{ backgroundColor: item.payload.color }}
            />
            <p className="font-bold text-gray-900">{item.name}</p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-3">
              <span className="text-sm text-gray-600">Projekte:</span>
              <span className="text-lg font-bold text-gray-900">{item.value}</span>
            </div>
            <div className="flex justify-between items-center gap-3 pt-1 border-t border-gray-200">
              <span className="text-sm text-gray-600">Anteil:</span>
              <span className="text-base font-bold text-indigo-600">{percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate most common status
  const maxEntry = Object.entries(data).reduce((max, [key, value]) => 
    value > max.value ? { key, value } : max
  , { key: '', value: 0 });
  
  const mostCommonStatus = STATUS_CONFIG[maxEntry.key as keyof typeof STATUS_CONFIG];
  const mostCommonPercentage = total > 0 ? ((maxEntry.value / total) * 100).toFixed(0) : '0';

  // Custom label for donut center
  const renderCustomLabel = ({ cx, cy }: any) => {
    return (
      <g>
        <text 
          x={cx} 
          y={cy - 10} 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="fill-gray-900 text-3xl font-bold"
        >
          {total}
        </text>
        <text 
          x={cx} 
          y={cy + 15} 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="fill-gray-500 text-sm font-medium"
        >
          Projekte
        </text>
      </g>
    );
  };

  return (
    <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-white hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden">
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <FolderKanban className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Project Distribution
              </CardTitle>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Status-Verteilung aller Projekte
            </p>
          </div>
          
          {/* Top status badge */}
          {mostCommonStatus && (
            <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${mostCommonStatus.gradient} shadow-lg ${mostCommonStatus.shadow}`}>
              <div className="text-xs text-white/90 font-medium">Top Status</div>
              <div className="text-base font-bold text-white">{mostCommonPercentage}%</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <defs>
              {/* 3D Shadow filter */}
              <filter id="donutShadow" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                <feOffset dx="3" dy="3" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.4"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              {/* Gradient definitions for each slice */}
              {chartData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                </linearGradient>
              ))}
            </defs>

            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
              filter="url(#donutShadow)"
              animationBegin={0}
              animationDuration={1200}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
                  stroke="white"
                  strokeWidth={3}
                />
              ))}
            </Pie>
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Center label */}
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={0}
              dataKey="value"
              label={renderCustomLabel}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend with stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          {Object.entries(data).map(([key, value]) => {
            if (value === 0) return null;
            const config = STATUS_CONFIG[key as keyof typeof STATUS_CONFIG];
            const percentage = ((value / total) * 100).toFixed(0);
            
            return (
              <div 
                key={key}
                className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full shadow-md"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    {config.label}
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900">{value}</div>
                <div className="text-xs font-medium text-gray-500">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
