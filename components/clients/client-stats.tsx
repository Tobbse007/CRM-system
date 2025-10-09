'use client';

import { Users, UserCheck, UserPlus, TrendingUp } from 'lucide-react';
import type { Client } from '@/types';

interface ClientStatsProps {
  clients: Client[];
  isLoading?: boolean;
}

export function ClientStats({ clients, isLoading }: ClientStatsProps) {
  // Calculate statistics
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length;
  const leads = clients.filter((c) => c.status === 'LEAD').length;
  
  // Conversion rate (Leads that became ACTIVE)
  // For demo, we calculate: active / total * 100
  const conversionRate = totalClients > 0 
    ? Math.round((activeClients / totalClients) * 100) 
    : 0;

  const stats = [
    {
      id: 'total',
      label: 'Gesamt Kunden',
      value: totalClients,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'active',
      label: 'Aktive Kunden',
      value: activeClients,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'leads',
      label: 'Leads',
      value: leads,
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="stat-card animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="stat-card hover-lift"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
