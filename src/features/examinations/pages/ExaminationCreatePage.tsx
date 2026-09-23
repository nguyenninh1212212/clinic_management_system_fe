// src/features/examinations/pages/ExaminationCreatePage.tsx
import React, { useEffect } from 'react';
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
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '@/components/common/PageHeader';
import {
  examinationSchema,
  ExaminationFormValues,
} from '../schemas/examination.schema';
import { useCreateExamination } from '../hooks/useExaminations';
import { useAppointments } from '@/features/appointments/hooks/useAppointments';
import { useDoctors } from '@/features/doctors/hooks/useDoctors';
import { AppointmentStatus } from '@/types';

export const ExaminationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedApptId = searchParams.get('appointmentId') || '';
  const preselectedDocId = searchParams.get('doctorId') || '';

  const createMutation = useCreateExamination();

  const { data: appointmentsData, isLoading: loadingAppts } = useAppointments({
    limit: 50,
  });
  const { data: doctorsData, isLoading: loadingDocs } = useDoctors({
    limit: 50,
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationSchema),
    defaultValues: {
      appointmentId: preselectedApptId,
      doctorId: preselectedDocId,
      diagnosis: '',
      icd10Code: '',
      clinicalNotes: '',
      treatmentPlan: '',
      followUpDate: '',
    },
  });

  const watchedApptId = watch('appointmentId');
  const selectedAppt = appointmentsData?.data?.find((a) => a.id === watchedApptId);

  useEffect(() => {
    if (selectedAppt?.doctorId && !preselectedDocId) {
      setValue('doctorId', selectedAppt.doctorId);
    }
  }, [selectedAppt, preselectedDocId, setValue]);

  const onSubmit = async (values: ExaminationFormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        appointmentId: values.appointmentId,
        doctorId: values.doctorId,
        diagnosis: values.diagnosis,
        icd10Code: values.icd10Code || undefined,
        clinicalNotes: values.clinicalNotes || undefined,
        treatmentPlan: values.treatmentPlan || undefined,
        followUpDate: values.followUpDate ? new Date(values.followUpDate).toISOString() : undefined,
      });
      navigate(`/examinations/${created.id}`);
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Lập phiếu Khám bệnh"
        subtitle="Ghi nhận chẩn đoán lâm sàng, chỉ định điều trị và kê đơn cho bệnh nhân"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Phiếu khám', href: '/examinations' },
          { label: 'Lập phiếu mới' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/examinations')}
            size="small"
          >
            Quay lại
          </Button>
        }
      />

      {/* Patient & Triage Summary if an appointment is selected */}
      {selectedAppt && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-500">Bệnh nhân khám: </span>
            <strong className="text-slate-900 text-sm">{selectedAppt.patient?.fullName}</strong>
            <span className="text-slate-500 ml-2">({selectedAppt.patient?.gender})</span>
          </div>
          {selectedAppt.triageResult && (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-500">Sinh hiệu:</span>
              <span>HA: {selectedAppt.triageResult.bloodPressure || '—'}</span>
              <span>· Mạch: {selectedAppt.triageResult.heartRate ?? '—'}</span>
              <span>· T: {selectedAppt.triageResult.temperature ? `${selectedAppt.triageResult.temperature}°C` : '—'}</span>
            </div>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-6 sm:p-8">
          {createMutation.isError && (
            <Alert severity="error" className="mb-6">
              {(createMutation.error as any)?.response?.data?.message ||
                'Có lỗi xảy ra khi tạo phiếu khám. Mỗi cuộc hẹn chỉ được liên kết 1 phiếu khám.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Appointment */}
              <div>
                <FormControl fullWidth error={!!errors.appointmentId}>
                  <InputLabel id="appt-select-label">Cuộc hẹn khám *</InputLabel>
                  <Controller
                    name="appointmentId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="appt-select-label"
                        label="Cuộc hẹn khám *"
                        disabled={loadingAppts}
                      >
                        {appointmentsData?.data?.map((a) => (
                          <MenuItem key={a.id} value={a.id}>
                            {a.patient?.fullName} — ({a.status})
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.appointmentId && (
                    <FormHelperText>{errors.appointmentId.message}</FormHelperText>
                  )}
                </FormControl>
              </div>

              {/* Doctor */}
              <div>
                <FormControl fullWidth error={!!errors.doctorId}>
                  <InputLabel id="doctor-select-label">Bác sĩ khám *</InputLabel>
                  <Controller
                    name="doctorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="doctor-select-label"
                        label="Bác sĩ khám *"
                        disabled={loadingDocs}
                      >
                        {doctorsData?.data?.map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.user?.fullName} — {d.specialty?.name || 'Đa khoa'}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.doctorId && (
                    <FormHelperText>{errors.doctorId.message}</FormHelperText>
                  )}
                </FormControl>
              </div>

              {/* Diagnosis */}
              <div className="sm:col-span-2">
                <TextField
                  label="Chẩn đoán xác định *"
                  fullWidth
                  placeholder="VD: Viêm họng cấp / Viêm phế quản cấp..."
                  {...register('diagnosis')}
                  error={!!errors.diagnosis}
                  helperText={errors.diagnosis?.message}
                />
              </div>

              {/* ICD-10 Code */}
              <div>
                <TextField
                  label="Mã bệnh ICD-10"
                  fullWidth
                  placeholder="VD: J02.9, I10, E11..."
                  {...register('icd10Code')}
                  error={!!errors.icd10Code}
                  helperText={errors.icd10Code?.message}
                />
              </div>

              {/* Follow-up Date */}
              <div>
                <TextField
                  label="Ngày hẹn tái khám"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('followUpDate')}
                />
              </div>

              {/* Clinical Notes */}
              <div className="sm:col-span-2">
                <TextField
                  label="Ghi chú lâm sàng / Diễn biến bệnh"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Các triệu chứng thực thể phát hiện khi khám: họng đỏ, không có giả mạc, tim đều, phổi trong..."
                  {...register('clinicalNotes')}
                />
              </div>

              {/* Treatment Plan */}
              <div className="sm:col-span-2">
                <TextField
                  label="Kế hoạch điều trị & Lời dặn"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Uống thuốc đúng liều, súc miệng nước muối, ăn uống đủ chất, tái khám ngay nếu sốt cao..."
                  {...register('treatmentPlan')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outlined" color="inherit" onClick={() => navigate('/examinations')}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Lưu phiếu khám bệnh'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
