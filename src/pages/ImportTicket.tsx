import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { FormSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Save, 
  RotateCcw, 
  AlertCircle, 
  ShieldX, 
  Phone, 
  Calendar, 
  Check, 
  ChevronsUpDown, 
  Clock,
  MapPin,
  FileText,
  Users,
  Building2,
  Ticket as TicketIcon,
  Pencil,
  Loader2,
  Info,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropdownOptions, hsaToStoMap } from '@/hooks/useDropdownOptions';
import { useAuth } from '@/contexts/AuthContext';
import { useTeknisi } from '@/hooks/useTeknisi';
import { useCreateTicket, useTicket, useUpdateTicket } from '@/hooks/useTickets';
import { cn } from "@/lib/utils";
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
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { ComboboxField } from '@/components/ComboboxField';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TicketFormData {
  hsa: string;
  sto: string;
  odc: string;
  stakeHolder: string;
  jenisPelanggan: string;
  kategori: string;
  tiket: string;
  tiketTacc: string;
  indukGamas: string;
  kjd: string;
  summary: string;
  idPelanggan: string;
  namaPelanggan: string;
  datek: string;
  losNonLos: string;
  siteImpact: string;
  classSite: string;
  koordinat: string;
  histori6Bulan: string;
  reportDate: string;
  ttrTarget: string;
  teknisi1: string;
  tim: string;
  jenisGangguan: string;
}

type FormErrors = Partial<Record<keyof TicketFormData, string>>;

const emptyForm: TicketFormData = {
  hsa: '',
  sto: '',
  odc: '',
  stakeHolder: 'TLKM',
  jenisPelanggan: 'TSEL',
  kategori: '',
  tiket: '',
  tiketTacc: '',
  indukGamas: '',
  kjd: '',
  summary: '',
  idPelanggan: '',
  namaPelanggan: '',
  datek: '',
  losNonLos: '',
  siteImpact: '',
  classSite: '',
  koordinat: '',
  histori6Bulan: '',
  reportDate: '',
  ttrTarget: '',
  teknisi1: '',
  tim: '',
  jenisGangguan: '',
};

const REQUIRED_FIELDS: { field: keyof TicketFormData; label: string }[] = [
  { field: 'teknisi1', label: 'Teknisi' },
  { field: 'hsa', label: 'HSA' },
  { field: 'sto', label: 'STO' },
  { field: 'odc', label: 'ODC' },
  { field: 'kategori', label: 'Severity' },
  { field: 'tiket', label: 'No. Tiket (INC)' },
  { field: 'jenisGangguan', label: 'Jenis Gangguan' },
  { field: 'reportDate', label: 'Report Date' },
  { field: 'summary', label: 'Summary' },
  { field: 'idPelanggan', label: 'ID Pelanggan / Site' },
  { field: 'namaPelanggan', label: 'Nama Pelanggan / Site' },
  { field: 'datek', label: 'DATEK' },
  { field: 'losNonLos', label: 'LOS / Non LOS' },
];

const DATEK_PATTERNS = [
  { regex: /^GPON[A-Z0-9]{2}-D1-[A-Z0-9]{3}-[A-Z0-9]{1}$/, label: 'GPON: GPONXX-D1-XXX-X' },
  { regex: /^GPON[A-Z0-9]{2}-D1-[A-Z0-9]{3}-[A-Z0-9]{4}$/, label: 'GPON: GPONXX-D1-XXX-XXXX' },
  { regex: /^FE-[A-Z0-9]{3}-[A-Z0-9]{2}$/, label: 'FEEDER: FE-XXX-XX' },
  { regex: /^ODC-[A-Z0-9]{3}-[A-Z0-9]{3}$/, label: 'ODC: ODC-XXX-XXX' },
  { regex: /^ODC-[A-Z0-9]{3}-[A-Z0-9]{3}\/[A-Z0-9]{2}$/, label: 'DISTRIBUSI: ODC-XXX-XXX/XX' },
  { regex: /^ODP-[A-Z0-9]{3}-[A-Z0-9]{3}\/[A-Z0-9]{3}$/, label: 'ODP: ODP-XXX-XXX/XXX' },
  { regex: /^ODP-[A-Z0-9]{3}-[A-Z0-9]{2}\/[A-Z0-9]{3}$/, label: 'ODP: ODP-XXX-XX/XXX' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const
    }
  })
};

