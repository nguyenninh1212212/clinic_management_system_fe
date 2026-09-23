// src/types/appointment.types.ts
import { AppointmentStatus } from './enums';
import { BaseQueryParams } from './common.types';
import { Patient } from './patient.types';
import { Doctor } from './doctor.types';
import { TriageResult } from './triage.types';
import { Examination } from './examination.types';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  appointmentDate: string;
  status: AppointmentStatus;
  orderNumber?: number;
  notes?: string;
  patient?: Patient;
  doctor?: Doctor;
  triageResult?: TriageResult;
  examination?: Examination;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentQueryParams extends BaseQueryParams {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  date?: string; // YYYY-MM-DD
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId?: string;
  appointmentDate: string; // ISO8601
  notes?: string;
}

export interface UpdateAppointmentDto {
  patientId?: string;
  doctorId?: string;
  appointmentDate?: string;
  notes?: string;
}

export interface UpdateAppointmentStatusDto {
  status: AppointmentStatus;
  notes?: string;
}
