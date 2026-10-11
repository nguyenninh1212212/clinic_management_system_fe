import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { InfiniteSelect, InfiniteSelectPage } from '@/components/common/InfiniteSelect';
import { patientsApi } from '@/api/endpoints/patients.api';
import { prescriptionsApi } from '@/api/endpoints/prescriptions.api';
import { queryKeys } from '@/api/queryKeys';
import { useMedicinesDropdown } from '@/features/medicines/hooks/useMedicines';
import { usePrescription } from '@/features/prescriptions/hooks/usePrescriptions';
import { CreateInvoiceItemDto, Patient, Prescription } from '@/types';
import { useCreateInvoice } from '../hooks/useInvoices';
import { InvoiceItemsTable } from '../components/InvoiceItemsTable';

const newItem = (): CreateInvoiceItemDto => ({ itemType: 'MEDICINE', medicineId: '', quantity: 1, unitPrice: 0 });

export const InvoiceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerTaxCode, setBuyerTaxCode] = useState('');
  const [patientId, setPatientId] = useState('');
  const [prescriptionId, setPrescriptionId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreateInvoiceItemDto[]>([newItem()]);
  const [submitted, setSubmitted] = useState(false);
  const selectedPrescriptionQuery = usePrescription(prescriptionId);
  const selectedPrescription = selectedPrescriptionQuery.data;
  const { data: medicinesData } = useMedicinesDropdown(500);
  const createMutation = useCreateInvoice();

  useEffect(() => {
    if (!prescriptionId || selectedPrescription?.id !== prescriptionId) return;

    const prescriptionItems = selectedPrescription.items?.map((item) => ({
      itemType: 'MEDICINE' as const,
      medicineId: item.medicineId,
      quantity: item.quantity,
      unitPrice: 0,
    }));
    if (prescriptionItems?.length) {
      setItems(prescriptionItems);
    }
  }, [prescriptionId, selectedPrescription]);

  const loadPatients = async ({ page, search }: { page: number; search: string }): Promise<InfiniteSelectPage<Patient>> => {
    const response = await patientsApi.findAll({ page, limit: 20, search: search || undefined });
    return {
      data: response.data,
      nextPage: page < response.pagination.totalPages ? page + 1 : null,
    };
  };

  const loadPatientPrescriptions = async ({ page, search }: { page: number; search: string }): Promise<InfiniteSelectPage<Prescription>> => {
    const response = await prescriptionsApi.findAll({ page, limit: 20, patientId, search: search || undefined });
    return {
      data: response.data,
      nextPage: page < response.pagination.totalPages ? page + 1 : null,
    };
  };

  const handlePatientChange = (nextPatientId: string | null, patient: Patient | null) => {
    const resolvedPatientId = nextPatientId || '';
    setPatientId(resolvedPatientId);
    setBuyerName(patient?.fullName || '');
    setBuyerPhone(patient?.phone || '')
    setBuyerAddress(patient?.address || '')
    setBuyerEmail(patient?.email || '')
    setBuyerPhone(patient?.phone || '')
    setPrescriptionId('');
    setItems([newItem()]);
  };

  const handlePrescriptionChange = (nextPrescriptionId: string | null) => {
    setPrescriptionId(nextPrescriptionId || '');
  };

  const total = items.reduce((sum, item) => sum + Math.max(0, item.quantity || 0) * Math.max(0, item.unitPrice || 0), 0);
  const hasInvalidItem = items.length === 0 || items.some((item) => item.quantity <= 0 || item.unitPrice < 0 || (item.itemType === 'MEDICINE' ? !item.medicineId : !item.description?.trim()));
  const invalid = !buyerName.trim() || hasInvalidItem;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (invalid) return;
    try {
      const result = await createMutation.mutateAsync({ buyerName: buyerName.trim(), buyerPhone: buyerPhone || undefined, buyerEmail: buyerEmail || undefined, buyerAddress: buyerAddress || undefined, buyerTaxCode: buyerTaxCode || undefined, patientId: patientId || undefined, notes: notes || undefined, items });
      navigate(`/invoices/${result.data?.id || (result as any).id}`);
    } catch {
      // API interceptor displays the backend error.
    }
  };

  return <div className="space-y-4">
    <PageHeader title="Tạo hóa đơn" subtitle="Nhập thông tin người mua và các dòng thanh toán" breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Hóa đơn', href: '/invoices' }, { label: 'Tạo mới' }]} action={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/invoices')}>Quay lại</Button>} />
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Thông tin người mua</h2>
            <p className="text-xs text-slate-500">Các trường có dấu * là bắt buộc.</p>
          </div>
          {submitted && !buyerName.trim() && <Alert severity="error">Vui lòng nhập tên người mua.</Alert>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <TextField required label="Tên người mua" size="small" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} error={submitted && !buyerName.trim()} />
            <TextField label="Số điện thoại" size="small" value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} />
            <TextField label="Email" type="email" size="small" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} />
            <TextField label="Mã số thuế" size="small" value={buyerTaxCode} onChange={(event) => setBuyerTaxCode(event.target.value)} />
            <TextField label="Địa chỉ" size="small" className="md:col-span-2" value={buyerAddress} onChange={(event) => setBuyerAddress(event.target.value)} />
            <InfiniteSelect<Patient>
              label="Bệnh nhân liên kết"
              value={patientId || null}
              onChange={handlePatientChange}
              queryKey={queryKeys.patients.lists()}
              queryFn={loadPatients}
              getOptionLabel={(patient) => `${patient.fullName}${patient.phone ? ` · ${patient.phone}` : ''}`}
              getOptionValue={(patient) => patient.id}
              fullWidth
            />
            <InfiniteSelect<Prescription>
              label="Đơn thuốc"
              value={prescriptionId || null}
              onChange={handlePrescriptionChange}
              queryKey={[...queryKeys.prescriptions.lists(), patientId]}
              queryFn={loadPatientPrescriptions}
              getOptionLabel={(prescription) => `${prescription.issuedAt || prescription.createdAt.slice(0, 10)} · ${prescription.id.slice(0, 8)}`}
              getOptionValue={(prescription) => prescription.id}
              disabled={!patientId}
              enabled={Boolean(patientId)}
              fullWidth
              helperText={!patientId ? 'Chọn bệnh nhân trước để xem đơn thuốc.' : undefined}
            />
            {selectedPrescriptionQuery.isError && (
              <Alert severity="error" className="md:col-span-2">
                Không thể tải chi tiết đơn thuốc đã chọn.
              </Alert>
            )}
            {prescriptionId && (
              <p className="md:col-span-2 text-xs text-slate-500">
                Đã tải các thuốc trong đơn; vui lòng nhập đơn giá cho từng thuốc.
              </p>
            )}
            <TextField label="Ghi chú" multiline minRows={2} size="small" className="md:col-span-2" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </div>
        </CardContent>
      </Card>
      <Card><CardContent className="space-y-5"><InvoiceItemsTable items={items} medicines={medicinesData?.data || []} onChange={(index, patch) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))} onAdd={() => setItems((current) => [...current, newItem()])} onRemove={(index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} />{submitted && hasInvalidItem && <Alert severity="error">Kiểm tra dòng hàng: số lượng phải lớn hơn 0, đơn giá không âm, thuốc phải được chọn và chi phí phải có mô tả.</Alert>}<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200 pt-4"><div className="text-right sm:ml-auto"><div className="text-xs text-slate-500">Tổng tiền</div><div className="text-2xl font-bold tabular-nums text-sky-700">{total.toLocaleString('vi-VN')} ₫</div></div><Button type="submit" variant="contained" size="large" startIcon={<SaveOutlinedIcon />} disabled={createMutation.isPending}>{createMutation.isPending ? 'Đang lưu...' : 'Lưu hóa đơn'}</Button></div></CardContent></Card>
    </form>
  </div>;
};