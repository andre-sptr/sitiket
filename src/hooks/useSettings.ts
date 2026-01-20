import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AppSettings {
  ttrThresholds: {
    warningHours: number;
    criticalHours: number;
    noUpdateAlertMinutes: number;
    dueSoonHours: number;
  };
  whatsappTemplates: {
    shareTemplate: string;
    updateTemplate: string;
  };
  categoryTtr: {
    low: number;
    minor: number;
    major: number;
    critical: number;
    premium: number;
  };
}

const defaultSettings: AppSettings = {
  ttrThresholds: {
    warningHours: 2,
    criticalHours: 1,
    noUpdateAlertMinutes: 60,
    dueSoonHours: 2,
  },
  categoryTtr: {
    low: 24,
    minor: 16,
    major: 8,
    critical: 4,
    premium: 2,
  },
  whatsappTemplates: {
    shareTemplate: '',
    updateTemplate: '',
  },
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem('tiketops_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultSettings,
        ...parsed,
        ttrThresholds: { ...defaultSettings.ttrThresholds, ...(parsed.ttrThresholds || {}) },
        categoryTtr: { ...defaultSettings.categoryTtr, ...(parsed.categoryTtr || {}) },
        whatsappTemplates: { ...defaultSettings.whatsappTemplates, ...(parsed.whatsappTemplates || {}) },
      };
    }
  } catch (e) {
    console.error('Failed to parse settings', e);
  }
  return defaultSettings;
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tiketops_settings') {
        setSettings(getSettings());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const fetchSettingsFromDb = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('*')
          .single();

        if (data && !error) {
          const dbSettings = {
            ttrThresholds: data.ttr_thresholds as any,
            categoryTtr: data.category_ttr as any,
            whatsappTemplates: data.whatsapp_templates as any,
          };

          localStorage.setItem('tiketops_settings', JSON.stringify(dbSettings));
          
          setSettings(prev => ({
            ...prev,
            ...dbSettings
          }));
        }
      } catch (err) {
        console.error('Auto-fetch settings failed:', err);
      }
    };

    fetchSettingsFromDb();
  }, []);

  const refreshSettings = useCallback(() => {
    setSettings(getSettings());
  }, []);

  return { settings, refreshSettings };
};

export const getTTRStatus = (hours: number, thresholds: AppSettings['ttrThresholds']): 'safe' | 'warning' | 'critical' | 'overdue' => {
  if (hours <= 0) return 'overdue';
  if (hours <= thresholds.criticalHours) return 'critical';
  if (hours <= thresholds.warningHours) return 'warning';
  return 'safe';
};

export const isDueSoon = (hours: number, thresholds: AppSettings['ttrThresholds']): boolean => {
  return hours > 0 && hours <= thresholds.dueSoonHours;
};
