import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, Variants } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { StatusBadge, ComplianceBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { TicketDetailSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTicket, useDeleteTicket, useAddProgressUpdate } from '@/hooks/useTickets';
import { mapDbTicketToTicket } from '@/lib/ticketMappers';
import { formatDateWIB, generateWhatsAppMessage, generateGoogleMapsLink, formatTTR } from '@/lib/formatters';
import { TicketStatus, TTRCompliance } from '@/types/ticket';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Copy, 
  FileText,
  Send,
  Phone,
  Trash2,
  Target,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Zap,
  MessageSquare,
  ChevronRight,
  Activity,
  Building2,
  FileStack,
  ShieldCheck,
  Wrench,
  Flag,
  Hash,
  Database,
  Signal,
  TowerControl,
  Globe,
  CheckSquare,
  Users,
  ChevronDown,
  Loader2,
  Pencil,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import SEO from '@/components/SEO';
import { useTeknisi } from '@/hooks/useTeknisi';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const TTRCountdown = ({ targetDate, status }: { targetDate: Date | string, status: string }) => {
  const [timeState, setTimeState] = useState({ display: '-', isOverdue: false, isClosed: false, percent: 100 });

  useEffect(() => {
    if (status === 'CLOSED') {
      setTimeState({ display: "TIKET CLOSED", isOverdue: false, isClosed: true, percent: 100 });
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      const isLate = diff < 0; 

      const duration = Math.abs(diff);
      const days = Math.floor(duration / (1000 * 60 * 60 * 24));
      const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((duration % (1000 * 60)) / 1000);

      let timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (days > 0) {
        timeString = `${days}h ${timeString}`;
      }

      const totalHours = days * 24 + hours + minutes / 60;
      const percent = isLate ? 0 : Math.min(100, (totalHours / 4) * 100);

      setTimeState({ 
        display: timeString, 
        isOverdue: isLate, 
        isClosed: false,
        percent
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000); 

    return () => clearInterval(interval);
  }, [targetDate, status]);

  return (
    <motion.div 
      className="relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`
        relative overflow-hidden rounded-xl p-4 
        ${timeState.isClosed 
          ? 'bg-muted/50 border border-border' 
          : timeState.isOverdue 
            ? 'bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/30' 
            : 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30'
        }
      `}>
        {!timeState.isClosed && !timeState.isOverdue && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        <div className="relative z-10 flex items-center gap-3">
          <div className={`
            p-2 rounded-lg 
            ${timeState.isClosed 
              ? 'bg-muted text-muted-foreground' 
              : timeState.isOverdue 
                ? 'bg-destructive/20 text-destructive' 
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }
          `}>
            {timeState.isClosed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : timeState.isOverdue ? (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : (
              <Timer className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              {timeState.isClosed ? 'Status' : timeState.isOverdue ? 'Overdue' : 'Sisa Waktu'}
            </p>
            <p className={`
              font-mono text-lg font-bold tracking-tight
              ${timeState.isClosed 
                ? 'text-muted-foreground' 
                : timeState.isOverdue 
                  ? 'text-destructive' 
                  : 'text-emerald-600 dark:text-emerald-400'
              }
            `}>
              {timeState.isClosed ? (
                'CLOSED'
              ) : timeState.isOverdue ? (
                <span className="flex items-center gap-1">
                  +{timeState.display}
                </span>
              ) : (
                timeState.display
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MTCDetailRow = ({ label, value, icon: Icon }: { label: string, value: string | number | undefined | null, icon?: any }) => (
  <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon className="w-3 h-3 text-muted-foreground" />}
      <p className="text-xs text-muted-foreground tracking-wider">{label}</p>
    </div>
    <p className="text-sm font-medium break-words">{value || '-'}</p>
  </div>
);

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { teknisiList: allTeknisi } = useTeknisi();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const deleteTicket = useDeleteTicket();
  const { data: dbTicket, isLoading } = useTicket(id || '');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState<TicketStatus | ''>('');
  const addProgressUpdate = useAddProgressUpdate();
  const isGuest = user?.role === 'guest';
  const isAdmin = user?.role === 'admin';
  const ticket = dbTicket ? mapDbTicketToTicket(dbTicket) : null;
  const isMTC = ticket?.tim === 'MTC';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleWhatsApp = (phone: string) => {
    const formatted = phone.replace(/\D/g, '').replace(/^0/, '62');
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const currentCompliance = useMemo((): TTRCompliance => {
    if (!ticket) return 'COMPLY';

    if (ticket.status === 'CLOSED') {
      return ticket.ttrCompliance;
    }

    const now = new Date();
    const target = new Date(ticket.maxJamClose);

    if (now > target) {
      return 'NOT COMPLY';
    }

    return ticket.ttrCompliance;
  }, [ticket]);

  const finalSisaTtr = useMemo(() => {
    if (!ticket) return 0;

    return (ticket.ttrRealHours !== null && ticket.ttrRealHours !== undefined)
      ? ticket.ttrTargetHours - ticket.ttrRealHours
      : ticket.sisaTtrHours;
  }, [ticket]);

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

  const { data: profiles } = useQuery({
    queryKey: ['profiles-map'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name');
      return data || [];
    },
    enabled: !!ticket
  });

  const profileMap = profiles?.reduce((acc, profile) => {
    acc[profile.user_id] = profile.name;
    return acc;
  }, {} as Record<string, string>) || {};

  const enrichedUpdates = ticket?.progressUpdates.map(update => ({
    ...update,
    createdBy: profileMap[update.createdBy] || update.createdBy
  })) || [];

  if (isLoading) {
    return (
      <Layout>
        <TicketDetailSkeleton />
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Tiket tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </motion.div>
      </Layout>
    );
  }

  const handleDelete = async () => {
    if (!ticket) return;

    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast({
        title: "Tiket Dihapus",
        description: `Tiket ${ticket.incNumbers?.[0] || 'tersebut'} berhasil dihapus permanen.`,
      });
      navigate('/tickets');
    } catch (error) {
      console.error('Gagal menghapus:', error);
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus tiket.",
        variant: "destructive",
      });
    }
  };

  const handleCopyShareMessage = (type: 'latest' | 'all') => {
    if (!ticket) return;

    const header = generateWhatsAppMessage('share', ticket);
    const sortedUpdates = [...(ticket.progressUpdates || [])].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let content = "";
    content += "\n\n*Timeline Progress:*\n";

    if (type === 'latest') {
      const latest = sortedUpdates[0];
      if (latest) {
        content += `[${formatDateWIB(latest.timestamp)}] ${latest.message}`;
      } else {
        content += "Belum ada update.";
      }
    } else {
      if (sortedUpdates.length > 0) {
        content += sortedUpdates.map((u, i) => 
          `${i + 1}. [${formatDateWIB(u.timestamp)}] ${u.message}`
        ).join('\n');
      } else {
        content += "Belum ada update.";
      }
    }

    const fullMessage = `${header}${content}`;
    
    navigator.clipboard.writeText(fullMessage);
    toast({
      title: type === 'latest' ? "Update Terbaru Disalin" : "Semua Progress Disalin",
      description: "Pesan WhatsApp telah disalin ke clipboard",
    });
  };

  const handleSubmitUpdate = async () => {
    if (!updateMessage.trim()) {
      toast({
        title: "Error",
        description: "Pesan update tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (!ticket || !user) return;
 
    try {
      await addProgressUpdate.mutateAsync({
        ticket_id: ticket.id,
        message: updateMessage,
        status_after_update: updateStatus || null, 
        source: 'HD',
        created_by: user.id,
      });

      toast({
        title: "Update Berhasil",
        description: "Progress update telah ditambahkan ke timeline",
      });
      
      setUpdateMessage('');
      setUpdateStatus('');
      
    } catch (error) {
      console.error('Gagal update:', error);
      toast({
        title: "Gagal Update",
        description: "Terjadi kesalahan saat menyimpan update.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      {ticket && (
        <SEO 
          title={`${isMTC ? (ticket.incGamas || '-') : ticket.incNumbers.join(', ')}`}
          description={`Detail tiket gangguan di ${ticket.siteName}. Status: ${ticket.status}`} 
        />
      )}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex items-start gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-xl bg-muted/50 hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <motion.span 
                className="font-mono text-sm px-2 py-1 rounded-md bg-muted/50 text-muted-foreground"
                whileHover={{ scale: 1.02 }}
              >
                {isMTC ? (ticket.incGamas || '-') : ticket.incNumbers.join(', ')}
              </motion.span>
              <StatusBadge status={displayStatus} />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {ticket.lokasiText}
            </h1>
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="rounded-full px-3">
                {ticket.kategori}
              </Badge>
            </div>
          </div>
        </motion.div>

        {!isGuest && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            {!isAdmin && (
              <>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="sm" 
                    className="gap-2 rounded-xl shadow-lg shadow-primary/20" 
                    onClick={() => navigate(`/ticket/${id}/update`)}
                  >
                    <FileText className="w-4 h-4" />
                    <span className='hidden sm:inline'>Update Tiket</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="sm" 
                    className="gap-2 rounded-xl shadow-lg shadow-primary/20" 
                    onClick={() => navigate(`/ticket/${id}/edit-data`)}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className='hidden sm:inline'>Edit Tiket</span>
                  </Button>
                </motion.div>
              </>
            )}

            {!isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="destructive" size="sm" className="gap-2 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Hapus Tiket</span>
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Tiket <strong>{isMTC ? (ticket.incGamas || '-') : ticket?.incNumbers?.[0]}</strong> akan dihapus secara permanen dari database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                    >
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="whatsapp" size="sm" className="gap-2 rounded-xl">
                    <Copy className="w-4 h-4" />
                    <span className='hidden sm:inline'>Copy Pesan WA</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => handleCopyShareMessage('latest')} className="cursor-pointer">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    Update Terbaru
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyShareMessage('all')} className="cursor-pointer">
                    <FileStack className="w-4 h-4 mr-2 text-muted-foreground" />
                    Semua Progress
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div variants={containerVariants} className="lg:col-span-1 space-y-4">
            <motion.div variants={cardVariants}>
              <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Status TTR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TTRCountdown targetDate={ticket.maxJamClose} status={ticket.status} />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Jam Open</p>
                      <p className="font-mono text-xs font-medium">{formatDateWIB(ticket.jamOpen)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Max Close</p>
                      <p className="font-mono text-xs font-medium">{formatDateWIB(ticket.maxJamClose)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="text-sm text-muted-foreground">Target TTR</span>
                    <span className="font-bold text-primary">{formatTTR(ticket.ttrTargetHours)}</span>
                  </div>

                  {ticket.status === 'CLOSED' && ticket.ttrRealHours !== undefined && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border-blue-500/10">
                      <span className="text-sm text-muted-foreground">Real TTR</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatTTR(ticket.ttrRealHours)}
                      </span>
                    </div>
                  )}

                  {ticket.status === 'CLOSED' && ticket.ttrRealHours !== undefined && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <span className="text-sm text-muted-foreground">Sisa TTR</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {finalSisaTtr > 0 ? '+' : ''}{formatTTR(finalSisaTtr)}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status Compliance</span>
                      <ComplianceBadge compliance={currentCompliance} />
                    </div>
                    
                    {ticket.ttrCompliance === 'NOT COMPLY' && (
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 mt-3">
                        <p className="text-xs text-destructive font-semibold mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Penyebab Not Comply
                        </p>
                        <p className="text-sm font-medium text-destructive">
                          {ticket.penyebabNotComply || '-'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {isMTC ? (
              <motion.div variants={containerVariants} className="lg:col-span-1 space-y-4">
                <motion.div variants={cardVariants}>
                  <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                    <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/10 to-transparent">
                      <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <FileStack className="w-4 h-4" />
                        Informasi Teknis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground tracking-wider">Mitra</p>
                        </div>
                        
                        {ticket.teknisiList && ticket.teknisiList.length > 0 ? (
                          <div className="space-y-2">
                            {ticket.teknisiList.map((name, i) => {
                              const teknisiData = allTeknisi.find(t => t.name === name);
                              const phoneNumber = teknisiData?.phone;

                              return (
                                <div key={i} className="flex items-center justify-between gap-2 border-b border-border/50 last:border-0 pb-1 last:pb-0">
                                  <span className="text-sm font-medium break-words">{name}</span>
                                  {phoneNumber && (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                        onClick={() => handleWhatsApp(phoneNumber)}
                                        title="Chat WhatsApp"
                                      >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                        onClick={() => handleCall(phoneNumber)}
                                        title="Panggilan Telepon"
                                      >
                                        <Phone className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm font-medium">Belum Assigned</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MTCDetailRow label="HSA" value={ticket.hsa} icon={MapPin} />
                        <MTCDetailRow label="STO" value={ticket.sto} icon={Building2} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MTCDetailRow label="ODC" value={ticket.odc} icon={Database} />
                        <MTCDetailRow label="Gangguan" value={ticket.kendala} icon={AlertTriangle} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MTCDetailRow label="Stake Holder" value={ticket.stakeHolder} icon={Flag} />
                        <MTCDetailRow label="Pelanggan" value={ticket.provider} icon={Building2} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <MTCDetailRow label="KJD" value={ticket.kjd} icon={ShieldCheck} />
                        <MTCDetailRow label="Gamas" value={ticket.incGamas} icon={Activity} />
                      </div>
                      <MTCDetailRow label="Datek" value={ticket.datek} icon={Database} />
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ) : (
              <>
                <motion.div variants={cardVariants}>
                  <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                    <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileStack className="w-4 h-4" />
                        Informasi Teknis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Flag className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Stake Holder</p>
                          </div>
                          <p className="text-sm font-medium">{ticket.stakeHolder || '-'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Pelanggan</p>
                          </div>
                          <p className="text-sm font-medium">{ticket.provider || '-'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">KJD</p>
                          </div>
                          <p className="font-mono text-xs font-medium truncate" title={ticket.kjd}>
                            {ticket.kjd || '-'}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Gamas</p>
                          </div>
                          <p className="font-mono text-xs font-medium truncate" title={ticket.incGamas}>
                            {ticket.incGamas || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckSquare className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">TACC</p>
                        </div>
                        <p className="text-sm font-medium">{ticket.tacc || '-'}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wrench className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Sifat Perbaikan</span>
                        </div>
                        {ticket.isPermanent === null ? (
                            <Badge variant="outline" className="bg-background/50">
                              -
                            </Badge>
                        ) : (
                            <Badge 
                              variant={ticket.isPermanent ? "default" : "secondary"}
                              className={`${ticket.isPermanent ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600 text-white'}`}
                            >
                              {ticket.isPermanent ? 'PERMANEN' : 'TEMPORARY'}
                            </Badge>
                        )}
                      </div>

                      {ticket.rawTicketText && (
                        <div className="p-3 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-2">Summary</p>
                          <div className="text-xs font-mono bg-background/50 p-2 rounded-lg border border-border/50 break-words whitespace-pre-wrap max-h-[100px] overflow-y-auto custom-scrollbar">
                            {ticket.rawTicketText}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                    <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Detail Pelanggan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">ID Site</p>
                          </div>
                          <p className="font-mono text-sm font-medium">{ticket.idPelanggan || '-'}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Nama Site</p>
                          </div>
                          <p className="text-sm font-medium">{ticket.namaPelanggan || '-'}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Database className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Datek</p>
                        </div>
                        <p className="text-sm font-medium">{ticket.datek || '-'}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Signal className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">LOS/Non-LOS</p>
                          </div>
                          <p className="text-sm font-medium">{ticket.losNonLos || '-'}</p>
                        </div>
                        
                        <div className="p-3 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Site Impact</p>
                          </div>
                          <p className="text-sm font-medium">{ticket.siteImpact || '-'}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TowerControl className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Class Site</span>
                        </div>
                        <Badge variant="outline" className="bg-background/50">
                          {ticket.classSite || '-'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                    <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Lokasi & Tipus
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm">{ticket.hsa} - {ticket.lokasiText}</p>
                      
                      {ticket.latitude && ticket.longitude && (
                        <>
                          <p className="text-xs font-mono text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                            {ticket.latitude}, {ticket.longitude}
                          </p>
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-2 rounded-xl group"
                              asChild
                            >
                              <a 
                                href={generateGoogleMapsLink(ticket.latitude, ticket.longitude)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <Navigation className="w-4 h-4 group-hover:text-primary transition-colors" />
                                Buka di Google Maps
                                <ChevronRight className="w-4 h-4 ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
                              </a>
                            </Button>
                          </motion.div>
                        </>
                      )}
                      
                      {ticket.jarakKmRange && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                          <span className="text-sm text-muted-foreground">Jarak</span>
                          <span className="font-medium">{ticket.jarakKmRange}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                  <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                    <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Unit & Teknisi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">Unit</p>
                        </div>
                        <p className="text-sm font-medium">{ticket.tim || '-'}</p>
                      </div>
                      
                      {ticket.teknisiList && ticket.teknisiList.length > 0 ? (
                        <div className="space-y-2">
                          {ticket.teknisiList.map((name, i) => {
                            const teknisiData = allTeknisi.find(t => t.name === name);
                            const phoneNumber = teknisiData?.phone;

                            return (
                              <motion.div 
                                key={i} 
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 group"
                                whileHover={{ scale: 1.01, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                              >
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-primary" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate max-w-[110px] sm:max-w-[150px]" title={name}>
                                      {name}
                                    </p>
                                    {phoneNumber && (
                                      <p className="text-[10px] text-muted-foreground">{phoneNumber}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {phoneNumber && (
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                        onClick={() => handleWhatsApp(phoneNumber)}
                                        title="Chat WhatsApp"
                                      >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                      </Button>
                                    </motion.div>
                                  )}

                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className={`h-8 w-8 rounded-full ${phoneNumber ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30' : 'opacity-30 cursor-not-allowed'}`}
                                      onClick={() => phoneNumber && handleCall(phoneNumber)}
                                      disabled={!phoneNumber}
                                      title="Panggilan Telepon"
                                    >
                                      <Phone className="w-4 h-4" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                            <User className="w-6 h-6 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm text-muted-foreground">Belum ada teknisi</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.div variants={containerVariants} className="lg:col-span-2 space-y-4">
            {!isGuest && !isAdmin && (
              <motion.div variants={cardVariants}>
                <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Tambah Update
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v as TicketStatus)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Status baru"/>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ONPROGRESS">On Progress</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="WAITING_MATERIAL">Menunggu Material</SelectItem>
                        <SelectItem value="WAITING_ACCESS">Menunggu Akses</SelectItem>
                        <SelectItem value="WAITING_COORDINATION">Menunggu Koordinasi</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Textarea
                      placeholder="Tulis update progress..."
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      className="min-h-[120px] resize-none rounded-xl"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <motion.div 
                        whileHover={{ scale: addProgressUpdate.isPending ? 1 : 1.02 }} 
                        whileTap={{ scale: addProgressUpdate.isPending ? 1 : 0.98 }}
                      >
                        <Button 
                          size="sm" 
                          onClick={handleSubmitUpdate} 
                          disabled={addProgressUpdate.isPending}
                          className="rounded-xl shadow-lg shadow-primary/20"
                        >
                          {addProgressUpdate.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Mengirim...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              <span className='hidden sm:inline'>Kirim Update</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div variants={cardVariants}>
              <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline Progress
                    {ticket.progressUpdates.length > 0 && (
                      <Badge variant="secondary" className="rounded-full ml-2">
                        {ticket.progressUpdates.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 custom-scrollbar">
                    <Timeline updates={enrichedUpdates} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {(dbTicket.timeline_dispatch || dbTicket.timeline_prepare || dbTicket.timeline_otw || dbTicket.timeline_identifikasi || dbTicket.timeline_break || dbTicket.timeline_splicing) && (
              <motion.div variants={cardVariants}>
                <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                  <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      Timeline Penanganan (MBB)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Dispatch', value: dbTicket.timeline_dispatch },
                        { label: 'Prepare', value: dbTicket.timeline_prepare },
                        { label: 'OTW', value: dbTicket.timeline_otw },
                        { label: 'Identifikasi', value: dbTicket.timeline_identifikasi },
                        { label: 'Break', value: dbTicket.timeline_break },
                        { label: 'Progress', value: dbTicket.timeline_splicing },
                      ].map((item, index) => (
                        <div key={index} className="p-3 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                          <p className="font-mono text-sm font-medium">
                            {item.value || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {(ticket.segmen || ticket.penyebab || ticket.perbaikan || (ticket.latitude && ticket.longitude) || ticket.kendala || ticket.statusAlatBerat || ticket.atbt || ticket.tiketEksternal) && (
              <motion.div variants={cardVariants}>
                <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                  <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Detail Tambahan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-4 sm:grid-cols-2 gap-3">
                    {ticket.segmen && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Segmen</p>
                        <p className="text-sm font-medium">{ticket.segmen}</p>
                      </div>
                    )}
                    {ticket.penyebab && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Penyebab</p>
                        <p className="text-sm font-medium">{ticket.penyebab}</p>
                      </div>
                    )}
                    {ticket.perbaikan && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Perbaikan</p>
                        <p className="text-sm font-medium">{ticket.perbaikan}</p>
                      </div>
                    )}
                    {(ticket.latitude && ticket.longitude)  && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Koordinat Tipus</p>
                        <p className="text-sm font-medium">{ticket.latitude}, {ticket.longitude}</p>
                      </div>
                    )}
                    {ticket.kendala  && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Kendala</p>
                        <p className="text-sm font-medium">{ticket.kendala}</p>
                      </div>
                    )}
                    {ticket.statusAlatBerat  && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Status Alat Berat</p>
                        <p className="text-sm font-medium">{ticket.statusAlatBerat}</p>
                      </div>
                    )}
                    {ticket.atbt  && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">ATBT</p>
                        <p className="text-sm font-medium">{ticket.atbt}</p>
                      </div>
                    )}
                    {ticket.tiketEksternal  && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Tiket Eksternal</p>
                        <p className="text-sm font-medium">{ticket.tiketEksternal}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default TicketDetail;
