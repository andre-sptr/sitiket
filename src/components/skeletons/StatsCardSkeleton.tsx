import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const StatsCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32 mt-1" />
          </div>

          <Skeleton className="h-11 w-11 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
};