import { api } from "@/api/axios";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type {
  PatientAccount,
  PatientAccountDetail,
  PatientAccountQuery,
  UpdatePatientAccountDto,
} from "@/types/patient-account.types";

export const patientAccountsApi = {
  findAll: (
    params: PatientAccountQuery,
  ): Promise<PaginatedResponse<PatientAccount>> =>
    api
      .get<PaginatedResponse<PatientAccount>>("/patient-accounts", { params })
      .then((response) => response.data),
  findById: (id: string): Promise<PatientAccountDetail> =>
    api
      .get<ApiResponse<PatientAccountDetail>>(
        `/patient-accounts/${encodeURIComponent(id)}`,
      )
      .then((response) => response.data.data),
  update: (
    id: string,
    dto: UpdatePatientAccountDto,
  ): Promise<PatientAccountDetail> =>
    api
      .patch<ApiResponse<PatientAccountDetail>>(
        `/patient-accounts/${encodeURIComponent(id)}`,
        dto,
      )
      .then((response) => response.data.data),
  revokeSessions: (id: string): Promise<void> =>
    api
      .post(`/patient-accounts/${encodeURIComponent(id)}/revoke-sessions`, {})
      .then(() => undefined),
};