const TEAM_CONFIG: Record<string, string[]> = {
  'SQUAT-A': ['teknisi1', 'hsa', 'sto', 'odc', 'stakeHolder', 'jenisPelanggan', 'kategori', 'tiket', 'tiketTacc', 'indukGamas', 'kjd', 'reportDate', 'ttrTarget', 'summary','idPelanggan', 'namaPelanggan', 'datek', 'losNonLos', 'siteImpact', 'classSite' ],
  'SQUAT-B': ['teknisi1', 'hsa', 'sto', 'odc', 'stakeHolder', 'jenisPelanggan', 'kategori', 'tiket', 'tiketTacc', 'indukGamas', 'kjd', 'reportDate', 'ttrTarget', 'summary','idPelanggan', 'namaPelanggan', 'datek', 'losNonLos', 'siteImpact', 'classSite' ],
  'MTC': ['teknisi1', 'hsa', 'sto', 'odc', 'stakeHolder', 'jenisPelanggan', 'kategori', 'jenisGangguan', 'datek', 'indukGamas', 'kjd', 'reportDate', 'ttrTarget' ],
};

const getVisibleFields = (tim: string) => {
  if (TEAM_CONFIG[tim]) {
    return TEAM_CONFIG[tim];
  }
  
  if (tim) {
    return TEAM_CONFIG['SQUAT-A'];
  }

  return []; 
};

