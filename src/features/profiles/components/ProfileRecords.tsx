import React, { useState } from 'react';
import { Alert, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { DataTable } from '@/components/common/DataTable';
import { useDoctorShifts } from '@/features/doctors/hooks/useDoctorShifts';
import { useInvoices } from '@/features/invoices/hooks/useInvoices';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { StatusChip } from '@/components/common/StatusChip';

export function DoctorShiftsTab({ doctorId }: { doctorId: string }) {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const query = useDoctorShifts(doctorId, date);
  return <div className="space-y-4">
    <TextField label="Ngày làm việc" type="date" value={date} onChange={(event) => setDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
    {query.isError ? <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>Không tải được ca làm việc.</Alert> : <DataTable rows={query.data || []} loading={query.isLoading} columns={[
      { id: 'workDate', label: 'Ngày làm việc', render: (row) => dayjs(row.workDate).format('DD/MM/YYYY') },
      { id: 'startTime', label: 'Giờ bắt đầu' }, { id: 'endTime', label: 'Giờ kết thúc' },
    ]} emptyTitle="Chưa có ca làm" emptyDescription="Chọn ngày khác để xem lịch làm việc của bác sĩ." />}
  </div>;
}

export function PatientInvoicesTab({ patientId }: { patientId: string }) {
  const [page, setPage] = useState(1);
  const query = useInvoices({ patientId, page, limit: 10 });
  const navigate = useNavigate();
  if (query.isError) return <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>Không tải được hóa đơn.</Alert>;
  return <DataTable rows={query.data?.data || []} loading={query.isLoading} pagination={query.data?.pagination} onPageChange={setPage} columns={[
    { id: 'invoiceNumber', label: 'Số hóa đơn', render: (row) => row.invoiceNumber || row.id },
    { id: 'createdAt', label: 'Ngày lập', render: (row) => dayjs(row.createdAt).format('DD/MM/YYYY') },
    { id: 'totalAmount', label: 'Tổng tiền', render: (row) => row.totalAmount == null ? '—' : `${row.totalAmount.toLocaleString('vi-VN')} đ` },
    { id: 'actions', label: 'Chi tiết', render: (row) => <Button onClick={() => navigate(`/invoices/${row.id}`)}>Xem hóa đơn</Button> },
  ]} emptyTitle="Chưa có hóa đơn" emptyDescription="Hóa đơn của bệnh nhân sẽ được hiển thị tại đây." />;
}

export function StaffAppointmentsTab({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const query = useAppointments({ bookedByUserId: userId, page, limit: 10 });
  const navigate = useNavigate();
  if (query.isError) return <Alert severity="error" action={<Button onClick={() => query.refetch()}>Thử lại</Button>}>Không tải được lịch hẹn.</Alert>;
  return <DataTable rows={query.data?.data || []} loading={query.isLoading} pagination={query.data?.pagination} onPageChange={setPage} columns={[
    { id: 'appointmentDate', label: 'Thời gian khám', render: (row) => dayjs(row.appointmentDate).format('HH:mm DD/MM/YYYY') },
    { id: 'patient', label: 'Bệnh nhân', render: (row) => row.patient?.fullName || '—' },
    { id: 'status', label: 'Trạng thái', render: (row) => <StatusChip status={row.status} type="appointment" /> },
    { id: 'actions', label: 'Chi tiết', render: (row) => <Button onClick={() => navigate(`/appointments/${row.id}`)}>Xem lịch hẹn</Button> },
  ]} emptyTitle="Chưa có lịch hẹn đã đặt" emptyDescription="Các lịch hẹn do nhân viên này đặt sẽ xuất hiện tại đây." />;
}
