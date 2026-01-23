import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Teknisi {
  id: string;
  name: string;
  phone: string;
  area: string;
  isActive: boolean;
  employeeId: string;
}

export const useTeknisi = () => {
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  const fetchTeknisi = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('teknisi')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedData: Teknisi[] = data.map((t) => ({
          id: t.id,
          name: t.name,
          phone: t.phone || '',
          area: t.area || '',
          isActive: t.is_active,
          employeeId: t.employee_id,
        }));
        setTeknisiList(formattedData);
      }
    } catch (error) {
      console.error('Error fetching teknisi:', error);
      toast({
        title: 'Gagal memuat data',
        description: 'Tidak dapat mengambil data teknisi dari server.',
        variant: 'destructive',
      });
    } finally {
      setIsLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeknisi();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teknisi',
        },
        () => {
          fetchTeknisi();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTeknisi]);

  const refreshTeknisi = useCallback(() => {
    fetchTeknisi();
  }, [fetchTeknisi]);

  const addTeknisi = useCallback(async (teknisi: Omit<Teknisi, 'id'>) => {
    try {
      const { error } = await supabase.from('teknisi').insert([
        {
          name: teknisi.name,
          phone: teknisi.phone,
          area: teknisi.area,
          is_active: teknisi.isActive,
          employee_id: teknisi.employeeId,
        },
      ]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error adding teknisi:', error);
      if (error.code === '23505') {
        throw new Error('NIK/ID Teknisi ini sudah terdaftar. Gunakan NIK lain.');
      }
      throw error;
    }
  }, []);

  const updateTeknisi = useCallback(async (id: string, data: Partial<Omit<Teknisi, 'id'>>) => {
    try {
      const updatePayload: any = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.area !== undefined) updatePayload.area = data.area;
      if (data.isActive !== undefined) updatePayload.is_active = data.isActive;
      if (data.employeeId !== undefined) updatePayload.employee_id = data.employeeId;

      const { error } = await supabase
        .from('teknisi')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating teknisi:', error);
       if (error.code === '23505') {
        throw new Error('NIK/ID Teknisi ini sudah digunakan oleh teknisi lain.');
      }
      throw error;
    }
  }, []);

  const deleteTeknisi = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('teknisi')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting teknisi:', error);
      throw error;
    }
  }, []);

  const resetToDefault = useCallback(async () => {
    toast({
      title: "Aksi tidak tersedia",
      description: "Reset massal tidak disarankan saat menggunakan database online.",
    })
  }, [toast]);

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
