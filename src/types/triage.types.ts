// src/types/triage.types.ts
import { TriageLevel } from './enums';
import { BaseQueryParams } from './common.types';

export interface TriageResult {
  id: number;
  appointmentId: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  spo2?: number;
  chiefComplaint?: string;
  triageLevel: TriageLevel;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TriageResultQueryParams extends BaseQueryParams {}

export interface CreateTriageResultDto {
  appointmentId: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  spo2?: number;
  chiefComplaint?: string;
  triageLevel: TriageLevel;
  notes?: string;
}

export interface UpdateTriageResultDto {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  spo2?: number;
  chiefComplaint?: string;
  triageLevel?: TriageLevel;
  notes?: string;
}
