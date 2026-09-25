import { Patient } from './patient.types';
import { User } from './user.types';

export enum RelationshipType {
  SELF = 'SELF',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SPOUSE = 'SPOUSE',
  SIBLING = 'SIBLING',
  OTHER = 'OTHER',
}

export interface UserPatientAccess {
  id: string;
  userId: string;
  patientId: string;
  relationship: RelationshipType;
  isLegalGuardian: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  user?: User;
}

export interface GrantAccessDto {
  userId: string;
  patientId: string;
  relationship: RelationshipType;
  isLegalGuardian: boolean;
  note?: string;
}

export interface UpdateAccessDto {
  relationship?: RelationshipType;
  isLegalGuardian?: boolean;
  note?: string;
}
