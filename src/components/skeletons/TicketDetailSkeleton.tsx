import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TicketDetailSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" /> {/* Back Button */}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Skeleton className="h-6 w-24 rounded-md" /> {/* Ticket No */}
            <Skeleton className="h-6 w-20 rounded-full" /> {/* Status Badge */}
          </div>
          
          <Skeleton className="h-8 md:h-9 w-3/4 sm:w-1/2 rounded-lg mb-3" /> {/* Title */}
          
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-32 rounded-xl" />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column (Info Cards) */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Status TTR Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-[72px] w-full rounded-xl" /> {/* Countdown Box */}
              
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              
              <Skeleton className="h-10 w-full rounded-xl" /> {/* Target TTR */}
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              
              <Skeleton className="h-8 w-40 rounded-lg" /> {/* LatLong */}
              <Skeleton className="h-9 w-full rounded-xl" /> {/* Maps Button */}
              
              <Skeleton className="h-11 w-full rounded-xl" /> {/* Distance */}
            </CardContent>
          </Card>

          {/* Teknisi Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-transparent">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Updates & Timeline) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Input Update Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" /> {/* Select */}
              <Skeleton className="h-32 w-full rounded-xl" /> {/* Textarea */}
              
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-32 rounded-xl" />
                <Skeleton className="h-9 w-32 rounded-xl" />
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <div className="w-0.5 h-full bg-muted mt-2" />
                  </div>
                  <div className="flex-1 space-y-2 pb-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};