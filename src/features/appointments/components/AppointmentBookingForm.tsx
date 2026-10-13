import React, { useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { usePatient, usePatients } from "@/features/patients/hooks/usePatients";
import { useDoctor, useDoctors } from "@/features/doctors/hooks/useDoctors";
import { useSpecialtiesDropdown } from "@/features/specialties/hooks/useSpecialties";
import { DataTable, Column } from "@/components/common/DataTable";
import type {
  Patient,
  Doctor,
  PatientQueryParams,
  DoctorQueryParams,
} from "@/types";
import { DoctorDegree, Gender } from "@/types";
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
  const [picker, setPicker] = useState<"patient" | "doctor" | null>(null);
  const [patientQuery, setPatientQuery] = useState<PatientQueryParams>({
    page: 1,
    limit: 10,
  });
  const [doctorQuery, setDoctorQuery] = useState<DoctorQueryParams>({
    page: 1,
    limit: 10,
  });
  const { data: patientsData, isLoading: loadingPatients } =
    usePatients(patientQuery);
  const { data: doctorsData, isLoading: loadingDoctors } =
    useDoctors(doctorQuery);
  const { data: specialties = [] } = useSpecialtiesDropdown();
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
  const { data: selectedPatientData } = usePatient(patientId);
  const selectedPatient =
    patientsData?.data.find((patient) => patient.id === patientId) ||
    selectedPatientData;
  const handlePatientFiltersChange = (filters: Record<string, any>) => {
    setPatientQuery((current) => {
      const next = { ...current, page: 1 };
      delete next.search;
      delete next.phoneNumber;
      delete next.gender;
      return { ...next, ...filters, page: 1 };
    });
  };
  const handleDoctorFiltersChange = (filters: Record<string, any>) => {
    setDoctorQuery((current) => {
      const next = { ...current, page: 1 };
      delete next.search;
      delete next.specialtyId;
      delete next.degree;
      return { ...next, ...filters, page: 1 };
    });
  };
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

  const patientColumns: Column<Patient>[] = [
    {
      id: "fullName",
      label: "Bệnh nhân",
      minWidth: 190,
      filterFields: [
        {
          key: "search",
          label: "Tên hoặc mã hồ sơ",
          type: "input",
          placeholder: "Nhập tên bệnh nhân",
        },
      ],
      render: (patient) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            sx={{
              bgcolor: "primary.50",
              color: "primary.main",
              width: 38,
              height: 38,
            }}
          >
            {patient.fullName.charAt(0)}
          </Avatar>
          <div>
            <Typography sx={{ fontWeight: 700 }}>{patient.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {patient.id}
            </Typography>
          </div>
        </Stack>
      ),
    },
    {
      id: "phone",
      label: "Số điện thoại",
      minWidth: 140,
      filterFields: [
        {
          key: "phoneNumber",
          label: "Số điện thoại",
          type: "input",
          placeholder: "Nhập số điện thoại",
        },
      ],
      render: (patient) => patient.phone || "—",
    },
    {
      id: "gender",
      label: "Giới tính",
      minWidth: 100,
      filterFields: [
        {
          key: "gender",
          label: "Giới tính",
          type: "select",
          filters: Object.values(Gender).map((value) => ({
            text: value,
            value,
          })),
        },
      ],
      render: (patient) => patient.gender || "—",
    },
    {
      id: "choose",
      label: "Chọn",
      align: "right",
      minWidth: 100,
      render: (patient) => (
        <Button
          size="small"
          variant={patient.id === patientId ? "contained" : "outlined"}
          onClick={() => {
            setPatientId(patient.id);
            setPicker(null);
          }}
        >
          {" "}
          {patient.id === patientId ? "Đã chọn" : "Chọn"}
        </Button>
      ),
    },
  ];
  const doctorColumns: Column<Doctor>[] = [
    {
      id: "name",
      label: "Bác sĩ",
      minWidth: 210,
      filterFields: [
        {
          key: "search",
          label: "Tên hoặc mã hành nghề",
          type: "input",
          placeholder: "Nhập tên bác sĩ",
        },
      ],
      render: (doctor) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Avatar
            src={doctor.user?.avatar}
            sx={{
              bgcolor: "secondary.50",
              color: "secondary.main",
              width: 38,
              height: 38,
            }}
          >
            {doctor.user?.fullName?.charAt(0) || "B"}
          </Avatar>
          <div>
            <Typography sx={{ fontWeight: 700 }}>
              {doctor.user?.fullName || "Bác sĩ"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {doctor.licenseNumber}
            </Typography>
          </div>
        </Stack>
      ),
    },
    {
      id: "specialty",
      label: "Chuyên khoa",
      minWidth: 140,
      filterFields: [
        {
          key: "specialtyId",
          label: "Chuyên khoa",
          type: "select",
          filters: specialties.map((specialty) => ({
            text: specialty.name,
            value: specialty.id,
          })),
        },
      ],
      render: (doctor) => doctor.specialty?.name || "Đa khoa",
    },
    {
      id: "degree",
      label: "Học vị",
      minWidth: 110,
      filterFields: [
        {
          key: "degree",
          label: "Học vị",
          type: "select",
          filters: Object.values(DoctorDegree).map((value) => ({
            text: value,
            value,
          })),
        },
      ],
      render: (doctor) => doctor.degree,
    },
    {
      id: "experience",
      label: "Kinh nghiệm",
      align: "center",
      minWidth: 110,
      render: (doctor) => `${doctor.yearsOfExperience || 0} năm`,
    },
    {
      id: "choose",
      label: "Chọn",
      align: "right",
      minWidth: 100,
      render: (doctor) => (
        <Button
          size="small"
          variant={doctor.id === doctorId ? "contained" : "outlined"}
          onClick={() => {
            setDoctorId(doctor.id);
            setTime("");
            setPicker(null);
          }}
        >
          {doctor.id === doctorId ? "Đã chọn" : "Chọn"}
        </Button>
      ),
    },
  ];

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
    <Stack spacing={3} sx={{ maxWidth: 980, mx: "auto", pb: 4 }}>
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
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {validationError && (
                <Alert severity="error">{validationError}</Alert>
              )}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Card
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center" }}
                    >
                      <Avatar
                        sx={{ bgcolor: "primary.50", color: "primary.main" }}
                      >
                        <PersonSearchIcon />
                      </Avatar>
                      <Stack sx={{ minWidth: 0, flex: 1 }} spacing={0.25}>
                        <Typography variant="overline" color="text.secondary">
                          Bệnh nhân *
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} noWrap>
                          {selectedPatient?.fullName ||
                            (patientId
                              ? "Đã chọn bệnh nhân"
                              : "Chưa chọn bệnh nhân")}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {selectedPatient?.phone ||
                            "Chọn hồ sơ bệnh nhân đặt lịch"}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        onClick={() => setPicker("patient")}
                        startIcon={<SearchIcon />}
                      >
                        Chọn
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
                <Card
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "center" }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "secondary.50",
                          color: "secondary.main",
                        }}
                      >
                        <MedicalServicesOutlinedIcon />
                      </Avatar>
                      <Stack sx={{ minWidth: 0, flex: 1 }} spacing={0.25}>
                        <Typography variant="overline" color="text.secondary">
                          Bác sĩ *
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }} noWrap>
                          {selectedDoctor?.user?.fullName || "Chưa chọn bác sĩ"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {selectedDoctor?.specialty?.name ||
                            "Chọn bác sĩ khám"}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        onClick={() => setPicker("doctor")}
                        startIcon={<SearchIcon />}
                      >
                        Chọn
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
              <TextField
                fullWidth
                size="small"
                sx={{ mt: 2 }}
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
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  sx={{ alignItems: "center", justifyContent: "space-between" }}
                >
                  <div>
                    <Typography sx={{ fontWeight: 700 }}>
                      Khung giờ khám 30 phút
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedDoctor?.user?.fullName ||
                        "Chọn bác sĩ để xem ca làm"}
                    </Typography>
                  </div>
                  {loadingAppointments && (
                    <Typography variant="caption" color="text.secondary">
                      Đang kiểm tra lịch...
                    </Typography>
                  )}
                </Stack>
                <AppointmentSlotGrid
                  shifts={shifts}
                  appointments={appointmentsData?.data || []}
                  value={time}
                  onChange={setTime}
                  loading={loadingShifts}
                />
              </Stack>
              <TextField
                fullWidth
                multiline
                minRows={3}
                size="small"
                label="Ghi chú"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
              <Divider />
              <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
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
                  {createMutation.isPending
                    ? "Đang lưu..."
                    : "Xác nhận đặt lịch"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>
      <Dialog
        open={picker !== null}
        onClose={() => setPicker(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {picker === "patient" ? (
              <PersonSearchIcon color="primary" />
            ) : (
              <MedicalServicesOutlinedIcon color="primary" />
            )}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {picker === "patient" ? "Chọn bệnh nhân" : "Chọn bác sĩ"}
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Tìm kiếm hồ sơ rồi chọn một dòng để đặt lịch.
          </Typography>
        </DialogTitle>
        <DialogContent>
          {picker === "patient" ? (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm theo tên hoặc số điện thoại"
                value={patientQuery.search || ""}
                onChange={(event) =>
                  setPatientQuery((current) => ({
                    ...current,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <DataTable
                columns={patientColumns}
                rows={patientsData?.data || []}
                loading={loadingPatients}
                pagination={patientsData?.pagination}
                filters={patientQuery}
                getRowId={(row) => row.id}
                onFilterChange={handlePatientFiltersChange}
                onPageChange={(page) =>
                  setPatientQuery((current) => ({ ...current, page }))
                }
                onLimitChange={(limit) =>
                  setPatientQuery((current) => ({ ...current, limit, page: 1 }))
                }
                emptyTitle="Không tìm thấy bệnh nhân"
                emptyDescription="Thử từ khóa tìm kiếm khác."
              />
            </>
          ) : (
            <>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm theo tên, chuyên khoa hoặc mã hành nghề"
                value={doctorQuery.search || ""}
                onChange={(event) =>
                  setDoctorQuery((current) => ({
                    ...current,
                    search: event.target.value,
                    page: 1,
                  }))
                }
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <DataTable
                columns={doctorColumns}
                rows={doctorsData?.data || []}
                loading={loadingDoctors}
                pagination={doctorsData?.pagination}
                filters={doctorQuery}
                getRowId={(row) => row.id}
                onFilterChange={handleDoctorFiltersChange}
                onPageChange={(page) =>
                  setDoctorQuery((current) => ({ ...current, page }))
                }
                onLimitChange={(limit) =>
                  setDoctorQuery((current) => ({ ...current, limit, page: 1 }))
                }
                emptyTitle="Không tìm thấy bác sĩ"
                emptyDescription="Thử từ khóa tìm kiếm khác."
              />
            </>
          )}
          {((picker === "patient" && patientId) ||
            (picker === "doctor" && doctorId)) && (
            <Button sx={{ mt: 1 }} onClick={() => setPicker(null)}>
              Đóng
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
