// src/features/patients/pages/PatientEditPage.tsx
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
  FormHelperText,
  CircularProgress,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '@/components/common/PageHeader';
import { patientSchema, PatientFormValues } from '../schemas/patient.schema';
import { usePatient, useUpdatePatient } from '../hooks/usePatients';
import { Gender } from '@/types';
import dayjs from 'dayjs';

export const PatientEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: patient, isLoading } = usePatient(id || '');
  const updateMutation = useUpdatePatient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: '',
      gender: Gender.MALE,
      dateOfBirth: '',
      phone: '',
      identityNumber: '',
      address: '',
      medicalHistory: '',
    },
  });

  useEffect(() => {
    if (patient) {
      reset({
        fullName: patient.fullName || '',
        gender: patient.gender || Gender.MALE,
        dateOfBirth: patient.dateOfBirth
          ? dayjs(patient.dateOfBirth).format('YYYY-MM-DD')
          : '',
        phone: patient.phone || '',
        identityNumber: patient.identityNumber || '',
        address: patient.address || '',
        medicalHistory: patient.medicalHistory || '',
      });
    }
  }, [patient, reset]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  const onSubmit = async (values: PatientFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          fullName: values.fullName,
          gender: values.gender,
          dateOfBirth: values.dateOfBirth || undefined,
          phone: values.phone || undefined,
          identityNumber: values.identityNumber || undefined,
          address: values.address || undefined,
          medicalHistory: values.medicalHistory || undefined,
        },
      });
      navigate(`/patients/${id}`);
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Chỉnh sửa: ${patient?.fullName || 'Bệnh nhân'}`}
        subtitle="Cập nhật thông tin hành chính và tiền sử y khoa"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Bệnh nhân', href: '/patients' },
          { label: patient?.fullName || 'Chi tiết', href: `/patients/${id}` },
          { label: 'Chỉnh sửa' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/patients/${id}`)}
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
                'Có lỗi xảy ra khi cập nhật hồ sơ bệnh nhân.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <TextField
                  label="Họ và tên bệnh nhân *"
                  fullWidth
                  {...register('fullName')}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                />
              </div>

              <div>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel id="gender-edit-label">Giới tính *</InputLabel>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="gender-edit-label" label="Giới tính *">
                        <MenuItem value={Gender.MALE}>Nam</MenuItem>
                        <MenuItem value={Gender.FEMALE}>Nữ</MenuItem>
                        <MenuItem value={Gender.OTHER}>Khác</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <FormHelperText>{errors.gender.message}</FormHelperText>
                  )}
                </FormControl>
              </div>

              <div>
                <TextField
                  label="Ngày sinh"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register('dateOfBirth')}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                />
              </div>

              <div>
                <TextField
                  label="Số điện thoại"
                  fullWidth
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </div>

              <div>
                <TextField
                  label="Số CCCD / CMND"
                  fullWidth
                  {...register('identityNumber')}
                  error={!!errors.identityNumber}
                  helperText={errors.identityNumber?.message}
                />
              </div>

              <div className="sm:col-span-2">
                <TextField
                  label="Địa chỉ thường trú"
                  fullWidth
                  multiline
                  rows={2}
                  {...register('address')}
                />
              </div>

              <div className="sm:col-span-2">
                <TextField
                  label="Tiền sử bệnh lý / Dị ứng"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('medicalHistory')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(`/patients/${id}`)}
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
