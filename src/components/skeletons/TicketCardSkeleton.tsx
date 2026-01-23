import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TicketCardSkeletonProps {
  count?: number;
}

export const TicketCardSkeleton = ({ count = 1 }: TicketCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="relative overflow-hidden border bg-card">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted" />

          <div className="pl-4 pr-3 py-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20 rounded" />
                <span className="hidden sm:inline text-muted-foreground/20">•</span>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              
              <Skeleton className="h-5 w-16 rounded-full" /> 
            </div>
            
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-3/4 sm:w-1/5" /> 
                  <Skeleton className="h-4 w-12 rounded hidden sm:block" /> 
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3 w-3 rounded-full" /> 
                  <Skeleton className="h-3 w-40" /> 
                </div>
              </div>
              
              <Skeleton className="h-4 w-4 rounded mt-1" /> 
            </div>
            
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 mt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-5 w-14 rounded-full" /> 
                <Skeleton className="h-5 w-20 rounded-full" /> 
              </div>
              
              <div className="flex items-center gap-2 shrink-0 max-w-[40%] justify-end">
                <Skeleton className="h-5 w-10 rounded hidden sm:block" />
                <Skeleton className="h-5 w-10 rounded hidden sm:block" />
                <Skeleton className="h-5 w-12 rounded hidden sm:block" />

                <div className="h-3 w-px bg-border shrink-0 mx-1 hidden sm:block" />

                <Skeleton className="h-5 w-12 rounded hidden sm:block" />
                
                <div className="flex -space-x-1.5 shrink-0">
                  <Skeleton className="h-5 w-5 rounded-full ring-1 ring-background" />
                  <Skeleton className="h-5 w-5 rounded-full ring-1 ring-background" />
                </div>
                
                <Skeleton className="h-3 w-16 hidden sm:block" /> 
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};