import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { UpdateFormSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ComboboxField } from '@/components/ComboboxField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  ArrowLeft, 
  Save, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  ShieldX, 
  Phone,
  Users,
  MapPin,
  Timer,
  FileWarning,
  Loader2,
  Ticket as TicketIcon,
  ChevronsUpDown,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTicket, useUpdateTicket, useAddProgressUpdate } from '@/hooks/useTickets';
import { TTRBadge } from '@/components/StatusBadge';
import { formatDateWIB } from '@/lib/formatters';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useAuth } from '@/contexts/AuthContext';
import { useTeknisi, Teknisi } from '@/hooks/useTeknisi';
import { TicketStatus, TTRCompliance } from '@/types/ticket';
import SEO from '@/components/SEO';
import { cn } from "@/lib/utils";

interface UpdateFormData {
  statusTiket: string;
  closedDate: string;
  ttrSisa: string;
  compliance: string;
  penyebabNotComply: string;
  segmenTerganggu: string;
  penyebabGangguan: string;
  perbaikanGangguan: string;
  statusAlatBerat: string;
  progressSaatIni: string;
  teknisi1: string;
  teknisi2: string;
  teknisi3: string;
  teknisi4: string;
  permanenTemporer: string;
  koordinatTipus: string;
  dispatchMbb: string;
  prepareTim: string;
  otwKeLokasi: string;
  identifikasi: string;
  breakTime: string;
  splicing: string;
  closing: string;
  totalTtr: string;
  kendala: string;
  atbt: string;
  tiketEksternal: string;
}

type FormErrors = Partial<Record<keyof UpdateFormData, string>>;

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}

const InputField = ({ 
  label, 
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder = "",
  type = "text",
  disabled = false,
  icon: Icon
}: InputFieldProps) => {
  return (
    <motion.div 
      className="space-y-2"
      whileTap={{ scale: 0.995 }}
    >
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`h-10 bg-muted/30 border-border/50 transition-all duration-200 
          hover:border-primary/30 hover:bg-muted/50
          focus:ring-2 focus:ring-primary/20 focus:border-primary/50
          ${error ? 'border-destructive ring-1 ring-destructive/20' : ''}`}
        disabled={disabled}
      />
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  error?: string;
  required?: boolean;
  options: string[];
  placeholder?: string;
  icon?: React.ElementType;
  disabled?: boolean;
}

