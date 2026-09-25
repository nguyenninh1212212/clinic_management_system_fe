// src/features/appointments/pages/AppointmentCreatePage.tsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FormHelperText,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '@/components/common/PageHeader';
import {
  createAppointmentSchema,
  CreateAppointmentFormValues,
} from '../schemas/appointment.schema';
import { useCreateAppointment } from '../hooks/useAppointments';
import { usePatients } from '@/features/patients/hooks/usePatients';
import { useDoctors } from '@/features/doctors/hooks/useDoctors';
import dayjs from 'dayjs';

export const AppointmentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get('patientId') || '';
  const preselectedDoctorId = searchParams.get('doctorId') || '';

  const createMutation = useCreateAppointment();

  // Load patients and doctors
  const { data: patientsData, isLoading: loadingPatients } = usePatients({ limit: 100 });
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors({ limit: 100 });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: preselectedPatientId,
      doctorId: preselectedDoctorId,
      appointmentDate: dayjs().add(1, 'hour').minute(0).format('YYYY-MM-DDTHH:mm'),
      notes: '',
    },
  });

  const onSubmit = async (values: CreateAppointmentFormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        patientId: values.patientId,
        doctorId: values.doctorId || undefined,
        appointmentDate: new Date(values.appointmentDate).toISOString(),
        notes: values.notes || undefined,
      });
      navigate(`/appointments/${created.data.id}`);
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Đặt lịch hẹn Khám bệnh"
        subtitle="Đăng ký lịch khám mới cho bệnh nhân tại cơ sở y tế"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Lịch hẹn', href: '/appointments' },
          { label: 'Đặt lịch mới' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/appointments')}
            size="small"
          >
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 sm:p-8">
          {createMutation.isError && (
            <Alert severity="error" className="mb-6">
              {(createMutation.error as any)?.response?.data?.message ||
                'Có lỗi xảy ra khi tạo lịch hẹn. Vui lòng kiểm tra lại thông tin.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Patient Selection */}
              <div>
                <FormControl fullWidth error={!!errors.patientId}>
                  <InputLabel id="patient-select-label">Bệnh nhân khám *</InputLabel>
                  <Controller
                    name="patientId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="patient-select-label"
                        label="Bệnh nhân khám *"
                        disabled={loadingPatients}
                      >
                        {patientsData?.data?.map((p) => (
                          <MenuItem key={p.id} value={p.id}>
                            {p.fullName} — {p.phone || 'Không có SĐT'} (CCCD: {p.identityNumber || '—'})
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.patientId && (
                    <FormHelperText>{errors.patientId.message}</FormHelperText>
                  )}
                </FormControl>
              </div>

              {/* Doctor Selection */}
              <div>
                <FormControl fullWidth error={!!errors.doctorId}>
                  <InputLabel id="doctor-select-label">Bác sĩ phụ trách (Tùy chọn)</InputLabel>
                  <Controller
                    name="doctorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="doctor-select-label"
                        label="Bác sĩ phụ trách (Tùy chọn)"
                        disabled={loadingDoctors}
                      >
                        <MenuItem value="">-- Chưa chỉ định bác sĩ cụ thể --</MenuItem>
                        {doctorsData?.data?.map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.user?.fullName} — {d.specialty?.name || 'Đa khoa'} (CCHN: {d.licenseNumber})
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </div>

              {/* Appointment Date and Time */}
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
                  label="Triệu chứng ban đầu / Lý do khám / Ghi chú"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="VD: Bệnh nhân đau đầu, sốt nhẹ 2 ngày nay..."
                  {...register('notes')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outlined" color="inherit" onClick={() => navigate('/appointments')}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Xác nhận đặt lịch'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
