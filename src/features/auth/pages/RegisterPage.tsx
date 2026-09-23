// src/features/auth/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { authApi } from '@/api/endpoints/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { registerSchema, RegisterFormValues } from '../schemas/auth.schema';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await authApi.register(values);
      if (res.accessToken && res.user) {
        setAuth(res.accessToken, res.user);
        navigate('/dashboard');
      } else {
        // Auto-login if registration doesn't return full token
        const loginRes = await authApi.login({
          email: values.email,
          password: values.password,
        });
        setAuth(loginRes.accessToken, loginRes.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng ký không thành công. Email có thể đã được sử dụng.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100/80 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/30 mb-3">
            <LocalHospitalIcon fontSize="medium" />
          </div>
          <Typography variant="h5" className="font-bold text-slate-900 tracking-tight">
            Tạo tài khoản mới
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1 text-xs">
            Đăng ký tài khoản để sử dụng hệ thống quản lý phòng khám
          </Typography>
        </div>

        {errorMessage && (
          <Alert severity="error" className="mb-6 text-xs" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <TextField
              label="Họ và tên"
              fullWidth
              size="small"
              placeholder="BS. Nguyễn Văn A"
              {...register('fullName')}
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
            />
          </div>

          <div>
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              placeholder="bacsi@phongkham.vn"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </div>

          <div>
            <TextField
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              placeholder="Tối thiểu 6 ký tự"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            className="py-2.5 mt-2 font-semibold"
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Tạo tài khoản'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <RouterLink to="/login" className="font-semibold text-sky-600 hover:text-sky-700">
            Đăng nhập
          </RouterLink>
        </div>
      </div>
    </div>
  );
};
