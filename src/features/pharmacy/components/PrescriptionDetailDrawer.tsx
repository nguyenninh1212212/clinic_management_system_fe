import React, { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Divider, Drawer, IconButton, MenuItem, Select, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { useQuery } from '@tanstack/react-query';
import { prescriptionsApi } from '@/api/endpoints/prescriptions.api';
import { prescriptionItemsApi } from '@/api/endpoints/prescription-items.api';
import { queryKeys } from '@/api/queryKeys';
import { PharmacyPrescriptionStatus, Prescription } from '@/types';
import dayjs from 'dayjs';
import { getPrescriptionStatus } from './PrescriptionCard';

const statusText: Record<PharmacyPrescriptionStatus, string> = { NEW: 'Đơn mới', PROCESSING: 'Đang chuẩn bị', READY: 'Sẵn sàng', COMPLETED: 'Đã giao', CANCELLED: 'Đã hủy' };

interface PrescriptionDetailDrawerProps { prescription: Prescription | null; onClose: () => void; onStatusChange: (id: string, status: PharmacyPrescriptionStatus) => Promise<void>; }

export const PrescriptionDetailDrawer: React.FC<PrescriptionDetailDrawerProps> = ({ prescription, onClose, onStatusChange }) => {
  const [status, setStatus] = useState<PharmacyPrescriptionStatus>(PharmacyPrescriptionStatus.NEW);
  const detailQuery = useQuery({ queryKey: queryKeys.prescriptions.detail(prescription?.id || ''), queryFn: () => prescriptionsApi.findById(prescription?.id || ''), enabled: Boolean(prescription?.id), staleTime: 30_000 });
  const itemQuery = useQuery({ queryKey: ['prescription-items', prescription?.id], queryFn: () => prescriptionItemsApi.findByPrescription(prescription?.id || ''), enabled: Boolean(prescription?.id) && !(detailQuery.data?.data?.items?.length || prescription?.items?.length), staleTime: 30_000 });
  const current = detailQuery.data?.data || prescription;
  const items = current?.items?.length ? current.items : itemQuery.data || [];
  useEffect(() => { setStatus(getPrescriptionStatus(prescription || ({ pharmacyStatus: PharmacyPrescriptionStatus.NEW } as Prescription))); }, [prescription]);
  if (!prescription) return null;
  const patient = current?.examination?.appointment?.patient;
  const changeStatus = async (nextStatus: PharmacyPrescriptionStatus) => { setStatus(nextStatus); await onStatusChange(prescription.id, nextStatus); };
  return <Drawer anchor="right" open={Boolean(prescription)} onClose={onClose}><div className="w-screen max-w-xl p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><Typography variant="h6" className="font-bold text-slate-900">Chi tiết đơn thuốc</Typography><div className="mt-1 text-xs text-slate-500">Kê lúc {dayjs(current?.issuedAt || current?.createdAt).format('HH:mm DD/MM/YYYY')}</div></div><IconButton onClick={onClose}><CloseIcon /></IconButton></div>{detailQuery.isLoading ? <div className="flex justify-center py-12"><CircularProgress /></div> : detailQuery.isError ? <Alert severity="error" className="mt-5">Không thể tải chi tiết đơn thuốc.</Alert> : <div className="mt-6 space-y-5"><div className="rounded-lg bg-slate-50 p-4"><div className="text-xs text-slate-500">Bệnh nhân</div><div className="mt-1 text-lg font-bold text-slate-900">{patient?.fullName || '—'}</div><div className="text-sm text-slate-600">{patient?.phone || 'Chưa có số điện thoại'}</div></div><div><div className="mb-2 text-sm font-bold text-slate-900">Trạng thái xử lý</div><Select size="small" fullWidth value={status} onChange={(event) => changeStatus(event.target.value as PharmacyPrescriptionStatus)}>{Object.values(PharmacyPrescriptionStatus).map((value) => <MenuItem key={value} value={value}>{statusText[value]}</MenuItem>)}</Select></div><Divider /><div><div className="mb-3 text-sm font-bold text-slate-900">Danh sách thuốc</div>{itemQuery.isLoading ? <CircularProgress size={20} /> : <div className="space-y-2">{items.map((item) => <div key={item.id} className="rounded-lg border border-slate-200 p-3"><div className="flex justify-between gap-3"><span className="font-semibold text-slate-800">{item.medicine?.name || 'Thuốc'}</span><span className="font-bold tabular-nums">x{item.quantity} {item.medicine?.unit || ''}</span></div><div className="mt-1 text-xs text-slate-500">{item.dosage} · {item.frequency}{item.duration ? ` · ${item.duration}` : ''}</div>{item.note && <div className="mt-1 text-xs text-amber-700">Ghi chú: {item.note}</div>}</div>)}</div>}</div>{current?.notes && <Alert severity="info">Lời dặn: {current.notes}</Alert>}<Button fullWidth variant="contained" startIcon={<CheckCircleOutlineIcon />} disabled={status === PharmacyPrescriptionStatus.COMPLETED || status === PharmacyPrescriptionStatus.CANCELLED} onClick={() => changeStatus(PharmacyPrescriptionStatus.COMPLETED)}>Xác nhận đã giao thuốc</Button></div>}</div></Drawer>;
};