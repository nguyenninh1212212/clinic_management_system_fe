export type PatientLoginMethod = "LOCAL" | "GOOGLE" | "FACEBOOK";
export interface PatientAccount {
  id: string;
  accountType: "PATIENT";
  fullName: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  loginMethods: PatientLoginMethod[];
}
export interface PatientAccountDetail extends PatientAccount {
  providers: { id: string; provider: PatientLoginMethod; createdAt: string }[];
  profiles: {
    id: string;
    patientId: string;
    relationship: string;
    accessLevel: string;
    status: string;
    isActive: boolean;
    verifiedAt: string | null;
    patient: {
      id: string;
      fullName: string;
      patientCode: string | null;
      isActive: boolean;
    };
  }[];
}
export interface PatientAccountQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  provider?: PatientLoginMethod;
}
export interface UpdatePatientAccountDto {
  fullName?: string;
  isActive?: boolean;
}
