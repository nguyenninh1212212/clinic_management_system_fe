import React, { useState } from 'react';
import { Alert, Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { usePatients } from '@/features/patients/hooks/usePatients';
import { useMedicinesDropdown } from '@/features/medicines/hooks/useMedicines';
import { CreateInvoiceItemDto, Gender } from '@/types';
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
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreateInvoiceItemDto[]>([newItem()]);
  const [submitted, setSubmitted] = useState(false);
  const { data: patientsData } = usePatients({ page: 1, limit: 100 });
  const { data: medicinesData } = useMedicinesDropdown(500);
  const createMutation = useCreateInvoice();

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
      <Card><CardContent className="space-y-4"><div><h2 className="text-sm font-bold text-slate-900">Thông tin người mua</h2><p className="text-xs text-slate-500">Các trường có dấu * là bắt buộc.</p></div>{submitted && !buyerName.trim() && <Alert severity="error">Vui lòng nhập tên người mua.</Alert>}<div className="grid grid-cols-1 md:grid-cols-2 gap-3"><TextField required label="Tên người mua" size="small" value={buyerName} onChange={(event) => setBuyerName(event.target.value)} error={submitted && !buyerName.trim()} /><TextField label="Số điện thoại" size="small" value={buyerPhone} onChange={(event) => setBuyerPhone(event.target.value)} /><TextField label="Email" type="email" size="small" value={buyerEmail} onChange={(event) => setBuyerEmail(event.target.value)} /><TextField label="Mã số thuế" size="small" value={buyerTaxCode} onChange={(event) => setBuyerTaxCode(event.target.value)} /><TextField label="Địa chỉ" size="small" className="md:col-span-2" value={buyerAddress} onChange={(event) => setBuyerAddress(event.target.value)} /><FormControl size="small" className="md:col-span-2"><InputLabel id="invoice-patient">Bệnh nhân liên kết</InputLabel><Select labelId="invoice-patient" label="Bệnh nhân liên kết" value={patientId} onChange={(event) => setPatientId(event.target.value)}><MenuItem value="">Không liên kết</MenuItem>{patientsData?.data?.map((patient) => <MenuItem key={patient.id} value={patient.id}>{patient.fullName} {patient.phone ? `· ${patient.phone}` : ''}</MenuItem>)}</Select></FormControl><TextField label="Ghi chú" multiline minRows={2} size="small" className="md:col-span-2" value={notes} onChange={(event) => setNotes(event.target.value)} /></div></CardContent></Card>
      <Card><CardContent className="space-y-5"><InvoiceItemsTable items={items} medicines={medicinesData?.data || []} onChange={(index, patch) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))} onAdd={() => setItems((current) => [...current, newItem()])} onRemove={(index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} />{submitted && hasInvalidItem && <Alert severity="error">Kiểm tra dòng hàng: số lượng phải lớn hơn 0, đơn giá không âm, thuốc phải được chọn và chi phí phải có mô tả.</Alert>}<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-200 pt-4"><div className="text-right sm:ml-auto"><div className="text-xs text-slate-500">Tổng tiền</div><div className="text-2xl font-bold tabular-nums text-sky-700">{total.toLocaleString('vi-VN')} ₫</div></div><Button type="submit" variant="contained" size="large" startIcon={<SaveOutlinedIcon />} disabled={createMutation.isPending}>{createMutation.isPending ? 'Đang lưu...' : 'Lưu hóa đơn'}</Button></div></CardContent></Card>
    </form>
  </div>;
};