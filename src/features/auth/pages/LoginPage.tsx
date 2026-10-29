import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link as RouterLink, useLocation } from "react-router-dom";

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
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { authApi } from "@/api/endpoints/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { loginSchema, LoginFormValues } from "../schemas/auth.schema";
import { AxiosError } from "axios";

const inputSx = {
  "& .MuiInput-root": {
    fontSize: 14,

    "&::before, &::after": {
      borderBottom: "1px solid #d1d5db",
    },

    "&:hover:not(.Mui-disabled, .Mui-error)::before": {
      borderBottom: "1px solid #d1d5db",
    },

    "&.Mui-focused::after": {
      borderBottom: "1px solid #d1d5db",
    },

    "&.Mui-error::before, &.Mui-error::after": {
      borderBottomColor: "error.main",
    },
  },

  "& .MuiInputBase-input": {
    padding: "10px 0",
  },

  "& .MuiInputLabel-root": {
    fontSize: 14,
    color: "text.secondary",

    "&.Mui-focused": {
      color: "text.secondary",
    },

    "&.Mui-error": {
      color: "error.main",
    },
  },
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.login({
        identifier: values.email.trim(),
        password: values.password,
      });
      setAuth(response.accessToken, response.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.log("🚀 ~ onSubmit ~ err:", err)
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
        statusCode?: number;
      }>;

      const msg = axiosError.response?.data?.message;

      setErrorMessage(
        msg ||
          "Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (email: string) => {
    setValue("email", email);
    setValue("password", "Admin@123");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 448,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "grey.200",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Stack spacing={1} sx={{ alignItems: "center", mb: 4 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              bgcolor: "primary.main",
              color: "white",
              mb: 0.5,
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            }}
          >
            <LocalHospitalIcon />
          </Box>

          <Typography
            variant="h5"
            color="text.primary"
            sx={{ fontWeight: 700, textAlign: "center" }}
          >
            Hệ thống Quản lý Phòng khám
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: 12, textAlign: "center" }}
          >
            Đăng nhập để truy cập hồ sơ bệnh nhân, lịch hẹn và kho dược
          </Typography>
        </Stack>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 3, fontSize: 12 }}
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <TextField
              {...register("email")}
              variant="standard"
              label="Email"
              type="email"
              fullWidth
              size="small"
              placeholder="bacsi@phongkham.vn"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={inputSx}
            />

            <TextField
              {...register("password")}
              variant="standard"
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              fullWidth
              size="small"
              placeholder="••••••••"
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={inputSx}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        size="small"
                        edge="end"
                        onClick={() => setShowPassword((prev) => !prev)}
                        onMouseDown={(event) => event.preventDefault()}
                        aria-label={
                          showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                        }
                        sx={{ color: "text.secondary" }}
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
                textTransform: "none",
              }}
            >
              {isLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", fontSize: 12, mt: 3 }}
        >
          Chưa có tài khoản?{" "}
          <Box
            component={RouterLink}
            to="/register"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              textDecoration: "none",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Đăng ký ngay
          </Box>
        </Typography>
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
        borderColor: "grey.300",
        borderRadius: 2,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        textAlign: "left",
        textTransform: "none",
        color: "text.primary",
        "&:hover": {
          borderColor: "grey.400",
          bgcolor: "grey.50",
        },
      }}
    >
      <Stack sx={{ alignItems: "flex-start", width: "100%" }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
          {title}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{
            maxWidth: "100%",
          }}
        >
          {email}
        </Typography>
      </Stack>
    </Button>
  );
};
