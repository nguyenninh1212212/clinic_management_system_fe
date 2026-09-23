// src/types/examination.types.ts
import { BaseQueryParams } from './common.types';
import { Doctor } from './doctor.types';
import { Patient } from './patient.types';
import { Prescription } from './prescription.types';

export interface Examination {
  id: string;
  appointmentId: string;
  doctorId: string;
  diagnosis?: string;
  clinicalNotes?: string;
  icd10Code?: string;
  followUpDate?: string;
  examinedAt?: string;
  doctor?: Doctor;
  appointment?: {
    id: string;
    patientId: string;
    patient?: Patient;
    appointmentDate: string;
    status: string;
  };
  prescription?: Prescription;
  createdAt: string;
  updatedAt: string;
}

export interface ExaminationQueryParams extends BaseQueryParams {
  doctorId?: string;
}

export interface CreateExaminationDto {
  appointmentId: string;
  doctorId: string;
  diagnosis?: string;
  clinicalNotes?: string;
  icd10Code?: string;
  followUpDate?: string;
  examinedAt?: string;
}

export interface UpdateExaminationDto {
  doctorId?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  icd10Code?: string;
  followUpDate?: string;
  examinedAt?: string;
}
