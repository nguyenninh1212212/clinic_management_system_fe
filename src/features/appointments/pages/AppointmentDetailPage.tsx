// src/features/appointments/pages/AppointmentDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HealingIcon from '@mui/icons-material/Healing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/common/StatusChip';
import {
  VALID_NEXT_STATUSES,
  STATUS_LABELS,
} from '../components/AppointmentStatusDialog';
import {
  useAppointment,
  useUpdateAppointmentStatus,
} from '../hooks/useAppointments';
import { useUpsertTriage } from '@/features/triage/hooks/useTriageList';
import {
  AppointmentStatus,
  TriageLevel,
  CreateTriageResultDto,
} from '@/types';
import dayjs from 'dayjs';

export const AppointmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appointmentData, isLoading, isError } = useAppointment(id || '');
  const statusMutation = useUpdateAppointmentStatus();
  const triageMutation = useUpsertTriage(id || '');
const appointment =appointmentData?.data
  // Triage Upsert Dialog
  const [triageDialogOpen, setTriageDialogOpen] = useState(false);
  const [triageLevel, setTriageLevel] = useState<TriageLevel>(TriageLevel.LEVEL_3);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState<number | ''>(75);
  const [temperature, setTemperature] = useState<number | ''>(36.8);
  const [spo2, setSpo2] = useState<number | ''>(98);
  const [weight, setWeight] = useState<number | ''>(60);
  const [height, setHeight] = useState<number | ''>(165);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [triageNotes, setTriageNotes] = useState('');

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !appointment) {
    return (
      <div className="py-12 text-center space-y-4">
        <Typography variant="h6" className="text-slate-800">
          Không tìm thấy thông tin lịch hẹn
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/appointments')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const validNextStatuses = VALID_NEXT_STATUSES[appointment.status] || [];
  const canEdit = ![AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(
    appointment.status,
  );

  const handleAdvanceStatus = async (nextStatus: AppointmentStatus) => {
    try {
      await statusMutation.mutateAsync({
        id: appointment.id,
        status: nextStatus,
      });
    } catch {
      // Handled by interceptor
    }
  };

  const openTriageForm = () => {
    const existing = appointment.triageResult;
    if (existing) {
      setTriageLevel(existing.triageLevel);
      setBloodPressure(existing.bloodPressure || '120/80');
      setHeartRate(existing.heartRate || '');
      setTemperature(existing.temperature || '');
      setSpo2(existing.spo2 || '');
      setWeight(existing.weight || '');
      setHeight(existing.height || '');
      setChiefComplaint(existing.chiefComplaint || '');
      setTriageNotes(existing.notes || '');
    } else {
      setChiefComplaint(appointment.notes || '');
    }
    setTriageDialogOpen(true);
  };

  const handleSaveTriage = async () => {
    await triageMutation.mutateAsync({
      dto: {
        appointmentId: appointment.id,
        triageLevel,
        bloodPressure: bloodPressure || undefined,
        heartRate: heartRate !== '' ? Number(heartRate) : undefined,
        temperature: temperature !== '' ? Number(temperature) : undefined,
        spo2: spo2 !== '' ? Number(spo2) : undefined,
        weight: weight !== '' ? Number(weight) : undefined,
        height: height !== '' ? Number(height) : undefined,
        chiefComplaint: chiefComplaint || undefined,
        notes: triageNotes || undefined,
      },
    });
    setTriageDialogOpen(false);
  };

  // Status timeline steps
  const statusSteps = [
    AppointmentStatus.PENDING,
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.WAITING_TRIAGE,
    AppointmentStatus.TRIAGED,
    AppointmentStatus.IN_EXAMINATION,
    AppointmentStatus.COMPLETED,
  ];

  const currentStepIdx = statusSteps.indexOf(appointment.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Cuộc hẹn: ${appointment.patient?.fullName || 'Bệnh nhân'}`}
        subtitle={`Mã hẹn: ${appointment.id} · Thời gian: ${dayjs(appointment.appointmentDate).format('HH:mm DD/MM/YYYY')}`}
        breadcrumbs={[
          { label: 'Trang chủ', href: '/dashboard' },
          { label: 'Lịch hẹn', href: '/appointments' },
          { label: 'Chi tiết' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/appointments')}
              size="small"
            >
              Danh sách
            </Button>
            {canEdit && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditOutlinedIcon />}
                onClick={() => navigate(`/appointments/${appointment.id}/edit`)}
                size="small"
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        }
      />

      {/* Status Workflow Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="text-xs text-slate-400 font-medium">TRẠNG THÁI HIỆN TẠI</div>
              <div className="flex items-center gap-2 mt-1">
                <StatusChip status={appointment.status} type="appointment" />
                <span className="text-xs text-slate-500 font-medium">
                  {STATUS_LABELS[appointment.status]}
                </span>
              </div>
            </div>

            {/* Quick Next Status Actions */}
            {validNextStatuses.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Chuyển tiếp sang:</span>
                {validNextStatuses.map((st) => (
                  <Button
                    key={st}
                    size="small"
                    variant={st === AppointmentStatus.CANCELLED ? 'outlined' : 'contained'}
                    color={st === AppointmentStatus.CANCELLED ? 'error' : 'primary'}
                    onClick={() => handleAdvanceStatus(st)}
                    disabled={statusMutation.isPending}
                    className="text-xs"
                  >
                    → {STATUS_LABELS[st].split('(')[0].trim()}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Stepper Visualization */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {statusSteps.map((st, idx) => {
              const isPassed = currentStepIdx >= 0 && idx <= currentStepIdx;
              const isCurrent = appointment.status === st;

              return (
                <div
                  key={st}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-sky-50 border-sky-400 text-sky-900 font-bold shadow-sm'
                      : isPassed
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-white border-dashed border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] tracking-wider uppercase mb-1">
                    Bước 0{idx + 1}
                  </div>
                  <div className="text-xs leading-tight">
                    {STATUS_LABELS[st].split('(')[0].trim()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Cards Grid: Patient & Doctor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="subtitle2" className="text-sky-800 font-bold uppercase tracking-wider text-xs">
                Thông tin Bệnh nhân
              </Typography>
              {appointment.patient?.id && (
                <Button
                  size="small"
                  onClick={() => navigate(`/patients/${appointment.patient?.id}`)}
                  className="text-xs text-sky-700"
                >
                  Xem hồ sơ đầy đủ →
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-slate-400">Họ và tên</div>
                <div className="font-semibold text-slate-800 mt-0.5">
                  {appointment.patient?.fullName || '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Giới tính</div>
                <div className="mt-0.5">
                  <StatusChip status={appointment.patient?.gender} type="gender" />
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Số điện thoại</div>
                <div className="font-mono text-slate-700 mt-0.5">
                  {appointment.patient?.phone || '—'}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">CCCD/CMND</div>
                <div className="font-mono text-slate-700 mt-0.5">
                  {appointment.patient?.identityNumber || '—'}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-xs text-slate-400">Địa chỉ</div>
                <div className="text-slate-600 text-xs mt-0.5">
                  {appointment.patient?.address || '—'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="subtitle2" className="text-sky-800 font-bold uppercase tracking-wider text-xs">
                Bác sĩ Phụ trách
              </Typography>
              {appointment.doctor?.id && (
                <Button
                  size="small"
                  onClick={() => navigate(`/doctors/${appointment.doctor?.id}`)}
                  className="text-xs text-sky-700"
                >
                  Hồ sơ bác sĩ →
                </Button>
              )}
            </div>

            {appointment.doctor ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-400">Bác sĩ khám</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {appointment.doctor.user?.fullName}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Chuyên khoa</div>
                  <div className="text-slate-700 font-medium mt-0.5">
                    {appointment.doctor.specialty?.name || 'Đa khoa'}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Số CCHN</div>
                  <div className="font-mono text-slate-700 mt-0.5">
                    {appointment.doctor.licenseNumber}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Email liên hệ</div>
                  <div className="font-mono text-slate-700 text-xs mt-0.5">
                    {appointment.doctor.user?.email || '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                Chưa chỉ định bác sĩ khám cụ thể cho lịch hẹn này.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Clinical Workflow Section: Triage & Examination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Triage Result Card */}
        <Card className="border-sky-100">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HealingIcon className="text-rose-500" fontSize="small" />
                <Typography variant="subtitle1" className="font-bold text-slate-900 text-sm">
                  Phân loại Cấp cứu & Sinh hiệu (Triage)
                </Typography>
              </div>
              <Button
                size="small"
                variant={appointment.triageResult ? 'outlined' : 'contained'}
                onClick={openTriageForm}
                className="text-xs"
              >
                {appointment.triageResult ? 'Cập nhật sinh hiệu' : 'Nhập sinh hiệu'}
              </Button>
            </div>

            {appointment.triageResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs text-slate-500 font-medium">Mức độ ưu tiên:</span>
                  <StatusChip status={appointment.triageResult.triageLevel} type="triage" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-500">Huyết áp</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5 font-mono">
                      {appointment.triageResult.bloodPressure || '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">mmHg</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-500">Nhịp tim</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5 tabular-nums">
                      {appointment.triageResult.heartRate ?? '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">lần/phút</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-500">Nhiệt độ</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5 tabular-nums">
                      {appointment.triageResult.temperature ? `${appointment.triageResult.temperature}°C` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">Thân nhiệt</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-500">SpO2</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5 tabular-nums">
                      {appointment.triageResult.spo2 ? `${appointment.triageResult.spo2}%` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">Độ bão hòa O2</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-500">Cân nặng</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5 tabular-nums">
                      {appointment.triageResult.weight ? `${appointment.triageResult.weight} kg` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">Khối lượng</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <div className="text-[11px] text-slate-500">Chiều cao</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5 tabular-nums">
                      {appointment.triageResult.height ? `${appointment.triageResult.height} cm` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">Chiều cao</div>
                  </div>
                </div>

                {appointment.triageResult.chiefComplaint && (
                  <div className="text-xs">
                    <span className="text-slate-400">Lý do vào viện (Chief Complaint):</span>
                    <p className="text-slate-800 font-medium mt-0.5">
                      {appointment.triageResult.chiefComplaint}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có kết quả phân loại cấp cứu và đo sinh hiệu ban đầu.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Examination & Prescription Card */}
        <Card className="border-sky-100">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AssignmentIcon className="text-sky-600" fontSize="small" />
                <Typography variant="subtitle1" className="font-bold text-slate-900 text-sm">
                  Phiếu Khám bệnh & Đơn thuốc
                </Typography>
              </div>
              {!appointment.examination ? (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() =>
                    navigate(
                      `/examinations/new?appointmentId=${appointment.id}&doctorId=${appointment.doctorId || ''}`,
                    )
                  }
                  className="text-xs"
                >
                  Tạo phiếu khám
                </Button>
              ) : (
                <Button
                  size="small"
                  onClick={() => navigate(`/examinations/${appointment.examination?.id}`)}
                  className="text-xs text-sky-700"
                >
                  Xem chi tiết phiếu khám →
                </Button>
              )}
            </div>

            {appointment.examination ? (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-slate-400">Chẩn đoán xác định</div>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {appointment.examination.diagnosis || 'Chưa có chẩn đoán'}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Mã bệnh ICD-10</div>
                    <div className="font-mono text-sky-700 font-semibold mt-0.5">
                      {appointment.examination.icd10Code || '—'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400">Hẹn ngày tái khám</div>
                    <div className="text-slate-700 mt-0.5 tabular-nums">
                      {appointment.examination.followUpDate
                        ? dayjs(appointment.examination.followUpDate).format('DD/MM/YYYY')
                        : 'Không hẹn tái khám'}
                    </div>
                  </div>
                </div>

                {appointment.examination.clinicalNotes && (
                  <div>
                    <div className="text-xs text-slate-400">Ghi chú diễn tiến lâm sàng</div>
                    <div className="text-slate-600 text-xs mt-0.5 bg-slate-50 p-2.5 rounded-lg">
                      {appointment.examination.clinicalNotes}
                    </div>
                  </div>
                )}

                {/* Prescription indicator */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Đơn thuốc điều trị:</span>
                  {appointment.examination.prescription ? (
                    <Button
                      size="small"
                      onClick={() =>
                        navigate(`/prescriptions/${appointment.examination?.prescription?.id}`)
                      }
                      className="text-xs font-semibold text-emerald-700"
                    >
                      Xem đơn thuốc ({appointment.examination.prescription.items?.length || 0} loại thuốc) →
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        navigate(`/prescriptions?examinationId=${appointment.examination?.id}`)
                      }
                      className="text-xs"
                    >
                      Kê đơn thuốc
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa lập phiếu khám cho cuộc hẹn này. Nhấn "Tạo phiếu khám" để bác sĩ nhập chẩn đoán.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Triage Dialog (Upsert) */}
      <Dialog
        open={triageDialogOpen}
        onClose={() => setTriageDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          Phân loại Cấp cứu & Ghi nhận Sinh hiệu
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          {triageMutation.isError && (
            <Alert severity="error">
              {(triageMutation.error as any)?.response?.data?.message || 'Có lỗi xảy ra khi lưu sinh hiệu.'}
            </Alert>
          )}

          <FormControl fullWidth size="small">
            <InputLabel id="triage-level-label">Mức độ phân loại cấp cứu (Triage Level) *</InputLabel>
            <Select
              labelId="triage-level-label"
              value={triageLevel}
              label="Mức độ phân loại cấp cứu (Triage Level) *"
              onChange={(e) => setTriageLevel(e.target.value as TriageLevel)}
            >
              <MenuItem value={TriageLevel.LEVEL_1}>Cấp 1 — Nguy kịch (Cấp cứu ngay lập tức)</MenuItem>
              <MenuItem value={TriageLevel.LEVEL_2}>Cấp 2 — Nặng (Khám trong vòng 10 phút)</MenuItem>
              <MenuItem value={TriageLevel.LEVEL_3}>Cấp 3 — Trung bình (Khám trong vòng 30 phút)</MenuItem>
              <MenuItem value={TriageLevel.LEVEL_4}>Cấp 4 — Nhẹ (Khám trong vòng 60 phút)</MenuItem>
              <MenuItem value={TriageLevel.LEVEL_5}>Cấp 5 — Không cấp bách</MenuItem>
            </Select>
          </FormControl>

          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Huyết áp (mmHg)"
              placeholder="120/80"
              size="small"
              value={bloodPressure}
              onChange={(e) => setBloodPressure(e.target.value)}
            />

            <TextField
              label="Nhịp tim (nhịp/phút)"
              type="number"
              placeholder="75"
              size="small"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value === '' ? '' : Number(e.target.value))}
            />

            <TextField
              label="Thân nhiệt (°C)"
              type="number"
              placeholder="37.0"
              size="small"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))}
            />

            <TextField
              label="SpO2 (%)"
              type="number"
              placeholder="98"
              size="small"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
            />

            <TextField
              label="Cân nặng (kg)"
              type="number"
              placeholder="60"
              size="small"
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            />

            <TextField
              label="Chiều cao (cm)"
              type="number"
              placeholder="165"
              size="small"
              value={height}
              onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>

          <TextField
            label="Lý do khám / Triệu chứng chính (Chief Complaint)"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
          />

          <TextField
            label="Ghi chú điều dưỡng"
            fullWidth
            size="small"
            multiline
            rows={2}
            value={triageNotes}
            onChange={(e) => setTriageNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setTriageDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSaveTriage}
            variant="contained"
            disabled={triageMutation.isPending}
          >
            {triageMutation.isPending ? 'Đang lưu...' : 'Lưu kết quả sinh hiệu'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
