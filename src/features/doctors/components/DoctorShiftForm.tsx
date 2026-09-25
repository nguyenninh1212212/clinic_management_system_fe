import React, { useState } from 'react';
import { Alert, Button, Card, CardContent, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import { DoctorShift } from '@/types';

interface DoctorShiftFormProps {
  doctorId: string;
  defaultDate: string;
  existingShifts: DoctorShift[];
  isSaving: boolean;
  onSubmit: (values: { workDate: string; startTime: string; endTime: string }) => Promise<void>;
}

export const DoctorShiftForm: React.FC<DoctorShiftFormProps> = ({ doctorId, defaultDate, existingShifts, isSaving, onSubmit }) => {
  const [workDate, setWorkDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const start = dayjs(`2000-01-01T${startTime}`);
    const end = dayjs(`2000-01-01T${endTime}`);
    if (!doctorId) return setError('Vui lòng chọn bác sĩ.');
    if (!workDate || workDate < dayjs().format('YYYY-MM-DD')) return setError('Không thể phân công ca trong ngày đã qua.');
    if (!start.isValid() || !end.isValid() || !start.isBefore(end)) return setError('Giờ bắt đầu phải nhỏ hơn giờ kết thúc.');
    const overlaps = existingShifts.some((shift) => {
      const shiftStart = dayjs(`2000-01-01T${shift.startTime}`);
      const shiftEnd = dayjs(`2000-01-01T${shift.endTime}`);
      return start.isBefore(shiftEnd) && end.isAfter(shiftStart);
    });
    if (overlaps) return setError('Ca mới bị trùng với ca đã phân công trong ngày.');
    setError('');
    await onSubmit({ workDate, startTime, endTime });
  };

  return <Card><CardContent><form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-4 md:items-end"><TextField size="small" type="date" label="Ngày làm việc" value={workDate} onChange={(event) => setWorkDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField size="small" type="time" label="Giờ bắt đầu" value={startTime} onChange={(event) => setStartTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField size="small" type="time" label="Giờ kết thúc" value={endTime} onChange={(event) => setEndTime(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={!doctorId || isSaving}>{isSaving ? 'Đang lưu...' : 'Thêm ca'}</Button>{error && <Alert severity="warning" className="md:col-span-4">{error}</Alert>}</form></CardContent></Card>;
};