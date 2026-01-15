export interface AppSettingsDB {
  id: string;
  ttr_thresholds: {
    warningHours: number;
    criticalHours: number;
    noUpdateAlertMinutes: number;
    dueSoonHours: number;
  };
  category_ttr: {
    premium: number;
    critical: number;
    major: number;
    minor: number;
    low: number;
  };
  whatsapp_templates: {
    shareTemplate: string;
    updateTemplate: string;
  };
  updated_at: string;
}

export interface DropdownOptionDB {
  option_key: string;
  label: string;
  field_values: string[];
  group_name: string;
  updated_at: string;
}