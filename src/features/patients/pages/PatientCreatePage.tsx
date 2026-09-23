// src/features/patients/pages/PatientCreatePage.tsx
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
import { patientSchema, PatientFormValues } from '../schemas/patient.schema';
import { useCreatePatient } from '../hooks/usePatients';
import { Gender } from '@/types';

export const PatientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreatePatient();

  const {
    register,
    handleSubmit,
    control,
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

  const onSubmit = async (values: PatientFormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        fullName: values.fullName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth || undefined,
        phone: values.phone || undefined,
        identityNumber: values.identityNumber || undefined,
        address: values.address || undefined,
        medicalHistory: values.medicalHistory || undefined,
      });
      navigate(`/patients/${created.id}`);
    } catch {
      // Error handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Tiếp nhận Bệnh nhân mới"
        subtitle="Nhập thông tin hành chính và tiền sử bệnh lý để mở hồ sơ theo dõi"
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Bệnh nhân', href: '/patients' },
          { label: 'Tiếp nhận mới' },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/patients')}
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
                'Có lỗi xảy ra khi tạo hồ sơ. Kiểm tra xem số điện thoại hoặc CCCD có bị trùng lặp không.'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <TextField
                  label="Họ và tên bệnh nhân *"
                  fullWidth
                  placeholder="NGUYỄN VĂN A"
                  {...register('fullName')}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                />
              </div>

              {/* Gender */}
              <div>
                <FormControl fullWidth error={!!errors.gender}>
                  <InputLabel id="gender-label">Giới tính *</InputLabel>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} labelId="gender-label" label="Giới tính *">
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

              {/* Date of Birth */}
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

              {/* Phone */}
              <div>
                <TextField
                  label="Số điện thoại"
                  fullWidth
                  placeholder="0912345678"
                  {...register('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              </div>

              {/* Identity Number (CCCD/CMND) */}
              <div>
                <TextField
                  label="Số CCCD / CMND"
                  fullWidth
                  placeholder="001234567890"
                  {...register('identityNumber')}
                  error={!!errors.identityNumber}
                  helperText={errors.identityNumber?.message}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <TextField
                  label="Địa chỉ thường trú"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                  {...register('address')}
                />
              </div>

              {/* Medical History */}
              <div className="sm:col-span-2">
                <TextField
                  label="Tiền sử bệnh lý / Dị ứng"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Tiền sử dị ứng kháng sinh, hen suyễn, tăng huyết áp, đái tháo đường..."
                  {...register('medicalHistory')}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate('/patients')}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Lưu hồ sơ bệnh nhân'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
