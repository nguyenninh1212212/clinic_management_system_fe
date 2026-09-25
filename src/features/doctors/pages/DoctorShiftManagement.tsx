import React, { useState } from 'react';
import { Alert, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/common/SearchInput';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useDoctors } from '../hooks/useDoctors';
import { useDoctorShifts, useCreateDoctorShift, useDeleteDoctorShift } from '../hooks/useDoctorShifts';
import { useSpecialtiesDropdown } from '@/features/specialties/hooks/useSpecialties';
import { DoctorShift } from '@/types';
import { DoctorShiftForm } from '../components/DoctorShiftForm';
import { DoctorShiftList } from '../components/DoctorShiftList';

export const DoctorShiftManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [specialtyId, setSpecialtyId] = useState<number | ''>('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [deleteShift, setDeleteShift] = useState<DoctorShift | null>(null);
  const { data: doctorsData, isLoading: loadingDoctors, isError: doctorsError } = useDoctors({ limit: 100, search: search || undefined, specialtyId: specialtyId ? Number(specialtyId) : undefined });
  const { data: specialties } = useSpecialtiesDropdown();
  const { data: shifts = [], isLoading: loadingShifts, isError: shiftsError } = useDoctorShifts(doctorId, date);
  const createMutation = useCreateDoctorShift();
  const deleteMutation = useDeleteDoctorShift();
  const selectedDoctor = doctorsData?.data?.find((doctor) => doctor.id === doctorId);

  const createShift = async (values: { workDate: string; startTime: string; endTime: string }) => {
    try { await createMutation.mutateAsync({ doctorId, dto: values }); } catch { /* interceptor handles backend feedback */ }
  };
  const deleteShiftConfirmed = async () => { if (!deleteShift) return; try { await deleteMutation.mutateAsync(deleteShift.id); setDeleteShift(null); } catch { /* interceptor handles backend feedback */ } };

  return <div className="space-y-4"><PageHeader title="Phân công ca bác sĩ" subtitle="Quản lý ca làm việc và thời gian tiếp nhận lịch khám của từng bác sĩ" breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Bác sĩ', href: '/doctors' }, { label: 'Phân công ca' }]} /><div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3"><SearchInput placeholder="Tìm tên bác sĩ..." value={search} onChange={setSearch} /><FormControl size="small"><InputLabel id="shift-specialty">Chuyên khoa</InputLabel><Select labelId="shift-specialty" label="Chuyên khoa" value={specialtyId} onChange={(event) => setSpecialtyId(event.target.value as number | '')}><MenuItem value="">Tất cả chuyên khoa</MenuItem>{specialties?.map((specialty) => <MenuItem key={specialty.id} value={specialty.id}>{specialty.name}</MenuItem>)}</Select></FormControl><FormControl size="small"><InputLabel id="shift-doctor">Bác sĩ</InputLabel><Select labelId="shift-doctor" label="Bác sĩ" value={doctorId} onChange={(event) => setDoctorId(event.target.value)} disabled={loadingDoctors}><MenuItem value="">Chọn bác sĩ</MenuItem>{doctorsData?.data?.map((doctor) => <MenuItem key={doctor.id} value={doctor.id}>{doctor.user?.fullName} · {doctor.specialty?.name || 'Đa khoa'}</MenuItem>)}</Select></FormControl></div><div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-sm font-bold text-slate-900">Ngày xem ca</div><div className="text-xs text-slate-500">Chỉ hiển thị ca của bác sĩ đã chọn.</div></div><input type="date" value={date} min={dayjs().format('YYYY-MM-DD')} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>{(doctorsError || shiftsError) && <Alert severity="error">Không thể tải dữ liệu ca làm. Vui lòng thử lại.</Alert>}{doctorId && <DoctorShiftForm doctorId={doctorId} defaultDate={date} existingShifts={shifts} isSaving={createMutation.isPending} onSubmit={createShift} />}{!doctorId ? <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">Chọn bác sĩ để xem và phân công ca.</div> : <><div className="flex items-center justify-between"><h2 className="text-base font-bold text-slate-900">Ca làm của {selectedDoctor?.user?.fullName || 'bác sĩ'}</h2><span className="text-xs text-slate-500">{date}</span></div><DoctorShiftList shifts={shifts} loading={loadingShifts} onDelete={setDeleteShift} /></>}<ConfirmDialog open={Boolean(deleteShift)} title="Xóa ca làm?" content={`Bạn có chắc muốn xóa ca ${deleteShift?.startTime} - ${deleteShift?.endTime} ngày ${deleteShift?.workDate}?`} confirmText="Xóa ca" isLoading={deleteMutation.isPending} onConfirm={deleteShiftConfirmed} onClose={() => setDeleteShift(null)} /></div>;
};