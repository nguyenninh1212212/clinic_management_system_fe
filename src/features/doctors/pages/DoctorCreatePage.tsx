// src/features/doctors/pages/DoctorCreatePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { createDoctorSchema, CreateDoctorFormValues } from '../schemas/doctor.schema';
import { useCreateDoctor } from '../hooks/useDoctors';
import { useSpecialtiesDropdown } from '@/features/specialties/hooks/useSpecialties';
import { useUsersDropdown } from '@/features/users/hooks/useUsers';
import { DoctorDegree } from '@/types';

export const DoctorCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateDoctor();
  const { data: specialties } = useSpecialtiesDropdown();

  // Load users to link
  const { data: usersData, isLoading: loadingUsers } = useUsersDropdown(100);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateDoctorFormValues>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      userId: '',
      specialtyId: undefined,
      licenseNumber: '',
      degree: DoctorDegree.MD,
      yearsOfExperience: 0,
      bio: '',
    },
  });

  const onSubmit = async (values: CreateDoctorFormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        userId: values.userId,
        specialtyId: values.specialtyId ? Number(values.specialtyId) : undefined,
        licenseNumber: values.licenseNumber,
        degree: values.degree,
        yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : 0,
        bio: values.bio || undefined,
      });
      navigate(`/doctors/${created.id}`);
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Tạo hồ sơ Bác sĩ"
        subtitle="Liên kết tài khoản người dùng và thiết lập chứng chỉ hành nghề y tế"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Bác sĩ', href: '/doctors' },
          { label: 'Thêm mới' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/doctors')}
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
                'Có lỗi xảy ra khi tạo hồ sơ bác sĩ. Lưu ý: Mỗi tài khoản người dùng chỉ liên kết được 1 hồ sơ bác sĩ.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* User Selection */}
              <div className="sm:col-span-2">
                <FormControl fullWidth error={!!errors.userId}>
                  <InputLabel id="user-select-label">Tài khoản người dùng liên kết *</InputLabel>
                  <Controller
                    name="userId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="user-select-label"
                        label="Tài khoản người dùng liên kết *"
                        disabled={loadingUsers}
                      >
                        {usersData?.data?.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {u.fullName} — {u.email} ({u.role})
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.userId && (
                    <FormHelperText>{errors.userId.message}</FormHelperText>
                  )}
                </FormControl>
              </div>

              {/* License Number */}
              <div>
                <TextField
                  label="Số chứng chỉ hành nghề (CCHN) *"
                  fullWidth
                  placeholder="012345/BYT-CCHN"
                  {...register('licenseNumber')}
                  error={!!errors.licenseNumber}
                  helperText={errors.licenseNumber?.message}
                />
              </div>

              {/* Degree */}
              <div>
                <FormControl fullWidth error={!!errors.degree}>
                  <InputLabel id="degree-select-label">Học vị / Học hàm *</InputLabel>
                  <Controller
                    name="degree"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="degree-select-label"
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

              {/* Specialty */}
              <div>
                <FormControl fullWidth error={!!errors.specialtyId}>
                  <InputLabel id="specialty-select-label">Chuyên khoa phụ trách</InputLabel>
                  <Controller
                    name="specialtyId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e: any) =>
                          field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                        }
                        labelId="specialty-select-label"
                        label="Chuyên khoa phụ trách"
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

              {/* Years of experience */}
              <div>
                <TextField
                  label="Số năm kinh nghiệm"
                  type="number"
                  fullWidth
                  placeholder="5"
                  {...register('yearsOfExperience', { valueAsNumber: true })}
                  error={!!errors.yearsOfExperience}
                  helperText={errors.yearsOfExperience?.message}
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <TextField
                  label="Giới thiệu chuyên môn / Tóm tắt tiểu sử"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Quá trình đào tạo, lĩnh vực nghiên cứu chuyên sâu, các chứng chỉ đào tạo liên tục..."
                  {...register('bio')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outlined" color="inherit" onClick={() => navigate('/doctors')}>
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Lưu hồ sơ bác sĩ'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
