'use client';

import { reportTypes, ReportCard, type ReportType } from './report-card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter } from 'lucide-react';

interface ReportSelectorProps {
  selectedReportId?: string;
  onSelectReport: (reportId: string) => void;
  showCategories?: boolean;
}

export function ReportSelector({
  selectedReportId,
  onSelectReport,
  showCategories = true,
}: ReportSelectorProps) {
  const categories = Array.from(new Set(reportTypes.map((r) => r.category)));

  const getReportsByCategory = (category: ReportType['category']) => {
    return reportTypes.filter((r) => r.category === category);
  };

  const categoryLabels: Record<ReportType['category'], string> = {
    project: 'Projekte',
    client: 'Kunden',
    time: 'Zeit',
    financial: 'Finanzen',
    team: 'Team',
  };

  if (!showCategories) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onSelect={onSelectReport}
            selected={selectedReportId === report.id}
            showQuickExport
          />
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-6">
        <TabsTrigger value="all" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Alle
        </TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger key={category} value={category} className="capitalize">
            {categoryLabels[category]}
            <Badge variant="secondary" className="ml-2">
              {getReportsByCategory(category).length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {/* Beliebte Reports */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            ⭐ Beliebte Reports
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes
              .filter((r) => r.popular)
              .map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onSelect={onSelectReport}
                  selected={selectedReportId === report.id}
                  showQuickExport
                />
              ))}
          </div>
        </div>

        {/* Alle Reports */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Alle Reports</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onSelect={onSelectReport}
                selected={selectedReportId === report.id}
                showQuickExport
              />
            ))}
          </div>
        </div>
      </TabsContent>

      {categories.map((category) => (
        <TabsContent key={category} value={category}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getReportsByCategory(category).map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onSelect={onSelectReport}
                selected={selectedReportId === report.id}
                showQuickExport
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
