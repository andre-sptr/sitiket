import { Ticket, ProgressUpdate, TicketStatus, TTRCompliance } from '@/types/ticket';
import { TicketWithProgress, ProgressUpdateRow } from '@/hooks/useTickets';

export const mapDbTicketToTicket = (dbTicket: TicketWithProgress): Ticket => {
  const jamOpen = new Date(dbTicket.jam_open);
  const targetHours = dbTicket.ttr_target_hours || 0;
  const deadline = jamOpen.getTime() + (targetHours * 60 * 60 * 1000); 
  const now = new Date().getTime();
  const dynamicSisaHours = (deadline - now) / (1000 * 60 * 60);
  
  const finalSisaTtrHours = dbTicket.status === 'CLOSED' 
    ? (dbTicket.sisa_ttr_hours || 0) 
    : dynamicSisaHours;

  let finalCompliance = dbTicket.ttr_compliance || 'COMPLY';
  if (dbTicket.status !== 'CLOSED' && finalSisaTtrHours < 0) {
    finalCompliance = 'NOT COMPLY';
  }

  return {
    id: dbTicket.id,
    provider: dbTicket.provider || 'TSEL',
    stakeHolder: dbTicket.stake_holder || undefined,
    hsa: dbTicket.hsa || undefined,
    sto: dbTicket.sto || undefined,
    odc: dbTicket.odc || undefined,
    datek: dbTicket.datek || undefined,
    losNonLos: dbTicket.los_non_los || undefined,
    siteImpact: dbTicket.site_impact || undefined,
    classSite: dbTicket.class_site || undefined,
    tacc: dbTicket.tacc || undefined,
    tim: dbTicket.tim || undefined,
    incNumbers: dbTicket.inc_numbers,
    idPelanggan: dbTicket.id_pelanggan || undefined,
    namaPelanggan: dbTicket.nama_pelanggan || undefined,
    siteCode: dbTicket.site_code,
    siteName: dbTicket.site_name,
    kategori: dbTicket.kategori || '',
    lokasiText: dbTicket.lokasi_text || '',
    latitude: dbTicket.latitude || undefined,
    longitude: dbTicket.longitude || undefined,
    jarakKmRange: dbTicket.jarak_km_range?.toString() || undefined,
    ttrCompliance: finalCompliance as TTRCompliance,
    penyebabNotComply: dbTicket.penyebab_not_comply || undefined,
    jamOpen: jamOpen,
    ttrTargetHours: dbTicket.ttr_target_hours,
    maxJamClose: new Date(dbTicket.max_jam_close),
    ttrRealHours: dbTicket.ttr_real_hours || undefined,
    sisaTtrHours: finalSisaTtrHours,
    status: (dbTicket.status || 'OPEN') as TicketStatus,
    isPermanent: dbTicket.is_permanent,
    penyebab: dbTicket.penyebab || undefined,
    segmen: dbTicket.segmen || undefined,
    incGamas: dbTicket.inc_gamas || undefined,
    kjd: dbTicket.kjd || undefined,
    teknisiList: dbTicket.teknisi_list || undefined,
    createdByAdmin: dbTicket.created_by || '',
    createdAt: new Date(dbTicket.created_at),
    updatedAt: new Date(dbTicket.updated_at),
    rawTicketText: dbTicket.raw_ticket_text || undefined,
    progressUpdates: dbTicket.progress_updates?.map(mapDbProgressToProgress) || [],
    perbaikan: dbTicket.perbaikan || undefined,
    statusAlatBerat: dbTicket.status_alat_berat || undefined,
    timelineDispatch: dbTicket.timeline_dispatch || undefined,
    timelinePrepare: dbTicket.timeline_prepare || undefined,
    timelineOtw: dbTicket.timeline_otw || undefined,
    timelineIdentifikasi: dbTicket.timeline_identifikasi || undefined,
    timelineBreak: dbTicket.timeline_break || undefined,
    timelineSplicing: dbTicket.timeline_splicing || undefined,
    kendala: dbTicket.kendala || undefined,
    atbt: dbTicket.atbt || undefined,
    tiketEksternal: dbTicket.tiket_eksternal || undefined,
  };
};

export const mapDbProgressToProgress = (pu: ProgressUpdateRow): ProgressUpdate => ({
  id: pu.id,
  ticketId: pu.ticket_id,
  timestamp: new Date(pu.timestamp),
  source: pu.source as 'HD' | 'ADMIN' | 'SYSTEM',
  message: pu.message,
  statusAfterUpdate: pu.status_after_update || undefined,
  attachments: pu.attachments || undefined,
  createdBy: pu.created_by || '',
});

export const mapTicketToDbInsert = (ticket: Partial<Ticket>, userId?: string) => ({
  provider: ticket.provider || 'TSEL',
  stakeHolder: ticket.stakeHolder || undefined,
  hsa: ticket.hsa || undefined,
  inc_numbers: ticket.incNumbers || [],
  id_pelanggan: ticket.idPelanggan,
  nama_pelanggan: ticket.namaPelanggan,
  site_code: ticket.siteCode || '',
  site_name: ticket.siteName || '',
  kategori: ticket.kategori || '',
  lokasi_text: ticket.lokasiText || '',
  latitude: ticket.latitude,
  longitude: ticket.longitude,
  jarak_km_range: ticket.jarakKmRange,
  ttr_compliance: ticket.ttrCompliance || 'COMPLY',
  penyebab_not_comply: ticket.penyebabNotComply,
  jam_open: ticket.jamOpen?.toISOString() || new Date().toISOString(),
  ttr_target_hours: ticket.ttrTargetHours || 8760,
  max_jam_close: ticket.maxJamClose?.toISOString() || new Date().toISOString(),
  ttr_real_hours: ticket.ttrRealHours,
  sisa_ttr_hours: ticket.sisaTtrHours || 0,
  status: ticket.status || 'OPEN',
  is_permanent: ticket.isPermanent || null,
  penyebab: ticket.penyebab,
  segmen: ticket.segmen,
  inc_gamas: ticket.incGamas,
  kjd: ticket.kjd,
  teknisi_list: ticket.teknisiList,
  created_by: userId,
  raw_ticket_text: ticket.rawTicketText,
  perbaikan: ticket.perbaikan,
  status_alat_berat: ticket.statusAlatBerat,
  timeline_dispatch: ticket.timelineDispatch,
  timeline_prepare: ticket.timelinePrepare,
  timeline_otw: ticket.timelineOtw,
  timeline_identifikasi: ticket.timelineIdentifikasi,
  timeline_break: ticket.timelineBreak,
  timeline_splicing: ticket.timelineSplicing,
  kendala: ticket.kendala,
  atbt: ticket.atbt,
  tiket_eksternal: ticket.tiketEksternal,
});
