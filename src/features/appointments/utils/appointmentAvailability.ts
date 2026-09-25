import dayjs, { Dayjs } from 'dayjs';
import { Appointment, Doctor, DoctorWorkSchedule } from '@/types';

export const APPOINTMENT_SLOT_MINUTES = 30;

export const isThirtyMinuteSlot = (value: string | Dayjs) => {
  const date = typeof value === 'string' ? dayjs(value) : value;
  return date.isValid() && date.minute() % APPOINTMENT_SLOT_MINUTES === 0 && date.second() === 0;
};

const minutesOfDay = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
};

export const getDoctorSchedules = (doctor?: Doctor): DoctorWorkSchedule[] =>
  doctor?.workSchedules || doctor?.workingSchedules || doctor?.schedules || [];

export const isWithinDoctorShift = (doctor: Doctor | undefined, appointmentDate: Dayjs) => {
  const schedules = getDoctorSchedules(doctor).filter((schedule) => schedule.isActive !== false);
  if (!schedules.length) return null;
  const daySchedules = schedules.filter((schedule) => schedule.dayOfWeek === appointmentDate.day());
  const appointmentMinutes = appointmentDate.hour() * 60 + appointmentDate.minute();
  return daySchedules.some((schedule) => {
    const start = minutesOfDay(schedule.startTime);
    const end = minutesOfDay(schedule.endTime);
    return start !== null && end !== null && appointmentMinutes >= start && appointmentMinutes + APPOINTMENT_SLOT_MINUTES <= end;
  });
};

export const hasDoctorConflict = (appointments: Appointment[], appointmentDate: Dayjs, editingId?: string) =>
  appointments.some((appointment) =>
    appointment.id !== editingId &&
    appointment.status !== 'CANCELLED' &&
    dayjs(appointment.appointmentDate).isSame(appointmentDate, 'minute'),
  );