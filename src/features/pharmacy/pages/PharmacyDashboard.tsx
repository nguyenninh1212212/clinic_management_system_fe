import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, FormControl, InputLabel, MenuItem, Select, Switch, TextField } from '@mui/material';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import dayjs from 'dayjs';
import { useMutation } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { prescriptionsApi } from '@/api/endpoints/prescriptions.api';
import { PharmacyPrescriptionStatus, PharmacyPrescriptionCreatedPayload, PharmacyPrescriptionUpdatedPayload, Prescription } from '@/types';
import { usePrescriptions } from '@/features/prescriptions/hooks/usePrescriptions';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { PharmacySocketProvider, usePharmacySocket } from '../components/PharmacySocketProvider';
import { PrescriptionDetailDrawer } from '../components/PrescriptionDetailDrawer';
import { PrescriptionQueue, isOpenPharmacyPrescription } from '../components/PrescriptionQueue';

const statusText: Record<PharmacyPrescriptionStatus, string> = { NEW: 'Đơn mới', PROCESSING: 'Đang chuẩn bị', READY: 'Sẵn sàng', COMPLETED: 'Đã giao', CANCELLED: 'Đã hủy' };

const sortPrescriptions = (items: Prescription[]) => [...items].sort((a, b) => dayjs(b.issuedAt || b.createdAt).valueOf() - dayjs(a.issuedAt || a.createdAt).valueOf());

type CreatedHandlerRef = React.MutableRefObject<((payload: PharmacyPrescriptionCreatedPayload) => void) | undefined>;
type UpdatedHandlerRef = React.MutableRefObject<((payload: PharmacyPrescriptionUpdatedPayload) => void) | undefined>;

