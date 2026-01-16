import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ReportsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* 1. Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 md:w-64" /> {/* Title */}
          <Skeleton className="h-4 w-32 md:w-48" /> {/* Subtitle */}
        </div>
        <Skeleton className="h-9 w-32" /> {/* Export Button */}
      </div>

      {/* 2. Date Filter Card */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" /> {/* Icon */}
            <Skeleton className="h-4 w-24" /> {/* Label */}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Preset Buttons (7, 14, 30 days) */}
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            
            <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
            
            {/* Date Pickers */}
            <Skeleton className="h-8 w-32" />
            <span className="text-muted-foreground">-</span>
            <Skeleton className="h-8 w-32" />
            
            {/* Reset Button */}
            <Skeleton className="h-8 w-20" />
          </div>

          <div className="ml-auto">
            <Skeleton className="h-6 w-32 rounded-full" /> {/* Ticket Count Badge */}
          </div>
        </div>
      </Card>

      {/* 3. Stats Cards Grid (Matching the 6 columns in Reports.tsx) */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" /> {/* Title */}
                  <Skeleton className="h-8 w-12" /> {/* Value */}
                  {i === 0 || i === 5 ? <Skeleton className="h-2 w-24 mt-1" /> : null} {/* Subtitle for some cards */}
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" /> {/* Icon */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4. Tabs & Main Chart Area */}
      <div className="space-y-4">
        {/* Tabs List */}
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        {/* Main Chart Card */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex items-end justify-between gap-2 pt-4">
              {/* Fake Bars representing the chart */}
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="w-full rounded-t-sm" 
                  style={{ height: `${Math.random() * 60 + 20}%` }} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Secondary Charts Grid (2 Columns) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* List items mimicking Provider Performance list */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Chart (Gauge/Pie placeholder) */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-[280px]">
              <Skeleton className="h-40 w-40 rounded-full border-8 border-muted" />
              <div className="flex gap-4 mt-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Summary Footer Stats */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};