// src/types/prescription.types.ts
import { BaseQueryParams } from './common.types';
import { Medicine } from './medicine.types';

export enum PharmacyPrescriptionStatus {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type PharmacySocketStatus = 'connecting' | 'connected' | 'disconnected';

export interface PharmacyPrescriptionCreatedPayload {
  action: 'CREATED';
  prescription: Prescription;
  message: string;
}

export interface PharmacyPrescriptionUpdatedPayload {
  action: 'ITEM_ADDED' | 'ITEM_UPDATED' | 'ITEM_REMOVED';
  prescriptionId: string;
  prescription: Prescription;
  message: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId: string;
  medicine?: Medicine;
  quantity: number;
  dosage: string;
  frequency: string;
  duration?: string;
  durationDays?: number;
  note?: string;
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Prescription {
  id: string;
  examinationId: string;
  notes?: string;
  pharmacyStatus?: PharmacyPrescriptionStatus;
  issuedAt?: string;
  validUntil?: string;
  items?: PrescriptionItem[];
  examination?: {
    id: string;
    appointmentId: string;
    doctorId: string;
    diagnosis?: string;
    icd10Code?: string;
    followUpDate?: string;
    doctor?: {
      id: string;
      licenseNumber?: string;
      user?: {
        fullName: string;
      };
    };
    appointment?: {
      id: string;
      patient?: {
        id: string;
        fullName: string;
        gender: string;
        phone?: string;
        dateOfBirth?: string;
        address?: string;
        identityNumber?: string;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionQueryParams extends BaseQueryParams {}

export interface CreatePrescriptionDto {
  examinationId: string;
  notes?: string;
  issuedAt?: string;
  validUntil?: string;
  items?: CreatePrescriptionItemDto[];
}

export interface UpdatePrescriptionDto {
  notes?: string;
  issuedAt?: string;
  validUntil?: string;
  pharmacyStatus?: PharmacyPrescriptionStatus;
}

export interface CreatePrescriptionItemDto {
  prescriptionId?: string;
  medicineId: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration?: string;
  durationDays?: number;
  instructions?: string;
  note?: string;
}

export interface UpdatePrescriptionItemDto {
  medicineId?: string;
  quantity?: number;
  dosage?: string;
  frequency?: string;
  duration?: string;
  note?: string;
}
