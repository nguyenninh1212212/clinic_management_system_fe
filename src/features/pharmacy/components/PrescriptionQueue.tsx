import React from 'react';
import { Alert, CircularProgress } from '@mui/material';
import { PharmacyPrescriptionStatus, Prescription } from '@/types';
import { PrescriptionCard } from './PrescriptionCard';

interface PrescriptionQueueProps { prescriptions: Prescription[]; loading: boolean; error?: unknown; highlightedIds: Set<string>; onOpen: (prescription: Prescription) => void; }

export const PrescriptionQueue: React.FC<PrescriptionQueueProps> = ({ prescriptions, loading, error, highlightedIds, onOpen }) => {
  if (loading) return <div className="flex justify-center py-16"><CircularProgress /></div>;
  if (error) return <Alert severity="error">Không thể tải hàng đợi đơn thuốc. Vui lòng thử lại.</Alert>;
  if (!prescriptions.length) return <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">Chưa có đơn thuốc phù hợp.</div>;
  return <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">{prescriptions.map((prescription) => <PrescriptionCard key={prescription.id} prescription={prescription} highlighted={highlightedIds.has(prescription.id)} onOpen={onOpen} />)}</div>;
};

export const isOpenPharmacyPrescription = (prescription: Prescription) => {
  const status = prescription.pharmacyStatus || PharmacyPrescriptionStatus.NEW;
  return status !== PharmacyPrescriptionStatus.COMPLETED && status !== PharmacyPrescriptionStatus.CANCELLED;
};