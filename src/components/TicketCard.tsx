import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatusBadge, ComplianceBadge, TTRBadge } from '@/components/StatusBadge';
import { Ticket, TTRCompliance } from '@/types/ticket';
import { formatDateWIB } from '@/lib/formatters';
import { Badge } from "@/components/ui/badge";

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const navigate = useNavigate();

  const displayStatus = useMemo(() => {
    if (!ticket) return 'OPEN';
  
    if (ticket.status !== 'TEMPORARY') {
      return ticket.status;
    }

    if (ticket.progressUpdates && ticket.progressUpdates.length > 0) {
      const sortedUpdates = [...ticket.progressUpdates].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      const lastValidUpdate = sortedUpdates.find(u => 
        u.statusAfterUpdate && u.statusAfterUpdate !== 'TEMPORARY'
      );

      if (lastValidUpdate?.statusAfterUpdate) {
        return lastValidUpdate.statusAfterUpdate;
      }
    }
    return (ticket.teknisiList && ticket.teknisiList.length > 0) ? 'ASSIGNED' : 'OPEN';
  }, [ticket]);

  const currentCompliance = useMemo((): TTRCompliance => {
    if (ticket.status === 'CLOSED') {
      return ticket.ttrCompliance;
    }

    const now = new Date();
    const target = new Date(ticket.maxJamClose);

    if (now > target) {
      return 'NOT COMPLY';
    }

    return ticket.ttrCompliance;
  }, [ticket.status, ticket.maxJamClose, ticket.ttrCompliance]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer bg-card"
        onClick={() => navigate(`/ticket/${ticket.id}`)}
      >
        
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          ticket.status === 'OPEN' ? 'bg-red-500' :
          ticket.status === 'CLOSED' ? 'bg-slate-300 dark:bg-slate-700' :
          'bg-blue-500'
        }`} />

        <div className="pl-4 pr-3 py-3">
          
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                {ticket.incNumbers[0]}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateWIB(ticket.jamOpen)}
              </span>
            </div>
            <StatusBadge status={displayStatus} />
          </div>

          
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-primary transition-colors flex items-center gap-2">
                {ticket.siteName}
                <span className="font-normal text-muted-foreground text-xs border border-border px-1.5 rounded hidden sm:inline-block">
                  {ticket.siteCode}
                </span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {ticket.hsa} ({ticket.lokasiText})
                </span>
              </div>
            </div>
            
            
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>

          
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <TTRBadge targetDate={ticket.maxJamClose} status={ticket.status} size="sm" />
              <ComplianceBadge compliance={currentCompliance} size="sm" />
            </div>

            
            <div className="flex items-center gap-2 shrink-0 max-w-[40%] justify-end">
              
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal shrink-0 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                {ticket.stakeHolder}
              </Badge>
              
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal shrink-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                {ticket.provider}
              </Badge>
              
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-normal shrink-0">
                {ticket.kategori}
              </Badge>

              <div className="h-3 w-px bg-border shrink-0 mx-1" />

              {ticket.teknisiList && ticket.teknisiList.length > 0 ? (
                <>
                  <div className="flex -space-x-1.5 shrink-0">
                    {ticket.teknisiList.slice(0, 3).map((tech, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-center w-5 h-5 rounded-full bg-background border border-border ring-1 ring-background text-[9px] font-bold text-muted-foreground uppercase"
                        title={tech}
                      >
                        {tech.charAt(0)}
                      </div>
                    ))}
                    {ticket.teknisiList.length > 3 && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted border border-border ring-1 ring-background text-[8px] font-medium">
                        +{ticket.teknisiList.length - 3}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-muted-foreground truncate hidden sm:block" title={ticket.teknisiList.join(', ')}>
                    {ticket.teknisiList[0]}
                    {ticket.teknisiList.length > 1 && ` +${ticket.teknisiList.length - 1}`}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">No Tech</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};