// src/features/auth/schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100, 'Họ và tên tối đa 100 ký tự'),
  email: z.string().min(1, 'Email không được để trống').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
