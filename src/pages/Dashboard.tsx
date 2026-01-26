import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/StatsCard';
import { TicketCard } from '@/components/TicketCard';
import { StatsCardSkeleton, TicketCardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTodayTickets, useDashboardStats, useActiveTickets } from '@/hooks/useTickets';
import { mapDbTicketToTicket } from '@/lib/ticketMappers';
import { getSettings, isDueSoon as checkIsDueSoon } from '@/hooks/useSettings';
import { generateWhatsAppMessage, formatDateWIB } from '@/lib/formatters';
import { 
  Ticket as TicketIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Percent,
  Plus,
  RefreshCw,
  ArrowRight,
  Hourglass,
  Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTeknisi } from '@/hooks/useTeknisi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const settings = getSettings();
  const { data: dbTickets, isLoading, refetch } = useTodayTickets();
  const { data: activeTicketsRaw } = useActiveTickets();
  const stats = useDashboardStats();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const todayTickets = dbTickets?.map(mapDbTicketToTicket) || [];

  const realTimeComplianceRate = todayTickets.length > 0
    ? Math.round((todayTickets.filter(t => t.ttrCompliance === 'COMPLY').length / todayTickets.length) * 100)
    : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [dbTickets]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: "Data diperbarui", description: "Dashboard telah di-refresh" });
  };

  const sortedTickets = [...todayTickets].sort((a, b) => {
    if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1;
    if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1;
    return a.sisaTtrHours - b.sisaTtrHours;
  });

  const totalPages = Math.ceil(sortedTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTickets = sortedTickets.slice(startIndex, startIndex + itemsPerPage);

  const overdueTickets = todayTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED');
  const dueSoonTickets = todayTickets.filter(t => 
    checkIsDueSoon(t.sisaTtrHours, settings.ttrThresholds) && t.status !== 'CLOSED'
  );
  const unassignedTickets = todayTickets.filter(t => !t.assignedTo && t.status === 'OPEN');

  const { activeTeknisi } = useTeknisi();
  const allBusyTechs = (activeTicketsRaw || [])
    .flatMap((t) => {
      const techs: string[] = [];
      if (t.assigned_to) techs.push(t.assigned_to);
      if (t.teknisi_list && Array.isArray(t.teknisi_list)) {
        techs.push(...(t.teknisi_list as string[]));
      }
      return techs;
    });

  const uniqueBusyTechs = [...new Set(allBusyTechs)]; 

  const idleTechnicians = activeTeknisi
    .filter((tek) => !uniqueBusyTechs.includes(tek.name))
    .filter((tek) => {
      const query = searchQuery.toLowerCase();
      if (query === 'mitra') {
        return tek.employeeId.startsWith('M-');
      }
      return tek.name.toLowerCase().includes(query);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const idleMitraCount = idleTechnicians.filter(t => t.employeeId.startsWith('M-')).length;
  const idleInternalCount = idleTechnicians.length - idleMitraCount;
  const totalMitraCount = activeTeknisi.filter(t => t.employeeId.startsWith('M-')).length;
  const totalInternalCount = activeTeknisi.length - totalMitraCount;

  const getInitials = (name: string, employeeId: string) => {
    if (employeeId.startsWith('M-')) {
      return name.charAt(0).toUpperCase();
    }

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleCopyTickets = () => {
    if (sortedTickets.length === 0) {
      toast({
        title: "Tidak ada tiket",
        description: "Tidak ada tiket hari ini untuk disalin.",
        variant: "destructive"
      });
      return;
    }

    const messages = sortedTickets.map((ticket, index) => {
      const header = generateWhatsAppMessage('share', ticket);
      const sortedUpdates = [...(ticket.progressUpdates || [])].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      let timelineContent = "\n\n*Timeline Progress:*\n";

      if (sortedUpdates.length > 0) {
        timelineContent += sortedUpdates.map((u, i) => 
          `${i + 1}. [${formatDateWIB(u.timestamp)}] ${u.message}`
        ).join('\n');
      } else {
        timelineContent += "Belum ada update.";
      }
      return `${index + 1}. ${header}${timelineContent}`;
    });

    const fullMessage = messages.join('\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n');  

    navigator.clipboard.writeText(fullMessage);
    
    toast({
      title: "Berhasil Disalin",
      description: `${sortedTickets.length} tiket hari ini telah disalin ke clipboard.`,
    });
  };

  return (
    <Layout>
      <SEO title="Dashboard" description="Dashboard monitoring tiket gangguan hari ini. Lihat statistik TTR, status tiket aktif, dan performa penanganan secara real-time." />
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tiket hari ini — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-9" 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {user?.role !== 'guest' && user?.role !== 'admin' && (
              <Link to="/import">
                <Button size="sm" className="gap-2 h-9">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Input Tiket</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Hari Ini"
                value={stats.totalToday}
                icon={TicketIcon}
                variant="primary"
                index={0}
              />
              <StatsCard
                title="Open"
                value={stats.openTickets}
                subtitle={unassignedTickets.length > 0 ? `${unassignedTickets.length} belum assign` : undefined}
                icon={Clock}
                variant="warning"
                index={1}
              />
              <StatsCard
                title="Overdue"
                value={overdueTickets.length}
                icon={AlertTriangle}
                variant="danger"
                index={2}
              />
              <StatsCard
                title="Closed"
                value={stats.closedToday}
                icon={CheckCircle2}
                variant="success"
                index={3}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Tiket Pending"
                value={stats.pendingTickets}
                subtitle="Menunggu Material/Akses"
                icon={Hourglass}
                variant="default"
                index={4}
              />
              <StatsCard
                title="Compliance Rate"
                value={`${realTimeComplianceRate}%`}
                subtitle="Target: 90%"
                icon={Percent}
                variant={realTimeComplianceRate >= 90 ? 'success' : realTimeComplianceRate >= 70 ? 'warning' : 'danger'}
                index={5}
              />
            </>
          )}
        </div>

        <Card className="col-span-full shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-medium flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Teknisi Standby
                </div>
                <div className="h-4 w-px bg-border mx-1" /> 
                <span className="text-xs text-muted-foreground font-normal">
                  <strong className="text-foreground font-semibold">{idleInternalCount}</strong>
                  <span className="mx-1">dari</span>
                  {totalInternalCount} teknisi
                </span>
                <div className="h-4 w-px bg-border mx-1" /> 
                <span className="text-xs text-muted-foreground font-normal">
                  <strong className="text-foreground font-semibold">{idleMitraCount}</strong>
                  <span className="mx-1">dari</span>
                  {totalMitraCount} mitra
                </span>
              </CardTitle>
              
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari teknisi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {idleTechnicians.length > 0 ? (
              <ScrollArea className="h-[200px] w-full pr-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {idleTechnicians.map((tech) => (
                    <div 
                      key={tech.id} 
                      className="flex items-center gap-3 p-2 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {getInitials(tech.name, tech.employeeId)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate" title={tech.name}>
                          {tech.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {tech.area}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg bg-muted/30">
                {searchQuery ? (
                  <>
                    <Search className="w-8 h-8 mb-2 opacity-20" />
                    <p>Tidak ditemukan teknisi dengan nama "{searchQuery}"</p>
                  </>
                ) : (
                  <p>Semua teknisi sedang menangani tiket.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {(overdueTickets.length > 0 || dueSoonTickets.length > 0 || unassignedTickets.length > 0) && (
          <motion.div 
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {overdueTickets.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge variant="critical" className="gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {overdueTickets.length} tiket overdue
                </Badge>
              </motion.div>
            )}
            {dueSoonTickets.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge variant="warning" className="gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer">
                  <Clock className="w-3.5 h-3.5" />
                  {dueSoonTickets.length} tiket hampir due
                </Badge>
              </motion.div>
            )}
            {unassignedTickets.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge variant="info" className="gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer">
                  <TicketIcon className="w-3.5 h-3.5" />
                  {unassignedTickets.length} belum assign
                </Badge>
              </motion.div>
            )}
          </motion.div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Tiket Hari Ini {sortedTickets.length > 0 && <span className="text-muted-foreground font-normal text-sm ml-1">({sortedTickets.length} total)</span>}
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="whatsapp"
                size="sm" 
                className="gap-2 h-9 mr-2" 
                onClick={handleCopyTickets}
                disabled={sortedTickets.length === 0}
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Pesan WA</span>
              </Button>
              <Link to="/tickets">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <span className='hidden sm:inline'>Lihat Semua</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              <TicketCardSkeleton count={3} />
            ) : sortedTickets.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Belum ada tiket hari ini</p>
                <p className="text-sm mt-1">Tiket yang dibuat hari ini akan muncul di sini</p>
              </div>
            ) : (
              <>
                
                {paginatedTickets.map((ticket) => (
                  <TicketCard 
                    key={ticket.id}
                    ticket={ticket} 
                  />
                ))}

                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 pt-2 w-full overflow-x-auto pb-2 sm:pb-0">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className={cn(
                              "cursor-pointer select-none", 
                              "pl-2.5 sm:pl-4",
                              "[&>span]:hidden [&>span]:sm:inline",
                              currentPage === 1 && "pointer-events-none opacity-50"
                            )} 
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }).map((_, i) => {
                          const pageNumber = i + 1;
                          
                          if (
                            totalPages > 7 &&
                            pageNumber !== 1 &&
                            pageNumber !== totalPages &&
                            Math.abs(currentPage - pageNumber) > 1
                          ) {
                            if (pageNumber === 2 || pageNumber === totalPages - 1) {
                              return (
                                <PaginationItem key={i}>
                                  <span className="px-1 text-muted-foreground text-xs sm:text-sm h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">...</span>
                                </PaginationItem>
                              );
                            }
                            return null;
                          }

                          return (
                            <PaginationItem key={i}>
                              <PaginationLink
                                isActive={pageNumber === currentPage}
                                onClick={() => setCurrentPage(pageNumber)}
                                className="cursor-pointer select-none h-8 w-8 text-xs sm:h-10 sm:w-10 sm:text-sm"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className={cn(
                              "cursor-pointer select-none", 
                              "pr-2.5 sm:pr-4",
                              "[&>span]:hidden [&>span]:sm:inline",
                              currentPage === totalPages && "pointer-events-none opacity-50"
                            )}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;