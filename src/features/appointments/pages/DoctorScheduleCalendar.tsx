import React, { useState } from "react";
import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  Avatar,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Column, DataTable } from "@/components/common/DataTable";
import { useListFilters } from "@/hooks/useListFilters";
import { useDoctor, useDoctors } from "@/features/doctors/hooks/useDoctors";
import { useSpecialtiesDropdown } from "@/features/specialties/hooks/useSpecialties";
import { useAppointments } from "../hooks/useAppointments";
import { useDoctorShifts } from "@/features/doctors/hooks/useDoctorShifts";
import { Appointment, AppointmentStatus, Doctor, DoctorDegree, DoctorQueryParams, DoctorShift } from "@/types";
import { ScheduleFilters } from "../components/ScheduleFilters";

const START_MINUTE = 7 * 60;
const END_MINUTE = 19 * 60;
const toMinutes = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
};
const timeLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
const inShift = (minute: number, shifts: DoctorShift[]) =>
  shifts.some(
    (shift) =>
      minute >= toMinutes(shift.startTime) &&
      minute + 30 <= toMinutes(shift.endTime),
  );
const appointmentAt = (minute: number, appointments: Appointment[]) =>
  appointments.find(
    (appointment) =>
      dayjs(appointment.appointmentDate).hour() * 60 +
        dayjs(appointment.appointmentDate).minute() ===
      minute,
  );

const DoctorScheduleColumn: React.FC<{
  doctor: Doctor;
  date: string;
  status: AppointmentStatus | "";
  onEmpty: (doctorId: string, time: string) => void;
  onAppointment: (appointment: Appointment) => void;
}> = ({ doctor, date, status, onEmpty, onAppointment }) => {
  const { data: shifts = [], isLoading: loadingShifts } = useDoctorShifts(
    doctor.id,
    date,
  );
  const { data: appointmentsData, isLoading: loadingAppointments } =
    useAppointments({
      page: 1,
      limit: 100,
      doctorId: doctor.id,
      date,
      status: status || undefined,
    });
  const appointments = appointmentsData?.data || [];
  if (loadingShifts || loadingAppointments) {
    return (
      <Box className="flex min-h-130 items-center justify-center border-l border-slate-200">
        <CircularProgress size={22} />
      </Box>
    );
  }

  return (
    <Box className="border-l border-slate-200">
      {Array.from({ length: (END_MINUTE - START_MINUTE) / 30 }, (_, index) => {
        const minute = START_MINUTE + index * 30;
        const appointment = appointmentAt(minute, appointments);
        const working = inShift(minute, shifts);

        return (
          <Button
            key={minute}
            fullWidth
            disableElevation
            onClick={() => {
              if (appointment) {
                onAppointment(appointment);
              } else if (working) {
                onEmpty(doctor.id, timeLabel(minute));
              }
            }}
            className="h-12! justify-start! rounded-none! border-b! px-2! py-1! text-lef! text-[11px]!"
            sx={(theme) => {
              const isDark = theme.palette.mode === "dark";

              const statusColor = appointment
                ? appointment.status === AppointmentStatus.CANCELLED
                  ? theme.palette.error
                  : appointment.status === AppointmentStatus.COMPLETED
                    ? theme.palette.secondary
                    : theme.palette.warning
                : working
                  ? theme.palette.success
                  : null;

              return {
                borderColor: `${theme.palette.divider} !important`,
                color: statusColor
                  ? isDark
                    ? statusColor.light
                    : statusColor.dark
                  : theme.palette.text.disabled,
                bgcolor: statusColor
                  ? alpha(statusColor.main, isDark ? 0.18 : 0.08)
                  : theme.palette.background.paper,
                cursor: appointment || working ? "pointer" : "default",
                "&:hover": {
                  bgcolor: statusColor
                    ? alpha(statusColor.main, isDark ? 0.28 : 0.16)
                    : theme.palette.background.paper,
                },
              };
            }}
          >
            {appointment
              ? `${appointment.patient?.fullName || "Đã đặt"} · ${appointment.status} - Bác sĩ: ${appointment.doctor?.user?.fullName} `
              : working
                ? "Trống · Đặt lịch"
                : "Ngoài ca"}
          </Button>
        );
      })}
    </Box>
  );
};

