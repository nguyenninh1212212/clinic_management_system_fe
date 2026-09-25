// src/features/appointments/pages/AppointmentEditPage.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PageHeader } from "@/components/common/PageHeader";
import { useAppointment, useUpdateAppointment } from "../hooks/useAppointments";
import { useDoctors } from "@/features/doctors/hooks/useDoctors";
import { AppointmentStatus } from "@/types";
import { useAppointments } from "../hooks/useAppointments";
import { hasDoctorConflict, isThirtyMinuteSlot, isWithinDoctorShift } from "../utils/appointmentAvailability";
import dayjs from "dayjs";
import { z } from "zod";

const editAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Vui lòng chọn bác sĩ có ca làm được phân công"),
  appointmentDate: z.string().min(1, "Vui lòng chọn thời gian khám"),
  notes: z.string().optional().or(z.literal("")),
});

type EditAppointmentFormValues = z.infer<typeof editAppointmentSchema>;

export const AppointmentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointmentData, isLoading } = useAppointment(id || "");
  const updateMutation = useUpdateAppointment();
  const { data: doctorsData } = useDoctors({ limit: 100 });
  const appointment = appointmentData?.data;
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditAppointmentFormValues>({
    resolver: zodResolver(editAppointmentSchema),
    defaultValues: {
      doctorId: "",
      appointmentDate: "",
      notes: "",
    },
  });

  const selectedDoctorId = watch("doctorId");
  const appointmentDateValue = watch("appointmentDate");
  const selectedDoctor = doctorsData?.data?.find((doctor) => doctor.id === selectedDoctorId);
  const appointmentDate = dayjs(appointmentDateValue);
  const { data: doctorAppointmentsData, isLoading: loadingDoctorAppointments } = useAppointments(
    { page: 1, limit: 100, doctorId: selectedDoctorId || undefined, date: appointmentDate.isValid() ? appointmentDate.format("YYYY-MM-DD") : undefined },
    { enabled: Boolean(selectedDoctorId && appointmentDate.isValid()) },
  );
  const slotError = appointmentDateValue && !isThirtyMinuteSlot(appointmentDate)
    ? "Thời gian khám phải nằm đúng mốc 30 phút (ví dụ: 08:00, 08:30, 09:00)."
    : "";
  const shiftAvailability = selectedDoctor ? isWithinDoctorShift(selectedDoctor, appointmentDate) : null;
  const shiftError = shiftAvailability === false ? "Thời gian này nằm ngoài ca làm được phân công của bác sĩ." : "";
  const conflictError = selectedDoctorId && appointmentDate.isValid() && hasDoctorConflict(doctorAppointmentsData?.data || [], appointmentDate, id)
    ? "Bác sĩ đã có lịch hẹn trong khung giờ này. Vui lòng chọn mốc khác."
    : "";
  const availabilityError = slotError || shiftError || conflictError;

  useEffect(() => {
    if (appointment) {
      reset({
        doctorId: appointment.doctorId || "",
        appointmentDate: appointment.appointmentDate
          ? dayjs(appointment.appointmentDate).format("YYYY-MM-DDTHH:mm")
          : "",
        notes: appointment.notes || "",
      });
    }
  }, [appointment, reset]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  const isTerminal =
    appointment &&
    [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(
      appointment.status,
    );

  if (isTerminal) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <Alert severity="warning">
          Lịch hẹn đã kết thúc hoặc bị hủy, không thể chỉnh sửa thông tin.
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate(`/appointments/${id}`)}
        >
          Quay lại chi tiết
        </Button>
      </div>
    );
  }

  const onSubmit = async (values: EditAppointmentFormValues) => {
    if (!id) return;
    if (availabilityError || loadingDoctorAppointments) return;
    try {
      await updateMutation.mutateAsync({
        id,
        dto: {
          doctorId: values.doctorId || undefined,
          appointmentDate: new Date(values.appointmentDate).toISOString(),
          notes: values.notes || undefined,
        },
      });
      navigate(`/appointments/${id}`);
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Chỉnh sửa Cuộc hẹn"
        subtitle={`Bệnh nhân: ${appointment?.patient?.fullName || "—"}`}
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Lịch hẹn", href: "/appointments" },
          { label: "Chi tiết", href: `/appointments/${id}` },
          { label: "Chỉnh sửa" },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/appointments/${id}`)}
            size="small"
          >
            Quay lại
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 sm:p-8">
          {updateMutation.isError && (
            <Alert severity="error" className="mb-6">
              {(updateMutation.error as any)?.response?.data?.message ||
                "Có lỗi xảy ra khi cập nhật cuộc hẹn."}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Doctor */}
              <div>
                <FormControl fullWidth error={!!errors.doctorId}>
                  <InputLabel id="doctor-edit-select-label">
                    Bác sĩ phụ trách
                  </InputLabel>
                  <Controller
                    name="doctorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        labelId="doctor-edit-select-label"
                        label="Bác sĩ phụ trách"
                      >
                        <MenuItem value="">-- Chọn bác sĩ --</MenuItem>
                        {doctorsData?.data?.map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            {d.user?.fullName} —{" "}
                            {d.specialty?.name || "Đa khoa"}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              </div>

              {/* Appointment Date */}
              <div>
                <TextField
                  label="Thời gian hẹn khám *"
                  type="datetime-local"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register("appointmentDate")}
                  error={!!errors.appointmentDate}
                  helperText={errors.appointmentDate?.message}
                />
                {availabilityError && (
                  <Alert severity="warning" className="mt-3">
                    {availabilityError}
                  </Alert>
                )}
                {!availabilityError && selectedDoctorId && !loadingDoctorAppointments && (
                  <div className="mt-2 text-xs text-emerald-700">Khung giờ đang trống cho bác sĩ đã chọn.</div>
                )}
              </div>

              {/* Notes */}
              <div>
                <TextField
                  label="Ghi chú"
                  fullWidth
                  multiline
                  rows={3}
                  {...register("notes")}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate(`/appointments/${id}`)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={updateMutation.isPending || loadingDoctorAppointments || Boolean(availabilityError)}
              >
                {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