const PharmacyDashboardContent: React.FC<{ createdHandlerRef: CreatedHandlerRef; updatedHandlerRef: UpdatedHandlerRef }> = ({ createdHandlerRef, updatedHandlerRef }) => {
  const { data, isLoading, isError, error } = usePrescriptions({ page: 1, limit: 100 });
  const { status: socketStatus, soundEnabled, setSoundEnabled } = usePharmacySocket();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selected, setSelected] = useState<Prescription | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PharmacyPrescriptionStatus | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const eventPrescriptions = useRef(new Map<string, Prescription>());
  const highlightTimers = useRef(new Map<string, number>());
  const updateStatusMutation = useMutation({ mutationFn: ({ id, status }: { id: string; status: PharmacyPrescriptionStatus }) => prescriptionsApi.update(id, { pharmacyStatus: status }) });

  const playNewOrderSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.04;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.14);
    } catch {
      // Audio is optional and may be blocked by the browser.
    }
  }, [soundEnabled]);

  const highlight = useCallback((id: string) => {
    setHighlightedIds((current) => new Set(current).add(id));
    const existingTimer = highlightTimers.current.get(id);
    if (existingTimer) window.clearTimeout(existingTimer);
    highlightTimers.current.set(id, window.setTimeout(() => {
      setHighlightedIds((current) => { const next = new Set(current); next.delete(id); return next; });
      highlightTimers.current.delete(id);
    }, 5000));
  }, []);

  const handleCreated = useCallback((payload: PharmacyPrescriptionCreatedPayload) => {
    const prescription = { ...payload.prescription, pharmacyStatus: payload.prescription.pharmacyStatus || PharmacyPrescriptionStatus.NEW };
    eventPrescriptions.current.set(prescription.id, prescription);
    setPrescriptions((current) => sortPrescriptions([prescription, ...current.filter((item) => item.id !== prescription.id)]));
    highlight(prescription.id);
    playNewOrderSound();
  }, [highlight, playNewOrderSound]);

  const handleUpdated = useCallback((payload: PharmacyPrescriptionUpdatedPayload) => {
    const prescription = eventPrescriptions.current.get(payload.prescription.id) ? { ...eventPrescriptions.current.get(payload.prescription.id), ...payload.prescription } : payload.prescription;
    eventPrescriptions.current.set(prescription.id, prescription);
    setPrescriptions((current) => sortPrescriptions(current.some((item) => item.id === prescription.id) ? current.map((item) => item.id === prescription.id ? prescription : item) : [prescription, ...current]));
    highlight(prescription.id);
  }, [highlight]);

  useEffect(() => {
    createdHandlerRef.current = handleCreated;
    updatedHandlerRef.current = handleUpdated;
    return () => {
      createdHandlerRef.current = undefined;
      updatedHandlerRef.current = undefined;
    };
  }, [createdHandlerRef, handleCreated, handleUpdated, updatedHandlerRef]);

  useEffect(() => {
    if (!data?.data) return;
    setPrescriptions((current) => sortPrescriptions(data.data.map((item) => eventPrescriptions.current.get(item.id) || current.find((currentItem) => currentItem.id === item.id) || item)));
  }, [data]);

  useEffect(() => () => { highlightTimers.current.forEach((timer) => window.clearTimeout(timer)); }, []);

  const visiblePrescriptions = useMemo(() => prescriptions.filter((prescription) => {
    const patient = prescription.examination?.appointment?.patient;
    const status = prescription.pharmacyStatus || PharmacyPrescriptionStatus.NEW;
    const matchesSearch = !search.trim() || patient?.fullName?.toLowerCase().includes(search.toLowerCase()) || patient?.phone?.includes(search);
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesDate = !dateFilter || dayjs(prescription.issuedAt || prescription.createdAt).format('YYYY-MM-DD') === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  }), [dateFilter, prescriptions, search, statusFilter]);
  const newCount = prescriptions.filter((prescription) => isOpenPharmacyPrescription(prescription) && (prescription.pharmacyStatus || PharmacyPrescriptionStatus.NEW) === PharmacyPrescriptionStatus.NEW).length;

  const handleStatusChange = async (id: string, nextStatus: PharmacyPrescriptionStatus) => {
    const previous = prescriptions.find((item) => item.id === id);
    setPrescriptions((current) => current.map((item) => item.id === id ? { ...item, pharmacyStatus: nextStatus } : item));
    try {
      await updateStatusMutation.mutateAsync({ id, status: nextStatus });
    } catch (requestError) {
      if (previous) setPrescriptions((current) => current.map((item) => item.id === id ? previous : item));
      throw requestError;
    }
  };

  return <div className="space-y-4">
    <PageHeader title="Nhà thuốc" subtitle="Hàng đợi đơn thuốc realtime dành cho quầy phát thuốc" breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Nhà thuốc' }]} action={<div className="flex flex-wrap items-center justify-end gap-2"><ConnectionStatus status={socketStatus} /><Button size="small" variant={soundEnabled ? 'contained' : 'outlined'} startIcon={soundEnabled ? <VolumeUpOutlinedIcon /> : <VolumeOffOutlinedIcon />} onClick={() => setSoundEnabled(!soundEnabled)}>{soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}</Button></div>} />
    {socketStatus === 'disconnected' && <Alert severity="warning">Mất kết nối realtime. Dữ liệu hiện tại vẫn hiển thị; hệ thống sẽ tự đồng bộ khi kết nối lại.</Alert>}
    {isError && <Alert severity="error">{(error as any)?.response?.data?.message || 'Không thể tải hàng đợi đơn thuốc.'}</Alert>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl border border-sky-200 bg-sky-50 p-4"><div className="text-xs text-sky-700">Đơn mới</div><div className="mt-1 text-2xl font-bold text-sky-900">{newCount}</div></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="text-xs text-amber-700">Đang chuẩn bị</div><div className="mt-1 text-2xl font-bold text-amber-900">{prescriptions.filter((item) => item.pharmacyStatus === PharmacyPrescriptionStatus.PROCESSING).length}</div></div><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"><div className="text-xs text-emerald-700">Sẵn sàng</div><div className="mt-1 text-2xl font-bold text-emerald-900">{prescriptions.filter((item) => item.pharmacyStatus === PharmacyPrescriptionStatus.READY).length}</div></div><div className="rounded-xl border border-slate-200 bg-white p-4"><div className="text-xs text-slate-500">Tổng hàng đợi</div><div className="mt-1 text-2xl font-bold text-slate-900">{prescriptions.filter(isOpenPharmacyPrescription).length}</div></div></div>
    <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><TextField size="small" label="Tìm bệnh nhân / số điện thoại" value={search} onChange={(event) => setSearch(event.target.value)} className="lg:w-80" /><FormControl size="small" className="lg:w-56"><InputLabel id="pharmacy-status">Trạng thái</InputLabel><Select labelId="pharmacy-status" label="Trạng thái" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PharmacyPrescriptionStatus | '')}><MenuItem value="">Tất cả trạng thái</MenuItem>{Object.values(PharmacyPrescriptionStatus).map((value) => <MenuItem key={value} value={value}>{statusText[value]}</MenuItem>)}</Select></FormControl><TextField size="small" type="date" label="Ngày kê đơn" slotProps={{ inputLabel: { shrink: true } }} value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /><div className="lg:ml-auto text-xs text-slate-500">Hiển thị {visiblePrescriptions.length} đơn</div></div></div>
    <div className="flex items-center gap-2"><LocalPharmacyOutlinedIcon className="text-sky-600" /><h2 className="text-lg font-bold text-slate-900">Hàng đợi đơn thuốc</h2><span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-bold text-sky-800">Realtime</span></div>
    <PrescriptionQueue prescriptions={visiblePrescriptions} loading={isLoading} error={isError ? error : undefined} highlightedIds={highlightedIds} onOpen={setSelected} />
    <PrescriptionDetailDrawer prescription={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
  </div>;
};

export const PharmacyDashboard: React.FC = () => {
  const createdHandlerRef = useRef<((payload: PharmacyPrescriptionCreatedPayload) => void) | undefined>(undefined);
  const updatedHandlerRef = useRef<((payload: PharmacyPrescriptionUpdatedPayload) => void) | undefined>(undefined);
  return <PharmacySocketProvider onCreated={(payload) => createdHandlerRef.current?.(payload)} onUpdated={(payload) => updatedHandlerRef.current?.(payload)}><PharmacyDashboardContent createdHandlerRef={createdHandlerRef} updatedHandlerRef={updatedHandlerRef} /></PharmacySocketProvider>;
};