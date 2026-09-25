import React, { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { usePatients } from "@/features/patients/hooks/usePatients";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import {
  useCreateAppointment,
  useAppointments,
} from "../hooks/useAppointments";
import { useDoctorShifts } from "@/features/doctors/hooks/useDoctorShifts";
import { AppointmentSlotGrid } from "./AppointmentSlotGrid";

export const AppointmentBookingForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patientId, setPatientId] = useState(
    searchParams.get("patientId") || "",
  );
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
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors({
    limit: 100,
  });
  const { data: shifts = [], isLoading: loadingShifts } = useDoctorShifts(
    doctorId,
    date,
  );
  const { data: appointmentsData, isLoading: loadingAppointments } =
    useAppointments(
      { page: 1, limit: 100, doctorId: doctorId || undefined, date },
      { enabled: Boolean(doctorId && date) },
    );
  const createMutation = useCreateAppointment();
  const selectedDoctor = doctorsData?.data?.find(
    (doctor) => doctor.id === doctorId,
  );
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
      const created = await createMutation.mutateAsync({
        patientId,
        doctorId,
        appointmentDate: `${date}T${time}:00+07:00`,
        notes: notes || undefined,
      });
      navigate(`/appointments/${created.data.id}`);
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
            <FormControl fullWidth size="small" error={!patientId}>
              <InputLabel id="booking-patient">Bệnh nhân *</InputLabel>
              <Select
                labelId="booking-patient"
                label="Bệnh nhân *"
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
                disabled={loadingPatients}
              >
                <MenuItem value="">Chọn bệnh nhân</MenuItem>
                {patientsData?.data?.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.fullName} · {patient.phone || "Không có SĐT"}
                  </MenuItem>
                ))}
              </Select>
              {!patientId && (
                <FormHelperText>Vui lòng chọn bệnh nhân</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth size="small" error={!doctorId}>
              <InputLabel id="booking-doctor">Bác sĩ *</InputLabel>
              <Select
                labelId="booking-doctor"
                label="Bác sĩ *"
                value={doctorId}
                onChange={(event) => {
                  setDoctorId(event.target.value);
                  setTime("");
                }}
                disabled={loadingDoctors}
              >
                <MenuItem value="">Chọn bác sĩ</MenuItem>
                {doctorsData?.data?.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.user?.fullName} ·{" "}
                    {doctor.specialty?.name || "Đa khoa"}
                  </MenuItem>
                ))}
              </Select>
              {!doctorId && (
                <FormHelperText>Vui lòng chọn bác sĩ</FormHelperText>
              )}
            </FormControl>
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
