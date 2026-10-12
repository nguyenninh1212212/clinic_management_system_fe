import React, { useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { useDoctor } from "@/features/doctors/hooks/useDoctors";
import { DoctorSelect } from "@/features/doctors/components/DoctorSelect";
import {
  useCreateAppointment,
  useAppointments,
} from "../hooks/useAppointments";
import { useDoctorShifts } from "@/features/doctors/hooks/useDoctorShifts";
import { AppointmentSlotGrid } from "./AppointmentSlotGrid";
import { useAppSocket } from "@/hooks/useSocket";
import { useAppointmentSocket } from "../service/appointmentSocketService";

export const AppointmentBookingForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState(
    searchParams.get("patientId") || "",
  );
  const socket = useAppSocket();

  const st = useAppointmentSocket(socket);
  console.log(st);

  const [doctorId, setDoctorId] = useState(searchParams.get("doctorId") || "");
  const [date, setDate] = useState(
    searchParams.get("date") || dayjs().format("YYYY-MM-DD"),
  );
  const [time, setTime] = useState(searchParams.get("time") || "");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState("");
  const { data: patientsData, isLoading: loadingPatients } = usePatients({
    limit: 100,
  });
  const { data: selectedDoctorData } = useDoctor(doctorId);
  const { data: shifts = [], isLoading: loadingShifts } = useDoctorShifts(
    doctorId,
    date,
  );
  const { data: appointmentsData, isLoading: loadingAppointments } =
    useAppointments(
      {
        page: 1,
        limit: 100,
        doctorId: doctorId || undefined,
        date,
      },
      {
        enabled: Boolean(doctorId && date),
      },
    );
  const createMutation = useCreateAppointment();
  const selectedDoctor = selectedDoctorData?.data;
  const bookedTimes = useMemo(
    () =>
      new Set(
        (appointmentsData?.data || [])
          .filter((appointment) => appointment.status !== "CANCELLED")
          .map((appointment) =>
            dayjs(appointment.appointmentDate).format("HH:mm"),
          ),
      ),
    [appointmentsData],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientId || !doctorId || !date || !time)
      return setValidationError(
        "Vui lòng chọn bệnh nhân, bác sĩ, ngày và khung giờ khám.",
      );
    if (dayjs(date).isBefore(dayjs(), "day"))
      return setValidationError("Không thể đặt lịch trong ngày đã qua.");
    if (bookedTimes.has(time))
      return setValidationError("Khung giờ này đã có người đặt.");
    setValidationError("");
    try {
       await createMutation.mutateAsync({
        patientId,
        doctorId,
        appointmentDate: `${date}T${time}:00+07:00`,
        notes: notes || undefined,
      });
    } catch (error: any) {
      const message = error?.response?.data?.message;
      setValidationError(
        Array.isArray(message)
          ? message.join(", ")
          : message ||
              "Không thể đặt lịch. Vui lòng kiểm tra lại ca làm và khung giờ.",
      );
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Đặt lịch hẹn Khám bệnh"
        subtitle="Chọn ca làm và khung giờ còn trống của bác sĩ"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Lịch hẹn", href: "/appointments" },
          { label: "Đặt lịch mới" },
        ]}
        action={
          <Button variant="outlined" onClick={() => navigate("/appointments")}>
            Quay lại
          </Button>
        }
      />
      <Card>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {validationError && (
              <Alert severity="error">{validationError}</Alert>
            )}
            <Autocomplete
              fullWidth
              size="small"
              id="booking-patient"
              options={patientsData?.data || []}
              getOptionLabel={(option) =>
                `${option.fullName} · ${option.phone || "Không có SĐT"}`
              }
              value={
                patientsData?.data?.find((p) => p.id === patientId) || null
              }
              onChange={(_, newValue) => {
                setPatientId(newValue ? newValue.id : "");
              }}
              disabled={loadingPatients}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Bệnh nhân *"
                  error={!patientId}
                  helperText={!patientId ? "Vui lòng chọn bệnh nhân" : ""}
                />
              )}
            />
            <DoctorSelect
              value={doctorId}
              label="Bác sĩ *"
              error={!doctorId}
              helperText={!doctorId ? "Vui lòng chọn bác sĩ" : undefined}
              onChange={(newDoctorId) => {
                setDoctorId(newDoctorId);
                setTime("");
              }}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Ngày khám *"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setTime("");
              }}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: dayjs().format("YYYY-MM-DD") },
              }}
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Khung giờ khám 30 phút
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedDoctor?.user?.fullName ||
                      "Chọn bác sĩ để xem ca làm"}
                  </div>
                </div>
                {loadingAppointments && (
                  <span className="text-xs text-slate-500">
                    Đang kiểm tra lịch...
                  </span>
                )}
              </div>
              <AppointmentSlotGrid
                shifts={shifts}
                appointments={appointmentsData?.data || []}
                value={time}
                onChange={setTime}
                loading={loadingShifts}
              />
            </div>
            <TextField
              fullWidth
              multiline
              minRows={3}
              size="small"
              label="Ghi chú"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={
                  createMutation.isPending ||
                  loadingShifts ||
                  loadingAppointments ||
                  !time
                }
              >
                {createMutation.isPending ? "Đang lưu..." : "Xác nhận đặt lịch"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
