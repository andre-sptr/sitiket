import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const UpdateFormSkeleton = () => {
  const sections = [
    {
      gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
      fields: 5,
      titleWidth: "w-32" 
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      fields: 4,
      titleWidth: "w-48"
    },
    {
      isTextarea: true,
      titleWidth: "w-40"
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      fields: 4,
      titleWidth: "w-32"
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-2",
      fields: 2,
      titleWidth: "w-40"
    },
    {
      gridClass: "grid-cols-2 md:grid-cols-4 lg:grid-cols-8",
      fields: 8,
      titleWidth: "w-56"
    },
    {
      gridClass: "grid-cols-1 md:grid-cols-3",
      fields: 3,
      titleWidth: "w-52"
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header Section */}
      <div className="flex items-start gap-4">
        {/* Back Button */}
        <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
        
        {/* Title & Subtitle */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {/* Save Button (Top) */}
        <Skeleton className="h-11 w-32 rounded-xl flex-shrink-0" />
      </div>

      {/* Ticket Summary Card */}
      <Card className="border-primary/10 overflow-hidden">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-center gap-6">
            {/* Items: No Tiket, Site, Kategori, Status, Jam Open, TTR Sisa */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
                {/* Divider (Hidden on mobile matches actual implementation) */}
                {i !== 6 && <Skeleton className="hidden md:block h-10 w-px" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Sections Container */}
      <div className="grid gap-5">
        {sections.map((section, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                {/* Icon Placeholder */}
                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                {/* Title Placeholder */}
                <Skeleton className={`h-6 ${section.titleWidth}`} />
              </div>
            </CardHeader>
            <CardContent>
              {section.isTextarea ? (
                <Skeleton className="h-[120px] w-full rounded-md" />
              ) : (
                <div className={`grid gap-4 ${section.gridClass}`}>
                  {Array.from({ length: section.fields || 0 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-24" /> {/* Label */}
                      <Skeleton className="h-10 w-full" /> {/* Input/Select */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-11 w-24 rounded-xl" /> {/* Cancel Button */}
        <Skeleton className="h-11 w-40 rounded-xl" /> {/* Save Button */}
      </div>
    </div>
  );
};