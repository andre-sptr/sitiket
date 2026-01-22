import { useState, useEffect, useCallback } from 'react';

export interface Teknisi {
  id: string;
  name: string;
  phone: string;
  area: string;
  isActive: boolean;
}

const defaultTeknisiList: Teknisi[] = [
  { id: '925604', name: 'BASOFI SOPIATNO', phone: '082248728760', area: 'Pekanbaru', isActive: true },
  { id: '19960316', name: 'HARRY KURNIAWAN', phone: '085356360266', area: 'Pekanbaru', isActive: true },
  { id: '19960213', name: 'ABDUL RAFIK', phone: '081270460715', area: 'Pekanbaru', isActive: true },
  { id: '21990067', name: 'AGUNG ADILVA IMAN', phone: '082391877607', area: 'Pekanbaru', isActive: true },
  { id: '24930024', name: 'ANNISA PERMATA SARI', phone: '085212710948', area: 'Pekanbaru', isActive: true },
  { id: '19880069', name: 'ERIC CALOSA SIREGAR', phone: '081267507710', area: 'Pekanbaru', isActive: true },
  { id: '18960235', name: 'KEVIN NAYOMAN', phone: '082170027373', area: 'Pekanbaru', isActive: true },
  { id: '20870146', name: 'SAFRIZAL', phone: '085265404026', area: 'Pekanbaru', isActive: true },
  { id: '20890117', name: 'FIRMANSYAH', phone: '081277887173', area: 'Pekanbaru', isActive: true },
  { id: '20970935', name: 'RIAN MAI FADLY', phone: '082285657871', area: 'Pekanbaru', isActive: true },
  { id: '20930970', name: 'RENDI PERIANTO', phone: '081267291297', area: 'Pekanbaru', isActive: true },
  { id: '25990125', name: 'ANGGI ALFIONAL', phone: '085323907887', area: 'Pekanbaru', isActive: true },
  { id: '22000178', name: 'JANU ANWAR MANIK', phone: '085315024878', area: 'Pekanbaru', isActive: true },
  { id: '25010145', name: 'AIDIL GUNAWAN', phone: '085355729658', area: 'Pekanbaru', isActive: true },
  { id: '22010051', name: 'MUHAMMAD ANDIKA FIKRIANSYAH', phone: '085363249640', area: 'Pekanbaru', isActive: true },
  { id: '18980253', name: 'REZA JUNIELFI', phone: '081371741860', area: 'Pekanbaru', isActive: true },
  { id: '22030032', name: 'KEVIN ISRAEL TAMBUNAN', phone: '081361902566', area: 'Pekanbaru', isActive: true },
  { id: '20880186', name: 'ROMI IRTANTO', phone: '082391515622', area: 'Pekanbaru', isActive: true },
  { id: '19930091', name: 'RESTU RESKIA', phone: '082283508924', area: 'Pekanbaru', isActive: true },
  { id: '18930009', name: 'JUMADI AWAL', phone: '085376846772', area: 'Pekanbaru', isActive: true },
  { id: '20950857', name: 'GUSRI SULITA INDRA', phone: '081274879796', area: 'Pekanbaru', isActive: true },
  { id: '25000012', name: 'DELTA PRATAMA', phone: '082381746572', area: 'Pekanbaru', isActive: true },
  { id: '19920283', name: 'AULIA FIRDAUS SIREGAR', phone: '081260301447', area: 'Pekanbaru', isActive: true },
  { id: '22010052', name: 'HAYKHAL BAGAS', phone: '085363198734', area: 'Pekanbaru', isActive: true },
  { id: '19970012', name: 'RANDI HOSANA', phone: '081276551940', area: 'Pekanbaru', isActive: true },
  { id: '20951052', name: 'IQBAL AZIZ', phone: '082387063413', area: 'Pekanbaru', isActive: true },
  { id: '20961250', name: 'JEPRI PARLINDUNGAN PASARIBU', phone: '081378523765', area: 'Pekanbaru', isActive: true },
  { id: '19970336', name: 'TATANG SUKARNA TARIGAN', phone: '082237852934', area: 'Pekanbaru', isActive: true },
  { id: '20890114', name: 'ANDI SOPANDI', phone: '082275281693', area: 'Pekanbaru', isActive: true },
  { id: '18960154', name: 'ADI JUMAGA SIMANJUNTAK', phone: '082389032291', area: 'Pekanbaru', isActive: true },
  { id: '20950856', name: 'YAN FAISAL PRATAMA', phone: '081261742783', area: 'Pekanbaru', isActive: true },
  { id: '22020065', name: 'MUHAMMAD ROIHAN', phone: '082275719656', area: 'Pekanbaru', isActive: true },
  { id: '20961385', name: 'RAMADHAN MULYADI', phone: '081276460646', area: 'Pekanbaru', isActive: true },
  { id: '19850003', name: 'RENOEL PRADICA', phone: '085271013247', area: 'Pekanbaru', isActive: true },
  { id: '20971455', name: 'AHMAD HABIL', phone: '081270569566', area: 'Pekanbaru', isActive: true },
  { id: '20890253', name: 'RIBUT WAHIDI', phone: '081371730898', area: 'Pekanbaru', isActive: true },
  { id: '20921023', name: 'OKTAVIANUS', phone: '082211631428', area: 'Pekanbaru', isActive: true },
  { id: '19940205', name: 'ADE TRIA PUTRA', phone: '082284274492', area: 'Pekanbaru', isActive: true },
  { id: '22960083', name: 'NOFIYA RANDI', phone: '081364357717', area: 'Pekanbaru', isActive: true },
  { id: '22980100', name: 'YOVAN ALBAR NASUTION', phone: '082269015299', area: 'Pekanbaru', isActive: true },
  { id: '22990118', name: 'JENDRA ALFREDI SINAGA', phone: '085336164216', area: 'Pekanbaru', isActive: true },
  { id: '22010053', name: 'M HAKIM HABIBA', phone: '085271197093', area: 'Pekanbaru', isActive: true },
  { id: '24950042', name: 'ILMI HADINA', phone: '082160152886', area: 'Pekanbaru', isActive: true },
  { id: '24980043', name: 'MELANI', phone: '082285572676', area: 'Pekanbaru', isActive: true },
  { id: '24970057', name: 'SIROJUDDIN TAMIM', phone: '082172226635', area: 'Pekanbaru', isActive: true },
  { id: '24940038', name: 'ZULFADLI', phone: '081261111532', area: 'Pekanbaru', isActive: true },
  { id: '21000081', name: 'DEWA KRISNA PURBA', phone: '081266542851', area: 'Pekanbaru', isActive: true },
  { id: '20971174', name: 'KIKI SATRIYA', phone: '081270356776', area: 'Pekanbaru', isActive: true },
  { id: '22970109', name: 'FEBRY WAHYU RAHMANSYAH', phone: '082288300088', area: 'Pekanbaru', isActive: true },
  { id: '20971215', name: 'FITRA SANDY', phone: '081275082335', area: 'Pekanbaru', isActive: true },
  { id: '20940720', name: 'BERI KURNIAWAN', phone: '081261566830', area: 'Pekanbaru', isActive: true },
  { id: '18940128', name: 'DARIATIN WIDODO', phone: '085356383001', area: 'Pekanbaru', isActive: true },
  { id: '22010118', name: 'MUHAMMAD REZKY ADHA', phone: '085264794073', area: 'Pekanbaru', isActive: true },
  { id: '22010189', name: 'FEBI RIYANTO', phone: '082171934462', area: 'Pekanbaru', isActive: true },
  { id: '19910173', name: 'RICO WARMAN', phone: '082288599291', area: 'Pekanbaru', isActive: true },
  { id: '22010054', name: 'DIMAS RIO SWARDY BINTANG', phone: '085261056674', area: 'Pekanbaru', isActive: true },
  { id: '20980851', name: 'NANDA SAPUTRA', phone: '082285297179', area: 'Pekanbaru', isActive: true },
  { id: '20971458', name: 'RAPIAN SYAHPUTRA', phone: '082385939012', area: 'Pekanbaru', isActive: true },
  { id: '18970012', name: 'RIKSON NAIDI', phone: '081277763446', area: 'Pekanbaru', isActive: true },
  { id: '20920714', name: 'SRI WANDOKO', phone: '085275359558', area: 'Pekanbaru', isActive: true },
  { id: '20941021', name: 'EKO SAPUTRA', phone: '081268499196', area: 'Pekanbaru', isActive: true },
  { id: '19900003', name: 'ARIF MAULANA', phone: '082387382182', area: 'Pekanbaru', isActive: true },
  { id: '18950752', name: 'ERIANTO SERGIO NABABAN', phone: '082390910723', area: 'Pekanbaru', isActive: true },
  { id: '20961386', name: 'FAUZI AFRIAN', phone: '085356132191', area: 'Pekanbaru', isActive: true },
  { id: '20940850', name: 'FERI HANDANI', phone: '085278616661', area: 'Pekanbaru', isActive: true },
  { id: '25970041', name: 'RIZKI RAHMAT ILLAHI', phone: '082283197766', area: 'Pekanbaru', isActive: true },
  { id: '19930236', name: 'TEGUH SULASTYO HADI', phone: '082283557260', area: 'Pekanbaru', isActive: true },
  { id: '25010026', name: 'NOVIARDI WIJAYA', phone: '082114398057', area: 'Pekanbaru', isActive: true },
  { id: '20921025', name: 'SONI JEFRY', phone: '082384881128', area: 'Pekanbaru', isActive: true },
  { id: '18970155', name: 'DONI KURNIADI', phone: '085323354371', area: 'Pekanbaru', isActive: true },
  { id: '18980272', name: 'RENALDI', phone: '085278090437', area: 'Pekanbaru', isActive: true },
  { id: '22000268', name: 'LUCKY ANDREANSYAH', phone: '082259990364', area: 'Pekanbaru', isActive: true },
  { id: '20941057', name: 'YOGI SAPUTRA', phone: '082390700196', area: 'Pekanbaru', isActive: true },
  { id: '20810031', name: 'DINO AFRIANTO', phone: '081363543300', area: 'Pekanbaru', isActive: true },
  { id: '18970049', name: 'DICKY NOVRIANTO', phone: '082285386012', area: 'Pekanbaru', isActive: true },
  { id: '18970244', name: 'MUHAMMAD RIDWAN', phone: '082170065494', area: 'Pekanbaru', isActive: true },
  { id: '20971621', name: 'MUHAMMAD FAJAR Z.', phone: '082299552922', area: 'Pekanbaru', isActive: true },
  { id: '19970312', name: 'DICKY RUARDI', phone: '082386490384', area: 'Pekanbaru', isActive: true },
  { id: '18970245', name: 'YOGI NOVIKO', phone: '082392093557', area: 'Pekanbaru', isActive: true },
  { id: '25060100', name: 'AHMAD PANCA NUR RASYID', phone: '085364594377', area: 'Pekanbaru', isActive: true },
  { id: '20921018', name: 'RAHMAT FAJRI', phone: '085279932950', area: 'Pekanbaru', isActive: true },
  { id: '20980878', name: 'ROMA ANANDA PUTRA', phone: '082385533320', area: 'Pekanbaru', isActive: true },
  { id: '25010144', name: 'FIKRI YASIR', phone: '081267311806', area: 'Pekanbaru', isActive: true },
  { id: '25020044', name: 'RIZKY ADILLAH', phone: '081216992645', area: 'Pekanbaru', isActive: true },
  { id: '25040096', name: 'MUHAMMAD ILHAM FAJAR', phone: '082268497874', area: 'Pekanbaru', isActive: true },
  { id: '20971173', name: 'EDY DARMINTO', phone: '081372608953', area: 'Pekanbaru', isActive: true },
  { id: '20990100', name: 'RISKI TRISTIO. P', phone: '081277579168', area: 'Pekanbaru', isActive: true },
  { id: '866024', name: 'DODI HARFYAN', phone: '082284545038', area: 'Pekanbaru', isActive: true },
  { id: '18870115', name: 'YUDHISTIRA', phone: '081371319177', area: 'Pekanbaru', isActive: true },
  { id: '20950004', name: 'MOH FATKUROJI', phone: '082386103630', area: 'Pekanbaru', isActive: true }
];

