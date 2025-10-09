'use client';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueChart3DProps {
  data: RevenueData[];
  isLoading?: boolean;
}

export function RevenueChart3D({ data, isLoading }: RevenueChart3DProps) {
  if (isLoading) {
    return (
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
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
      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
        <CardHeader>
          <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            💰 Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Keine Revenue-Daten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0';
  
  // Calculate growth
  const lastMonth = data[data.length - 1]?.revenue || 0;
  const previousMonth = data[data.length - 2]?.revenue || 0;
  const growth = previousMonth > 0 
    ? (((lastMonth - previousMonth) / previousMonth) * 100).toFixed(1)
    : '0';
  const isGrowthPositive = parseFloat(growth) >= 0;

  // Custom Tooltip with 3D effect
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const revenue = payload.find((p: any) => p.dataKey === 'revenue')?.value || 0;
      const expenses = payload.find((p: any) => p.dataKey === 'expenses')?.value || 0;
      const profit = revenue - expenses;
      const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0';

      return (
        <div className="bg-white/95 backdrop-blur-xl border-2 border-gray-200/50 rounded-2xl shadow-2xl p-5 min-w-[240px]">
          <p className="font-bold text-gray-900 mb-3 text-lg pb-2 border-b border-gray-200">
            {label}
          </p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg" />
                <span className="text-sm text-gray-600 font-medium">Revenue</span>
              </div>
              <span className="font-bold text-gray-900 text-base">
                {formatCurrency(revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-orange-500 shadow-lg" />
                <span className="text-sm text-gray-600 font-medium">Expenses</span>
              </div>
              <span className="font-bold text-gray-900 text-base">
                {formatCurrency(expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  profit >= 0 
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                }`} />
                <span className="text-sm font-semibold">Profit</span>
              </div>
              <span className={`font-bold text-base ${
                profit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(profit)}
              </span>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Margin</span>
                <span className={`text-sm font-bold ${
                  parseFloat(margin) >= 30 ? 'text-green-600' :
                  parseFloat(margin) >= 15 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {margin}%
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
    <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Revenue Performance
              </CardTitle>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Monatliche Umsatz- und Gewinnentwicklung
            </p>
          </div>
          
          {/* Stats badges */}
          <div className="flex flex-col gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${
              isGrowthPositive 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            }`}>
              {isGrowthPositive ? (
                <ArrowUpRight className="h-5 w-5 text-white" />
              ) : (
                <ArrowDownRight className="h-5 w-5 text-white" />
              )}
              <span className="text-base font-bold text-white">
                {growth}%
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <div className="text-xs text-white/90 font-medium">Profit Margin</div>
              <div className="text-lg font-bold text-white">{profitMargin}%</div>
            </div>
          </div>
        </div>

        {/* Summary stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="text-xs text-gray-600 font-semibold mb-1">Total Revenue</div>
            <div className="text-lg font-bold text-blue-700">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="text-xs text-gray-600 font-semibold mb-1">Total Expenses</div>
            <div className="text-lg font-bold text-orange-700">
              {formatCurrency(totalExpenses)}
            </div>
          </div>
          <div className={`text-center p-3 rounded-xl ${
            totalProfit >= 0 
              ? 'bg-gradient-to-br from-green-50 to-green-100/50'
              : 'bg-gradient-to-br from-red-50 to-red-100/50'
          }`}>
            <div className="text-xs text-gray-600 font-semibold mb-1">Net Profit</div>
            <div className={`text-lg font-bold ${
              totalProfit >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {formatCurrency(totalProfit)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative pt-4">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart 
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {/* 3D Gradient for Revenue */}
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
              </linearGradient>
              
              {/* 3D Gradient for Expenses */}
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.7}/>
                <stop offset="50%" stopColor="#fb923c" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#fdba74" stopOpacity={0.1}/>
              </linearGradient>

              {/* Shadow effects for 3D look */}
              <filter id="shadow" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="2" dy="2" result="offsetblur"/>
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
              dataKey="month" 
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
              stroke="#9ca3af"
              style={{ 
                fontSize: '12px', 
                fontWeight: 600,
                fill: '#6b7280'
              }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb', strokeWidth: 2 }}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
            
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '13px',
                fontWeight: 600
              }}
              iconType="circle"
            />

            {/* Expenses Area - Behind */}
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#f97316"
              strokeWidth={3}
              fill="url(#expensesGradient)"
              filter="url(#shadow)"
              animationDuration={1500}
              animationBegin={0}
            />

            {/* Revenue Area - Front with 3D effect */}
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={4}
              fill="url(#revenueGradient)"
              filter="url(#shadow)"
              animationDuration={1500}
              animationBegin={300}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
