// src/components/common/StatusChip.tsx
import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  AppointmentStatus,
  TriageLevel,
  StockTransactionType,
  UserRole,
  Gender,
} from '@/types';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status?: AppointmentStatus | TriageLevel | StockTransactionType | UserRole | Gender | string | null;
  type?: 'appointment' | 'triage' | 'stock' | 'role' | 'gender';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  type = 'appointment',
  ...rest
}) => {
  if (!status) return <span className="text-slate-400 text-xs">—</span>;

  // Appointment status
  if (type === 'appointment' || Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    const map: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
      [AppointmentStatus.PENDING]: { label: 'Chờ xác nhận', bg: 'bg-slate-100', text: 'text-slate-700' },
      [AppointmentStatus.CONFIRMED]: { label: 'Đã xác nhận', bg: 'bg-blue-50', text: 'text-blue-700' },
      [AppointmentStatus.WAITING_TRIAGE]: { label: 'Chờ phân loại', bg: 'bg-amber-50', text: 'text-amber-700' },
      [AppointmentStatus.TRIAGED]: { label: 'Đã phân loại', bg: 'bg-yellow-50', text: 'text-yellow-800' },
      [AppointmentStatus.IN_EXAMINATION]: { label: 'Đang khám', bg: 'bg-purple-50', text: 'text-purple-700' },
      [AppointmentStatus.COMPLETED]: { label: 'Hoàn thành', bg: 'bg-emerald-50', text: 'text-emerald-700' },
      [AppointmentStatus.CANCELLED]: { label: 'Đã hủy', bg: 'bg-rose-50', text: 'text-rose-700' },
      [AppointmentStatus.NO_SHOW]: { label: 'Vắng mặt', bg: 'bg-neutral-200', text: 'text-neutral-800' },
    };
    const config = map[status as AppointmentStatus] || { label: String(status), bg: 'bg-slate-100', text: 'text-slate-700' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }

  // Triage Level
  if (type === 'triage' || Object.values(TriageLevel).includes(status as TriageLevel)) {
    const map: Record<TriageLevel, { label: string; bg: string; text: string }> = {
      [TriageLevel.LEVEL_1]: { label: 'Cấp 1 - Nguy kịch', bg: 'bg-red-600', text: 'text-white' },
      [TriageLevel.LEVEL_2]: { label: 'Cấp 2 - Nặng', bg: 'bg-rose-100', text: 'text-rose-800' },
      [TriageLevel.LEVEL_3]: { label: 'Cấp 3 - Trung bình', bg: 'bg-amber-100', text: 'text-amber-800' },
      [TriageLevel.LEVEL_4]: { label: 'Cấp 4 - Nhẹ', bg: 'bg-yellow-100', text: 'text-yellow-800' },
      [TriageLevel.LEVEL_5]: { label: 'Cấp 5 - Không khẩn cấp', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    };
    const config = map[status as TriageLevel] || { label: String(status), bg: 'bg-slate-100', text: 'text-slate-700' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }

  // Stock transaction type
  if (type === 'stock' || Object.values(StockTransactionType).includes(status as StockTransactionType)) {
    const map: Record<StockTransactionType, { label: string; bg: string; text: string }> = {
      [StockTransactionType.IN]: { label: 'Nhập kho', bg: 'bg-emerald-50', text: 'text-emerald-700' },
      [StockTransactionType.OUT]: { label: 'Xuất kho', bg: 'bg-rose-50', text: 'text-rose-700' },
      [StockTransactionType.ADJUSTMENT]: { label: 'Điều chỉnh', bg: 'bg-blue-50', text: 'text-blue-700' },
      [StockTransactionType.EXPIRED]: { label: 'Hết hạn', bg: 'bg-slate-100', text: 'text-slate-700' },
      [StockTransactionType.RETURN]: { label: 'Trả hàng', bg: 'bg-amber-50', text: 'text-amber-700' },
    };
    const config = map[status as StockTransactionType] || { label: String(status), bg: 'bg-slate-100', text: 'text-slate-700' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }

  // User Role
  if (type === 'role' || Object.values(UserRole).includes(status as UserRole)) {
    const map: Record<UserRole, { label: string; bg: string; text: string }> = {
      [UserRole.SUPER_ADMIN]: { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-800' },
      [UserRole.ADMIN]: { label: 'Quản trị viên', bg: 'bg-blue-100', text: 'text-blue-800' },
      [UserRole.MANAGER]: { label: 'Quản lý', bg: 'bg-teal-100', text: 'text-teal-800' },
      [UserRole.STAFF]: { label: 'Nhân viên y tế', bg: 'bg-cyan-100', text: 'text-cyan-800' },
      [UserRole.USER]: { label: 'Người dùng', bg: 'bg-slate-100', text: 'text-slate-800' },
      [UserRole.GUEST]: { label: 'Khách', bg: 'bg-neutral-100', text: 'text-neutral-700' },
    };
    const config = map[status as UserRole] || { label: String(status), bg: 'bg-slate-100', text: 'text-slate-700' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }

  // Gender
  if (type === 'gender' || Object.values(Gender).includes(status as Gender)) {
    const map: Record<Gender, { label: string; text: string }> = {
      [Gender.MALE]: { label: 'Nam', text: 'text-sky-700 font-medium' },
      [Gender.FEMALE]: { label: 'Nữ', text: 'text-rose-700 font-medium' },
      [Gender.OTHER]: { label: 'Khác', text: 'text-slate-600' },
    };
    const config = map[status as Gender] || { label: String(status), text: 'text-slate-600' };
    return <span className={`text-xs ${config.text}`}>{config.label}</span>;
  }

  return <Chip size="small" label={String(status)} {...rest} />;
};
