import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const UpdateFormSkeleton = () => {
  const sections = [
    {
      gridClass: "grid-cols-2 md:grid-cols-4 lg:grid-cols-6",
      fields: 6,
      titleWidth: "w-56" 
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      fields: 3,
      titleWidth: "w-48"
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-2",
      fields: 2,
      titleWidth: "w-40"
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-2",
      fields: 2,
      titleWidth: "w-44"
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-4",
      fields: 4,
      titleWidth: "w-52"
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      fields: 4,
      titleWidth: "w-32"
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" /> 
            <Skeleton className="h-8 w-48" /> 
          </div>
          <Skeleton className="h-4 w-64" /> 
        </div>
        <Skeleton className="h-11 w-32 rounded-xl flex-shrink-0" />
      </div>
      
      <Card className="border-primary/10 overflow-hidden">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-center gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-16" /> 
                  <Skeleton className="h-5 w-24" />   
                </div>
                {i !== 5 && <Skeleton className="hidden md:block h-10 w-px" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-5">
        {sections.map((section, index) => (
          <Card key={index} className="overflow-hidden border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                <Skeleton className={`h-6 ${section.titleWidth}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${section.gridClass}`}>
                {Array.from({ length: section.fields || 0 }).map((_, i) => (
                  <div key={i} className="space-y-2"> 
                    <Skeleton className="h-3 w-20" /> 
                    <Skeleton className="h-10 w-full" /> 
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-11 w-24 rounded-xl" /> 
        <Skeleton className="h-11 w-40 rounded-xl" /> 
      </div>
    </div>
  );
};