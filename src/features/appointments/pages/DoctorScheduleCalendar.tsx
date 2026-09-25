import React, { useMemo, useState } from "react";
import { Alert, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
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
  if (loadingShifts || loadingAppointments)
    return (
      <div className="flex min-h-130 items-center justify-center border-l border-slate-200">
        <CircularProgress size={22} />
      </div>
    );
  return (
    <div className="border-l border-slate-200">
      {Array.from({ length: (END_MINUTE - START_MINUTE) / 30 }, (_, index) => {
        const minute = START_MINUTE + index * 30;
        const appointment = appointmentAt(minute, appointments);
        const working = inShift(minute, shifts);
        return (
          <button
            key={minute}
            type="button"
            onClick={() =>
              appointment
                ? onAppointment(appointment)
                : working
                  ? onEmpty(doctor.id, timeLabel(minute))
                  : undefined
            }
            className={`relative flex h-12 w-full border-b border-slate-100 px-2 py-1 text-left text-[11px] ${appointment ? (appointment.status === AppointmentStatus.CANCELLED ? "bg-rose-50 text-rose-700" : appointment.status === AppointmentStatus.COMPLETED ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-800") : working ? "bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-50 text-slate-300"} ${!appointment && working ? "cursor-pointer" : ""}`}
          >
            <span>
              {appointment
                ? `${appointment.patient?.fullName || "Đã đặt"} · ${appointment.status}`
                : working
                  ? "Trống · Đặt lịch"
                  : "Ngoài ca"}
            </span>
          </button>
        );
      })}
    </div>
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
  const {
    data: doctorsData,
    isLoading,
    isError,
  } = useDoctors({
    limit: 100,
    search: search || undefined,
    specialtyId: specialtyId ? Number(specialtyId) : undefined,
  });
  const { data: specialties = [] } = useSpecialtiesDropdown();
  const doctors = useMemo(() => doctorsData?.data || [], [doctorsData]);
  const minutes = Array.from(
    { length: (END_MINUTE - START_MINUTE) / 30 },
    (_, index) => START_MINUTE + index * 30,
  );
  return (
    <div className="space-y-4">
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
        <div className="flex justify-center py-16">
          <CircularProgress />
        </div>
      ) : !doctors.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          Không có bác sĩ phù hợp.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div
            className="grid min-w-225"
            style={{
              gridTemplateColumns:
                "72px repeat(" + doctors.length + ", minmax(180px, 1fr))",
            }}
          >
            <div className="sticky left-0 z-10 border-b border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500">
              Giờ
            </div>
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="border-b border-l border-slate-200 bg-sky-50 p-3 text-center"
              >
                <div className="truncate text-sm font-bold text-slate-900">
                  {doctor.user?.fullName || "Bác sĩ"}
                </div>
                <div className="truncate text-[11px] text-slate-500">
                  {doctor.specialty?.name || "Đa khoa"}
                </div>
              </div>
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
          </div>
        </div>
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
    </div>
  );
};
