// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { usePermission } from '@/hooks/usePermission';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  visible?: boolean;
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { isSuperAdmin, isManager, canViewPatients, canViewAuditLogs } = usePermission();

  const navigationGroups: NavGroup[] = [
    {
      groupTitle: 'TỔNG QUAN',
      items: [
        {
          label: 'Bảng điều khiển',
          path: '/dashboard',
          icon: <DashboardOutlinedIcon fontSize="small" />,
          visible: true,
        },
      ],
    },
    {
      groupTitle: 'TIẾP ĐÓN & KHÁM CHỮA',
      items: [
        {
          label: 'Hồ sơ Bệnh nhân',
          path: '/patients',
          icon: <PeopleAltOutlinedIcon fontSize="small" />,
          visible: canViewPatients,
        },
        {
          label: 'Lịch hẹn khám',
          path: '/appointments',
          icon: <EventNoteOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Lịch làm việc bác sĩ',
          path: '/doctor-schedule',
          icon: <EventNoteOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Phân loại cấp cứu (Triage)',
          path: '/triage-results',
          icon: <HealingOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Phiếu khám bệnh',
          path: '/examinations',
          icon: <AssignmentOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Đơn thuốc',
          path: '/prescriptions',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Hóa đơn thanh toán',
          path: '/invoices',
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
          visible: true,
        },
      ],
    },
    {
      groupTitle: 'NHÂN SỰ Y TẾ',
      items: [
        {
          label: 'Danh sách Bác sĩ',
          path: '/doctors',
          icon: <MedicalServicesOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Chuyên khoa',
          path: '/specialties',
          icon: <LocalHospitalOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Vị trí công việc',
          path: '/positions',
          icon: <BadgeOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Phân công ca bác sĩ',
          path: '/doctor-shifts',
          icon: <EventNoteOutlinedIcon fontSize="small" />,
          visible: isManager,
        },
      ],
    },
    {
      groupTitle: 'DƯỢC & KHO VẬN',
      items: [
        {
          label: 'Danh mục Thuốc',
          path: '/medicines',
          icon: <MedicationOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Tồn kho dược',
          path: '/inventory',
          icon: <Inventory2OutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Giao dịch kho',
          path: '/stock-transactions',
          icon: <SwapHorizOutlinedIcon fontSize="small" />,
          visible: true,
        },
        {
          label: 'Nhà thuốc',
          path: '/pharmacy',
          icon: <MedicationOutlinedIcon fontSize="small" />,
          visible: true,
        },
      ],
    },
    {
      groupTitle: 'HỆ THỐNG & BẢO MẬT',
      items: [
        {
          label: 'Nhật ký kiểm toán',
          path: '/audit-logs',
          icon: <HistoryOutlinedIcon fontSize="small" />,
          visible: canViewAuditLogs,
        },
        {
          label: 'Quản lý Người dùng',
          path: '/users',
          icon: <ManageAccountsOutlinedIcon fontSize="small" />,
          visible: isSuperAdmin,
        },
        {
          label: 'Phân quyền hệ thống',
          path: '/permissions',
          icon: <SecurityOutlinedIcon fontSize="small" />,
          visible: isSuperAdmin,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 h-full flex flex-col border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-md shadow-sky-600/30">
          <LocalHospitalOutlinedIcon fontSize="medium" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-white leading-tight">
            MEDI CLINIC
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            HỆ THỐNG PHÒNG KHÁM
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navigationGroups.map((group, gIdx) => {
          const visibleItems = group.items.filter((i) => i.visible !== false);
          if (visibleItems.length === 0) return null;

          return (
            <div key={gIdx} className="space-y-1">
              <Typography
                variant="caption"
                className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider block"
              >
                {group.groupTitle}
              </Typography>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-600 text-white font-semibold shadow-sm shadow-sky-600/20'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </div>

      {/* Bottom Clinic System Info */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 shrink-0">
        <div className="px-2 py-1.5 rounded bg-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Phiên bản v2.6.0</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>
      </div>
    </aside>
  );
};
