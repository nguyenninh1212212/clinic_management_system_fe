// src/features/appointments/pages/AppointmentListPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, Tooltip, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusChip } from "@/components/common/StatusChip";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { AppointmentStatusDialog } from "../components/AppointmentStatusDialog";
import {
  useAppointments,
  useDeleteAppointment,
} from "../hooks/useAppointments";
import {
  Appointment,
  AppointmentQueryParams,
  AppointmentStatus,
} from "@/types";
import { useListFilters } from "@/hooks/useListFilters";
import dayjs from "dayjs";

export const AppointmentListPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { filters, replaceFilters } =
    useListFilters<Omit<AppointmentQueryParams, "page" | "limit">>();

  // Status Dialog State
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Delete State (Pending only)
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useAppointments({
    page,
    limit,
    ...filters,
  });

  const deleteMutation = useDeleteAppointment();

  const handleOpenStatus = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setStatusDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Handled by interceptor
    }
  };

  const columns: Column<Appointment>[] = [
    {
      id: "queueNumber",
      label: "STT",
      minWidth: 50,
      render: (row,idx) => (
        <span className="text-slate-400 tabular-nums">
          {row.queueNumber ?? (page - 1) * limit + idx + 1 }
        </span>
      ),
    },
    {
      id: "patient",
      label: "Bệnh nhân",
      filterFields: [
        { key: "fullName", label: "Tên bệnh nhân", type: "input" },
        { key: "phone", label: "Số điện thoại", type: "input" },
      ],
      minWidth: 220,
      render: (row) => {
        const patient = row.patient;

        const genderLabel =
          patient?.gender === "MALE"
            ? "Nam"
            : patient?.gender === "FEMALE"
              ? "Nữ"
              : "Chưa cập nhật";

        const dateOfBirth = patient?.dateOfBirth
          ? new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")
          : "Chưa cập nhật";

        return (
          <div className="flex flex-col gap-1 py-1">
            <button
              onClick={() => navigate(`/appointments/${row.id}`)}
              className="text-left text-sm font-semibold text-sky-700 hover:text-sky-900 hover:underline"
            >
              {patient?.fullName?.trim() || "Bệnh nhân"}
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{patient?.phone || "Chưa có số điện thoại"}</span>
            </div>

            <div className="text-xs text-slate-400">
              {genderLabel} · Ngày sinh: {dateOfBirth}
            </div>
          </div>
        );
      },
    },
    {
      id: "doctor",
      label: "Bác sĩ phụ trách",
      filterFields: [{ key: "doctorId", label: "Mã bác sĩ", type: "input" }],
      minWidth: 240,
      render: (row) => {
        const doctor = row.doctor;
        const fullName = doctor?.user?.fullName;
        const licenseNumber = doctor?.licenseNumber;
        const yearsOfExperience = doctor?.yearsOfExperience;

        return (
          <div className="flex flex-col gap-1 py-1">
            <span className="font-medium text-slate-800">
              {fullName ||
                (row.doctorId ? "Bác sĩ chuyên khoa" : "Chưa phân công")}
            </span>

            {doctor ? (
              <>
                <span className="text-xs text-slate-500">
                  {yearsOfExperience != null
                    ? `${yearsOfExperience} năm kinh nghiệm`
                    : "Chưa cập nhật kinh nghiệm"}
                </span>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  Số giấy phép: {licenseNumber || "Chưa cập nhật"}
                </Typography>
              </>
            ) : (
              <span className="text-xs text-slate-400">
                Chưa có thông tin bác sĩ
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "appointmentDate",
      label: "Ngày hẹn khám",
      filterFields: [
        { key: "date", label: "Ngày hẹn", type: "date" },
        { key: "dateFrom", label: "Từ ngày", type: "date" },
        { key: "dateTo", label: "Đến ngày", type: "date" },
      ],
      minWidth: 150,
      render: (row) => (
        <div className="tabular-nums">
          <div className="font-semibold text-slate-800 text-xs">
            {dayjs(row.appointmentDate).format("HH:mm")}
          </div>
          <div className="text-[11px] text-slate-500">
            {dayjs(row.appointmentDate).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      id: "status",
      label: "Trạng thái",
      filterFields: [
        {
          key: "status",
          label: "Trạng thái",
          type: "select",
          filters: Object.values(AppointmentStatus).map((value) => ({
            text: value,
            value,
          })),
        },
      ],
      minWidth: 150,
      render: (row) => (
        <button
          onClick={() => handleOpenStatus(row)}
          className="cursor-pointer hover:opacity-85 text-left group flex items-center gap-1"
          title="Bấm để đổi trạng thái"
        >
          <StatusChip status={row.status} type="appointment" />
          <AutorenewIcon
            fontSize="inherit"
            className="text-slate-400 group-hover:text-sky-600 text-xs"
          />
        </button>
      ),
    },
    {
      id: "notes",
      label: "Ghi chú",
      filterFields: [
        { key: "bookedByUserId", label: "Mã người đặt", type: "input" },
      ],
      minWidth: 160,
      render: (row) => (
        <span className="text-slate-500 text-xs line-clamp-1">
          {row.notes || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      minWidth: 140,
      render: (row) => {
        const canEdit = ![
          AppointmentStatus.COMPLETED,
          AppointmentStatus.CANCELLED,
        ].includes(row.status);
        const canDelete = row.status === AppointmentStatus.PENDING;

        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip title="Xem chi tiết cuộc hẹn">
              <IconButton
                size="small"
                onClick={() => navigate(`/appointments/${row.id}`)}
                className="text-slate-500 hover:text-sky-600"
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {canEdit && (
              <Tooltip title="Chỉnh sửa lịch hẹn">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/appointments/${row.id}/edit`)}
                  className="text-slate-500 hover:text-amber-600"
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {canDelete && (
              <Tooltip title="Xóa lịch hẹn (chỉ khi đang Chờ)">
                <IconButton
                  size="small"
                  onClick={() => setDeleteId(row.id)}
                  className="text-slate-500 hover:text-rose-600"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Lịch hẹn Khám bệnh"
        subtitle="Tiếp nhận bệnh nhân, phân loại sinh hiệu và điều phối phòng khám"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Lịch hẹn" },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/appointments/new")}
          >
            Đặt lịch khám
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        filters={filters}
        onFilterChange={(nextFilters) => {
          replaceFilters(nextFilters);
          setPage(1);
        }}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        emptyTitle="Chưa có lịch hẹn nào"
        emptyDescription="Thử thay đổi bộ lọc ngày/trạng thái hoặc đặt lịch khám mới."
        emptyActionText="Đặt lịch hẹn khám mới"
        onEmptyAction={() => navigate("/appointments/new")}
      />

      {/* Status Transition Dialog */}
      <AppointmentStatusDialog
        open={statusDialogOpen}
        appointment={selectedAppointment}
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedAppointment(null);
        }}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Xóa lịch hẹn?"
        content="Bạn có chắc muốn xóa lịch hẹn đang chờ xử lý này?"
        confirmText="Xóa lịch hẹn"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