const STORAGE_KEY = 'tiketops_teknisi';

export const getTeknisiList = (): Teknisi[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse teknisi data', e);
  }
  return defaultTeknisiList;
};

export const saveTeknisiList = (teknisiList: Teknisi[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teknisiList));
  window.dispatchEvent(new CustomEvent('teknisi-updated'));
};

export const generateTeknisiId = (): string => {
  return `tek-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useTeknisi = () => {
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>(getTeknisiList);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setTeknisiList(getTeknisiList());
    };

    window.addEventListener('teknisi-updated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        handleUpdate();
      }
    });

    const timer = setTimeout(() => setIsLoaded(true), 300);

    return () => {
      window.removeEventListener('teknisi-updated', handleUpdate);
      clearTimeout(timer);
    };
  }, []);

  const refreshTeknisi = useCallback(() => {
    setTeknisiList(getTeknisiList());
  }, []);

  const addTeknisi = useCallback((teknisi: Omit<Teknisi, 'id'>) => {
    const newTeknisi: Teknisi = {
      ...teknisi,
      id: generateTeknisiId(),
    };
    const updated = [...getTeknisiList(), newTeknisi];
    saveTeknisiList(updated);
    setTeknisiList(updated);
    return newTeknisi;
  }, []);

  const updateTeknisi = useCallback((id: string, data: Partial<Omit<Teknisi, 'id'>>) => {
    const current = getTeknisiList();
    const updated = current.map((t) => (t.id === id ? { ...t, ...data } : t));
    saveTeknisiList(updated);
    setTeknisiList(updated);
  }, []);

  const deleteTeknisi = useCallback((id: string) => {
    const current = getTeknisiList();
    const updated = current.filter((t) => t.id !== id);
    saveTeknisiList(updated);
    setTeknisiList(updated);
  }, []);

  const resetToDefault = useCallback(() => {
    saveTeknisiList(defaultTeknisiList);
    setTeknisiList(defaultTeknisiList);
  }, []);

  const activeTeknisi = teknisiList.filter((t) => t.isActive);

  return {
    teknisiList,
    activeTeknisi,
    isLoaded,
    refreshTeknisi,
    addTeknisi,
    updateTeknisi,
    deleteTeknisi,
    resetToDefault,
  };
};

export default useTeknisi;
