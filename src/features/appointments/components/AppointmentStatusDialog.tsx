// src/features/appointments/components/AppointmentStatusDialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Appointment, AppointmentStatus } from '@/types';
import { useUpdateAppointmentStatus } from '../hooks/useAppointments';

export const VALID_NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.WAITING_TRIAGE,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.WAITING_TRIAGE]: [AppointmentStatus.TRIAGED, AppointmentStatus.CANCELLED],
  [AppointmentStatus.TRIAGED]: [AppointmentStatus.IN_EXAMINATION],
  [AppointmentStatus.IN_EXAMINATION]: [AppointmentStatus.COMPLETED],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
};

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.PENDING]: 'Chờ xác nhận (PENDING)',
  [AppointmentStatus.CONFIRMED]: 'Đã xác nhận (CONFIRMED)',
  [AppointmentStatus.WAITING_TRIAGE]: 'Chờ phân loại cấp cứu (WAITING_TRIAGE)',
  [AppointmentStatus.TRIAGED]: 'Đã phân loại xong (TRIAGED)',
  [AppointmentStatus.IN_EXAMINATION]: 'Đang khám với bác sĩ (IN_EXAMINATION)',
  [AppointmentStatus.COMPLETED]: 'Hoàn thành khám bệnh (COMPLETED)',
  [AppointmentStatus.CANCELLED]: 'Hủy hẹn khám (CANCELLED)',
  [AppointmentStatus.NO_SHOW]: 'Vắng mặt không đến (NO_SHOW)',
};

interface AppointmentStatusDialogProps {
  open: boolean;
  appointment: Appointment | null;
  onClose: () => void;
}

export const AppointmentStatusDialog: React.FC<AppointmentStatusDialogProps> = ({
  open,
  appointment,
  onClose,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | ''>('');
  const [notes, setNotes] = useState('');

  const statusMutation = useUpdateAppointmentStatus();

  if (!appointment) return null;

  const validNext = VALID_NEXT_STATUSES[appointment.status] || [];
  const isTerminal = validNext.length === 0;

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    try {
      await statusMutation.mutateAsync({
        id: appointment.id,
        status: selectedStatus as AppointmentStatus,
        notes: notes || undefined,
      });
      onClose();
      setSelectedStatus('');
      setNotes('');
    } catch {
      // Handled by interceptor
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold text-slate-900">
        Chuyển trạng thái lịch hẹn
      </DialogTitle>
      <DialogContent className="space-y-4 pt-2">
        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
          <div>
            Bệnh nhân: <strong>{appointment.patient?.fullName || '—'}</strong>
          </div>
          <div>
            Trạng thái hiện tại:{' '}
            <span className="font-bold text-sky-700">{STATUS_LABELS[appointment.status]}</span>
          </div>
        </div>

        {isTerminal ? (
          <Alert severity="info">
            Cuộc hẹn này đã ở trạng thái kết thúc ({STATUS_LABELS[appointment.status]}). Không thể
            chuyển tiếp trạng thái nữa.
          </Alert>
        ) : (
          <>
            <FormControl fullWidth size="small">
              <InputLabel id="next-status-label">Trạng thái kế tiếp theo quy trình *</InputLabel>
              <Select
                labelId="next-status-label"
                value={selectedStatus}
                label="Trạng thái kế tiếp theo quy trình *"
                onChange={(e) => setSelectedStatus(e.target.value as AppointmentStatus)}
              >
                {validNext.map((st) => (
                  <MenuItem key={st} value={st}>
                    {STATUS_LABELS[st]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Ghi chú chuyển trạng thái (tùy chọn)"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Bệnh nhân đã tới quầy tiếp đón, chuyển vào phòng phân loại sinh hiệu..."
            />
          </>
        )}
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
        {!isTerminal && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedStatus || statusMutation.isPending}
          >
            {statusMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