export const DoctorScheduleCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [doctorId, setDoctorId] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const { filters, replaceFilters } = useListFilters<Omit<DoctorQueryParams, "page" | "limit">>();
  const { data: doctorsData, isLoading, isError } = useDoctors({ page, limit, ...filters });
  const { data: selectedDoctorData, isLoading: isLoadingSelectedDoctor } = useDoctor(doctorId);
  const { data: specialties = [] } = useSpecialtiesDropdown();

  const minutes = Array.from(
    { length: (END_MINUTE - START_MINUTE) / 30 },
    (_, index) => START_MINUTE + index * 30,
  );
  const selectedDoctor = selectedDoctorData?.data;
  const getDegreeLabel = (degree?: DoctorDegree) => {
    const labels: Partial<Record<DoctorDegree, string>> = {
      [DoctorDegree.MD]: "Bác sĩ Đa khoa (MD)",
      [DoctorDegree.MASTER]: "Thạc sĩ Y khoa",
      [DoctorDegree.PHD]: "Tiến sĩ Y khoa",
      [DoctorDegree.ASSOCIATE_PROFESSOR]: "Phó Giáo sư",
      [DoctorDegree.PROFESSOR]: "Giáo sư",
    };
    return degree ? labels[degree] || degree : "—";
  };
  const columns: Column<Doctor>[] = [
    {
      id: "avatar",
      label: "Ảnh",
      minWidth: 60,
      render: (row) => (
        <Avatar src={row.user?.avatar} sx={{ width: 34, height: 34, bgcolor: "#0284c7" }} className="text-xs font-semibold">
          {row.user?.fullName?.charAt(0) || "D"}
        </Avatar>
      ),
    },
    {
      id: "fullName",
      label: "Bác sĩ",
      minWidth: 180,
      filterFields: [
        { key: "search", label: "Tìm bác sĩ", type: "input" },
        { key: "isActive", label: "Đang hoạt động", type: "boolean" },
      ],
      render: (row) => (
        <div>
          <button onClick={() => navigate(`/doctors/${row.id}`)} className="font-semibold text-sky-700 hover:underline text-left text-sm">
            {row.user?.fullName || "Bác sĩ"}
          </button>
          <div className="text-xs text-slate-400">{row.user?.email}</div>
        </div>
      ),
    },
    {
      id: "specialty",
      label: "Chuyên khoa",
      minWidth: 140,
      filterFields: [{ key: "specialtyId", label: "Chuyên khoa", type: "select", filters: specialties.map((specialty) => ({ text: specialty.name, value: specialty.id })) }],
      render: (row) => <span className="font-medium text-slate-700">{row.specialty?.name || "Chưa phân chuyên khoa"}</span>,
    },
    {
      id: "degree",
      label: "Học vị / Học hàm",
      minWidth: 160,
      filterFields: [{ key: "degree", label: "Học vị", type: "select", filters: Object.values(DoctorDegree).map((value) => ({ text: value, value })) }],
      render: (row) => <span className="text-xs text-sky-800 font-medium bg-sky-50 px-2 py-0.5 rounded">{getDegreeLabel(row.degree)}</span>,
    },
    {
      id: "licenseNumber",
      label: "Số CCHN",
      minWidth: 130,
      filterFields: [{ key: "licenseNumber", label: "Số giấy phép", type: "input" }],
      render: (row) => <span className="font-mono text-xs tabular-nums text-slate-600 font-medium">{row.licenseNumber}</span>,
    },
    {
      id: "yearsOfExperience",
      label: "Kinh nghiệm",
      minWidth: 120,
      filterFields: [{ key: "yearsOfExperience", label: "Số năm kinh nghiệm", type: "number" }],
      render: (row) => <span className="tabular-nums text-xs text-slate-700 font-medium">{row.yearsOfExperience ? `${row.yearsOfExperience} năm` : "Chưa cập nhật"}</span>,
    },
    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      minWidth: 120,
      render: (row) => {
        const isSelected = doctorId === row.id;
        return (
          <div className="flex items-center justify-center gap-1">
            <Radio
              checked={isSelected}
              onClick={() => {
                if (isSelected) setDoctorId("");
              }}
              onChange={() => setDoctorId(row.id)}
              value={row.id}
              slotProps={{ input: { "aria-label": `Chọn ${row.user?.fullName || "bác sĩ"}` } }}
            />
          </div>
        );
      },
    },
  ];
  return (
    <Stack spacing={2}>
      <PageHeader
        title="Lịch làm việc bác sĩ"
        subtitle="Theo dõi ca làm, slot trống và lịch hẹn theo ngày"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Lịch làm việc" },
        ]}
      />

      <ScheduleFilters
        date={date}
        status={status}
        onDateChange={setDate}
        onStatusChange={setStatus}
      />
      {isError && (
        <Alert severity="error">Không thể tải danh sách bác sĩ.</Alert>
      )}
      <Box className="space-y-4">
        <DataTable
          columns={columns}
          rows={doctorsData?.data || []}
          loading={isLoading}
          pagination={doctorsData?.pagination}
          filters={filters}
          onFilterChange={(nextFilters) => {
            replaceFilters(nextFilters);
            setPage(1);
            setDoctorId("");
          }}
          onPageChange={setPage}
          rowsPerPageOptions={[5]}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
          emptyTitle="Chưa có bác sĩ nào phù hợp"
          emptyDescription="Thử bỏ lọc hoặc thêm hồ sơ bác sĩ mới vào hệ thống."
          onEmptyAction={() => navigate("/doctors/new")}
        />
        <Box>
          {!doctorId ? (
        <Box className="rounded-xl border border-dashed border-slate-300 py-16 text-center">
          <Typography variant="body2" color="text.secondary">
            Chọn bác sĩ để xem lịch làm việc.
          </Typography>
        </Box>
      ) : isLoadingSelectedDoctor ? (
        <Box className="flex justify-center rounded-xl border border-slate-200 py-16">
          <CircularProgress />
        </Box>
      ) : (
        <Box className="doctor-calendar-scroll overflow-x-auto rounded-xl border border-slate-200">
          <Box
            className="grid min-w-225"
            sx={{
              gridTemplateColumns: "72px minmax(180px, 1fr)",
            }}
          >
            <div className="sticky left-0 z-10 border-b border-slate-200  p-3 text-xs font-bold ">
              Giờ
            </div>
            <div className="border-b border-l border-slate-200 p-3 text-xs font-bold">
              {selectedDoctor?.user?.fullName || "Bác sĩ"}
            </div>
            <div className="">
              {minutes.map((minute) => (
                <div
                  key={minute}
                  className="h-12 border-b border-slate-100 px-2 py-3 text-center text-xs font-semibold tabular-nums text-slate-500"
                >
                  {timeLabel(minute)}
                </div>
              ))}
            </div>
            {selectedDoctor && (
              <DoctorScheduleColumn
                doctor={selectedDoctor}
                date={date}
                status={status}
                onEmpty={(doctorId, time) =>
                  navigate(
                    `/appointments/new?doctorId=${doctorId}&date=${date}&time=${time}`,
                  )
                }
                onAppointment={(appointment) => navigate(`/appointments/${appointment.id}`)}
              />
            )}
          </Box>
        </Box>
      )}
        </Box>
      </Box>
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded " />
          Slot trống
        </span>
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded " />
          Đã đặt
        </span>
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded " />
          Ngoài ca
        </span>
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded " />
          Đã hủy
        </span>
      </div>
    
    </Stack>
  );
};
