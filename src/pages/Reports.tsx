import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReportsSkeleton } from '@/components/skeletons';
import { useTickets } from '@/hooks/useTickets';
import { FilterCombobox } from '@/components/FilterCombobox';
import { 
  BarChart3, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar as CalendarIcon,
  PieChart,
  X,
  Activity,
  Timer,
  Users,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  LayoutGrid,
  FileText,
  DownloadCloud,
  ChevronDown,
  Filter,
  Wrench,
  Globe,
  UserCheck,
  PauseCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  RadialBarChart, 
  RadialBar,
  ResponsiveContainer,
} from 'recharts';
import { useMemo, useState } from 'react';
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEO from '@/components/SEO';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }
  }
};

const chartCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
  }
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; isUp: boolean };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  subtitle?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, variant = 'default', subtitle }: StatCardProps) => {
  const variantStyles = {
    default: {
      bg: 'bg-card',
      iconBg: 'bg-muted',
      iconColor: 'text-muted-foreground',
      valueColor: 'text-foreground'
    },
    primary: {
      bg: 'bg-primary/5 border-primary/20',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-primary'
    },
    success: {
      bg: 'bg-emerald-500/5 border-emerald-500/20',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400'
    },
    warning: {
      bg: 'bg-amber-500/5 border-amber-500/20',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-600 dark:text-amber-400'
    },
    danger: {
      bg: 'bg-destructive/5 border-destructive/20',
      iconBg: 'bg-destructive/10',
      iconColor: 'text-destructive',
      valueColor: 'text-destructive'
    }
  };

  const styles = variantStyles[variant];

  return (
    <motion.div variants={cardVariants} whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
      <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-lg", styles.bg)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className={cn("text-3xl font-bold tracking-tight", styles.valueColor)}>{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
              {trend && (
                <div className={cn("flex items-center gap-1 text-xs font-medium", trend.isUp ? "text-emerald-600" : "text-destructive")}>
                  {trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {trend.value}% dari kemarin
                </div>
              )}
            </div>
            <div className={cn("p-3 rounded-xl", styles.iconBg)}>
              <Icon className={cn("w-6 h-6", styles.iconColor)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ChartCard = ({ children, title, description, icon: Icon, className }: { children: React.ReactNode; title: string; description?: string; icon?: React.ElementType; className?: string }) => (
  <motion.div variants={chartCardVariants} className="h-full">
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-primary" />}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  </motion.div>
);

const Reports = () => {
  const { toast } = useToast();
  const { data: tickets = [], isLoading } = useTickets();

  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterKategori, setFilterKategori] = useState<string>("ALL");
  const [filterProvider, setFilterProvider] = useState<string>("ALL");
  const [filterTeknisi, setFilterTeknisi] = useState<string>("ALL");
  const [filterDatek, setFilterDatek] = useState<string>("");
  const [filterId, setFilterId] = useState<string>("");

  const { statusOptions, kategoriOptions, providerOptions, teknisiOptions } = useMemo(() => {
    const statusSet = new Set<string>();
    const kategoriSet = new Set<string>();
    const providerSet = new Set<string>();
    const teknisiSet = new Set<string>();

    tickets.forEach(ticket => {
      if (ticket.status) statusSet.add(ticket.status);
      if (ticket.kategori) kategoriSet.add(ticket.kategori);
      if (ticket.provider) providerSet.add(ticket.provider);
      if (ticket.teknisi_list && Array.isArray(ticket.teknisi_list)) {
        ticket.teknisi_list.forEach((tech: string) => teknisiSet.add(tech));
      }
    });

    return {
      statusOptions: Array.from(statusSet).sort(),
      kategoriOptions: Array.from(kategoriSet).sort(),
      providerOptions: Array.from(providerSet).sort(),
      teknisiOptions: Array.from(teknisiSet).sort(),
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.jam_open); 
      const isDateMatch = isWithinInterval(ticketDate, {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });

      if (!isDateMatch) return false;

      if (filterStatus !== "ALL" && ticket.status !== filterStatus) return false;

      if (filterKategori !== "ALL" && ticket.kategori !== filterKategori) return false;

      if (filterProvider !== "ALL" && ticket.provider !== filterProvider) return false;

      if (filterTeknisi !== "ALL") {
        if (!ticket.teknisi_list || !ticket.teknisi_list.includes(filterTeknisi)) return false;
      }

      if (filterDatek && !ticket.datek?.toLowerCase().includes(filterDatek.toLowerCase())) {
        return false;
      }

      if (filterId) {
        const searchLower = filterId.toLowerCase();
        const matchesId = ticket.id_pelanggan?.toLowerCase().includes(searchLower);
        const matchesSiteCode = ticket.site_code?.toLowerCase().includes(searchLower);
        const matchesSiteName = ticket.site_name?.toLowerCase().includes(searchLower);
        
        if (!matchesId && !matchesSiteCode && !matchesSiteName) {
          return false;
        }
      }

      return true;
    });
  }, [dateRange, tickets, filterStatus, filterKategori, filterProvider, filterTeknisi, filterDatek, filterId]); 

  const periodData = useMemo(() => {
    const days = [];
    const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(dateRange.from);
      date.setDate(dateRange.from.getDate() + i);
      const dateStr = format(date, 'EEE, d', { locale: id });
      
      const ticketsOnDay = filteredTickets.filter(ticket => {
        const ticketDate = new Date(ticket.jam_open);
        return ticketDate.toDateString() === date.toDateString();
      });
      
      const closedOnDay = ticketsOnDay.filter(t => t.status === 'CLOSED');
      const avgTTR = closedOnDay.length > 0 
        ? closedOnDay.reduce((acc, t) => acc + (t.ttr_real_hours || 0), 0) / closedOnDay.length 
        : 0;
      
      days.push({
        name: dateStr,
        fullDate: format(date, 'dd MMM', { locale: id }),
        open: ticketsOnDay.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length,
        onprogress: ticketsOnDay.filter(t => t.status === 'ONPROGRESS').length,
        pending: ticketsOnDay.filter(t => t.status === 'PENDING' || t.status.startsWith('WAITING')).length,
        closed: ticketsOnDay.filter(t => t.status === 'CLOSED').length,
        total: ticketsOnDay.length,
        avgTTR: Math.round(avgTTR * 10) / 10,
        compliance: ticketsOnDay.filter(t => t.ttr_compliance === 'COMPLY').length,
      });
    }
    
    return days;
  }, [dateRange, filteredTickets]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const cat = t.kategori || 'Lainnya';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      category: name,
    }));
  }, [filteredTickets]);

  const statusData = useMemo(() => {
    return [
      { name: 'Open', value: filteredTickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length, status: 'open', fill: 'hsl(var(--primary))' },
      { name: 'On Progress', value: filteredTickets.filter(t => t.status === 'ONPROGRESS').length, status: 'onprogress', fill: 'hsl(45 93% 47%)' },
      { name: 'Pending', value: filteredTickets.filter(t => t.status === 'PENDING' || t.status.startsWith('WAITING')).length, status: 'pending', fill: 'hsl(262 83% 58%)' },
      { name: 'Closed', value: filteredTickets.filter(t => t.status === 'CLOSED').length, status: 'closed', fill: 'hsl(142 76% 36%)' },
    ].filter(d => d.value > 0);
  }, [filteredTickets]);

  const providerData = useMemo(() => {
    const providers: Record<string, { total: number; closed: number; comply: number }> = {};
    filteredTickets.forEach(t => {
      const provider = t.provider || 'Unknown';
      if (!providers[provider]) {
        providers[provider] = { total: 0, closed: 0, comply: 0 };
      }
      providers[provider].total++;
      if (t.status === 'CLOSED') providers[provider].closed++;
      if (t.ttr_compliance === 'COMPLY') providers[provider].comply++;
    });
    return Object.entries(providers).map(([name, data]) => ({
      name,
      total: data.total,
      closed: data.closed,
      comply: data.comply,
      rate: data.total > 0 ? Math.round((data.comply / data.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [filteredTickets]);

  const sifatPerbaikanData = useMemo(() => {
    const data = [
      { name: 'Permanen', value: filteredTickets.filter(t => t.is_permanent === true).length, fill: 'hsl(142 76% 36%)' },
      { name: 'Temporary', value: filteredTickets.filter(t => t.is_permanent === false).length, fill: 'hsl(25 95% 53%)' },
      { name: 'Belum Ditentukan', value: filteredTickets.filter(t => t.is_permanent === null).length, fill: 'hsl(var(--muted))' }
    ].filter(d => d.value > 0);
    return data;
  }, [filteredTickets]);

  const impactData = useMemo(() => {
    const impacts: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const imp = t.site_impact || 'Tidak Ada';
      impacts[imp] = (impacts[imp] || 0) + 1;
    });
    return Object.entries(impacts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTickets]);

  const complianceRadialData = useMemo(() => {
    const comply = filteredTickets.filter(t => t.ttr_compliance === 'COMPLY').length;
    const notComply = filteredTickets.filter(t => t.ttr_compliance === 'NOT COMPLY').length;
    const total = comply + notComply;
    return [
      { name: 'Comply', value: total > 0 ? Math.round((comply / total) * 100) : 0, fill: 'hsl(142 76% 36%)' },
    ];
  }, [filteredTickets]);

  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hours[i] = 0;
    
    filteredTickets.forEach(t => {
      const hour = new Date(t.jam_open).getHours();
      hours[hour]++;
    });
    
    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour.padStart(2, '0')}:00`,
      count
    }));
  }, [filteredTickets]);

  const avgResolutionTime = useMemo(() => {
    const closedTickets = filteredTickets.filter(t => t.status === 'CLOSED' && t.ttr_real_hours);
    if (closedTickets.length === 0) return 0;
    const total = closedTickets.reduce((acc, t) => acc + (t.ttr_real_hours || 0), 0);
    return Math.round((total / closedTickets.length) * 10) / 10;
  }, [filteredTickets]);

  const datekData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach(t => {
      const d = t.datek ? t.datek.trim() : 'Tanpa Datek';
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredTickets]);

  const datekChartConfig: ChartConfig = {
    value: { label: 'Jumlah Tiket', color: 'hsl(var(--primary))' },
  };

  const barChartConfig: ChartConfig = {
    open: { label: 'Open', color: 'hsl(var(--primary))' },
    onprogress: { label: 'On Progress', color: 'hsl(45 93% 47%)' },
    pending: { label: 'Pending', color: 'hsl(262 83% 58%)' },
    closed: { label: 'Closed', color: 'hsl(142 76% 36%)' },
  };

  const areaChartConfig: ChartConfig = {
    total: { label: 'Total Tiket', color: 'hsl(var(--primary))' },
    closed: { label: 'Closed', color: 'hsl(142 76% 36%)' },
  };

  const pieChartConfig: ChartConfig = categoryData.reduce((acc, cat, index) => {
    const colors = ['hsl(var(--primary))', 'hsl(45 93% 47%)', 'hsl(262 83% 58%)', 'hsl(174 72% 40%)', 'hsl(340 75% 55%)'];
    acc[cat.category] = { label: cat.name, color: colors[index % colors.length] };
    return acc;
  }, {} as ChartConfig);

  const statusChartConfig: ChartConfig = {
    open: { label: 'Open', color: 'hsl(var(--primary))' },
    onprogress: { label: 'On Progress', color: 'hsl(45 93% 47%)' },
    waiting: { label: 'Waiting', color: 'hsl(25 95% 53%)' },
    pending: { label: 'Pending', color: 'hsl(262 83% 58%)' },
    closed: { label: 'Closed', color: 'hsl(142 76% 36%)' },
  };

  const CATEGORY_COLORS = ['hsl(var(--primary))', 'hsl(45 93% 47%)', 'hsl(262 83% 58%)', 'hsl(174 72% 40%)', 'hsl(340 75% 55%)'];
  const STATUS_COLORS = ['hsl(var(--primary))', 'hsl(45 93% 47%)', 'hsl(25 95% 53%)', 'hsl(262 83% 58%)', 'hsl(142 76% 36%)'];

  const exportToExcel = async (exportType: 'full' | 'summary') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan');
    const dateFrom = format(dateRange.from, 'yyyy-MM-dd');
    const dateTo = format(dateRange.to, 'yyyy-MM-dd');
    const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm');
    
    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    };

    const cellStyle: Partial<ExcelJS.Style> = {
      border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      alignment: { vertical: 'middle', wrapText: true }
    };

    const addReportHeader = (title: string) => {
      worksheet.mergeCells('A1:J1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `SITIKET - ${title}`;
      titleCell.font = { bold: true, size: 16, color: { argb: 'FF0F172A' } };
      titleCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:J2');
      worksheet.getCell('A2').value = `Periode: ${format(dateRange.from, 'dd MMM yyyy', { locale: id })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: id })}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };

      worksheet.mergeCells('A3:J3');
      worksheet.getCell('A3').value = `Dicetak pada: ${timestamp}`;
      worksheet.getCell('A3').alignment = { horizontal: 'center' };
      
      worksheet.addRow([]);
    };

    if (exportType === 'full') {
      addReportHeader('LAPORAN TIKET LENGKAP');

      worksheet.columns = [
        { header: 'ID Tiket', key: 'id', width: 12 },
        { header: 'No. INC', key: 'inc', width: 22 },
        { header: 'Site', key: 'site', width: 30 },
        { header: 'Provider', key: 'provider', width: 15 },
        { header: 'Kategori', key: 'kategori', width: 18 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Jam Open', key: 'open', width: 18 },
        { header: 'Jam Close', key: 'close', width: 18 },
        { header: 'TTR (Jam)', key: 'ttr', width: 10 },
        { header: 'KJD', key: 'kjd', width: 15 },
        { header: 'Gamas', key: 'gamas', width: 15 },
        { header: 'Sifat', key: 'sifat', width: 15 },
        { header: 'TACC', key: 'tacc', width: 20 },
        { header: 'Datek', key: 'datek', width: 15 },
        { header: 'LOS', key: 'los', width: 10 },
        { header: 'Impact', key: 'impact', width: 15 },
        { header: 'Class', key: 'class', width: 10 },
        { header: 'Segmen', key: 'segmen', width: 20 },
        { header: 'Penyebab', key: 'penyebab', width: 30 },
        { header: 'Perbaikan', key: 'perbaikan', width: 30 },
        { header: 'Kendala', key: 'kendala', width: 25 },
        { header: 'Teknisi', key: 'teknisi', width: 25 },
        { header: 'Koordinat', key: 'koordinat', width: 25 },
      ];

      const headerRow = worksheet.getRow(5);
      headerRow.eachCell((cell) => { cell.style = headerStyle; });

      filteredTickets.forEach(ticket => {
        const row = worksheet.addRow({
          id: ticket.id.substring(0, 8).toUpperCase(),
          inc: Array.isArray(ticket.inc_numbers) ? ticket.inc_numbers.join(', ') : '',
          site: `${ticket.site_code} - ${ticket.site_name}`,
          provider: ticket.provider,
          kategori: ticket.kategori,
          status: ticket.status,
          open: ticket.jam_open ? format(new Date(ticket.jam_open), 'dd/MM/yy HH:mm') : '-',
          close: ticket.status === 'CLOSED' && ticket.ttr_real_hours 
            ? format(new Date(new Date(ticket.jam_open).getTime() + ticket.ttr_real_hours * 3600 * 1000), 'dd/MM/yy HH:mm') 
            : '-',
          ttr: ticket.ttr_real_hours ? ticket.ttr_real_hours.toFixed(1) : '-',
          kjd: ticket.kjd || '-',
          gamas: ticket.inc_gamas || '-',
          sifat: ticket.is_permanent === true ? 'PERMANEN' : ticket.is_permanent === false ? 'TEMPORARY' : '-',
          tacc: ticket.tacc || '-',
          datek: ticket.datek || '-',
          los: ticket.los_non_los || '-',
          impact: ticket.site_impact || '-',
          class: ticket.class_site || '-',
          segmen: ticket.segmen || '-',
          penyebab: ticket.penyebab || '-',
          perbaikan: ticket.perbaikan || '-',
          kendala: ticket.kendala || '-',
          teknisi: Array.isArray(ticket.teknisi_list) ? ticket.teknisi_list.join(', ') : '',
          koordinat: (ticket.latitude && ticket.longitude) ? `${ticket.latitude}, ${ticket.longitude}` : '-'
        });

        row.eachCell((cell) => { cell.style = cellStyle; });

        const statusCell = row.getCell('status');
        if (ticket.status === 'CLOSED') {
          statusCell.font = { color: { argb: 'FF166534' }, bold: true };
        } else if (ticket.status === 'OPEN') {
          statusCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        } else if (ticket.status === 'ONPROGRESS') {
          statusCell.font = { color: { argb: 'FFD97706' }, bold: true };
        }
      });

    } else {
      addReportHeader('RINGKASAN EKSEKUTIF');

      worksheet.addRow(['RINGKASAN STATUS TIKET']);
      worksheet.lastRow!.font = { bold: true, size: 12 };
      
      const headerRowStatus = worksheet.addRow(['Status', 'Jumlah']);
      headerRowStatus.getCell(1).style = headerStyle;
      headerRowStatus.getCell(2).style = headerStyle;

      statusData.forEach(d => {
        const row = worksheet.addRow([d.name, d.value]);
        row.getCell(1).style = cellStyle;
        row.getCell(2).style = cellStyle;
      });
      worksheet.addRow([]);

      worksheet.addRow(['PERFORMA PER KATEGORI']);
      worksheet.lastRow!.font = { bold: true, size: 12 };

      const headerRowCat = worksheet.addRow(['Kategori', 'Total', 'Closed', '% Selesai']);
      [1, 2, 3, 4].forEach(i => headerRowCat.getCell(i).style = headerStyle);

      categoryData.forEach(cat => {
        const categoryTickets = filteredTickets.filter(t => t.kategori === cat.category);
        const closed = categoryTickets.filter(t => t.status === 'CLOSED').length;
        const percentage = categoryTickets.length > 0 ? Math.round((closed / categoryTickets.length) * 100) : 0;
        
        const row = worksheet.addRow([cat.name, cat.value, closed, `${percentage}%`]);
        [1, 2, 3, 4].forEach(i => row.getCell(i).style = cellStyle);
      });
      worksheet.addRow([]);

      worksheet.addRow(['TRAFIK HARIAN']);
      worksheet.lastRow!.font = { bold: true, size: 12 };

      const headerRowDaily = worksheet.addRow(['Tanggal', 'Masuk (Open)', 'Selesai (Closed)', 'Total']);
      [1, 2, 3, 4].forEach(i => headerRowDaily.getCell(i).style = headerStyle);

      periodData.forEach(d => {
        const row = worksheet.addRow([d.name, d.open, d.closed, d.total]);
        [1, 2, 3, 4].forEach(i => row.getCell(i).style = cellStyle);
      });

      worksheet.getColumn(1).width = 25;
      worksheet.getColumn(2).width = 15;
      worksheet.getColumn(3).width = 15;
      worksheet.getColumn(4).width = 15;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = exportType === 'full' 
      ? `Sitiket-Lengkap_${dateFrom}_${dateTo}.xlsx`
      : `Sitiket-Ringkasan_${dateFrom}_${dateTo}.xlsx`;
      
    saveAs(new Blob([buffer]), fileName);

    toast({
      title: "Export Berhasil",
      description: `File Excel berhasil diunduh: ${fileName}`,
    });
  };

  const handlePresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days - 1),
      to: new Date(),
    });
  };

  const handleResetFilter = () => {
    setDateRange({
      from: subDays(new Date(), 6),
      to: new Date(),
    });
    setFilterStatus("ALL");
    setFilterKategori("ALL");
    setFilterProvider("ALL");
    setFilterTeknisi("ALL");
    setFilterDatek("");
    setFilterId("");
  };

  if (isLoading) {
    return (
      <Layout>
         <ReportsSkeleton />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <SEO title="Laporan & Analitik" description="Statistik dan performa penanganan tiket." />
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Laporan & Analitik
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Ringkasan performa dan statistik tiket secara komprehensif
            </p>
          </div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-2 pl-3 pr-4 h-9 bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all shadow-sm group"
                >
                  <div className="bg-primary/10 p-1 rounded-md group-hover:bg-primary/20 transition-colors">
                    <DownloadCloud className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Export Data</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 glass-card">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                  Pilih Format Laporan (.xlsx)
                </DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={() => exportToExcel('summary')}
                  className="rounded-md p-2 cursor-pointer focus:bg-primary/5 focus:text-primary mb-1 group"
                >
                  <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center mr-3 group-hover:bg-emerald-500/20 transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">Laporan Ringkasan</span>
                    <span className="text-[10px] text-muted-foreground">Statistik & angka penting</span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => exportToExcel('full')}
                  className="rounded-md p-2 cursor-pointer focus:bg-primary/5 focus:text-primary group"
                >
                  <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">Data Tiket Lengkap</span>
                    <span className="text-[10px] text-muted-foreground">Semua detail (Raw Data)</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </motion.div>

        
        <motion.div variants={itemVariants}>
          <Card className="p-4 bg-gradient-to-r from-card to-muted/30 border-border/50 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 min-w-fit">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm">Periode Laporan:</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap flex-1">
                <div className="flex items-center gap-1">
                  {[7, 14, 30].map((days) => (
                    <motion.div key={days} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePresetRange(days)}
                        className="text-xs transition-all hover:bg-primary hover:text-primary-foreground h-8"
                      >
                        {days} Hari
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="h-6 w-px bg-border hidden sm:block mx-1" />

                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal text-xs min-w-[120px] transition-all h-8",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {dateRange.from ? format(dateRange.from, "dd MMM yyyy", { locale: id }) : "Dari"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                        disabled={(date) => date > new Date() || date > dateRange.to}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>

                  <span className="text-muted-foreground text-sm">-</span>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal text-xs min-w-[120px] transition-all h-8",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {dateRange.to ? format(dateRange.to, "dd MMM yyyy", { locale: id }) : "Sampai"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                        disabled={(date) => date > new Date() || date < dateRange.from}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2 border-t border-border/50">
              <div className="flex items-center gap-2 min-w-fit">
                 <div className="p-2 rounded-lg bg-blue-500/10">
                   <Filter className="w-4 h-4 text-blue-500" />
                 </div>
                 <span className="font-medium text-sm">Filter Detail:</span>
              </div>
              
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
                <FilterCombobox
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                  options={statusOptions}
                  placeholder="Semua Status"
                  className="h-8 text-xs w-full"
                />
                <FilterCombobox
                  value={filterKategori}
                  onValueChange={setFilterKategori}
                  options={kategoriOptions}
                  placeholder="Semua Kategori"
                  className="h-8 text-xs w-full"
                />
                <FilterCombobox
                  value={filterProvider}
                  onValueChange={setFilterProvider}
                  options={providerOptions}
                  placeholder="Semua Pelanggan"
                  className="h-8 text-xs w-full"
                />
                 <FilterCombobox
                  value={filterTeknisi}
                  onValueChange={setFilterTeknisi}
                  options={teknisiOptions}
                  placeholder="Semua Teknisi"
                  className="h-8 text-xs w-full"
                />
                <Input 
                  placeholder="Datek..." 
                  value={filterDatek} 
                  onChange={(e) => setFilterDatek(e.target.value)}
                  className="h-8 text-xs w-full bg-background"
                />
                <Input 
                  placeholder="ID Pelanggan / Site..." 
                  value={filterId} 
                  onChange={(e) => setFilterId(e.target.value)}
                  className="h-8 text-xs w-full bg-background"
                />
              </div>
              
              <div className="flex items-center gap-2 min-w-fit ml-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilter}
                    className="text-xs text-muted-foreground hover:text-foreground h-8"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </motion.div>
                 <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={filteredTickets.length}
                >
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                    {filteredTickets.length} tiket
                  </span>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatCard 
            title="Total Periode" 
            value={filteredTickets.length} 
            icon={LayoutGrid} 
            variant="primary"
            subtitle={`${format(dateRange.from, 'dd MMM', { locale: id })} - ${format(dateRange.to, 'dd MMM', { locale: id })}`}
          />
          <StatCard 
            title="Open" 
            value={filteredTickets.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED').length} 
            icon={UserCheck} 
            variant="primary"
          />
          <StatCard 
            title="On Progress" 
            value={filteredTickets.filter(t => t.status === 'ONPROGRESS').length} 
            icon={Activity}
            variant="warning"
          />
          <StatCard 
            title="Pending" 
            value={filteredTickets.filter(t => t.status === 'PENDING' || t.status.startsWith('WAITING')).length} 
            icon={PauseCircle}
            variant="default"
          />
          <StatCard 
            title="Closed" 
            value={filteredTickets.filter(t => t.status === 'CLOSED').length} 
            icon={CheckCircle2} 
            variant="success"
          />
          <StatCard 
            title="Compliance" 
            value={`${complianceRadialData[0]?.value || 0}%`} 
            icon={Target} 
            variant="success"
            subtitle="TTR sesuai SLA"
          />
        </motion.div>

        
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid mb-4">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="distribution" className="gap-2">
                <PieChart className="w-4 h-4" />
                <span className="hidden sm:inline">Distribution</span>
              </TabsTrigger>
            </TabsList>

            
            <TabsContent value="overview" className="space-y-6">
              
              <ChartCard 
                title={`Tiket per Periode (${format(dateRange.from, "dd MMM", { locale: id })} - ${format(dateRange.to, "dd MMM yyyy", { locale: id })})`}
                description="Jumlah tiket berdasarkan status per hari"
                icon={BarChart3}
              >
                <ChartContainer config={barChartConfig} className="h-[350px] w-full">
                  <BarChart data={periodData} accessibilityLayer>
                    <defs>
                      <linearGradient id="openGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(45 93% 47%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(45 93% 47%)" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="pendingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(262 83% 58%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(262 83% 58%)" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="closedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="open" fill="url(#openGradient)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="onprogress" fill="url(#progressGradient)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pending" fill="url(#pendingGradient)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="closed" fill="url(#closedGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </ChartCard>

              
              <div className="grid lg:grid-cols-2 gap-6">
                
                <ChartCard 
                  title="Performa per Pelanggan" 
                  description="Distribusi dan compliance rate per pelanggan"
                  icon={Users}
                >
                  <div className="space-y-4">
                    {providerData.slice(0, 5).map((provider, index) => (
                      <motion.div 
                        key={provider.name}
                        className="space-y-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{provider.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{provider.total} tiket</span>
                            <span className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-full",
                              provider.rate >= 80 ? "bg-emerald-500/10 text-emerald-600" :
                              provider.rate >= 60 ? "bg-amber-500/10 text-amber-600" :
                              "bg-destructive/10 text-destructive"
                            )}>
                              {provider.rate}%
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress value={provider.rate} className="h-2" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ChartCard>

                
                <ChartCard 
                  title="TTR Compliance" 
                  description="Persentase tiket yang sesuai target TTR"
                  icon={Target}
                >
                  <div className="flex flex-col items-center justify-center h-[280px]">
                    <div className="relative">
                      <ResponsiveContainer width={200} height={200}>
                        <RadialBarChart 
                          innerRadius="70%" 
                          outerRadius="100%" 
                          data={complianceRadialData}
                          startAngle={180}
                          endAngle={0}
                        >
                          <RadialBar
                            dataKey="value"
                            cornerRadius={10}
                            background={{ fill: 'hsl(var(--muted))' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                          {complianceRadialData[0]?.value || 0}%
                        </span>
                        <span className="text-xs text-muted-foreground">Compliance</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-sm">Comply: {filteredTickets.filter(t => t.ttr_compliance === 'COMPLY').length}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="text-sm">Not Comply: {filteredTickets.filter(t => t.ttr_compliance === 'NOT COMPLY').length}</span>
                      </div>
                    </div>
                  </div>
                </ChartCard>
              </div>
            </TabsContent>

            
            <TabsContent value="trends" className="space-y-6">
              
              <ChartCard 
                title="Trend Tiket" 
                description="Perbandingan total tiket masuk dan closed per hari"
                icon={TrendingUp}
              >
                <ChartContainer config={areaChartConfig} className="h-[350px] w-full">
                  <AreaChart data={periodData} accessibilityLayer>
                    <defs>
                      <linearGradient id="totalArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="closedArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#totalArea)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="closed" 
                      stroke="hsl(142 76% 36%)" 
                      strokeWidth={2}
                      fill="url(#closedArea)" 
                    />
                  </AreaChart>
                </ChartContainer>
              </ChartCard>

              
              <div className="grid lg:grid-cols-2 gap-6">
                <ChartCard 
                  title="Rata-rata TTR per Hari" 
                  description="Waktu penyelesaian rata-rata dalam jam"
                  icon={Timer}
                >
                  <ChartContainer config={{ avgTTR: { label: 'Avg TTR (jam)', color: 'hsl(262 83% 58%)' }}} className="h-[280px] w-full">
                    <LineChart data={periodData} accessibilityLayer>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="avgTTR" 
                        stroke="hsl(262 83% 58%)" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(262 83% 58%)', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </ChartCard>

                
                <ChartCard 
                  title="Distribusi per Jam" 
                  description="Jumlah tiket berdasarkan jam pembuatan"
                  icon={Clock}
                >
                  <ChartContainer config={{ count: { label: 'Jumlah Tiket', color: 'hsl(var(--primary))' }}} className="h-[280px] w-full">
                    <BarChart data={hourlyData} accessibilityLayer>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                      <XAxis 
                        dataKey="hour" 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        interval={2}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="count" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                      />
                    </BarChart>
                  </ChartContainer>
                </ChartCard>
              </div>
            </TabsContent>

            
            <TabsContent value="distribution" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                
                <ChartCard 
                  title="Tiket per Severity" 
                  description="Distribusi tiket berdasarkan severity"
                  icon={PieChart}
                >
                  <div className="flex flex-col items-center">
                    <ChartContainer config={pieChartConfig} className="h-[320px] w-full">
                      <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        
                      </RechartsPieChart>
                    </ChartContainer>

                    
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2">
                      {categoryData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full ring-1 ring-border" 
                            style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} 
                          />
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.name} <span className="text-xs opacity-70">({item.value})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>

                
                <ChartCard 
                  title="Tiket per Status" 
                  description="Distribusi tiket berdasarkan status penanganan"
                  icon={TrendingUp}
                >
                  <div className="flex flex-col items-center">
                    <ChartContainer config={statusChartConfig} className="h-[320px] w-full">
                      <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={3}
                          dataKey="value"
                          nameKey="name"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ChartContainer>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2">
                      {statusData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full ring-1 ring-border" 
                            style={{ backgroundColor: item.fill }} 
                          />
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.name} <span className="text-xs opacity-70">({item.value})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>
              </div>
              
              
              <div className="grid lg:grid-cols-2 gap-6">
                 
                <ChartCard 
                  title="Sifat Perbaikan" 
                  description="Permanen vs Temporary"
                  icon={Wrench}
                >
                  <div className="flex flex-col items-center">
                    <ChartContainer config={{}} className="h-[250px] w-full">
                      <RechartsPieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie
                          data={sifatPerbaikanData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                        >
                          {sifatPerbaikanData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ChartContainer>

                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-2">
                      {sifatPerbaikanData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full ring-1 ring-border" 
                            style={{ backgroundColor: item.fill }} 
                          />
                          <span className="text-sm font-medium text-muted-foreground">
                            {item.name} <span className="text-xs opacity-70">({item.value})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>

                
                <ChartCard 
                  title="Site Impact" 
                  description="Distribusi berdasarkan site terdampak"
                  icon={Globe}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                     {impactData.map((item, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors text-center">
                           <span className="text-xl font-bold text-primary mb-1">{item.value}</span>
                           <span className="text-xs font-medium text-muted-foreground line-clamp-2 leading-tight" title={item.name}>
                             {item.name}
                           </span>
                        </div>
                     ))}
                  </div>
                </ChartCard>
              </div>

              <motion.div variants={itemVariants}>
                <Card className="overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-card to-muted/20">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 ring-1 ring-blue-500/20 shadow-sm">
                          <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-0.5">
                          <CardTitle className="text-base font-bold tracking-tight">
                            Top 5 Datek
                          </CardTitle>
                          <CardDescription className="text-xs text-muted-foreground/80">
                            Distribusi tiket berdasarkan data teknis
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/50 border border-border/50 shadow-sm backdrop-blur-sm">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Most Frequent
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pl-2">
                    <ChartContainer config={datekChartConfig} className="h-[350px] w-full">
                      <BarChart
                        accessibilityLayer
                        data={datekData}
                        layout="vertical"
                        margin={{ left: -35, right: 10, top: 0, bottom: 0 }}
                        barSize={24}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/30" />
                        <YAxis
                          dataKey="name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                          width={140}
                          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                        />
                        <XAxis type="number" hide />
                        <ChartTooltip
                          cursor={{ fill: 'hsl(var(--muted)/0.4)', radius: 4 }}
                          content={
                            <ChartTooltipContent 
                              indicator="line" 
                              className="bg-background/95 backdrop-blur-xl border-border/50 shadow-xl"
                            />
                          }
                        />
                        <Bar
                          dataKey="value"
                          layout="vertical"
                          fill="hsl(var(--primary))"
                          radius={[0, 6, 6, 0]}
                        >
                          <div className="fill-foreground text-xs" />
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </motion.div>

              
              <ChartCard 
                title="Detail per Severity" 
                description="Breakdown tiket berdasarkan severity dan status penyelesaian"
                icon={BarChart3}
              >
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryData.map((cat, index) => {
                    const categoryTickets = filteredTickets.filter(t => t.kategori === cat.category);
                    const closed = categoryTickets.filter(t => t.status === 'CLOSED').length;
                    const onProgress = categoryTickets.filter(t => t.status === 'ONPROGRESS').length;
                    const pending = categoryTickets.filter(t => t.status === 'PENDING' || t.status.startsWith('WAITING')).length;
                    const overdue = categoryTickets.filter(t => t.sisa_ttr_hours < 0 && t.status !== 'CLOSED').length;
                    const percentage = categoryTickets.length > 0 ? Math.round((closed / categoryTickets.length) * 100) : 0;
                    
                    return (
                      <motion.div 
                        key={cat.category} 
                        className="p-4 bg-muted/30 rounded-xl border border-border/50 transition-all hover:shadow-md hover:border-primary/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-sm">{cat.name}</h4>
                            <p className="text-2xl font-bold text-primary mt-1">{cat.value}</p>
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <motion.div 
                                className="h-full bg-emerald-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                              {percentage}%
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              {closed} (Closed)
                            </span>
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Clock className="w-3 h-3" />
                              {onProgress} (Proses)
                            </span>
                            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              <PauseCircle className="w-3 h-3" />
                              {pending} (Pending)
                            </span>
                            {overdue > 0 && (
                              <span className="flex items-center gap-1 text-destructive">
                                <AlertTriangle className="w-3 h-3" />
                                {overdue} (Overdue)
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ChartCard>
            </TabsContent>
          </Tabs>
        </motion.div>

        
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-r from-primary/5 via-card to-primary/5 border-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Avg. Resolution</span>
                </div>
                <p className="text-3xl font-bold">{avgResolutionTime} <span className="text-lg font-normal text-muted-foreground">jam</span></p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-muted-foreground">Tiket/Hari</span>
                </div>
                <p className="text-3xl font-bold">
                  {periodData.length > 0 ? Math.round(filteredTickets.length / periodData.length) : 0}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Percent className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Close Rate</span>
                </div>
                <p className="text-3xl font-bold">
                  {filteredTickets.length > 0 
                    ? Math.round((filteredTickets.filter(t => t.status === 'CLOSED').length / filteredTickets.length) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Pelanggan Aktif</span>
                </div>
                <p className="text-3xl font-bold">{providerData.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Reports;
