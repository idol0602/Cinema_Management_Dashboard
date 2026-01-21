import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Tên là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  role: z.string().min(1, "Vai trò là bắt buộc"),
  is_online: z.boolean().default(false).optional(),
  last_seen: z.string().default(new Date().toISOString()).optional(),
  created_at: z.string().default(new Date().toISOString()).optional(),
  is_active: z.boolean().default(true).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
