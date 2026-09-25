import React from 'react';
import { DoctorShift, Appointment } from '@/types';
import dayjs from 'dayjs';

const toMinutes = (value: string) => { const [hours, minutes] = value.split(':').map(Number); return hours * 60 + minutes; };

export const buildAppointmentSlots = (shifts: DoctorShift[]) => {
  const slots: string[] = [];
  shifts.forEach((shift) => {
    for (let cursor = toMinutes(shift.startTime); cursor + 30 <= toMinutes(shift.endTime); cursor += 30) {
      const value = `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`;
      if (!slots.includes(value)) slots.push(value);
    }
  });
  return slots.sort();
};

interface AppointmentSlotGridProps { shifts: DoctorShift[]; appointments: Appointment[]; value: string; onChange: (value: string) => void; loading?: boolean; }

export const AppointmentSlotGrid: React.FC<AppointmentSlotGridProps> = ({ shifts, appointments, value, onChange, loading }) => {
  const slots = buildAppointmentSlots(shifts);
  const bookedSlots = new Set(appointments.filter((appointment) => appointment.status !== 'CANCELLED').map((appointment) => dayjs(appointment.appointmentDate).format('HH:mm')));
  if (loading) return <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Đang tải các khung giờ...</div>;
  if (!slots.length) return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Bác sĩ chưa được phân công ca trong ngày này.</div>;
  return <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">{slots.map((slot) => { const booked = bookedSlots.has(slot); const selected = value === slot; return <button key={slot} type="button" disabled={booked} onClick={() => onChange(slot)} className={`rounded-lg border px-3 py-2 text-sm font-semibold tabular-nums transition-colors ${selected ? 'border-sky-600 bg-sky-600 text-white shadow-sm' : booked ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-400'}`}>{slot}<span className="mt-0.5 block text-[10px] font-normal">{selected ? 'Đang chọn' : booked ? 'Đã đặt' : 'Còn trống'}</span></button>; })}</div>;
};