import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" /> {/* Icon Box */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" /> {/* Title */}
            <Skeleton className="h-4 w-64" /> {/* Description */}
          </div>
        </div>
      </div>

      {/* Tabs List */}
      <div className="grid w-full grid-cols-3 gap-2 p-1 bg-muted/50 rounded-xl border border-border/50">
        <Skeleton className="h-9 w-full rounded-lg bg-background/50" />
        <Skeleton className="h-9 w-full rounded-lg bg-transparent" />
        <Skeleton className="h-9 w-full rounded-lg bg-transparent" />
      </div>

      {/* Content Section (Simulating active tab content) */}
      <div className="space-y-6">
        
        {/* Action Header (Title & Buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" /> {/* Reset Button */}
            <Skeleton className="h-9 w-24" /> {/* Save Button */}
          </div>
        </div>

        {/* Card 1 */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Simulating Accordion Items or Form Inputs */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/30">
                <div className="flex items-center gap-3 w-full">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
             <Skeleton className="h-12 w-full rounded-lg" />
             <Skeleton className="h-12 w-full rounded-lg" />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}