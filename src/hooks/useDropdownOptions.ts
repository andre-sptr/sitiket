import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DropdownOptions {
  hsa: string[];
  sto: string[];
  odc: string[];
  stakeHolder: string[];
  jenisPelanggan: string[];
  kategori: string[];
  losNonLos: string[];
  classSite: string[];
  tim: string[];
  
  statusTiket: string[];
  compliance: string[];
  permanenTemporer: string[];
  statusAlatBerat: string[];
  segmen: string[];
  penyebabGangguan: string[];
  perbaikanGangguan: string[];
  kendala: string[];
}

export const hsaToStoMap: Record<string, string[]> = {
  'ARENGKA': ['ARK'],
  'BUKIT RAYA': ['BKR', 'BKN', 'UBT', 'PPN', 'SAK', 'SEA', 'SGP'],
  'DUMAI': ['DUM', 'BAG', 'BAS', 'SLJ', 'DRI', 'BGU'],
  'PANGKALAN KERINCI': ['PKR', 'RBI', 'PWG', 'SOK', 'MIS'],
  'PEKANBARU': ['PBR'],
  'RENGAT': ['RGT', 'TBH', 'AMK', 'TAK', 'PMB', 'KLE'], 
};

export const defaultDropdownOptions: DropdownOptions = {
  hsa: ['ARENGKA', 'BUKIT RAYA', 'DUMAI', 'PANGKALAN KERINCI', 'PEKANBARU', 'RENGAT'],
  sto: ['ARK', 'BKR', 'BKN', 'UBT', 'PPN', 'SAK', 'SEA', 'SGP', 'DUM', 'BAG', 'BAS', 'SLJ', 'DRI', 'BGU', 'PKR', 'RBI', 'PWG', 'SOK', 'MIS', 'PBR', 'RGT', 'TBH', 'AMK', 'TAK', 'PMB', 'KLE'],
  odc: [],
  stakeHolder: ['TLKM', 'MTEL', 'LA', 'SPBU', 'UMT', 'ALFAMART', 'INDOMARET', 'KIMIA FARMA'],
  jenisPelanggan: ['DATIN', 'FTM', 'GAMAS', 'HSI', 'INDIBIZ', 'LA', 'MTEL', 'NE', 'ODC', 'OLO', 'POTS', 'SDWAN', 'SIPTRUNK', 'SPBU', 'TSEL', 'UMT', 'WICO', 'WMS LITE', 'WMS REGULER'],
  
  kategori: ['LOW[24]', 'MINOR[16]', 'MAJOR[8]', 'CRITICAL[4]', 'PREMIUM[2]', 'OLO[4]', 'OLO GAMAS[7]', 'OLO QUALITY[7]', 'CNQ', 'HSI RESELLER[6]', 'HSI RESELLER[36]', 'POTS[6]', 
    'INDIBIZ[4]', 'INDIBIZ[24]', 'SIPTRUNK[14]', 'DATIN K2[3.6]', 'DATIN K3[7.2]', 'WICO[12]', 'WMS LITE[3]', 'WMS REGULER[3]', 'LA[5]', 'MTEL[4]', 'NE DOWN[3]', 'SPBU[2]', 'MONET', 
    'SQM', 'MANUAL', 'AP DOWN', 'MOJANG GAUL', 'VALINS', 'GCU', 'COMO', 'REVITALISASI', 'VALIDASI', 'FEEDER[10]', 'DISTRIBUSI[4]', 'ODC[18]', 'ODP[3]', 'UMT[4]', 'PATROLI', 
    'PREVENTIVE', 'INVENTORY', 'MS SDWAN', 'PSB SDWAN'],

  losNonLos: ['LOS', 'NON LOS', 'UNSPEC'],
  classSite: ['Platinum', 'Diamond', 'Gold', 'Silver', 'Bronze', 'Premium'],
  tim: ['SQUAT-A', 'SQUAT-B', 'MTC'],
  
  statusTiket: ['OPEN', 'ASSIGNED', 'ONPROGRESS', 'PENDING', 'WAITING_MATERIAL', 'WAITING_ACCESS', 'WAITING_COORDINATION', 'CLOSED'],
  compliance: ['COMPLY', 'NOT COMPLY'],
  permanenTemporer: ['PERMANEN', 'TEMPORARY'],
  statusAlatBerat: ['DI LOKASI DAN BEROPERASI', 'STOP TETAPI DI LOKASI', 'TIDAK ADA ALBER DI LOKASI'],
  segmen: ['ACCESS POINT', 'BACKBONE', 'DISTRIBUSI', 'DROPCORE', 'FEEDER', 'FTM', 'HYBRID', 'IKR', 'METRO', 'NPU', 'ODC', 'ODP', 'OLT', 'ONT', 'OTB', 'PELANGGAN', 'POE', 'POTS', 'RBS', 'STB', 'SWITCH', 'TIANG', 'NO ACTION', 'EDC', 'ROUTER', 'ATG', 'PC POS', 'NO IDENTIFIED'],
  penyebabGangguan: [
    'ACCESS POINT | CONFIG', 'ACCESS POINT | DOWN', 'ACCESS POINT | HANG', 'ACCESS POINT | HILANG', 'ACCESS POINT | RUSAK', 'ACCESS POINT | SAMBAR PETIR', 'ACCESS POINT | TERBAKAR',
    'BACKBONE | FO CUT | DIMAKAN HEWAN', 'BACKBONE | FO CUT | FORCE MAJEURE | BANJIR', 'BACKBONE | FO CUT | FORCE MAJEURE | LONGSOR', 'BACKBONE | FO CUT | FORCE MAJEURE | TERBAKAR', 'BACKBONE | FO CUT | FORCE MAJEURE | TERSAMBAR PETIR', 'BACKBONE | FO CUT | PERMANENISASI', 'BACKBONE | FO CUT | PIHAK KE 3 [INSTANSI]', 'BACKBONE | FO CUT | PIHAK KE 3 [WARGA]', 'BACKBONE | FO CUT | TERENCANA [QE]', 'BACKBONE | FO CUT | TERTABRAK MOBIL', 'BACKBONE | FO CUT | VANDALISME',
    'DISTRIBUSI | FO CUT | BENANG LAYANG - LAYANG', 'DISTRIBUSI | FO CUT | DEGRADASI CORE DI JOIN', 'DISTRIBUSI | FO CUT | DEGRADASI TEMPORER', 'DISTRIBUSI | FO CUT | DIMAKAN HEWAN', 'DISTRIBUSI | FO CUT | FORCE MAJEURE | BANJIR', 'DISTRIBUSI | FO CUT | FORCE MAJEURE | LONGSOR', 'DISTRIBUSI | FO CUT | FORCE MAJEURE | POHON TUMBANG', 'DISTRIBUSI | FO CUT | FORCE MAJEURE | TERBAKAR', 'DISTRIBUSI | FO CUT | FORCE MAJEURE | TERSAMBAR PETIR', 'DISTRIBUSI | FO CUT | PERMANENISASI', 'DISTRIBUSI | FO CUT | PIHAK KE 3 [INSTANSI]', 'DISTRIBUSI | FO CUT | PIHAK KE 3 [WARGA]', 'DISTRIBUSI | FO CUT | TERENCANA [QE]', 'DISTRIBUSI | FO CUT | TERTABRAK MOBIL', 'DISTRIBUSI | FO CUT | VANDALISME', 'DISTRIBUSI | FO US | DEGRADASI CORE DI JOIN', 'DISTRIBUSI | FO US | DEGRADASI TEMPORER',
    'DROPCORE | FO CUT | BENANG LAYANG - LAYANG', 'DROPCORE | FO CUT | DIMAKAN HEWAN', 'DROPCORE | FO CUT | FORCE MAJEURE | LONGSOR', 'DROPCORE | FO CUT | FORCE MAJEURE | POHON TUMBANG', 'DROPCORE | FO CUT | FORCE MAJEURE | TERBAKAR', 'DROPCORE | FO CUT | FORCE MAJEURE | TERSAMBAR PETIR', 'DROPCORE | FO CUT | PIHAK KE 3 [INSTANSI]', 'DROPCORE | FO CUT | PIHAK KE 3 [WARGA]', 'DROPCORE | FO CUT | TERTABRAK MOBIL', 'DROPCORE | FO CUT | VANDALISME', 'DROPCORE | FO US | BENDING', 'DROPCORE | FO US | DEGRADASI CORE SAMBUNGAN', 'DROPCORE | FO US | DEGRADASI SOC', 'DROPCORE | FO US | TARIKAN JAUH',
    'FEEDER | FO CUT | DEGRADASI CORE DI JOIN', 'FEEDER | FO CUT | DEGRADASI TEMPORER', 'FEEDER | FO CUT | DIMAKAN HEWAN', 'FEEDER | FO CUT | FORCE MAJEURE | BANJIR', 'FEEDER | FO CUT | FORCE MAJEURE | LONGSOR', 'FEEDER | FO CUT | FORCE MAJEURE | POHON TUMBANG', 'FEEDER | FO CUT | FORCE MAJEURE | TERBAKAR', 'FEEDER | FO CUT | FORCE MAJEURE | TERSAMBAR PETIR', 'FEEDER | FO CUT | PERMANENISASI', 'FEEDER | FO CUT | PIHAK KE 3 [INSTANSI]', 'FEEDER | FO CUT | PIHAK KE 3 [WARGA]', 'FEEDER | FO CUT | TERENCANA [QE]', 'FEEDER | FO CUT | TERTABRAK MOBIL', 'FEEDER | FO CUT | VANDALISME', 'FEEDER | FO US | DEGRADASI CORE DI JOIN', 'FEEDER | FO US | DEGRADASI TEMPORER',
    'FTM | FO CUT | DEGRADASI CONNECTOR', 'FTM | FO CUT | DEGRADASI PIGTAIL', 'FTM | FO CUT | PATCHCORE DIMAKAN HEWAN', 'FTM | FO CUT | PATCHCORE RUSAK', 'FTM | FO CUT | PIGTAIL DIMAKAN HEWAN', 'FTM | FO US | CORE BENDING', 'FTM | FO US | DEGRADASI CONNECTOR', 'FTM | FO US | PATCHCORE BENDING',
    'HYBRID | MTEL | FO CUT', 'HYBRID | TBG | FO CUT',
    'IKR | FO CUT | DEGRADASI CONNECTOR OTP', 'IKR | FO CUT | DEGRADASI CONNECTOR PREKSO', 'IKR | FO CUT | PATCHCORE DIMAKAN HEWAN', 'IKR | FO CUT | PUTUS', 'IKR | FO US | DEGRADASI CONNECTOR OTP', 'IKR | FO US | DEGRADASI CONNECTOR PREKSO', 'IKR | FO US | TIDAK RAPI', 'IKR | LAN CONNECTOR RUSAK', 'IKR | LAN PUTUS',
    'METRO | DOWN | CME', 'METRO | DOWN | FORCE MAJEURE', 'METRO | DOWN | FRAME RUSAK', 'METRO | DOWN | LOGIC', 'METRO | DOWN | MCB RUSAK', 'METRO | DOWN | MCB TRIP', 'METRO | DOWN | MODULE RUSAK', 'METRO | DOWN | PLN DOWN', 'METRO | DOWN | PORT RUSAK', 'METRO | DOWN | SFP HANG', 'METRO | DOWN | VANDALISME', 'METRO | FO CUT | PATCHCORE DIMAKAN HEWAN', 'METRO | FO CUT | PATCHCORE RUSAK', 'METRO | FO US | PATCHCORE BENDING',
    'NPU | DOWN | ADAPTOR RUSAK', 'NPU | DOWN | MATOT', 'NPU | DOWN | RUSAK',
    'ODC | FO CUT | DEGRADASI CONNECTOR', 'ODC | FO CUT | DEGRADASI PIGTAIL', 'ODC | FO CUT | DEGRADASI SPLITER 1:4', 'ODC | FO CUT | DISTRIBUSI DIMAKAN HEWAN', 'ODC | FO CUT | FEEDER DIMAKAN HEWAN', 'ODC | FO CUT | PATCHCORE DIMAKAN HEWAN', 'ODC | FO CUT | PATCHCORE RUSAK', 'ODC | FO CUT | PIGTAIL DIMAKAN HEWAN', 'ODC | FO CUT | SPLITER 1:4 RUSAK', 'ODC | FO US | CORE BENDING', 'ODC | FO US | DEGRADASI CONNECTOR', 'ODC | FO US | DEGRADASI SPLITER 1:4',
    'ODP | FO CUT | CORE DISTRIBUSI PUTUS', 'ODP | FO CUT | DEGRADASI CONNECTOR', 'ODP | FO CUT | DEGRADASI PIGTAIL', 'ODP | FO CUT | DEGRADASI SPLITER 1:8', 'ODP | FO CUT | PIGTAIL DIMAKAN HEWAN', 'ODP | FO CUT | SOC RUSAK', 'ODP | FO CUT | SPLITER 1:8 RUSAK', 'ODP | FO US | CORE BENDING', 'ODP | FO US | DEGRADASI CONNECTOR', 'ODP | FO US | DEGRADASI SOC', 'ODP | FO US | DEGRADASI SPLITER 1:8',
    'OLT | DOWN | CME', 'OLT | DOWN | FORCE MAJEURE', 'OLT | DOWN | FRAME RUSAK', 'OLT | DOWN | LOGIC', 'OLT | DOWN | MCB RUSAK', 'OLT | DOWN | MCB TRIP', 'OLT | DOWN | MODULE RUSAK', 'OLT | DOWN | PATCHCORE DIMAKAN HEWAN', 'OLT | DOWN | PATCHCORE RUSAK', 'OLT | DOWN | PLN DOWN', 'OLT | DOWN | PORT RUSAK', 'OLT | DOWN | SFP HANG', 'OLT | DOWN | VANDALISME', 'OLT | FO US | PATCHCORE BENDING',
    'ONT | DOWN | ADAPTOR RUSAK', 'ONT | DOWN | ATTENUATOR', 'ONT | DOWN | LOGIC', 'ONT | DOWN | MCB RUSAK', 'ONT | DOWN | MCB TRIP', 'ONT | DOWN | ONT RUSAK', 'ONT | DOWN | PORT RUSAK', 'ONT | DOWN | SFP HANG', 'ONT | DOWN | VANDALISME', 'ONT | FO CUT | PATCHCORE DIMAKAN HEWAN', 'ONT | FO CUT | PATCHCORE PUTUS', 'ONT | FO CUT | PATCHCORE RUSAK', 'ONT | FO US | DEGRADASI PATCHCORE', 'ONT | FO US | PATCHCORE RUSAK', 'ONT | INTERNET LELET', 'ONT | PINDAH', 'ONT | WIFI TIDAK TERHUBUNG',
    'OTB | FO CUT | DEGRADASI CONNECTOR', 'OTB | FO CUT | DEGRADASI PIGTAIL', 'OTB | FO CUT | PATCHCORE DIMAKAN HEWAN', 'OTB | FO CUT | PATCHCORE RUSAK', 'OTB | FO CUT | PIGTAIL DIMAKAN HEWAN', 'OTB | FO US | CORE BENDING', 'OTB | FO US | DEGRADASI CONNECTOR',
    'PELANGGAN | BILLING ISOLIR', 'PELANGGAN | PERANGKAT RUSAK', 'PELANGGAN | PESAWAT TELPON RUSAK',
    'POE | HANG', 'POE | HILANG', 'POE | RUSAK', 'POE | SAMBAR PETIR', 'POE | TERBAKAR',
    'POTS | VOICE-VOICE',
    'RBS | DOWN | ADAPTOR RUSAK', 'RBS | DOWN | PORT RUSAK', 'RBS | DOWN | RUSAK', 'RBS | DOWN | SFP HANG',
    'STB | ADAPTOR RUSAK', 'STB | ERROR', 'STB | REMOT RUSAK', 'STB | RUSAK', 'STB | STB BLANK', 'STB | STB HILANG', 'STB | STB TIDAK TERHUBUNG',
    'SWITCH | DOWN | ADAPTOR RUSAK', 'SWITCH | DOWN | PORT RUSAK', 'SWITCH | DOWN | RUSAK', 'SWITCH | DOWN | SFP HANG',
    'TIANG | AKTIVITAS PIHAK KE 3', 'TIANG | FORCE MAJEURE', 'TIANG | HILANG', 'TIANG | MIRING', 'TIANG | PATAH', 'TIANG | RUBUH', 'TIANG | TABRAK KENDARAAN',
    'UNKNOW',
    'EDC | RUSAK',
    'ROUTER | CONFIG', 'ROUTER | DOWN', 'ROUTER | HANG', 'ROUTER | HILANG', 'ROUTER | RUSAK', 'ROUTER | SAMBAR PETIR', 'ROUTER | TERBAKAR',
    'ATG | RUSAK', 'ATG | PROB RUSAK', 'ATG | CONSOLE RUSAK',
    'PC POS | CONFIG', 'PC POS | DOWN', 'PC POS | HANG', 'PC POS | HILANG', 'PC POS | RUSAK', 'PC POS | SAMBAR PETIR', 'PC POS | TERBAKAR',
    'EDC | CONFIG',
    'ODP | RUSAK',
    'DISTRIBUSI | BRANCHING | FO CUT | LAIN - LAIN',
    'DISTRIBUSI | NORMALISASI',
    'ODC | BENJAR / UPGRADE',
    'ODP | BENJAR / UPGRADE'
  ],
  perbaikanGangguan: ['PERANGKAT | RECOUNFIG', 'NO ACTION', 'PELANGGAN | KELISTRIKAN', 'PERANGKAT | DIMATIKAN', 'PERANGKAT | DISMANTLE', 'PLN | PLN UP', 'PERANGKAT | GANTI', 'KABEL | GANTI', 'KABEL | SAMBUNG ULANG', 'KABEL | PERAPIAN', 'KABEL | OMSET', 'CONNECTOR | GANTI', 'CONNECTOR | PEMBERSIHAN', 'PIGTAIL | GANTI', 'PIGTAIL | SAMBUNG ULANG', 'LAN | GANTI RJ11', 'LAN | GANTI', 'LAN | SAMBUNG ULANG', 'CME | GANTI BATERAI', 'CME | PERBAIKAN KELISTRIKAN', 'FRAME | GANTI', 'MCB | GANTI', 'MCB | MCB ON', 'MODULE | GANTI', 'MODULE | PINDAH', 'PORT | PINDAH', 'SFP | GANTI', 'SFP | PINDAH', 'SFP | PLUG UNPLUG', 'ADAPTOR | GANTI', 'SPLITER 1:4 | GANTI', 'SPLITER 1:4 | SAMBUNG ULANG', 'SPLITER 1:4 | PERAPIAN', 'SPLITER 1:8 | GANTI', 'SPLITER 1:8 | SAMBUNG ULANG', 'SOC | GANTI', 'SOC | PEMBERSIHAN', 'SPLITER 1:8 | PERAPIAN', 'ATTENUATOR | GANTI', 'ATTENUATOR | LEPAS', 'ATTENUATOR | PASANG', 'ONT | RECOUNFIG', 'PORT | PLUG UNPLUG', 'PERANGKAT | RESTART', 'PERANGKAT | PINDAH', 'PERANGKAT | SETTING ULANG', 'BILLING | BUKA ISOLIR', 'GANTI REMOT', 'LAN | PLUG UNPLUG', 'TIANG | PINDAH', 'TIANG | GANTI', 'TIANG | PELURUSAN', 'TIANG | TANAM KEMBALI', 'UNKNOW | NO ACTION', 'PINDAH DATEK', 'ODP | NORMALISASI', 'ODP | GANTI', 'ODC | BENJAR / UPGRADE', 'ODP | BENJAR / UPGRADE'],
  kendala: [],
};

