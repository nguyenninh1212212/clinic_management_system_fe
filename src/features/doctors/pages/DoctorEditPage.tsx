// src/features/doctors/pages/DoctorEditPage.tsx
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
import { updateDoctorSchema, UpdateDoctorFormValues } from '../schemas/doctor.schema';
import { useDoctor, useUpdateDoctor } from '../hooks/useDoctors';
import { useSpecialtiesDropdown } from '@/features/specialties/hooks/useSpecialties';
import { DoctorDegree } from '@/types';

export const DoctorEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: doctor, isLoading } = useDoctor(id || '');
  const updateMutation = useUpdateDoctor();
  const { data: specialties } = useSpecialtiesDropdown();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateDoctorFormValues>({
    resolver: zodResolver(updateDoctorSchema),
    defaultValues: {
      specialtyId: undefined,
      licenseNumber: '',
      degree: DoctorDegree.MD,
      yearsOfExperience: 0,
      bio: '',
    },
  });

  useEffect(() => {
    if (doctor) {
      reset({
        specialtyId: doctor.specialtyId || undefined,
        licenseNumber: doctor.licenseNumber || '',
        degree: doctor.degree || DoctorDegree.MD,
        yearsOfExperience: doctor.yearsOfExperience || 0,
        bio: doctor.bio || '',
      });
    }
  }, [doctor, reset]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  const onSubmit = async (values: UpdateDoctorFormValues) => {
    if (!id) return;
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          specialtyId: values.specialtyId ? Number(values.specialtyId) : undefined,
          licenseNumber: values.licenseNumber,
          degree: values.degree,
          yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : 0,
          bio: values.bio || undefined,
        },
      });
      navigate(`/doctors/${id}`);
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Chỉnh sửa: ${doctor?.user?.fullName || 'Bác sĩ'}`}
        subtitle="Cập nhật thông tin chứng chỉ hành nghề và chuyên môn"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Bác sĩ', href: '/doctors' },
          { label: doctor?.user?.fullName || 'Chi tiết', href: `/doctors/${id}` },
          { label: 'Chỉnh sửa' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/doctors/${id}`)}
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
                'Có lỗi xảy ra khi cập nhật hồ sơ bác sĩ.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <TextField
                  label="Số chứng chỉ hành nghề (CCHN) *"
                  fullWidth
                  {...register('licenseNumber')}
                  error={!!errors.licenseNumber}
                  helperText={errors.licenseNumber?.message}
                />
              </div>

              <div>
                <FormControl fullWidth error={!!errors.degree}>
                  <InputLabel id="degree-edit-label">Học vị / Học hàm *</InputLabel>
                  <Controller
                    name="degree"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="degree-edit-label"
                        label="Học vị / Học hàm *"
                      >
                        <MenuItem value={DoctorDegree.MD}>Bác sĩ Đa khoa (MD)</MenuItem>
                        <MenuItem value={DoctorDegree.MASTER}>Thạc sĩ Y khoa (Master)</MenuItem>
                        <MenuItem value={DoctorDegree.PHD}>Tiến sĩ Y khoa (PhD)</MenuItem>
                        <MenuItem value={DoctorDegree.ASSOCIATE_PROFESSOR}>Phó Giáo sư</MenuItem>
                        <MenuItem value={DoctorDegree.PROFESSOR}>Giáo sư</MenuItem>
                      </Select>
                    )}
                  />
                  {errors.degree && (
                    <FormHelperText>{errors.degree.message}</FormHelperText>
                  )}
                </FormControl>
              </div>

              <div>
                <FormControl fullWidth error={!!errors.specialtyId}>
                  <InputLabel id="specialty-edit-label">Chuyên khoa</InputLabel>
                  <Controller
                    name="specialtyId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        labelId="specialty-edit-label"
                        label="Chuyên khoa"
                      >
                        <MenuItem value="">-- Chưa chỉ định --</MenuItem>
                        {specialties?.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </div>

              <div>
                <TextField
                  label="Số năm kinh nghiệm"
                  type="number"
                  fullWidth
                  {...register('yearsOfExperience', { valueAsNumber: true })}
                  error={!!errors.yearsOfExperience}
                  helperText={errors.yearsOfExperience?.message}
                />
              </div>

              <div className="sm:col-span-2">
                <TextField
                  label="Tiểu sử / Quá trình công tác"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('bio')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outlined" color="inherit" onClick={() => navigate(`/doctors/${id}`)}>
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
