// src/features/appointments/pages/AppointmentEditPage.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '@/components/common/PageHeader';
import { useAppointment, useUpdateAppointment } from '../hooks/useAppointments';
import { useDoctors } from '@/features/doctors/hooks/useDoctors';
import { AppointmentStatus } from '@/types';
import dayjs from 'dayjs';
import { z } from 'zod';

const editAppointmentSchema = z.object({
  doctorId: z.string().optional().or(z.literal('')),
  appointmentDate: z.string().min(1, 'Vui lòng chọn thời gian khám'),
  notes: z.string().optional().or(z.literal('')),
});

type EditAppointmentFormValues = z.infer<typeof editAppointmentSchema>;

export const AppointmentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointment, isLoading } = useAppointment(id || '');
  const updateMutation = useUpdateAppointment();
  const { data: doctorsData } = useDoctors({ limit: 100 });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditAppointmentFormValues>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      doctorId: '',
      appointmentDate: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (appointment) {
      reset({
        doctorId: appointment.doctorId || '',
        appointmentDate: appointment.appointmentDate
          ? dayjs(appointment.appointmentDate).format('YYYY-MM-DDTHH:mm')
          : '',
        notes: appointment.notes || '',
      });
    }
  }, [appointment, reset]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  const isTerminal =
    appointment &&
    [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(appointment.status);

  if (isTerminal) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <Alert severity="warning">
          Lịch hẹn đã kết thúc hoặc bị hủy, không thể chỉnh sửa thông tin.
        </Alert>
        <Button variant="outlined" onClick={() => navigate(`/appointments/${id}`)}>
          Quay lại chi tiết
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: EditAppointmentFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          doctorId: values.doctorId || undefined,
          appointmentDate: new Date(values.appointmentDate).toISOString(),
          notes: values.notes || undefined,
        },
      });
      navigate(`/appointments/${id}`);
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Chỉnh sửa Cuộc hẹn"
        subtitle={`Bệnh nhân: ${appointment?.patient?.fullName || '—'}`}
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Lịch hẹn', href: '/appointments' },
          { label: 'Chi tiết', href: `/appointments/${id}` },
          { label: 'Chỉnh sửa' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/appointments/${id}`)}
            size="small"
          >
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 sm:p-8">
          {updateMutation.isError && (
            <Alert severity="error" className="mb-6">
              {(updateMutation.error as any)?.response?.data?.message ||
                'Có lỗi xảy ra khi cập nhật cuộc hẹn.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Doctor */}
              <div>
                <FormControl fullWidth error={!!errors.doctorId}>
                  <InputLabel id="doctor-edit-select-label">Bác sĩ phụ trách</InputLabel>
                  <Controller
                    name="doctorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="doctor-edit-select-label"
                        label="Bác sĩ phụ trách"
                      >
                        <MenuItem value="">-- Chưa chỉ định bác sĩ --</MenuItem>
                        {doctorsData?.data?.map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.user?.fullName} — {d.specialty?.name || 'Đa khoa'}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </div>

              {/* Appointment Date */}
              <div>
                <TextField
                  label="Thời gian hẹn khám *"
                  type="datetime-local"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('appointmentDate')}
                  error={!!errors.appointmentDate}
                  helperText={errors.appointmentDate?.message}
                />
              </div>

              {/* Notes */}
              <div>
                <TextField
                  label="Ghi chú"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('notes')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(`/appointments/${id}`)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
