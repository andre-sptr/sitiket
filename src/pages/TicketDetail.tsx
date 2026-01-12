import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { StatusBadge, ComplianceBadge, TTRBadge } from '@/components/StatusBadge';
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
import { useTicket, useDeleteTicket, useAddProgressUpdate } from '@/hooks/useTickets';
import { mapDbTicketToTicket } from '@/lib/ticketMappers';
import { formatDateWIB, generateWhatsAppMessage, generateGoogleMapsLink, getStatusLabel } from '@/lib/formatters';
import { TicketStatus } from '@/types/ticket';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Copy, 
  ExternalLink,
  FileText,
  Send,
  Phone,
  Trash2
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

const TTRCountdown = ({ targetDate, status }: { targetDate: Date | string, status: string }) => {
  const [timeState, setTimeState] = useState({ display: '-', isOverdue: false, isClosed: false });

  useEffect(() => {
    if (status === 'CLOSED') {
      setTimeState({ display: "TIKET CLOSED", isOverdue: false, isClosed: true });
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

      setTimeState({ 
        display: timeString, 
        isOverdue: isLate, 
        isClosed: false 
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000); 

    return () => clearInterval(interval);
  }, [targetDate, status]);

  let badgeVariant: "default" | "secondary" | "destructive" | "outline" | "success" | "critical" = "success";
  
  if (timeState.isClosed) {
    badgeVariant = "secondary";
  } else if (timeState.isOverdue) {
    badgeVariant = "critical";
  }

  return (
    <Badge 
      variant={badgeVariant}
      className={`font-mono gap-1.5 font-medium ${timeState.isOverdue && !timeState.isClosed ? 'animate-pulse' : ''}`}
    >
      <Clock className="w-3 h-3" />
      {timeState.isClosed ? (
        <span>{timeState.display}</span>
      ) : timeState.isOverdue ? (
        <span>+{timeState.display} <span className="ml-0.5 font-bold">OVERDUE</span></span>
      ) : (
        <span>{timeState.display}</span>
      )}
    </Badge>
  );
};

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const deleteTicket = useDeleteTicket();
  const { data: dbTicket, isLoading } = useTicket(id || '');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState<TicketStatus | ''>('');
  const addProgressUpdate = useAddProgressUpdate();
  const isGuest = user?.role === 'guest';
  const ticket = dbTicket ? mapDbTicketToTicket(dbTicket) : null;

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
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tiket tidak ditemukan</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            Kembali
          </Button>
        </div>
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

  const handleCopyShareMessage = () => {
    const message = generateWhatsAppMessage('share', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Pesan WhatsApp Disalin",
      description: "Pesan share tiket sudah disalin ke clipboard",
    });
  };

  const handleCopyUpdateTemplate = () => {
    const message = generateWhatsAppMessage('update', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Template Update Disalin",
      description: "Template update progress sudah disalin ke clipboard",
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
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-muted-foreground">
                {ticket.incNumbers.join(', ')}
              </span>
              <StatusBadge status={ticket.status} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold mt-1">
              {ticket.siteCode} - {ticket.siteName}
            </h1>
            <Badge variant="outline" className="mt-2">
              {ticket.kategori}
            </Badge>
          </div>
        </div>

        {!isGuest && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-2" onClick={() => navigate(`/ticket/${id}/update`)}>
              <FileText className="w-4 h-4" />
              Update Tiket
            </Button>
            {user?.role !== 'guest' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Hapus Tiket</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Tiket <strong>{ticket?.incNumbers?.[0]}</strong> akan dihapus secara permanen dari database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="whatsapp" size="sm" className="gap-2" onClick={handleCopyShareMessage}>
              <Copy className="w-4 h-4" />
              Copy Pesan WA
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyUpdateTemplate}>
              <FileText className="w-4 h-4" />
              Template Update
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Status TTR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sisa Waktu</span>
                  <TTRCountdown targetDate={ticket.maxJamClose} status={ticket.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance</span>
                  <ComplianceBadge compliance={ticket.ttrCompliance} />
                </div>
                <div className="pt-2 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jam Open</span>
                    <span className="font-mono text-xs">{formatDateWIB(ticket.jamOpen)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Close</span>
                    <span className="font-mono text-xs">{formatDateWIB(ticket.maxJamClose)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target TTR</span>
                    <span>{ticket.ttrTargetHours} jam</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Lokasi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{ticket.lokasiText}</p>
                {ticket.latitude && ticket.longitude && (
                  <>
                    <p className="text-xs font-mono text-muted-foreground">
                      {ticket.latitude}, {ticket.longitude}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2"
                      asChild
                    >
                      <a 
                        href={generateGoogleMapsLink(ticket.latitude, ticket.longitude)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Buka di Google Maps
                      </a>
                    </Button>
                  </>
                )}
                {ticket.jarakKmRange && (
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Jarak</span>
                      <span>{ticket.jarakKmRange}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Teknisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ticket.teknisiList && ticket.teknisiList.length > 0 ? (
                  <div className="space-y-2">
                    {ticket.teknisiList.map((name, i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <span className="text-sm">{name}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada teknisi</p>
                )}
              </CardContent>
            </Card>

            {(ticket.penyebab || ticket.segmen || ticket.networkElement) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Detail Tambahan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {ticket.penyebab && (
                    <div>
                      <span className="text-muted-foreground">Penyebab: </span>
                      <span>{ticket.penyebab}</span>
                    </div>
                  )}
                  {ticket.segmen && (
                    <div>
                      <span className="text-muted-foreground">Segmen: </span>
                      <span>{ticket.segmen}</span>
                    </div>
                  )}
                  {ticket.networkElement && (
                    <div className="break-all">
                      <span className="text-muted-foreground">Network Element: </span>
                      <span className="font-mono text-xs">{ticket.networkElement}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {!isGuest && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tambah Update</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v as TicketStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status baru (opsional)" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[190px]">
                      <SelectItem value="ONPROGRESS">On Progress</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="TEMPORARY">Temporary</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="WAITING_MATERIAL">Menunggu Material</SelectItem>
                      <SelectItem value="WAITING_ACCESS">Menunggu Akses</SelectItem>
                      <SelectItem value="WAITING_COORDINATION">Menunggu Koordinasi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Tulis update progress..."
                    value={updateMessage}
                    onChange={(e) => setUpdateMessage(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyUpdateTemplate}>
                      <FileText className="w-4 h-4 mr-2" />
                      Pakai Template
                    </Button>
                    <Button size="sm" onClick={handleSubmitUpdate}>
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline updates={ticket.progressUpdates} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TicketDetail;