const SelectField = ({ 
  label, 
  value, 
  onValueChange,
  error,
  required = false,
  options,
  placeholder = "Pilih...",
  icon: Icon,
  disabled = false
}: SelectFieldProps) => {
  return (
    <motion.div 
      className="space-y-2"
      whileTap={disabled ? undefined : { scale: 0.995 }}
    >
      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select 
        disabled={disabled}
        value={value} 
        onValueChange={onValueChange}
      >
        <SelectTrigger 
          className={`h-10 bg-muted/30 border-border/50 transition-all duration-200 
            hover:border-primary/30 hover:bg-muted/50
            focus:ring-2 focus:ring-primary/20 focus:border-primary/50
            ${error ? 'border-destructive ring-1 ring-destructive/20' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/60 shadow-xl z-50">
          {options.map(opt => (
            <SelectItem 
              key={opt} 
              value={opt}
              className="focus:bg-primary/10 cursor-pointer transition-colors"
            >
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TeknisiCombobox = ({ 
  label, 
  value, 
  onChange, 
  options, 
  activeTeknisi 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  options: Teknisi[];
  activeTeknisi: Teknisi[];
}) => {
  const [open, setOpen] = useState(false);
  const selectedTeknisi = activeTeknisi.find((t) => t.name === value);

  return (
    <motion.div 
      className="space-y-2"
      whileHover={{ scale: 1.01 }}
    >
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 px-3 font-normal bg-muted/30 border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 text-left"
          >
            {value ? value : "Pilih Teknisi..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover/95 backdrop-blur-xl border-border/60 shadow-xl z-50" align="start">
          <Command>
            <CommandInput placeholder="Cari Teknisi..." className="h-10" />
            <CommandList>
              <CommandEmpty>Teknisi tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {options.map((teknisi) => (
                  <CommandItem
                    key={teknisi.id}
                    value={`${teknisi.name} ${teknisi.area}`}
                    onSelect={() => {
                      onChange(teknisi.name);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 transition-opacity",
                        value === teknisi.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{teknisi.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {teknisi.area}
                        {teknisi.jobdesk && ` (${teknisi.jobdesk})`}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <AnimatePresence>
        {selectedTeknisi && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-xs text-muted-foreground px-1"
          >
            <Phone className="w-3 h-3" />
            {selectedTeknisi.phone || '-'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const emptyForm: UpdateFormData = {
  statusTiket: '',
  closedDate: '',
  ttrSisa: '',
  compliance: '',
  penyebabNotComply: '',
  segmenTerganggu: '',
  penyebabGangguan: '',
  perbaikanGangguan: '',
  statusAlatBerat: '',
  progressSaatIni: '',
  teknisi1: '',
  teknisi2: '',
  teknisi3: '',
  teknisi4: '',
  permanenTemporer: '',
  koordinatTipus: '',
  dispatchMbb: '',
  prepareTim: '',
  otwKeLokasi: '',
  identifikasi: '',
  breakTime: '',
  splicing: '',
  closing: '',
  totalTtr: '',
  kendala: '',
  atbt: '',
  tiketEksternal: '',
};

const REQUIRED_FIELDS: { field: keyof UpdateFormData; label: string }[] = [];

const getConditionalRequiredFields = (formData: UpdateFormData): { field: keyof UpdateFormData; label: string }[] => {
  return [];
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

const TimeInputField = ({ 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  required = false 
}: InputFieldProps) => {
  const handleTimeChange = (val: string) => {
    let cleanVal = val.replace(/[^0-9]/g, '');

    if (cleanVal.length > 4) cleanVal = cleanVal.slice(0, 4);
    
    if (cleanVal.length > 2) {
      cleanVal = `${cleanVal.slice(0, 2)}:${cleanVal.slice(2)}`;
    }
    
    onChange(cleanVal);
  };

  const setNow = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }).replace('.', ':');
    onChange(timeString);
  };

  return (
    <motion.div 
      className="space-y-2"
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <button
          type="button"
          onClick={setNow}
          className="text-[10px] h-5 px-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium flex items-center gap-1 cursor-pointer"
          title="Set Waktu Sekarang"
        >
          <Clock className="w-3 h-3" />
          Now
        </button>
      </div>
      <Input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => handleTimeChange(e.target.value)}
        onBlur={onBlur}
        placeholder="HH:MM"
        maxLength={5}
        className={`h-10 bg-muted/30 border-border/50 transition-all duration-200 
          hover:border-primary/30 hover:bg-muted/50
          focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-center font-mono tracking-wider
          ${error ? 'border-destructive ring-1 ring-destructive/20' : ''}`}
      />
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-destructive flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const UpdateTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { options: DROPDOWN_OPTIONS } = useDropdownOptions();
  const { activeTeknisi } = useTeknisi();
  const { data: ticket, isLoading: isTicketLoading } = useTicket(id || '');
  const updateTicketMutation = useUpdateTicket();
  const addProgressMutation = useAddProgressUpdate();
  const [formData, setFormData] = useState<UpdateFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof UpdateFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  const sortedTeknisi = useMemo(() => {
    return [...activeTeknisi].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeTeknisi]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (ticket) {
      setFormData(prev => ({
        ...prev,
        statusTiket: ticket.status || '',
        compliance: ticket.ttr_compliance || '', 
        penyebabNotComply: ticket.penyebab_not_comply || '',
        ttrSisa: ticket.sisa_ttr_hours?.toString() || '',
        penyebabGangguan: ticket.penyebab || '',
        segmenTerganggu: ticket.segmen || '',
        perbaikanGangguan: ticket.perbaikan || '',
        statusAlatBerat: ticket.status_alat_berat || '',
        dispatchMbb: ticket.timeline_dispatch || '',
        prepareTim: ticket.timeline_prepare || '',
        otwKeLokasi: ticket.timeline_otw || '',
        identifikasi: ticket.timeline_identifikasi || '',
        breakTime: ticket.timeline_break || '',
        splicing: ticket.timeline_splicing || '',
        kendala: ticket.kendala || '',
        atbt: ticket.atbt || '',
        tiketEksternal: ticket.tiket_eksternal || '',
        koordinatTipus: (ticket.latitude && ticket.longitude) 
          ? `${ticket.latitude}, ${ticket.longitude}` 
          : '',
        permanenTemporer: ticket.is_permanent === null 
          ? '' 
          : (ticket.is_permanent ? 'PERMANEN' : 'TEMPORARY'),
        teknisi1: ticket.teknisi_list?.[0] || '',
        teknisi2: ticket.teknisi_list?.[1] || '',
        teknisi3: ticket.teknisi_list?.[2] || '',
        teknisi4: ticket.teknisi_list?.[3] || '',
      }));
      setIsDataReady(true);
    }
  }, [ticket]);

  useEffect(() => {
    if (formData.statusTiket === 'TEMPORARY') {
      setFormData(prev => ({
        ...prev,
        permanenTemporer: 'TEMPORARY'
      }));
    }
  }, [formData.statusTiket]);

  useEffect(() => {
    if (!ticket?.max_jam_close) return;

    const checkCompliance = () => {
      const now = new Date();
      const maxClose = new Date(ticket.max_jam_close);
      const isOverdue = now > maxClose;
      const realtimeStatus = isOverdue ? 'NOT COMPLY' : 'COMPLY';

      setFormData(prev => {
        if (prev.compliance !== realtimeStatus) {
          return {
            ...prev,
            compliance: realtimeStatus,
            penyebabNotComply: realtimeStatus === 'COMPLY' ? '' : prev.penyebabNotComply
          };
        }
        return prev;
      });
    };

    checkCompliance();

    const interval = setInterval(checkCompliance, 10000);

    return () => clearInterval(interval);
  }, [ticket?.max_jam_close]);

  const sortedSegmen = [...DROPDOWN_OPTIONS.segmen].sort((a, b) => a.localeCompare(b));
  const sortedPenyebab = [...DROPDOWN_OPTIONS.penyebabGangguan].sort((a, b) => a.localeCompare(b));
  const sortedPerbaikan = [...DROPDOWN_OPTIONS.perbaikanGangguan].sort((a, b) => a.localeCompare(b));

  const updateField = (field: keyof UpdateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const markTouched = (field: keyof UpdateFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const isFieldRequired = (field: keyof UpdateFormData): boolean => {
    const allRequiredFields = [...REQUIRED_FIELDS, ...getConditionalRequiredFields(formData)];
    return allRequiredFields.some(f => f.field === field);
  };

  const getFieldError = (field: keyof UpdateFormData): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const allRequiredFields = [...REQUIRED_FIELDS, ...getConditionalRequiredFields(formData)];
    
    allRequiredFields.forEach(({ field, label }) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${label} wajib diisi`;
      }
    });

    if (formData.closedDate && !/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(formData.closedDate)) {
      newErrors.closedDate = 'Format harus DD/MM/YYYY HH:MM';
    }

    setErrors(newErrors);
    
    const touchedFields: Partial<Record<keyof UpdateFormData, boolean>> = {};
    allRequiredFields.forEach(({ field }) => {
      touchedFields[field] = true;
    });
    setTouched(prev => ({ ...prev, ...touchedFields }));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validasi Gagal",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const teknisiList = [formData.teknisi1, formData.teknisi2, formData.teknisi3, formData.teknisi4]
        .filter(t => t && t.trim() !== '');

      let lat = null;
      let lon = null;
      if (formData.koordinatTipus) {
        const parts = formData.koordinatTipus.split(',').map(s => s.trim());
        if (parts.length === 2) {
          lat = parseFloat(parts[0]);
          lon = parseFloat(parts[1]);
        }
      }

      const updates = {
        status: formData.statusTiket as TicketStatus,
        ttr_compliance: formData.compliance as TTRCompliance,
        penyebab_not_comply: formData.penyebabNotComply,
        sisa_ttr_hours: parseFloat(formData.ttrSisa) || 0,
        penyebab: formData.penyebabGangguan,
        perbaikan: formData.perbaikanGangguan,
        timeline_dispatch: formData.dispatchMbb,
        timeline_prepare: formData.prepareTim,
        timeline_otw: formData.otwKeLokasi,
        timeline_identifikasi: formData.identifikasi,
        timeline_break: formData.breakTime,
        timeline_splicing: formData.splicing,
        kendala: formData.kendala,
        atbt: formData.atbt,
        tiket_eksternal: formData.tiketEksternal,
        latitude: lat,
        longitude: lon,
        status_alat_berat: formData.statusAlatBerat,
        segmen: formData.segmenTerganggu,
        is_permanent: formData.permanenTemporer === 'PERMANEN' 
          ? true 
          : (formData.permanenTemporer === 'TEMPORARY' ? false : null),
        teknisi_list: teknisiList.length > 0 ? teknisiList : null,
      };

      await updateTicketMutation.mutateAsync({ 
        id: id!, 
        updates: updates 
      });

      if (formData.progressSaatIni && formData.progressSaatIni.trim() !== '') {
        await addProgressMutation.mutateAsync({
          ticket_id: id!,
          message: formData.progressSaatIni,
          source: 'web',
          status_after_update: formData.statusTiket as TicketStatus,
        });
      }

      toast({
        title: "Update Berhasil",
        description: `Tiket berhasil diupdate`,
      });
      
      navigate(`/ticket/${id}`);

    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Gagal Update",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role === 'guest') {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6"
          >
            <ShieldX className="w-10 h-10 text-destructive" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Anda tidak dapat mengakses halaman ini.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="btn-ripple">
            Kembali ke Dashboard
          </Button>
        </motion.div>
      </Layout>
    );
  }

  if (isTicketLoading || !isDataReady) {
    return (
      <Layout>
        <UpdateFormSkeleton />
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileWarning className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Tiket tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="hover-lift">
            Kembali
          </Button>
        </motion.div>
      </Layout>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Layout>
      {ticket && (
        <SEO 
          title={`Update ${Array.isArray(ticket.inc_numbers) ? ticket.inc_numbers[0] : ticket.inc_numbers || 'Tiket'}`} 
          description={`Halaman update untuk tiket ${ticket.site_name}`}
        />
      )} 
      <motion.div 
        className="space-y-6 max-w-5xl mx-auto pb-8"
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
              className="h-10 w-10 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <div className="flex-1">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <TicketIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              Update Tiket
            </motion.h1>
            <p className="hidden sm:inline-flex text-muted-foreground text-sm mt-1.5">
              Update progress tiket dengan informasi terbaru
            </p>
          </div>
        </motion.div>

        
        <motion.div variants={cardVariants}>
          <Card className="glass-card border-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardContent className="pt-5 pb-5 relative">
              <div className="flex flex-wrap items-center gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="group">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{ticket.tim === 'MTC' ? 'Gamas' : 'No. Tiket'}</p>
                  <p className="font-medium">
                    {ticket.tim === 'MTC' 
                      ? (ticket.inc_gamas || '-') 
                      : (Array.isArray(ticket.inc_numbers) ? ticket.inc_numbers.join(', ') : ticket.inc_numbers)
                    }
                  </p>
                </motion.div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">{ticket.tim === 'MTC' ? 'Datek' : 'Site'}</p>
                  <p className="font-medium">{ticket.tim === 'MTC' 
                    ? (ticket.datek || '-') 
                    : `${ticket.site_code} - ${ticket.site_name}`
                  }</p>
                </div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Severity</p>
                  <p className="font-medium">{ticket.kategori}</p>
                </div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Jam Open</p>
                  <p className="font-mono text-sm">{formatDateWIB(new Date(ticket.jam_open))}</p>
                </div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">TTR Sisa</p>
                  <TTRBadge targetDate={ticket.max_jam_close} status={ticket.status as TicketStatus} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        
        <AnimatePresence>
          {hasErrors && Object.keys(touched).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
            >
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3 text-destructive">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Mohon lengkapi field berikut:</p>
                      <ul className="text-xs mt-1.5 space-y-0.5">
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-destructive" />
                            {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        
        <motion.div className="grid gap-5" variants={containerVariants}>
          
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Timer className="w-4 h-4 text-indigo-500" />
                  </div>
                  Timeline Penanganan (MBB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <TimeInputField 
                    label="Dispatch" 
                    value={formData.dispatchMbb}
                    onChange={(v) => updateField('dispatchMbb', v)}
                    onBlur={() => markTouched('dispatchMbb')}
                    error={getFieldError('dispatchMbb')}
                    required={isFieldRequired('dispatchMbb')}
                  />
                  <TimeInputField 
                    label="Prepare" 
                    value={formData.prepareTim}
                    onChange={(v) => updateField('prepareTim', v)}
                    onBlur={() => markTouched('prepareTim')}
                    error={getFieldError('prepareTim')}
                    required={isFieldRequired('prepareTim')}
                  />
                  <TimeInputField 
                    label="OTW" 
                    value={formData.otwKeLokasi}
                    onChange={(v) => updateField('otwKeLokasi', v)}
                    onBlur={() => markTouched('otwKeLokasi')}
                    error={getFieldError('otwKeLokasi')}
                    required={isFieldRequired('otwKeLokasi')}
                  />
                  <TimeInputField 
                    label="Identifikasi" 
                    value={formData.identifikasi}
                    onChange={(v) => updateField('identifikasi', v)}
                    onBlur={() => markTouched('identifikasi')}
                    error={getFieldError('identifikasi')}
                    required={isFieldRequired('identifikasi')}
                  />
                  <TimeInputField 
                    label="Break" 
                    value={formData.breakTime}
                    onChange={(v) => updateField('breakTime', v)}
                    onBlur={() => markTouched('breakTime')}
                    error={getFieldError('breakTime')}
                    required={isFieldRequired('breakTime')}
                  />
                  <TimeInputField 
                    label="Progress" 
                    value={formData.splicing}
                    onChange={(v) => updateField('splicing', v)}
                    onBlur={() => markTouched('splicing')}
                    error={getFieldError('splicing')}
                    required={isFieldRequired('splicing')}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  Gangguan & Perbaikan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ComboboxField 
                    label="Segmen Terganggu" 
                    value={formData.segmenTerganggu}
                    onChange={(v) => { updateField('segmenTerganggu', v); markTouched('segmenTerganggu'); }}
                    onBlur={() => markTouched('segmenTerganggu')}
                    error={getFieldError('segmenTerganggu')}
                    required={isFieldRequired('segmenTerganggu')}
                    options={sortedSegmen}
                  />
                  
                  <ComboboxField 
                    label="Penyebab Gangguan" 
                    value={formData.penyebabGangguan}
                    onChange={(v) => { updateField('penyebabGangguan', v); markTouched('penyebabGangguan'); }}
                    onBlur={() => markTouched('penyebabGangguan')}
                    error={getFieldError('penyebabGangguan')}
                    required={isFieldRequired('penyebabGangguan')}
                    options={sortedPenyebab}
                  />
                  
                  <ComboboxField 
                    label="Perbaikan Gangguan" 
                    value={formData.perbaikanGangguan}
                    onChange={(v) => { updateField('perbaikanGangguan', v); markTouched('perbaikanGangguan'); }}
                    onBlur={() => markTouched('perbaikanGangguan')}
                    error={getFieldError('perbaikanGangguan')}
                    required={isFieldRequired('perbaikanGangguan')}
                    options={sortedPerbaikan}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <CheckCircle className="w-4 h-4 text-cyan-500" />
                  </div>
                  Status Perbaikan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField 
                    label="Permanen / Temporer" 
                    value={formData.permanenTemporer}
                    onValueChange={(v) => { updateField('permanenTemporer', v); markTouched('permanenTemporer'); }}
                    error={getFieldError('permanenTemporer')}
                    required={isFieldRequired('permanenTemporer')}
                    options={DROPDOWN_OPTIONS.permanenTemporer} 
                  />
                  <InputField 
                    label="Koordinat Tipus" 
                    value={formData.koordinatTipus}
                    onChange={(v) => updateField('koordinatTipus', v)}
                    onBlur={() => markTouched('koordinatTipus')}
                    error={getFieldError('koordinatTipus')}
                    required={isFieldRequired('koordinatTipus')}
                    placeholder="-0.123456, 101.123456"
                    icon={MapPin}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  Status Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <SelectField 
                    label="Compliance" 
                    value={formData.compliance}
                    onValueChange={(v) => { updateField('compliance', v); markTouched('compliance'); }}
                    error={getFieldError('compliance')}
                    required={isFieldRequired('compliance')}
                    options={DROPDOWN_OPTIONS.compliance}
                    icon={CheckCircle}
                    disabled={true}
                  />
                  <div className={formData.compliance !== 'NOT COMPLY' ? 'opacity-50 pointer-events-none grayscale' : ''}>
                    <InputField 
                      label="Penyebab Not Comply" 
                      value={formData.penyebabNotComply}
                      onChange={(v) => updateField('penyebabNotComply', v)}
                      onBlur={() => markTouched('penyebabNotComply')}
                      error={getFieldError('penyebabNotComply')}
                      required={isFieldRequired('penyebabNotComply')}
                      placeholder="Jika NOT COMPLY"
                      icon={AlertTriangle}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                    <FileWarning className="w-4 h-4 text-rose-500" />
                  </div>
                  Kendala & Informasi Lainnya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <InputField 
                    label="Kendala" 
                    value={formData.kendala}
                    onChange={(v) => updateField('kendala', v)}
                    onBlur={() => markTouched('kendala')}
                    error={getFieldError('kendala')}
                    required={isFieldRequired('kendala')}
                    placeholder="Deskripsikan kendala" 
                  />
                  <InputField 
                    label="ATBT" 
                    value={formData.atbt}
                    onChange={(v) => updateField('atbt', v)}
                    onBlur={() => markTouched('atbt')}
                    error={getFieldError('atbt')}
                    required={isFieldRequired('atbt')}
                    placeholder="Alat Berat yang digunakan" 
                  />
                  <SelectField 
                    label="Status Alat Berat" 
                    value={formData.statusAlatBerat}
                    onValueChange={(v) => { updateField('statusAlatBerat', v); markTouched('statusAlatBerat'); }}
                    error={getFieldError('statusAlatBerat')}
                    required={isFieldRequired('statusAlatBerat')}
                    options={DROPDOWN_OPTIONS.statusAlatBerat} 
                  />
                  <InputField 
                    label="Tiket Eksternal" 
                    value={formData.tiketEksternal}
                    onChange={(v) => updateField('tiketEksternal', v)}
                    onBlur={() => markTouched('tiketEksternal')}
                    error={getFieldError('tiketEksternal')}
                    required={isFieldRequired('tiketEksternal')}
                    placeholder="Tiket dari sistem lain" 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                    <Users className="w-4 h-4 text-violet-500" />
                  </div>
                  Tim Teknisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['teknisi1', 'teknisi2', 'teknisi3', 'teknisi4'] as const).map((field, idx) => (
                    <TeknisiCombobox
                      key={field}
                      label={`Teknisi ${idx + 1}`}
                      value={formData[field]}
                      onChange={(val) => updateField(field, val)}
                      options={sortedTeknisi}
                      activeTeknisi={activeTeknisi}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end gap-3 pt-4"
        >
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="gap-2 icon-hover-spin"
          >
            <span>Batal</span>
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="gap-2 btn-ripple"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-4 h-4" />
                </motion.div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className='hidden sm:inline'>Update Tiket</span>
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default UpdateTicket;
