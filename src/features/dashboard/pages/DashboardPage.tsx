// src/features/dashboard/pages/DashboardPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Skeleton, Box, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Alert, Tabs, Tab } from "@mui/material";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusChip } from "@/components/common/StatusChip";
import { Appointment, Gender } from "@/types";
import { usePermission } from "@/hooks/usePermission";
import dayjs from "dayjs";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { DashboardChartCard } from "../components/DashboardChartCard";
import type { DashboardChartRow } from "../components/DashboardChartCard";
import {
  DashboardChartGroup,
  useDashboardStats,
  useDashboardRecentAppointments,
  useDashboardCharts,
} from "../hooks/useDashboard";

const formatCurrency = (value: number) => `${value.toLocaleString("vi-VN")} ₫`;
const dateLabel = (value: string) => dayjs(value).format("DD/MM");

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { canCreateOrEditPatient } = usePermission();
  const [dateFrom, setDateFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(dayjs().format("YYYY-MM-DD"));
  const [doctorId, setDoctorId] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState(dateFrom);
  const [appliedDateTo, setAppliedDateTo] = useState(dateTo);
  const [appliedDoctorId, setAppliedDoctorId] = useState("");
  const [activeChartTab, setActiveChartTab] = useState<DashboardChartGroup>("appointments");
  const chartQueries = useDashboardCharts({ dateFrom: appliedDateFrom, dateTo: appliedDateTo, doctorId: appliedDoctorId || undefined }, activeChartTab);
  const { data: doctorsData } = useDoctors({ page: 1, limit: 100 }, activeChartTab === "appointments");

  const {
    totalPatients,
    totalToday,
    totalPending,
    totalLowStock,
    loadingPatients,
    loadingTodayAppts,
    loadingPending,
    loadingLowStock,
  } = useDashboardStats();

  const { recentAppointments, loadingRecent } =
    useDashboardRecentAppointments();

  const appointmentCharts = chartQueries.appointments.data?.data;
  const examinationCharts = chartQueries.examinations.data?.data;
  const prescriptionCharts = chartQueries.prescriptions.data?.data;
  const invoiceCharts = chartQueries.invoices.data?.data;
  const triageCharts = chartQueries.triage.data?.data;
  const stockCharts = chartQueries.stockTransactions.data?.data;
  const inventoryCharts = chartQueries.inventoryCharts.data?.data;
  const isDateRangeInvalid = dateFrom > dateTo;
  const filtersChanged = dateFrom !== appliedDateFrom || dateTo !== appliedDateTo || doctorId !== appliedDoctorId;
  const applyChartFilters = () => {
    if (isDateRangeInvalid) return;
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setAppliedDoctorId(doctorId);
  };

  const appointmentByDate: DashboardChartRow[] = (appointmentCharts?.byDate || []).map((point) => ({
    label: dateLabel(point.date),
    values: [{ label: "Lịch hẹn", value: point.count }],
  }));
  const appointmentByStatus: DashboardChartRow[] = (appointmentCharts?.byStatus || []).map((point) => ({
    label: point.status,
    values: [{ label: "Số lịch", value: point.count }],
  }));
  const examinationByDate: DashboardChartRow[] = (examinationCharts?.byDate || []).map((point) => ({
    label: dateLabel(point.date),
    values: [{ label: "Lượt khám", value: point.count }],
  }));
  const examinationsByDoctor: DashboardChartRow[] = (examinationCharts?.byDoctor || []).map((point) => ({
    label: point.doctorName,
    values: [{ label: "Lượt khám", value: point.count }],
  }));
  const prescriptionsByDate: DashboardChartRow[] = (prescriptionCharts?.byDate || []).map((point) => ({
    label: dateLabel(point.date),
    values: [{ label: "Đơn thuốc", value: point.count }],
  }));
  const prescriptionsByStatus: DashboardChartRow[] = (prescriptionCharts?.byPharmacyStatus || []).map((point) => ({
    label: point.status,
    values: [{ label: "Số đơn", value: point.count }],
  }));
  const invoicesByDate: DashboardChartRow[] = (invoiceCharts?.byDate || []).map((point) => ({
    label: dateLabel(point.date),
    values: [
      { label: "Hóa đơn", value: point.count },
      { label: "Doanh thu", value: point.amount, formatValue: formatCurrency },
    ],
  }));
  const triageByDate: DashboardChartRow[] = (triageCharts?.byDate || []).map((point) => ({
    label: dateLabel(point.date),
    values: [{ label: "Lượt phân loại", value: point.count }],
  }));
  const triageByLevel: DashboardChartRow[] = (triageCharts?.byTriageLevel || []).map((point) => ({
    label: point.level,
    values: [{ label: "Số lượt", value: point.count }],
  }));
  const stockByDate: DashboardChartRow[] = (stockCharts?.byDate || []).map((point) => ({
    label: dateLabel(point.date),
    values: [
      { label: "Giao dịch", value: point.count },
      { label: "Số lượng", value: point.quantity },
    ],
  }));
  const stockByType: DashboardChartRow[] = (stockCharts?.byType || []).map((point) => ({
    label: point.type,
    values: [
      { label: "Giao dịch", value: point.count },
      { label: "Số lượng", value: point.quantity },
    ],
  }));
  const lowestStock: DashboardChartRow[] = (inventoryCharts?.lowestStockByMedicine || []).map((point) => ({
    label: point.medicineName,
    values: [
      { label: "Tồn kho", value: point.quantity },
      { label: "Giá trị", value: point.stockValue, formatValue: formatCurrency },
    ],
  }));

  const columns: Column<Appointment>[] = [
    {
      id: "patient",
      label: "Bệnh nhân",
      filters: [
        { text: "Nam", value: Gender.MALE },
        { text: "Nữ", value: Gender.FEMALE },
        { text: "Khác", value: Gender.OTHER },
      ],
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">
            {row.patient?.fullName || "—"}
          </div>
          <div className="text-xs text-slate-400 tabular-nums">
            {row.patient?.phone || ""}
          </div>
        </div>
      ),
    },
    {
      id: "doctor",
      label: "Bác sĩ phụ trách",
      render: (row) => (
        <span className="text-slate-700">
          {row.doctor?.user?.fullName ||
            (row.doctorId ? "Bác sĩ chuyên khoa" : "Chưa chỉ định")}
        </span>
      ),
    },
    {
      id: "appointmentDate",
      label: "Thời gian hẹn",
      render: (row) => (
        <span className="tabular-nums text-slate-600 font-medium">
          {row.appointmentDate
            ? dayjs(row.appointmentDate).format("HH:mm DD/MM/YYYY")
            : "—"}
        </span>
      ),
    },
    {
      id: "status",
      label: "Trạng thái",
      render: (row) => <StatusChip status={row.status} type="appointment" />,
    },
    {
      id: "notes",
      label: "Ghi chú",
      render: (row) => (
        <span className="text-xs text-slate-500 line-clamp-1 max-w-xs">
          {row.notes || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      render: (row) => (
        <Button
          size="small"
          variant="text"
          onClick={() => navigate(`/appointments/${row.id}`)}
          className="text-xs font-semibold text-sky-700"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan phòng khám"
        subtitle={`Hôm nay: ${dayjs().format("dddd, [ngày] DD/MM/YYYY")} · Báo cáo tiếp nhận & hoạt động lâm sàng`}
        action={
          <div className="flex items-center gap-2">
            {canCreateOrEditPatient && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate("/patients/new")}
                size="small"
              >
                Tiếp nhận bệnh nhân
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<CalendarMonthIcon />}
              onClick={() => navigate("/appointments/new")}
              size="small"
            >
              Đặt lịch hẹn
            </Button>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <Card className="hover:border-sky-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography
                variant="caption"
                className="text-slate-500 font-medium tracking-wide"
              >
                TỔNG SỐ BỆNH NHÂN
              </Typography>
              <div className="text-2xl font-bold  mt-1 tabular-nums">
                {loadingPatients ? (
                  <Skeleton width={60} />
                ) : (
                  totalPatients.toLocaleString("vi-VN")
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Đã lưu trong hệ thống
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <PeopleOutlineIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Today Appointments */}
        <Card className="hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography
                variant="caption"
                className="text-slate-500 font-medium tracking-wide"
              >
                LỊCH HẸN HÔM NAY
              </Typography>
              <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                {loadingTodayAppts ? (
                  <Skeleton width={60} />
                ) : (
                  totalToday.toLocaleString("vi-VN")
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Lịch đăng ký ngày {dayjs().format("DD/MM")}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <EventAvailableOutlinedIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pending Appointments */}
        <Card className="hover:border-amber-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography
                variant="caption"
                className="text-slate-500 font-medium tracking-wide"
              >
                CHỜ TIẾP NHẬN / PHÂN LOẠI
              </Typography>
              <div className="text-2xl font-bold text-amber-700 mt-1 tabular-nums">
                {loadingPending ? (
                  <Skeleton width={60} />
                ) : (
                  totalPending.toLocaleString("vi-VN")
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Cần điều dưỡng tiếp đón
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <HourglassEmptyOutlinedIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Low Stock Alert */}
        <Card className="hover:border-rose-300 transition-colors">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <Typography
                variant="caption"
                className="text-slate-500 font-medium tracking-wide"
              >
                DƯỢC SẮP HẾT / CẢNH BÁO
              </Typography>
              <div className="text-2xl font-bold text-rose-700 mt-1 tabular-nums">
                {loadingLowStock ? (
                  <Skeleton width={60} />
                ) : (
                  totalLowStock.toLocaleString("vi-VN")
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Lô dược dưới mức tối thiểu
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <WarningAmberOutlinedIcon fontSize="medium" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Stack spacing={2}>
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Phân tích hoạt động</Typography>
                <Typography variant="body2" color="text.secondary">Chọn khoảng ngày rồi áp dụng để tải dữ liệu biểu đồ.</Typography>
              </Box>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ alignItems: { md: "center" } }}>
                <TextField size="small" type="date" label="Từ ngày" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField size="small" type="date" label="Đến ngày" value={dateTo} onChange={(event) => setDateTo(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: dayjs().format("YYYY-MM-DD"), min: dateFrom } }} />
                {activeChartTab === "appointments" && (
                  <FormControl size="small" sx={{ minWidth: 210 }}>
                    <InputLabel id="dashboard-doctor-filter">Bác sĩ</InputLabel>
                    <Select labelId="dashboard-doctor-filter" label="Bác sĩ" value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
                      <MenuItem value="">Tất cả bác sĩ</MenuItem>
                      {(doctorsData?.data || []).map((doctor) => <MenuItem key={doctor.id} value={doctor.id}>{doctor.user?.fullName || "Bác sĩ"}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                <Button variant="contained" onClick={applyChartFilters} disabled={isDateRangeInvalid || !filtersChanged}>
                  Áp dụng
                </Button>
              </Stack>
              {isDateRangeInvalid && <Alert severity="warning">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</Alert>}
            </Stack>
          </CardContent>
        </Card>

        <Tabs value={activeChartTab} onChange={(_event, value: DashboardChartGroup) => setActiveChartTab(value)} variant="scrollable" allowScrollButtonsMobile>
          <Tab value="appointments" label="Lịch hẹn" />
          <Tab value="clinical" label="Khám bệnh & phân loại" />
          <Tab value="pharmacy" label="Nhà thuốc & kho" />
          <Tab value="finance" label="Tài chính" />
        </Tabs>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
          {activeChartTab === "appointments" && <>
            <DashboardChartCard title="Lịch hẹn theo ngày" subtitle={`Tổng ${appointmentCharts?.total?.toLocaleString("vi-VN") ?? "—"} lịch hẹn`} rows={appointmentByDate} yAxisLabel="Số lịch hẹn" xAxisLabel="Ngày" loading={chartQueries.appointments.isFetching} error={chartQueries.appointments.isError} onRetry={() => void chartQueries.appointments.refetch()} />
            <DashboardChartCard title="Phân bố trạng thái lịch hẹn" rows={appointmentByStatus} kind="pie" loading={chartQueries.appointments.isFetching} error={chartQueries.appointments.isError} onRetry={() => void chartQueries.appointments.refetch()} />
          </>}
          {activeChartTab === "clinical" && <>
            <DashboardChartCard title="Lượt khám theo ngày" subtitle={`Tổng ${examinationCharts?.total?.toLocaleString("vi-VN") ?? "—"} lượt khám`} rows={examinationByDate} yAxisLabel="Lượt khám" xAxisLabel="Ngày" loading={chartQueries.examinations.isFetching} error={chartQueries.examinations.isError} onRetry={() => void chartQueries.examinations.refetch()} />
            <DashboardChartCard title="Lượt khám theo bác sĩ" rows={examinationsByDoctor} layout="horizontal" xAxisLabel="Lượt khám" loading={chartQueries.examinations.isFetching} error={chartQueries.examinations.isError} onRetry={() => void chartQueries.examinations.refetch()} />
            <DashboardChartCard title="Phân loại bệnh nhân theo ngày" subtitle={`Tổng ${triageCharts?.total?.toLocaleString("vi-VN") ?? "—"} lượt`} rows={triageByDate} yAxisLabel="Lượt phân loại" xAxisLabel="Ngày" loading={chartQueries.triage.isFetching} error={chartQueries.triage.isError} onRetry={() => void chartQueries.triage.refetch()} />
            <DashboardChartCard title="Phân bố theo mức độ phân loại" rows={triageByLevel} kind="pie" loading={chartQueries.triage.isFetching} error={chartQueries.triage.isError} onRetry={() => void chartQueries.triage.refetch()} />
          </>}
          {activeChartTab === "pharmacy" && <>
            <DashboardChartCard title="Đơn thuốc theo ngày" subtitle={`Tổng ${prescriptionCharts?.total?.toLocaleString("vi-VN") ?? "—"} đơn thuốc`} rows={prescriptionsByDate} yAxisLabel="Số đơn" xAxisLabel="Ngày" loading={chartQueries.prescriptions.isFetching} error={chartQueries.prescriptions.isError} onRetry={() => void chartQueries.prescriptions.refetch()} />
            <DashboardChartCard title="Trạng thái xử lý tại nhà thuốc" rows={prescriptionsByStatus} kind="pie" loading={chartQueries.prescriptions.isFetching} error={chartQueries.prescriptions.isError} onRetry={() => void chartQueries.prescriptions.refetch()} />
            <DashboardChartCard title="Giao dịch kho theo ngày" subtitle={`Tổng ${stockCharts?.totalTransactions?.toLocaleString("vi-VN") ?? "—"} giao dịch`} rows={stockByDate} xAxisLabel="Ngày" loading={chartQueries.stockTransactions.isFetching} error={chartQueries.stockTransactions.isError} onRetry={() => void chartQueries.stockTransactions.refetch()} />
            <DashboardChartCard title="Giao dịch kho theo loại" rows={stockByType} kind="pie" loading={chartQueries.stockTransactions.isFetching} error={chartQueries.stockTransactions.isError} onRetry={() => void chartQueries.stockTransactions.refetch()} />
            <Card variant="outlined" sx={{ borderRadius: 3, gridColumn: { xl: "span 2" } }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Tổng quan tồn kho</Typography>
                {chartQueries.inventoryCharts.isError ? (
                  <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void chartQueries.inventoryCharts.refetch()}>Thử lại</Button>} sx={{ mt: 2 }}>Không thể tải dữ liệu tồn kho.</Alert>
                ) : (
                  <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" }, gap: 1.5, mt: 1.5, mb: 2 }}>
                      {[
                        ["Lô thuốc", inventoryCharts?.summary.batches],
                        ["Tổng số lượng", inventoryCharts?.summary.quantity],
                        ["Giá trị tồn", inventoryCharts?.summary.stockValue, true],
                        ["Lô đã hết hạn", inventoryCharts?.summary.expiredBatches],
                        ["Sắp hết hạn 30 ngày", inventoryCharts?.summary.expiringWithin30Days],
                      ].map(([label, value, currency]) => (
                        <Box key={String(label)} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">{label}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {chartQueries.inventoryCharts.isFetching ? <Skeleton width={90} /> : value === undefined ? "—" : currency ? formatCurrency(Number(value)) : Number(value).toLocaleString("vi-VN")}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <DashboardChartCard title="10 thuốc có tồn thấp nhất" rows={lowestStock} layout="horizontal" xAxisLabel="Tồn kho / giá trị" loading={chartQueries.inventoryCharts.isFetching} error={chartQueries.inventoryCharts.isError} onRetry={() => void chartQueries.inventoryCharts.refetch()} />
                  </>
                )}
              </CardContent>
            </Card>
          </>}
          {activeChartTab === "finance" && <DashboardChartCard title="Hóa đơn và doanh thu theo ngày" subtitle={`Tổng ${invoiceCharts?.totalInvoices?.toLocaleString("vi-VN") ?? "—"} hóa đơn · ${invoiceCharts ? formatCurrency(invoiceCharts.totalAmount) : "—"}`} rows={invoicesByDate} xAxisLabel="Ngày" loading={chartQueries.invoices.isFetching} error={chartQueries.invoices.isError} onRetry={() => void chartQueries.invoices.refetch()} />}
        </Box>
      </Stack>

      {/* Recent Appointments Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography
              variant="h6"
              className="text-slate-800 font-bold text-base"
            >
              Lịch khám gần đây
            </Typography>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              10 bản ghi mới nhất
            </span>
          </div>
          <Button
            size="small"
            variant="text"
            onClick={() => navigate("/appointments")}
            className="text-xs text-sky-700 font-semibold"
          >
            Xem tất cả lịch hẹn →
          </Button>
        </div>

        <DataTable
          columns={columns}
          rows={recentAppointments?.data || []}
          loading={loadingRecent}
          emptyTitle="Chưa có lịch hẹn nào"
          emptyDescription="Tạo cuộc hẹn mới cho bệnh nhân hoặc kiểm tra bộ lọc."
          emptyActionText="Tạo lịch hẹn đầu tiên"
          onEmptyAction={() => navigate("/appointments/new")}
        />
      </div>
    </div>
  );
};
