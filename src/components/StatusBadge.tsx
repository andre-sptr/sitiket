import { Badge } from '@/components/ui/badge';
import { TicketStatus, TTRCompliance } from '@/types/ticket';
import { getStatusLabel } from '@/lib/formatters';
import { getSettings, getTTRStatus } from '@/hooks/useSettings';
import { 
  Clock, 
  UserCheck, 
  Loader2, 
  Wrench, 
  Package, 
  Lock, 
  Users, 
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: TicketStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const statusVariantMap: Record<TicketStatus, 'open' | 'assigned' | 'onprogress' | 'pending' | 'temporary' | 'waiting' | 'closed'> = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  ONPROGRESS: 'onprogress',
  PENDING: 'pending',
  TEMPORARY: 'temporary',
  WAITING_MATERIAL: 'waiting',
  WAITING_ACCESS: 'waiting',
  WAITING_COORDINATION: 'waiting',
  CLOSED: 'closed',
};

const statusIconMap: Record<TicketStatus, React.ReactNode> = {
  OPEN: <Clock className="w-3 h-3" />,
  ASSIGNED: <UserCheck className="w-3 h-3" />,
  ONPROGRESS: <Loader2 className="w-3 h-3 animate-spin" />,
  PENDING: <Clock className="w-3 h-3" />,
  TEMPORARY: <Wrench className="w-3 h-3" />,
  WAITING_MATERIAL: <Package className="w-3 h-3" />,
  WAITING_ACCESS: <Lock className="w-3 h-3" />,
  WAITING_COORDINATION: <Users className="w-3 h-3" />,
  CLOSED: <CheckCircle2 className="w-3 h-3" />,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true, size = 'default' }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
    >
      <Badge 
        variant={statusVariantMap[status]} 
        className={`gap-1.5 font-medium transition-all duration-200 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      >
        {showIcon && (
          <motion.span
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            {statusIconMap[status]}
          </motion.span>
        )}
        {getStatusLabel(status)}
      </Badge>
    </motion.div>
  );
};

interface ComplianceBadgeProps {
  compliance: TTRCompliance;
  size?: 'sm' | 'default';
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ compliance, size = 'default' }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Badge 
        variant={compliance === 'COMPLY' ? 'comply' : 'notcomply'}
        className={`gap-1.5 font-medium transition-all duration-200 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      >
        {compliance === 'COMPLY' ? (
          <motion.span
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle2 className="w-3 h-3" />
          </motion.span>
        ) : (
          <motion.span
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <AlertTriangle className="w-3 h-3" />
          </motion.span>
        )}
        {compliance}
      </Badge>
    </motion.div>
  );
};

interface TTRBadgeProps {
  hours: number;
  size?: 'sm' | 'default';
}

export const TTRBadge: React.FC<TTRBadgeProps> = ({ hours, size = 'default' }) => {
  const settings = getSettings();
  const ttrStatus = getTTRStatus(hours, settings.ttrThresholds);
  
  const variantMap: Record<string, 'success' | 'warning' | 'critical'> = {
    safe: 'success',
    warning: 'warning',
    critical: 'critical',
    overdue: 'critical',
  };

  const formatHours = (h: number) => {
    const absH = Math.abs(h);
    const hrs = Math.floor(absH);
    const mins = Math.round((absH - hrs) * 60);
    const sign = h < 0 ? '-' : '';
    return `${sign}${hrs}j ${mins}m`;
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, delay: 0.15 }}
      whileHover={{ scale: 1.05 }}
    >
      <Badge 
        variant={variantMap[ttrStatus]}
        className={`font-mono gap-1.5 font-medium transition-all duration-200 ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} ${ttrStatus === 'overdue' ? 'animate-pulse' : ''}`}
      >
        <motion.span
          animate={ttrStatus === 'overdue' ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Clock className="w-3 h-3" />
        </motion.span>
        {formatHours(hours)}
        {ttrStatus === 'overdue' && (
          <motion.span 
            className="ml-0.5"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            OVERDUE
          </motion.span>
        )}
      </Badge>
    </motion.div>
  );
};
