import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { useDoctors, useInfiniteDoctors } from "@/features/doctors/hooks/useDoctors";
import { useSpecialtiesDropdown } from "@/features/specialties/hooks/useSpecialties";
import { useAppointments } from "../hooks/useAppointments";
import { useDoctorShifts } from "@/features/doctors/hooks/useDoctorShifts";
import { Appointment, AppointmentStatus, Doctor, DoctorShift } from "@/types";
import { ScheduleFilters } from "../components/ScheduleFilters";
import { AppointmentDetailDrawer } from "../components/AppointmentDetailDrawer";

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
      {Array.from(
        { length: (END_MINUTE - START_MINUTE) / 30 },
        (_, index) => {
          const minute = START_MINUTE + index * 30;
          const appointment = appointmentAt(minute, appointments);
          const working = inShift(minute, shifts);

          return (
            <Button
              key={minute}
              fullWidth
              disableElevation
              onClick={() =>
                appointment
                  ? onAppointment(appointment)
                  : working
                    ? onEmpty(doctor.id, timeLabel(minute))
                    : undefined
              }
              className="!h-12 !justify-start !rounded-none !border-b !border-slate-100 !px-2 !py-1 !text-left !text-[11px]"
              sx={{
                color: appointment
                  ? appointment.status === AppointmentStatus.CANCELLED
                    ? "error.dark"
                    : "text.primary"
                  : working
                    ? "success.dark"
                    : "text.disabled",
                bgcolor: appointment
                  ? appointment.status === AppointmentStatus.CANCELLED
                    ? "error.50"
                    : appointment.status === AppointmentStatus.COMPLETED
                      ? "grey.100"
                      : "warning.50"
                  : working
                    ? "success.50"
                    : "grey.50",
                "&:hover": {
                  bgcolor: working && !appointment ? "success.100" : undefined,
                },
              }}
            >
              {appointment
                ? `${appointment.patient?.fullName || "Đã đặt"} · ${appointment.status}`
                : working
                  ? "Trống · Đặt lịch"
                  : "Ngoài ca"}
            </Button>
          );
        },
      )}
    </Box>
  );
};

export const DoctorScheduleCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [search, setSearch] = useState("");
  const [specialtyId, setSpecialtyId] = useState<number | "">("");
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [doctorPage, setDoctorPage] = useState(1);
  const DOCTORS_PER_PAGE = 5;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const {
    data: doctorsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteDoctors(
    search || undefined,
    specialtyId ? Number(specialtyId) : undefined,
  );

  const doctors = useMemo(
    () => doctorsData?.pages.flatMap((page) => page.data) ?? [],
    [doctorsData],
  );

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchNextPage();
        }
      },
      {
        root: target.closest(".doctor-calendar-scroll"),
        rootMargin: "0px 300px 0px 0px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const { data: specialties = [] } = useSpecialtiesDropdown();

  const minutes = Array.from(
    { length: (END_MINUTE - START_MINUTE) / 30 },
    (_, index) => START_MINUTE + index * 30,
  );
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
        search={search}
        specialtyId={specialtyId}
        status={status}
        specialties={specialties}
        onDateChange={setDate}
        onSearchChange={setSearch}
        onSpecialtyChange={setSpecialtyId}
        onStatusChange={setStatus}
      />
      {isError && (
        <Alert severity="error">Không thể tải danh sách bác sĩ.</Alert>
      )}
      {isLoading ? (
        <Box className="flex justify-center py-16">
          <CircularProgress />
        </Box>
      ) : !doctors.length ? (
        <Box className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Typography variant="body2" color="text.secondary">
            Không có bác sĩ phù hợp.
          </Typography>
        </Box>
      ) : (
        <Box className="doctor-calendar-scroll overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <Box
            className="grid min-w-225"
            sx={{
              gridTemplateColumns: `72px repeat(${doctors.length}, minmax(180px, 1fr))`,
            }}
          >

            <div className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500">
              Giờ
            </div>
            {doctors.map((doctor) => (
              <DoctorScheduleColumn
                key={doctor.id}
                doctor={doctor}
                date={date}
                status={status}
                onEmpty={(doctorId, time) =>
                  navigate(
                    `/appointments/new?doctorId=${doctorId}&date=${date}&time=${time}`,
                  )
                }
                onAppointment={setSelectedAppointment}
              />
            ))}
            <div className="bg-slate-50">
              {minutes.map((minute) => (
                <div
                  key={minute}
                  className="h-12 border-b border-slate-100 px-2 py-3 text-center text-xs font-semibold tabular-nums text-slate-500"
                >
                  {timeLabel(minute)}
                </div>
              ))}
            </div>
            {doctors.map((doctor) => (
              <DoctorScheduleColumn
                key={doctor.id}
                doctor={doctor}
                date={date}
                status={status}
                onEmpty={(doctorId, time) =>
                  navigate(
                    `/appointments/new?doctorId=${doctorId}&date=${date}&time=${time}`,
                  )
                }
                onAppointment={setSelectedAppointment}
              />
            ))}
            {/* Nội dung các cột lịch hiện tại */}
          </Box>
        </Box>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded bg-emerald-100" />
          Slot trống
        </span>
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded bg-amber-100" />
          Đã đặt
        </span>
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded bg-slate-100" />
          Ngoài ca
        </span>
        <span>
          <i className="mr-1 inline-block h-3 w-3 rounded bg-rose-100" />
          Đã hủy
        </span>
      </div>
      <AppointmentDetailDrawer
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </Stack>

  );
};
