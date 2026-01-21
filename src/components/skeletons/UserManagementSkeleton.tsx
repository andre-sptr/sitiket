import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export const UserManagementSkeleton = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-2">
            
            <Skeleton className="h-8 w-48 md:w-64" />
            <Skeleton className="h-4 w-32 md:w-48" />
          </div>
        </div>
        
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      
      <div className="flex flex-col sm:flex-row gap-4">
        
        <div className="relative flex-1 max-w-sm">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        
        <Skeleton className="w-full sm:w-[200px] h-10 rounded-md" />
      </div>

      
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 border-border/50">
            <div className="flex items-center gap-3">
              
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5">
                
                <Skeleton className="h-7 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-16" /> 
        </CardHeader>
        <Separator className="mb-6" />
        
        <CardContent>
          
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, index) => (
              <div 
                key={index} 
                className="flex flex-col justify-between rounded-xl border border-border/50 overflow-hidden h-full"
              >
                
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    
                    <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                    
                    
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>

                  <div className="space-y-4">
                    
                    <Skeleton className="h-6 w-3/4" />
                    
                    
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4 rounded-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  </div>
                </div>

                
                <div className="p-3 bg-muted/30 border-t flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          
          <div className="flex justify-center mt-8 gap-2">
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-9 w-9 rounded-md" /> 
            <Skeleton className="h-9 w-9 rounded-md" /> 
          </div>
        </CardContent>
      </Card>
    </div>
  );
};