import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" /> 
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" /> 
            <Skeleton className="h-4 w-64" /> 
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-3 gap-2 p-1 bg-muted/50 rounded-xl border border-border/50">
        <Skeleton className="h-9 w-full rounded-lg bg-background/80" />
        <Skeleton className="h-9 w-full rounded-lg bg-transparent" />
        <Skeleton className="h-9 w-full rounded-lg bg-transparent" />
      </div>

      <div className="space-y-6">  
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" /> 
            <Skeleton className="h-4 w-56" /> 
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" /> 
            <Skeleton className="h-9 w-24" /> 
          </div>
        </div>

        {[1, 2].map((cardIndex) => (
          <Card key={cardIndex} className="border-border/50 overflow-hidden bg-card/80">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" /> 
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" /> 
                  <Skeleton className="h-3 w-48" /> 
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-muted/10">
                  <div className="flex items-center gap-3 w-full">
                    <Skeleton className="h-4 w-4 rounded-sm" /> 
                    <Skeleton className="h-4 w-1/3" /> 
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" /> 
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}