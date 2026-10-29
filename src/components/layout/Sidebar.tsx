import React from "react";
import { NavLink } from "react-router-dom";
import { Box, Divider, IconButton, Tooltip, Typography } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import HealingOutlinedIcon from "@mui/icons-material/HealingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { usePermission } from "@/hooks/usePermission";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const { isSuperAdmin, isManager, canManagePatientAccounts, canViewPatients, canViewAuditLogs } =
    usePermission();

  const navigationGroups: NavGroup[] = [
    {
      groupTitle: "TỔNG QUAN",
      items: [
        {
          label: "Bảng điều khiển",
          path: "/dashboard",
          icon: <DashboardOutlinedIcon fontSize="small" />,
        },
      ],
    },
    {
      groupTitle: "TIẾP ĐÓN & KHÁM CHỮA",
      items: [
        {
          label: "Hồ sơ Bệnh nhân",
          path: "/patients",
          icon: <PeopleAltOutlinedIcon fontSize="small" />,
          visible: canViewPatients,
        },
        {
          label: "Lịch hẹn khám",
          path: "/appointments",
          icon: <EventNoteOutlinedIcon fontSize="small" />,
        },
        {
          label: "Lịch làm việc bác sĩ",
          path: "/doctor-schedule",
          icon: <EventNoteOutlinedIcon fontSize="small" />,
        },
        {
          label: "Phân loại cấp cứu (Triage)",
          path: "/triage-results",
          icon: <HealingOutlinedIcon fontSize="small" />,
        },
        {
          label: "Phiếu khám bệnh",
          path: "/examinations",
          icon: <AssignmentOutlinedIcon fontSize="small" />,
        },
        {
          label: "Đơn thuốc",
          path: "/prescriptions",
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
        },
        {
          label: "Hóa đơn thanh toán",
          path: "/invoices",
          icon: <ReceiptLongOutlinedIcon fontSize="small" />,
        },
      ],
    },
    {
      groupTitle: "NHÂN SỰ Y TẾ",
      items: [
        {
          label: "Danh sách Bác sĩ",
          path: "/doctors",
          icon: <MedicalServicesOutlinedIcon fontSize="small" />,
        },
        {
          label: "Chuyên khoa",
          path: "/specialties",
          icon: <LocalHospitalOutlinedIcon fontSize="small" />,
        },
        {
          label: "Vị trí công việc",
          path: "/positions",
          icon: <BadgeOutlinedIcon fontSize="small" />,
        },
        {
          label: "Phân công ca bác sĩ",
          path: "/doctor-shifts",
          icon: <EventNoteOutlinedIcon fontSize="small" />,
          visible: isManager,
        },
      ],
    },
    {
      groupTitle: "DƯỢC & KHO VẬN",
      items: [
        {
          label: "Danh mục Thuốc",
          path: "/medicines",
          icon: <MedicationOutlinedIcon fontSize="small" />,
        },
        {
          label: "Tồn kho dược",
          path: "/inventory",
          icon: <Inventory2OutlinedIcon fontSize="small" />,
        },
        {
          label: "Giao dịch kho",
          path: "/stock-transactions",
          icon: <SwapHorizOutlinedIcon fontSize="small" />,
        },
      ],
    },
    {
      groupTitle: "HỆ THỐNG & BẢO MẬT",
      items: [
        {
          label: "Nhật ký kiểm toán",
          path: "/audit-logs",
          icon: <HistoryOutlinedIcon fontSize="small" />,
          visible: canViewAuditLogs,
        },
        {
          label: "Quản lý Người dùng",
          path: "/users",
          icon: <ManageAccountsOutlinedIcon fontSize="small" />,
          visible: isSuperAdmin,
        },
        {
          label: "Tài khoản bệnh nhân",
          path: "/patient-accounts",
          icon: <ManageAccountsOutlinedIcon fontSize="small" />,
          visible: canManagePatientAccounts,
        },
        {
          label: "Phân quyền hệ thống",
          path: "/permissions",
          icon: <SecurityOutlinedIcon fontSize="small" />,
          visible: isSuperAdmin,
        },
      ],
    },
  ];

  return (
    <Box
      component="aside"
      sx={{
        width: "100%",
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: "#cbd5e1",
        bgcolor: "#0b1220",
        borderRight: "1px solid #1e293b",
        userSelect: "none",
        transition: "width 200ms ease",
      }}
    >
      <Box
        sx={{
          minHeight: 72,
          px: collapsed ? 1 : 1.75,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
          borderBottom: "1px solid #1e293b",
        }}
      >
        {collapsed ? (
          onToggleCollapse ? (
            <Tooltip title="Mở rộng menu" placement="right">
              <IconButton
                onClick={onToggleCollapse}
                size="small"
                aria-label="Mở rộng sidebar"
                sx={{
                  color: "#94a3b8",
                  "&:hover": { color: "#fff", bgcolor: "#1e293b" },
                }}
              >
                <PanelLeftOpen size={19} />
              </IconButton>
            </Tooltip>
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                bgcolor: "primary.main",
                borderRadius: 2.5,
              }}
            >
              <LocalHospitalOutlinedIcon />
            </Box>
          )
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.25,
              minWidth: 0,
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  color: "#fff",
                  bgcolor: "primary.main",
                  borderRadius: 2.5,
                  boxShadow: "0 6px 18px rgba(2,132,199,.25)",
                }}
              >
                <LocalHospitalOutlinedIcon />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: "#f8fafc",
                    fontWeight: 800,
                    letterSpacing: ".04em",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  MEDI CLINIC
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#94a3b8",
                    fontSize: 9,
                    letterSpacing: ".09em",
                    whiteSpace: "nowrap",
                  }}
                >
                  HỆ THỐNG PHÒNG KHÁM
                </Typography>
              </Box>
            </Box>
            {onToggleCollapse && (
              <Tooltip
                title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
                placement="right"
              >
                <IconButton
                  onClick={onToggleCollapse}
                  size="small"
                  aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                  sx={{
                    color: "#94a3b8",
                    "&:hover": { color: "#fff", bgcolor: "#1e293b" },
                  }}
                >
                  {collapsed ? (
                    <PanelLeftOpen size={18} />
                  ) : (
                    <PanelLeftClose size={18} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          py: 2,
          px: collapsed ? 1 : 1.25,
          "&::-webkit-scrollbar": { width: 5 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#334155", borderRadius: 5 },
        }}
      >
        {navigationGroups.map((group, groupIndex) => {
          const visibleItems = group.items.filter(
            (item) => item.visible !== false,
          );
          if (!visibleItems.length) return null;

          return (
            <Box key={group.groupTitle} sx={{ mb: 1.75 }}>
              {collapsed ? (
                groupIndex > 0 && (
                  <Divider sx={{ my: 1.25, borderColor: "#1e293b" }} />
                )
              ) : (
                <Typography
                  variant="overline"
                  sx={{
                    display: "block",
                    px: 1.25,
                    mb: 0.75,
                    color: "#64748b",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: ".1em",
                    lineHeight: 1.5,
                  }}
                >
                  {group.groupTitle}
                </Typography>
              )}
              <Box
                component="nav"
                aria-label={group.groupTitle}
                sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
              >
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {({ isActive }) => (
                      <Tooltip
                        title={collapsed ? item.label : ""}
                        placement="right"
                        arrow
                        disableHoverListener={!collapsed}
                      >
                        <Box
                          component="span"
                          sx={{
                            minHeight: 42,
                            px: collapsed ? 0 : 1.25,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: collapsed ? "center" : "flex-start",
                            gap: 1.25,
                            borderRadius: 2,
                            color: isActive ? "#fff" : "#a8b4c5",
                            bgcolor: isActive ? "primary.main" : "transparent",
                            boxShadow: isActive
                              ? "0 5px 14px rgba(2,132,199,.2)"
                              : "none",
                            transition:
                              "background-color 150ms ease, color 150ms ease",
                            "&:hover": {
                              color: "#fff",
                              bgcolor: isActive ? "primary.dark" : "#172235",
                            },
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              color: isActive ? "#fff" : "#8fa1b8",
                            }}
                          >
                            {item.icon}
                          </Box>
                          {!collapsed && (
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: 12,
                                fontWeight: isActive ? 700 : 500,
                              }}
                            >
                              {item.label}
                            </Typography>
                          )}
                        </Box>
                      </Tooltip>
                    )}
                  </NavLink>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>

      {!collapsed && (
        <Box sx={{ p: 1.5, borderTop: "1px solid #1e293b" }}>
          <Box
            sx={{
              px: 1.25,
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#111c2e",
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", fontSize: 10, fontWeight: 600 }}
            >
              Phiên bản v2.6.0
            </Typography>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "success.main",
                boxShadow: "0 0 0 3px rgba(34,197,94,.12)",
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
