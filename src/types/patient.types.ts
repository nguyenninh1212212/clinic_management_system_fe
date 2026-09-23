// src/types/patient.types.ts
import { Gender } from './enums';
import { BaseQueryParams } from './common.types';

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth?: string;
  gender: Gender;
  phone?: string;
  address?: string;
  medicalHistory?: string;
  identityNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientQueryParams extends BaseQueryParams {
  gender?: Gender;
}

export interface CreatePatientDto {
  fullName: string;
  gender: Gender;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  medicalHistory?: string;
  identityNumber?: string;
}

export interface UpdatePatientDto {
  fullName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  medicalHistory?: string;
  identityNumber?: string;
}
