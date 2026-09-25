import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import dayjs from 'dayjs';
import { PharmacyPrescriptionStatus, Prescription } from '@/types';

const statusText: Record<PharmacyPrescriptionStatus, string> = { NEW: 'Đơn mới', PROCESSING: 'Đang chuẩn bị', READY: 'Sẵn sàng', COMPLETED: 'Đã giao', CANCELLED: 'Đã hủy' };
const statusStyle: Record<PharmacyPrescriptionStatus, string> = { NEW: 'bg-sky-50 text-sky-700 border-sky-200', PROCESSING: 'bg-amber-50 text-amber-700 border-amber-200', READY: 'bg-emerald-50 text-emerald-700 border-emerald-200', COMPLETED: 'bg-slate-100 text-slate-600 border-slate-200', CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200' };

export const getPrescriptionStatus = (prescription: Prescription) => prescription.pharmacyStatus || PharmacyPrescriptionStatus.NEW;

interface PrescriptionCardProps {
  prescription: Prescription;
  highlighted?: boolean;
  onOpen: (prescription: Prescription) => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, highlighted, onOpen }) => {
  const patient = prescription.examination?.appointment?.patient;
  const status = getPrescriptionStatus(prescription);
  return <article className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${highlighted ? 'border-sky-400 ring-2 ring-sky-100' : 'border-slate-200 hover:border-sky-300'}`}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><LocalPharmacyOutlinedIcon className="text-sky-600" fontSize="small" /><h3 className="truncate font-bold text-slate-900">{patient?.fullName || 'Bệnh nhân chưa xác định'}</h3></div><div className="mt-1 text-xs text-slate-500">{patient?.phone || 'Chưa có số điện thoại'} · {dayjs(prescription.issuedAt || prescription.createdAt).format('HH:mm DD/MM/YYYY')}</div></div><span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyle[status]}`}>{statusText[status]}</span></div>
    <div className="mt-4 divide-y divide-slate-100 rounded-lg bg-slate-50">{prescription.items?.length ? prescription.items.map((item) => <div key={item.id || `${item.medicineId}-${item.quantity}`} className="px-3 py-2.5"><div className="flex items-start justify-between gap-3 text-sm"><span className="font-semibold text-slate-800">{item.medicine?.name || 'Thuốc'}</span><span className="shrink-0 font-bold tabular-nums text-slate-900">x{item.quantity} {item.medicine?.unit || ''}</span></div><div className="mt-1 text-xs text-slate-500">{item.dosage} · {item.frequency}{item.duration ? ` · ${item.duration}` : item.durationDays ? ` · ${item.durationDays} ngày` : ''}</div></div>) : <div className="px-3 py-3 text-xs text-slate-500">Chưa có dữ liệu thuốc trong danh sách.</div>}</div>
    <div className="mt-3 flex justify-end"><Tooltip title="Xem chi tiết đơn"><IconButton size="small" onClick={() => onOpen(prescription)} className="text-sky-700"><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip></div>
  </article>;
};