const STORAGE_KEY = 'tiketops_dropdown_options';

export const getDropdownOptions = (): DropdownOptions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultDropdownOptions, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse dropdown options', e);
  }
  return defaultDropdownOptions;
};

export const saveDropdownOptions = (options: DropdownOptions): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  window.dispatchEvent(new CustomEvent('dropdown-options-updated'));
};

export const useDropdownOptions = () => {
  const [options, setOptions] = useState<DropdownOptions>(getDropdownOptions);

  useEffect(() => {
    const fetchFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from('dropdown_options')
          .select('*');

        if (error) {
          console.error('Error fetching dropdowns:', error);
          return;
        }

        if (data && data.length > 0) {
          setOptions(prevOptions => {
            const mergedOptions = { ...prevOptions };

            data.forEach((item: any) => {
              if (item.option_key && item.field_values) {
                (mergedOptions as any)[item.option_key] = item.field_values;
              }
            });

            saveDropdownOptions(mergedOptions);
            return mergedOptions;
          });
        }
      } catch (err) {
        console.error('Unexpected error fetching dropdowns:', err);
      }
    };

    fetchFromSupabase();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setOptions(getDropdownOptions());
    };

    window.addEventListener('dropdown-options-updated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener('dropdown-options-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const refreshOptions = useCallback(() => {
    setOptions(getDropdownOptions());
  }, []);

  const updateOptions = useCallback((newOptions: DropdownOptions) => {
    saveDropdownOptions(newOptions);
    setOptions(newOptions);
  }, []);

  return { options, refreshOptions, updateOptions };
};

