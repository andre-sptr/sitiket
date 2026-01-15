import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const UpdateFormSkeleton = () => {
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
        
        {/* Save Button */}
        <Skeleton className="h-11 w-32 rounded-xl flex-shrink-0" />
      </div>

      {/* Ticket Summary Card */}
      <Card className="bg-muted/30 border-primary/10">
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-wrap items-center gap-6">
            {/* 6 Summary Items: No Tiket, Site, Kategori, Status, Jam Open, TTR Sisa */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Sections 
         Urutan sesuai UpdateTicket.tsx:
         0: Status & TTR (5 fields)
         1: Gangguan & Perbaikan (4 fields)
         2: Progress Saat Ini (Textarea)
         3: Tim Teknisi (4 fields)
         4: Status Perbaikan (2 fields)
         5: Timeline Penanganan (8 fields - small grid)
         6: Kendala & Informasi (3 fields)
      */}
      {[5, 4, 1, 4, 2, 8, 3].map((fields, sectionIndex) => (
        <Card key={sectionIndex}>
          <CardHeader className="pb-4">
            {/* Card Title + Icon */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            {sectionIndex === 2 ? (
              // Khusus Section Progress (Textarea)
              <Skeleton className="h-32 w-full rounded-md" />
            ) : (
              // Grid Layout untuk field lainnya
              <div className={`grid gap-4 ${
                sectionIndex === 5 
                  ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8' // Timeline fields (lebih padat)
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' // Standard fields
              }`}>
                {Array.from({ length: fields }).map((_, fieldIndex) => (
                  <div key={fieldIndex} className="space-y-2">
                    <Skeleton className="h-3 w-20" /> {/* Label */}
                    <Skeleton className="h-10 w-full" /> {/* Input/Select */}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-11 w-24 rounded-xl" /> {/* Tombol Batal */}
        <Skeleton className="h-11 w-40 rounded-xl" /> {/* Tombol Simpan */}
      </div>
    </div>
  );
};