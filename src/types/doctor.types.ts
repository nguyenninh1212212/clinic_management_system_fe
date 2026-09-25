// src/types/doctor.types.ts
import { DoctorDegree, UserRole } from './enums';
import { BaseQueryParams } from './common.types';
import { Specialty } from './specialty.types';

export interface DoctorUser {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
}

export interface DoctorWorkSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  specialtyId?: number;
  licenseNumber: string;
  bio?: string;
  degree: DoctorDegree;
  yearsOfExperience: number;
  user?: DoctorUser;
  specialty?: Specialty;
  workSchedules?: DoctorWorkSchedule[];
  workingSchedules?: DoctorWorkSchedule[];
  schedules?: DoctorWorkSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface DoctorQueryParams extends BaseQueryParams {
  specialtyId?: number;
  degree?: DoctorDegree;
}

export interface CreateDoctorDto {
  userId: string;
  specialtyId?: number;
  licenseNumber: string;
  bio?: string;
  degree: DoctorDegree;
  yearsOfExperience?: number;
}

export interface UpdateDoctorDto {
  specialtyId?: number;
  licenseNumber?: string;
  bio?: string;
  degree?: DoctorDegree;
  yearsOfExperience?: number;
}