export const dropdownLabels: Record<keyof DropdownOptions, string> = {
  hsa: 'HSA (Head of Service Area)',
  sto: 'STO (Sentral Telepon Otomat)',
  odc: 'ODC',
  stakeHolder: 'Stake Holder',
  jenisPelanggan: 'Jenis Pelanggan',
  kategori: 'Severity',
  losNonLos: 'LOS / Non LOS',
  classSite: 'Class Site',
  tim: 'Unit',
  statusTiket: 'Status Tiket',
  compliance: 'Compliance',
  permanenTemporer: 'Permanen / Temporer',
  statusAlatBerat: 'Status Alat Berat',
  segmen: 'Segmen Gangguan',
  penyebabGangguan: 'Penyebab Gangguan',
  perbaikanGangguan: 'Perbaikan Gangguan',
  kendala: 'Kendala',
};

export const optionGroups = {
  'Import Tiket': ['hsa', 'sto', 'odc', 'stakeHolder', 'jenisPelanggan', 'kategori', 'losNonLos', 'classSite', 'tim'] as (keyof DropdownOptions)[],
  'Update Tiket': ['statusTiket', 'compliance', 'permanenTemporer', 'statusAlatBerat', 'segmen', 'penyebabGangguan', 'perbaikanGangguan', 'kendala'] as (keyof DropdownOptions)[],
};