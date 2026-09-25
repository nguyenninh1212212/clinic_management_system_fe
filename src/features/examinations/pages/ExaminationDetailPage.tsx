// src/features/examinations/pages/ExaminationDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useExamination, useDeleteExamination } from '../hooks/useExaminations';
import { PrescriptionItem } from '@/types';
import dayjs from 'dayjs';

export const ExaminationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: examination, isLoading, isError } = useExamination(id!);
  const deleteMutation = useDeleteExamination();
  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !examination) {
    return (
      <div className="py-12 text-center space-y-4">
        <Typography variant="h6" className="text-slate-800">
          Không tìm thấy phiếu khám bệnh
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/examinations')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(examination.id);
      navigate('/examinations');
    } catch {
      // Handled by interceptor
    }
  };

  const prescriptionItemColumns: Column<PrescriptionItem>[] = [
    {
      id: 'stt',
      label: 'STT',
      minWidth: 50,
      render: (_row, idx) => <span className="text-slate-400 tabular-nums">{idx + 1}</span>,
    },
    {
      id: 'medicine',
      label: 'Tên biệt dược / Hoạt chất',
      minWidth: 200,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm">
            {row.medicine?.name || 'Thuốc'}
          </div>
          {/* <div className="text-xs text-slate-500">
            {row.medicine?.activeIngredient} {row.medicine?.strength && `· ${row.medicine?.strength}`}
          </div> */}
        </div>
      ),
    },
    {
      id: 'quantity',
      label: 'Số lượng',
      minWidth: 90,
      render: (row) => (
        <span className="font-bold text-slate-900 tabular-nums">
          {row.quantity} {row.medicine?.unit || 'viên'}
        </span>
      ),
    },
    {
      id: 'dosage',
      label: 'Liều dùng & Cách dùng',
      minWidth: 200,
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-slate-700">{row.dosage}</div>
          <div className="text-[11px] text-slate-500">{row.frequency}</div>
        </div>
      ),
    },
    {
      id: 'durationDays',
      label: 'Số ngày',
      minWidth: 90,
      render: (row) => (
        <span className="text-xs tabular-nums text-slate-600">
          {row.durationDays ? `${row.durationDays} ngày` : '—'}
        </span>
      ),
    },
    {
      id: 'instructions',
      label: 'Lời dặn',
      minWidth: 200,
      render: (row) => (
        <span className="text-xs text-slate-600">{row.instructions || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Phiếu khám: ${examination.diagnosis}`}
        subtitle={`Bệnh nhân: ${examination.appointment?.patient?.fullName || '—'} · Bác sĩ: ${examination.doctor?.user?.fullName || '—'}`}
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Phiếu khám', href: '/examinations' },
          { label: 'Chi tiết' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/examinations')}
              size="small"
            >
              Danh sách
            </Button>
            {examination.appointmentId && (
              <Button
                variant="outlined"
                onClick={() => navigate(`/appointments/${examination.appointmentId}`)}
                size="small"
              >
                Xem cuộc hẹn
              </Button>
            )}
            <IconButton color="error" onClick={() => setDeleteOpen(true)} size="small">
              <DeleteOutlineIcon />
            </IconButton>
          </div>
        }
      />

      {/* Main Clinical Data Card */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-400">Bệnh nhân</div>
              <div className="font-semibold text-slate-800 text-sm mt-0.5">
                {examination.appointment?.patient?.fullName}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {examination.appointment?.patient?.phone}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Bác sĩ khám</div>
              <div className="font-semibold text-slate-800 text-sm mt-0.5">
                {examination.doctor?.user?.fullName}
              </div>
              <div className="text-xs text-slate-500">
                {examination.doctor?.specialty?.name || 'Đa khoa'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Mã bệnh ICD-10</div>
              <div className="font-mono text-sky-700 font-bold text-base mt-0.5">
                {examination.icd10Code || 'Chưa ghi mã'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Ngày hẹn tái khám</div>
              <div className="text-sm font-semibold text-slate-800 mt-0.5 tabular-nums">
                {examination.followUpDate
                  ? dayjs(examination.followUpDate).format('DD/MM/YYYY')
                  : 'Không có hẹn tái khám'}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Chẩn đoán xác định
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">
              {examination.diagnosis}
            </div>
          </div>

          {examination.clinicalNotes && (
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Ghi chú diễn tiến lâm sàng
              </div>
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg mt-1 whitespace-pre-line">
                {examination.clinicalNotes}
              </div>
            </div>
          )}

          {/* {examination.treatmentPlan && (
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Kế hoạch điều trị & Hướng dẫn bệnh nhân
              </div>
              <div className="text-sm text-slate-700 bg-sky-50/50 border border-sky-100 p-3 rounded-lg mt-1 whitespace-pre-line">
                {examination.treatmentPlan}
              </div>
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Prescription Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ReceiptLongIcon className="text-emerald-600" />
              <Typography variant="h6" className="text-slate-800 font-bold text-base">
                Đơn thuốc theo phiếu khám
              </Typography>
            </div>

            {examination.prescription ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/prescriptions/${examination.prescription?.id}`)}
              >
                In đơn thuốc
              </Button>
            ) : (
              <Button
                variant="contained"
                size="small"
                startIcon={<ReceiptLongIcon />}
                onClick={() => navigate(`/prescriptions?examinationId=${examination.id}`)}
              >
                Kê đơn thuốc mới
              </Button>
            )}
          </div>

          {examination.prescription ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>
                  Mã đơn: <strong className="font-mono text-slate-800">#{examination.prescription.id}</strong>
                </span>
                <span>
                  Ngày kê:{' '}
                  <strong className="text-slate-800 tabular-nums">
                    {dayjs(examination.prescription.createdAt).format('HH:mm DD/MM/YYYY')}
                  </strong>
                </span>
                {examination.prescription.notes && (
                  <span>Ghi chú đơn: {examination.prescription.notes}</span>
                )}
              </div>

              <DataTable
                columns={prescriptionItemColumns}
                rows={examination.prescription.items || []}
                loading={false}
                emptyTitle="Chưa có thuốc trong đơn"
                emptyDescription="Đơn thuốc này chưa có danh mục thuốc cụ thể."
              />
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Chưa có đơn thuốc nào được lập cho phiếu khám này. Nhấn "Kê đơn thuốc mới" để thêm thuốc.
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        title="Xóa phiếu khám bệnh?"
        content="Bạn có chắc muốn xóa phiếu khám bệnh này? Thao tác không thể hoàn tác."
        confirmText="Xóa phiếu khám"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};
