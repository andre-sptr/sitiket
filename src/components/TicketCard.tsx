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
  const isMTC = ticket?.tim === 'MTC';

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
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded w-fit">
                {isMTC ? (ticket.incGamas || '-') : ticket.incNumbers[0]}
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
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base group-hover:text-primary transition-colors flex flex-wrap items-center gap-x-2">
                {isMTC ? (ticket.datek || '-') : ticket.siteName}
                <span className="font-normal text-muted-foreground text-[10px] border border-border px-1.5 rounded">
                  {isMTC ? (ticket.odc || '-') : ticket.siteCode}
                </span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {ticket.hsa} <span className="opacity-70">({ticket.lokasiText})</span>
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-border/40 mt-2">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div className="flex items-center gap-2">
                <TTRBadge targetDate={ticket.maxJamClose} status={ticket.status} size="sm" />
                <ComplianceBadge compliance={currentCompliance} size="sm" />
              </div>
              
              <div className="flex items-center gap-1 sm:hidden">
                <Badge variant="outline" className="h-5 px-1.5 text-[9px] bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                  {ticket.stakeHolder}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="hidden sm:inline-flex h-5 px-1.5 text-[10px]">
                  {ticket.provider}
                </Badge>
                <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                  {ticket.kategori}
                </Badge>
                <div className="h-3 w-px bg-border mx-0.5" />
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold border-primary/20 bg-primary/5">
                  {ticket.tim}
                </Badge>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {ticket.teknisiList && ticket.teknisiList.length > 0 ? (
                  <div className="flex -space-x-1.5">
                    {ticket.teknisiList.slice(0, 2).map((tech, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-center w-6 h-6 rounded-full bg-background border border-border ring-1 ring-background text-[10px] font-bold text-muted-foreground uppercase"
                        title={tech}
                      >
                        {tech
                        .replace(/\(.*?\)/g, '')    
                        .replace(/[^a-zA-Z\s]/g, '')
                        .trim()                     
                        .split(/\s+/)               
                        .map(name => name.charAt(0))
                        .join('')                   
                        .toUpperCase()              
                        .slice(0, 2)                
                      }
                      </div>
                    ))}
                    {ticket.teknisiList.length > 2 && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted border border-border ring-1 ring-background text-[9px] font-medium">
                        +{ticket.teknisiList.length - 2}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">No Tech</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};