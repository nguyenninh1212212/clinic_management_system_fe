
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useNavigate,
  Link as RouterLink,
  useLocation,
} from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { authApi } from '@/api/endpoints/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { loginSchema, LoginFormValues } from '../schemas/auth.schema';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login(values);
      setAuth(response.accessToken, response.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.';

      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'Admin@123');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 448,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'grey.200',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        {/* Header */}
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'white',
              mb: 0.5,
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            }}
          >
            <LocalHospitalIcon />
          </Box>

          <Typography
            variant="h5"
            color="text.primary"
            sx={{ fontWeight: 700, textAlign: 'center' }}
          >
            Hệ thống Quản lý Phòng khám
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12, textAlign: 'center' }}
          >
            Đăng nhập để truy cập hồ sơ bệnh nhân, lịch hẹn và kho dược
          </Typography>
        </Stack>

        {/* Error */}
        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 3, fontSize: 12 }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}

        {/* Login form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Stack spacing={2}>
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              size="small"
              placeholder="bacsi@phongkham.vn"
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              {...register('password')}
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              placeholder="••••••••"
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword
                            ? 'Ẩn mật khẩu'
                            : 'Hiển thị mật khẩu'
                        }
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                mt: 1,
                py: 1.25,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {isLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', fontSize: 12, mt: 3 }}
        >
          Chưa có tài khoản?{' '}
          <Box
            component={RouterLink}
            to="/register"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Đăng ký ngay
          </Box>
        </Typography>

        <Divider sx={{ my: 3 }}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Tài khoản mẫu thử nghiệm
          </Typography>
        </Divider>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
            },
            gap: 1,
          }}
        >
          <DemoAccountButton
            title="Super Admin"
            email="superadmin@clinic.vn"
            onClick={() =>
              setDemoCredentials('superadmin@clinic.vn')
            }
          />

          <DemoAccountButton
            title="Quản trị viên"
            email="admin@clinic.vn"
            onClick={() =>
              setDemoCredentials('admin@clinic.vn')
            }
          />

          <DemoAccountButton
            title="Nhân viên y tế"
            email="staff@clinic.vn"
            onClick={() =>
              setDemoCredentials('staff@clinic.vn')
            }
          />

          <DemoAccountButton
            title="Bác sĩ / User"
            email="doctor@clinic.vn"
            onClick={() =>
              setDemoCredentials('doctor@clinic.vn')
            }
          />
        </Box>
      </Paper>
    </Box>
  );
};

interface DemoAccountButtonProps {
  title: string;
  email: string;
  onClick: () => void;
}

const DemoAccountButton: React.FC<DemoAccountButtonProps> = ({
  title,
  email,
  onClick,
}) => {
  return (
    <Button
      type="button"
      variant="outlined"
      onClick={onClick}
      sx={{
        minHeight: 58,
        p: 1.25,
        borderColor: 'grey.300',
        borderRadius: 2,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        textAlign: 'left',
        textTransform: 'none',
        color: 'text.primary',
        '&:hover': {
          borderColor: 'grey.400',
          bgcolor: 'grey.50',
        },
      }}
    >
      <Stack sx={{ alignItems: 'flex-start', width: '100%' }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, lineHeight: 1.4 }}
        >
          {title}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{
            maxWidth: '100%',
          }}
        >
          {email}
        </Typography>
      </Stack>
    </Button>
  );
};