const ImportTicket = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { options: DROPDOWN_OPTIONS } = useDropdownOptions();
  const { activeTeknisi } = useTeknisi();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<TicketFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TicketFormData, boolean>>>({});
  const [openTeknisi, setOpenTeknisi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filteredStoOptions = formData.hsa ? hsaToStoMap[formData.hsa] || [] : [];
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const { data: ticketData, isLoading: isLoadingTicket } = useTicket(id || '');

  const sortedTeknisi = useMemo(() => {
    return [...activeTeknisi].sort((a, b) => a.name.localeCompare(b.name));
  }, [activeTeknisi]);

  const visibleFields = useMemo(() => 
    formData.tim ? getVisibleFields(formData.tim) : [], 
  [formData.tim]);

  const showField = (fieldName: keyof TicketFormData) => visibleFields.includes(fieldName);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (isEditMode && ticketData) {
        const formatDateForInput = (dateString: string | null) => {
            if (!dateString) return '';
            const d = new Date(dateString);
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        const existingData: TicketFormData = {
            hsa: ticketData.hsa || '',
            sto: ticketData.sto || '',
            odc: ticketData.odc || '',
            stakeHolder: ticketData.stake_holder || '',
            jenisPelanggan: ticketData.provider || '',
            kategori: ticketData.kategori || '',
            tiket: ticketData.inc_numbers?.[0] || '',
            tiketTacc: ticketData.tacc || '',
            indukGamas: ticketData.inc_gamas || '',
            kjd: ticketData.kjd || '',
            summary: ticketData.raw_ticket_text || '',
            idPelanggan: ticketData.id_pelanggan || '',
            namaPelanggan: ticketData.nama_pelanggan || '',
            datek: ticketData.datek || '',
            losNonLos: ticketData.los_non_los || '',
            siteImpact: ticketData.site_impact || '',
            classSite: ticketData.class_site || '',
            koordinat: (ticketData.latitude && ticketData.longitude) 
                ? `${ticketData.latitude}, ${ticketData.longitude}` 
                : '',
            histori6Bulan: '',
            reportDate: formatDateForInput(ticketData.jam_open),
            ttrTarget: ticketData.ttr_target_hours?.toString() || '',
            teknisi1: ticketData.teknisi_list?.[0] || '',
            tim: ticketData.tim || '',
            jenisGangguan: ticketData.jenis_gangguan || ''
        };
        setFormData(existingData);
        setIsLoading(false);
    } else if (!isEditMode) {
        setFormData(emptyForm);
        setErrors({});
        setTouched({});
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 300);
    }
  }, [isEditMode, ticketData, id]);

  useEffect(() => {
    if (!isLoading && formData.kategori) {
       const match = formData.kategori.match(/\[(\d+(?:\.\d+)?)\]/);
       if (match && match[1]) {
         if (formData.ttrTarget !== match[1]) {
             updateField('ttrTarget', match[1]);
         }
       }
    }
  }, [formData.kategori, isLoading]);

  useEffect(() => {
    if (!isLoading) {
        const currentStoOptions = formData.hsa ? hsaToStoMap[formData.hsa] || [] : [];
        if (formData.sto && !currentStoOptions.includes(formData.sto) && currentStoOptions.length > 0) {
           updateField('sto', '');
        }
    }
  }, [formData.hsa, isLoading]);

  useEffect(() => {
    if (!isEditMode) {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }
  }, [isEditMode]);

  if (user?.role === 'guest') {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
          > 
            <ShieldX className="w-10 h-10 text-destructive" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Anda tidak dapat mengakses halaman ini.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="btn-ripple gap-2"
          >
            Kembali ke Dashboard
          </Button>
        </motion.div>
      </Layout>
    );
  }

  if (isLoading || (isEditMode && isLoadingTicket)) {
    return (
      <Layout>
        <FormSkeleton mode={isEditMode ? 'full' : 'simple'} />
      </Layout>
    );
  }

  const updateField = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const markTouched = (field: keyof TicketFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const activeFields = formData.tim ? getVisibleFields(formData.tim) : [];

    const fieldsToValidate = REQUIRED_FIELDS.filter(req => 
      activeFields.includes(req.field)
    );

    fieldsToValidate.forEach(({ field, label }) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${label} wajib diisi`;
      }
    });

    if (formData.tim === 'MTC' && (!formData.indukGamas || formData.indukGamas.trim() === '')) {
      newErrors.indukGamas = 'Induk GAMAS wajib diisi';
    }

    if (activeFields.includes('tiket') && formData.tiket && !formData.tiket.toUpperCase().startsWith('INC')) {
      newErrors.tiket = 'Format Tiket tidak valid';
    }

    if (activeFields.includes('datek') && formData.datek) {
      const isValidDatek = DATEK_PATTERNS.some(pattern => pattern.regex.test(formData.datek.toUpperCase()));
      if (!isValidDatek) {
        newErrors.datek = 'Format Datek tidak valid';
      }
    }

    setErrors(newErrors);
    
    const touchedFields: Partial<Record<keyof TicketFormData, boolean>> = {};
    fieldsToValidate.forEach(({ field }) => {
      touchedFields[field] = true;
    });

    if (formData.tim === 'MTC') {
      touchedFields.indukGamas = true;
    }
    
    setTouched(prev => ({ ...prev, ...touchedFields }));

    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    if (isEditMode && ticketData) {
        window.location.reload();
    } else {
        setFormData(emptyForm);
        setErrors({});
        setTouched({});
        toast({
            title: "Form Direset",
            description: "Semua field telah dikosongkan",
        });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validasi Gagal",
        description: `Terdapat ${Object.keys(errors).length > 0 ? Object.keys(errors).length : 'beberapa'} field yang perlu diperbaiki`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const jamOpen = new Date(formData.reportDate);
      const ttrHours = parseFloat(formData.ttrTarget) || 8760; 
      const maxJamClose = new Date(jamOpen.getTime() + (ttrHours * 60 * 60 * 1000));
      let lat = null;
      let lon = null;
      if (formData.koordinat && formData.koordinat.includes(',')) {
        const [latStr, lonStr] = formData.koordinat.split(',').map(s => s.trim());
        lat = parseFloat(latStr);
        lon = parseFloat(lonStr);
      }

      const payload = {
        hsa: formData.hsa,
        sto: formData.sto,
        odc: formData.odc,
        datek: formData.datek.toUpperCase(),
        los_non_los: formData.losNonLos,
        site_impact: formData.siteImpact,
        class_site: formData.classSite,
        tacc: formData.tiketTacc, 
        tim: formData.tim,
        inc_numbers: [formData.tiket],
        id_pelanggan: formData.idPelanggan,
        nama_pelanggan: formData.namaPelanggan,
        site_code: formData.idPelanggan,
        site_name: formData.namaPelanggan,
        kategori: formData.kategori,
        lokasi_text: `${formData.sto} - ${formData.odc}`,
        jam_open: jamOpen.toISOString(),
        ttr_target_hours: ttrHours,
        max_jam_close: maxJamClose.toISOString(),
        provider: formData.jenisPelanggan,
        stake_holder: formData.stakeHolder,
        kjd: formData.kjd || null,
        inc_gamas: formData.indukGamas || null,
        jenis_gangguan: formData.jenisGangguan || null,
        teknisi_list: formData.teknisi1 ? [formData.teknisi1] : [],
        latitude: (lat !== null && !isNaN(lat)) ? lat : null,
        longitude: (lon !== null && !isNaN(lon)) ? lon : null,
        raw_ticket_text: formData.summary
      };

      if (isEditMode && id) {
        await updateTicket.mutateAsync({
            id: id,
            updates: {
                ...payload,
                updated_at: new Date().toISOString()
            }
        });
        toast({
            title: "Tiket Diperbarui",
            description: `Data tiket ${formData.tiket} berhasil diupdate`,
        });
        navigate(`/ticket/${id}`);
      } else {
        const initialStatus = formData.teknisi1 ? 'ASSIGNED' : 'OPEN';
        await createTicket.mutateAsync({
            ...payload,
            status: initialStatus,
            created_by: user?.id,
        });
        toast({
            title: "Tiket Berhasil Disimpan",
            description: `Tiket ${formData.tiket} telah ditambahkan dengan status ${initialStatus}`,
        });
        navigate('/tickets');
      }
    } catch (error) {
      console.error('Gagal menyimpan tiket:', error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan data ke database.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldRequired = (field: keyof TicketFormData): boolean => {
    if (field === 'indukGamas' && formData.tim === 'MTC') {
      return true;
    }
    return REQUIRED_FIELDS.some(f => f.field === field);
  };

  const getFieldError = (field: keyof TicketFormData): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  const SelectField = ({ 
    label, 
    field, 
    options,
    placeholder = "Pilih...",
    onAfterChange,
    disabled = false
  }: { 
    label: string; 
    field: keyof TicketFormData; 
    options: string[];
    placeholder?: string;
    onAfterChange?: (value: string) => void;
    disabled?: boolean;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Select 
          value={formData[field]} 
          onValueChange={(v) => {
            updateField(field, v);
            markTouched(field);
            if (onAfterChange) onAfterChange(v);
          }}
          disabled={disabled}
        >
          <SelectTrigger 
            className={cn(
              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
              error && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-lg z-50 max-h-[180px]">
            {options.map(opt => (
              <SelectItem 
                key={opt} 
                value={opt}
                className="cursor-pointer hover:bg-accent transition-colors"
              >
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const InputField = ({ 
    label, 
    field, 
    placeholder = "",
    type = "text",
    icon: Icon,
    min,
  }: { 
    label: string; 
    field: keyof TicketFormData; 
    placeholder?: string;
    type?: string;
    icon?: React.ComponentType<{ className?: string }>;
    min?: number;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <Input
            type={type}
            min={min}
            value={formData[field]}
            onChange={(e) => {
              let val = e.target.value;
              
              if (type === 'number' && min !== undefined) {
                 if (val !== '' && parseFloat(val) < min) {
                    val = min.toString();
                 }
              }
              
              updateField(field, val);
            }}
            onBlur={() => markTouched(field)}
            placeholder={placeholder}
            className={cn(
              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
              Icon && "pl-10",
              error && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
            )}
          />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const setReportDateToNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    updateField('reportDate', formattedDate);
  
    if (!touched.reportDate) {
      markTouched('reportDate');
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Layout>
      <SEO title={isEditMode ? "Edit Tiket" : "Input Tiket Baru"} description="Form manajemen data tiket." />
      <div className="space-y-6 max-w-5xl mx-auto pb-8">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            {isEditMode && (
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
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  isEditMode 
                    ? "bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 text-primary-foreground" 
                    : "bg-primary/10 text-primary"
                )}>
                   {isEditMode ? <Pencil className="w-5 h-5" /> : <TicketIcon className="w-5 h-5" />}
                </div>
                {isEditMode ? "Edit Tiket" : "Input Tiket Baru"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1.5 ml-1 hidden sm:inline">
                {isEditMode 
                  ? "Perbarui informasi teknis pelanggan" 
                  : "Masukkan data awal tiket gangguan"}
              </p>
            </div>
          </div>
          {!isEditMode && (
            <div className="flex gap-2 shrink-0 mt-1">
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="gap-2 icon-hover-spin"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !formData.tim}
                className="gap-2 btn-ripple"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className='hidden sm:inline'>{isSubmitting ? 'Menyimpan...' : 'Simpan Tiket'}</span>
              </Button>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {hasErrors && Object.keys(touched).length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-destructive/50 bg-destructive/5 overflow-hidden">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3 text-destructive">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Mohon lengkapi field berikut:</p>
                      <ul className="text-xs mt-2 space-y-1">
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

        <div className="grid gap-6">
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="glass-card card-hover overflow-hidden">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-status-assigned/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-status-assigned" />
                  </div>
                  <CardTitle className="text-base font-semibold">Unit & Teknisi</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField 
                    label="Unit" 
                    field="tim" 
                    options={DROPDOWN_OPTIONS.tim} 
                    disabled={isEditMode}
                    onAfterChange={(val) => {
                      if (val === 'MTC') {
                        updateField('jenisPelanggan', 'GAMAS');
                      } else {
                        updateField('jenisPelanggan', 'TSEL');
                      }
                    }}
                  />
                  {showField('teknisi1') && (
                    <div className="space-y-2">
                      <Label className={cn(
                        "text-xs font-medium",
                        errors.teknisi1 && touched.teknisi1 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        Teknisi <span className="text-destructive">*</span>
                      </Label>
                      <Popover open={openTeknisi} onOpenChange={setOpenTeknisi}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openTeknisi}
                            className={cn(
                              "w-full justify-between h-10 px-3 font-normal bg-muted/50 border-transparent hover:border-border hover:bg-muted/70 transition-all duration-200",
                              !formData.teknisi1 && "text-muted-foreground",
                              errors.teknisi1 && touched.teknisi1 && "border-destructive ring-2 ring-destructive/20 bg-destructive/5 hover:bg-destructive/5"
                            )}
                          >
                            {formData.teknisi1
                              ? activeTeknisi.find((teknisi) => teknisi.name === formData.teknisi1)?.name
                              : "Pilih Teknisi..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Cari Teknisi..." className="h-10" />
                            <CommandList>
                              <CommandEmpty>Teknisi tidak ditemukan.</CommandEmpty>
                              <CommandGroup>
                                {sortedTeknisi.map((teknisi) => (
                                  <CommandItem
                                    key={teknisi.id}
                                    value={`${teknisi.name} ${teknisi.area}`}
                                    onSelect={(currentValue) => {
                                      updateField('teknisi1', teknisi.name);
                                      setOpenTeknisi(false);
                                      if (!touched.teknisi1) {
                                        markTouched('teknisi1');
                                      }
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 transition-opacity",
                                        formData.teknisi1 === teknisi.name ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{teknisi.name}</span>
                                      <span className="text-xs text-muted-foreground">{teknisi.area}</span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <AnimatePresence>
                        {formData.teknisi1 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{activeTeknisi.find(t => t.name === formData.teknisi1)?.phone || '-'}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {errors.teknisi1 && touched.teknisi1 && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-xs text-destructive flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {errors.teknisi1}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {formData.tim && (
            <>
              <motion.div
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="glass-card card-hover overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <CardTitle className="text-base font-semibold">Lokasi & Kategori</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {showField('hsa') && (
                        <SelectField label="HSA" field="hsa" options={DROPDOWN_OPTIONS.hsa} />
                      )}
                      {showField('sto') && (
                        <ComboboxField 
                          label="STO" 
                          value={formData.sto}
                          options={filteredStoOptions}
                          onChange={(val) => updateField('sto', val)}
                          onBlur={() => markTouched('sto')}
                          error={getFieldError('sto')}
                          required={isFieldRequired('sto')}
                        />
                      )}
                      {showField('odc') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            ODC <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={formData.odc}
                            onChange={(e) => updateField('odc', e.target.value)}
                            onBlur={() => markTouched('odc')}
                            placeholder="Masukkan ODC"
                            className={cn(
                              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                              errors.odc && touched.odc && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                            )}
                          />
                          <AnimatePresence>
                            {errors.odc && touched.odc && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.odc}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {showField('stakeHolder') && (
                        <SelectField label="Stake Holder" field="stakeHolder" options={DROPDOWN_OPTIONS.stakeHolder} />
                      )}
                      {showField('jenisPelanggan') && (
                        <SelectField label="Jenis Pelanggan" field="jenisPelanggan" options={DROPDOWN_OPTIONS.jenisPelanggan} />
                      )}
                      {showField('kategori') && (
                        <ComboboxField 
                          label="Severity" 
                          value={formData.kategori}
                          options={DROPDOWN_OPTIONS.kategori}
                          onChange={(val) => updateField('kategori', val)}
                          onBlur={() => markTouched('kategori')}
                          error={getFieldError('kategori')}
                          required={isFieldRequired('kategori')}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                custom={2}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="glass-card card-hover overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                        <FileText className="w-4 h-4 text-accent-foreground" />
                      </div>
                      <CardTitle className="text-base font-semibold">Informasi Tiket</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className={cn(
                      "grid grid-cols-1 md:grid-cols-2 gap-4",
                      formData.tim === 'MTC' ? "lg:grid-cols-3" : "lg:grid-cols-4"
                    )}>
                      {showField('tiket') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            No. Tiket (INC) <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <TicketIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              value={formData.tiket}
                              onChange={(e) => updateField('tiket', e.target.value.toUpperCase())}
                              onBlur={() => markTouched('tiket')}
                              placeholder="INC12345678"
                              className={cn(
                                "h-10 pl-10 font-mono bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                                errors.tiket && touched.tiket && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                              )}
                            />
                          </div>
                          <AnimatePresence>
                            {errors.tiket && touched.tiket && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.tiket}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {showField('tiketTacc') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Tiket TACC
                          </Label>
                          <Input
                            value={formData.tiketTacc}
                            onChange={(e) => updateField('tiketTacc', e.target.value)}
                            onBlur={() => markTouched('tiketTacc')}
                            placeholder="Optional"
                            className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
                          />
                        </div>
                      )}
                      {showField('indukGamas') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Induk GAMAS {isFieldRequired('indukGamas') && <span className="text-destructive">*</span>}
                          </Label>
                          <Input
                            value={formData.indukGamas}
                            onChange={(e) => updateField('indukGamas', e.target.value)}
                            onBlur={() => markTouched('indukGamas')}
                            placeholder={formData.tim === 'MTC' ? "INC12345678" : "Optional"}
                            className={cn(
                              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                              errors.indukGamas && touched.indukGamas && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                            )}
                          />
                          <AnimatePresence>
                            {errors.indukGamas && touched.indukGamas && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.indukGamas}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {showField('kjd') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            KJD
                          </Label>
                          <Input
                            value={formData.kjd}
                            onChange={(e) => updateField('kjd', e.target.value)}
                            onBlur={() => markTouched('kjd')}
                            placeholder="Optional"
                            className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
                          />
                        </div>
                      )}
                      {showField('jenisGangguan') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Jenis Gangguan <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={formData.jenisGangguan}
                            onChange={(e) => updateField('jenisGangguan', e.target.value)}
                            onBlur={() => markTouched('jenisGangguan')}
                            placeholder="ODP LOSS"
                            className={cn(
                              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                              errors.jenisGangguan && touched.jenisGangguan && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                            )}
                          />
                          <AnimatePresence>
                            {errors.jenisGangguan && touched.jenisGangguan && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.jenisGangguan}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {showField('reportDate') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Report Date <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="datetime-local"
                              value={formData.reportDate}
                              onChange={(e) => updateField('reportDate', e.target.value)}
                              className={cn(
                                "h-10 pl-10 pr-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                                errors.reportDate && touched.reportDate && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-10 w-10 text-muted-foreground hover:text-primary transition-colors icon-hover-bounce"
                              onClick={setReportDateToNow}
                              title="Set waktu saat ini"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                          <AnimatePresence>
                            {errors.reportDate && touched.reportDate && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.reportDate}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {showField('ttrTarget') && (
                        <InputField label="TTR Target (Jam)" field="ttrTarget" placeholder="Otomatis..." type="number" min={0} />
                      )}
                    </div>
                    {showField('summary') && (
                      <div className="space-y-2 mt-4">
                        <Label className="text-xs font-medium text-muted-foreground">
                          Summary <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          value={formData.summary}
                          onChange={(e) => updateField('summary', e.target.value)}
                          onBlur={() => markTouched('summary')}
                          placeholder="TSEL_METRO_PBR178_PEKANBARU..."
                          className={cn(
                            "min-h-[80px] bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200 resize-none",
                            errors.summary && touched.summary && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                          )}
                        />
                        <AnimatePresence>
                          {errors.summary && touched.summary && (
                            <motion.p 
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-xs text-destructive flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3" />
                              {errors.summary}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                custom={3}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="glass-card card-hover overflow-hidden">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-status-closed/10 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-status-closed" />
                      </div>
                      <CardTitle className="text-base font-semibold">Pelanggan & Site</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className={cn(
                      "grid grid-cols-1 md:grid-cols-2 gap-4",
                      formData.tim === 'MTC' ? "lg:grid-cols-1" : "lg:grid-cols-4"
                    )}>
                      {showField('idPelanggan') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            ID Pelanggan / Site <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={formData.idPelanggan}
                            onChange={(e) => updateField('idPelanggan', e.target.value)}
                            onBlur={() => markTouched('idPelanggan')}
                            placeholder="PBR123"
                            className={cn(
                              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                              errors.idPelanggan && touched.idPelanggan && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                            )}
                          />
                          <AnimatePresence>
                            {errors.idPelanggan && touched.idPelanggan && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.idPelanggan}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {showField('namaPelanggan') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Nama Pelanggan / Site <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={formData.namaPelanggan}
                            onChange={(e) => updateField('namaPelanggan', e.target.value)}
                            onBlur={() => markTouched('namaPelanggan')}
                            placeholder="PEKANBARU..."
                            className={cn(
                              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                              errors.namaPelanggan && touched.namaPelanggan && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                            )}
                          />
                          <AnimatePresence>
                            {errors.namaPelanggan && touched.namaPelanggan && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.namaPelanggan}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {showField('datek') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2.5 mt-1.5">
                            DATEK <span className="text-destructive">*</span>
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button 
                                    type="button" 
                                    className="focus:outline-none"
                                    onClick={(e) => e.preventDefault()}
                                  >
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs text-xs" side="right">
                                  <p className="font-semibold mb-1">Format yang diterima:</p>
                                  <ul className="list-disc pl-3 space-y-0.5">
                                    {DATEK_PATTERNS.map((p, idx) => (
                                      <li key={idx}>{p.label}</li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            value={formData.datek}
                            onChange={(e) => updateField('datek', e.target.value.toUpperCase())}
                            onBlur={() => markTouched('datek')}
                            placeholder="GPON/FE/ODC/ODP..."
                            className={cn(
                              "h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200",
                              errors.datek && touched.datek && "border-destructive ring-2 ring-destructive/20 bg-destructive/5"
                            )}
                          />
                          <AnimatePresence>
                            {errors.datek && touched.datek && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="text-xs text-destructive flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3" />
                                {errors.datek}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                      {showField('losNonLos') && (
                        <SelectField label="LOS / Non LOS" field="losNonLos" options={DROPDOWN_OPTIONS.losNonLos} />
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {showField('siteImpact') && (
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">
                            Site Impact
                          </Label>
                          <Input
                            value={formData.siteImpact}
                            onChange={(e) => updateField('siteImpact', e.target.value)}
                            onBlur={() => markTouched('siteImpact')}
                            placeholder="PBR456"
                            className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
                          />
                        </div>
                      )}
                      {showField('classSite') && (
                        <SelectField label="Class Site" field="classSite" options={DROPDOWN_OPTIONS.classSite} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-end gap-3 pt-4"
        >
          <Button 
            variant="outline" 
            onClick={isEditMode ? () => navigate(-1) : handleReset}
            className="gap-2 icon-hover-spin"
          >
            {!isEditMode && (
              <RotateCcw className="w-4 h-4" />
            )}
            {isEditMode ? "Batal" : "Reset"}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.tim}
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
                <span className='hidden sm:inline'>{isEditMode ? "Edit Tiket" : "Simpan Tiket"}</span>
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ImportTicket;
