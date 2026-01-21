import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ReportsSkeleton = () => {
  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 md:w-64" /> 
          <Skeleton className="h-4 w-32 md:w-48" /> 
        </div>
        <Skeleton className="h-9 w-32" /> 
      </div>

      
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" /> 
            <Skeleton className="h-4 w-24" /> 
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            
            <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
            
            
            <Skeleton className="h-8 w-32" />
            <span className="text-muted-foreground">-</span>
            <Skeleton className="h-8 w-32" />
            
            
            <Skeleton className="h-8 w-20" />
          </div>

          <div className="ml-auto">
            <Skeleton className="h-6 w-32 rounded-full" /> 
          </div>
        </div>
      </Card>

      
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" /> 
                  <Skeleton className="h-8 w-12" /> 
                  {i === 0 || i === 5 ? <Skeleton className="h-2 w-24 mt-1" /> : null} 
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" /> 
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      
      <div className="space-y-4">
        
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full flex items-end justify-between gap-2 pt-4">
              
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

      
      <div className="grid lg:grid-cols-2 gap-6">
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-4">
            
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