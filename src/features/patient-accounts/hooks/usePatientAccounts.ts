import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyApiFeedback } from "@/api/axios";
import { patientAccountsApi } from "@/api/endpoints/patient-accounts.api";
import type {
  PatientAccountQuery,
  UpdatePatientAccountDto,
} from "@/types/patient-account.types";

const root = ["patient-accounts"] as const;
export const patientAccountKeys = {
  all: root,
  list: (params: PatientAccountQuery) => [...root, "list", params] as const,
  detail: (id: string) => [...root, "detail", id] as const,
};
export function usePatientAccountList(params: PatientAccountQuery) {
  return useQuery({
    queryKey: patientAccountKeys.list(params),
    queryFn: () => patientAccountsApi.findAll(params),
  });
}
export function usePatientAccountDetail(id: string) {
  return useQuery({
    queryKey: patientAccountKeys.detail(id),
    queryFn: () => patientAccountsApi.findById(id),
    enabled: !!id,
  });
}
export function useUpdatePatientAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePatientAccountDto }) =>
      patientAccountsApi.update(id, dto),
    onSuccess: async (account) => {
      client.setQueryData(patientAccountKeys.detail(account.id), account);
      await client.invalidateQueries({ queryKey: root });
      notifyApiFeedback("Đã cập nhật tài khoản bệnh nhân", "info");
    },
    // A Redis failure may occur after the database has committed the account lock.
    onError: async () => {
      await client.invalidateQueries({ queryKey: root });
    },
  });
}
export function useRevokePatientSessions() {
  return useMutation({
    mutationFn: patientAccountsApi.revokeSessions,
    onSuccess: () =>
      notifyApiFeedback(
        "Đã thu hồi phiên đăng nhập của tài khoản bệnh nhân",
        "info",
      ),
  });
}
