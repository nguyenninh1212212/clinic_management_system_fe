import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { AppointmentStatus } from '@/types';

interface ScheduleFiltersProps {
  date: string;
  status: AppointmentStatus | '';
  onDateChange: (value: string) => void;
  onStatusChange: (value: AppointmentStatus | '') => void;
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  date,
  status,
  onDateChange,
  onStatusChange,
}) => (
  <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
    <TextField
      size="small"
      type="date"
      label="Ngày xem lịch"
      value={date}
      onChange={(event) => onDateChange(event.target.value)}
      slotProps={{ inputLabel: { shrink: true } }}
    />
    <FormControl size="small">
      <InputLabel id="schedule-status">Trạng thái lịch</InputLabel>
      <Select
        labelId="schedule-status"
        label="Trạng thái lịch"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as AppointmentStatus | '')}
      >
        <MenuItem value="">Tất cả trạng thái</MenuItem>
        {Object.values(AppointmentStatus).map((value) => (
          <MenuItem key={value} value={value}>{value}</MenuItem>
        ))}
      </Select>
    </FormControl>
  </div>
);
