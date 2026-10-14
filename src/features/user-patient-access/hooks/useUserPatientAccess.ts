import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { userPatientAccessApi } from '@/api/endpoints/user-patient-access.api';
import { notifyApiFeedback } from '@/api/axios';
import { GrantAccessDto, MyPatientsQueryParams, UpdateAccessDto } from '@/types';

export function useMyPatients(params?: MyPatientsQueryParams) {
  return useQuery({
    queryKey: queryKeys.userPatientAccess.myPatients(params),
    queryFn: () => userPatientAccessApi.getMyPatients(params),
  });
}

export function useCheckAccess(patientId: string) {
  return useQuery({
    queryKey: queryKeys.userPatientAccess.check(patientId),
    queryFn: () => userPatientAccessApi.checkAccess(patientId),
    enabled: !!patientId,
  });
}

export function usePatientAccessors(patientId: string, params?: MyPatientsQueryParams) {
  return useQuery({
    queryKey: queryKeys.userPatientAccess.accessors(patientId, params),
    queryFn: () => userPatientAccessApi.getAccessors(patientId, params),
    enabled: !!patientId,
  });
}

export function useGrantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantAccessDto) => userPatientAccessApi.grantAccess(data),
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.userPatientAccess.check(created.patientId), created);
      queryClient.setQueriesData({ queryKey: [...queryKeys.userPatientAccess.all, 'my-patients'] }, (cached: any) => Array.isArray(cached) && !cached.some((item: any) => item.id === created.id) ? [...cached, created] : cached);
      void queryClient.refetchQueries({ queryKey: [...queryKeys.userPatientAccess.all, 'my-patients'], type: 'all' });
      notifyApiFeedback('Tạo liên kết thành công', 'info');
    },
    onError: () => {
      notifyApiFeedback('Lỗi khi tạo liên kết', 'error');
    },
  });
}

export function useUpdateAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccessDto }) =>
      userPatientAccessApi.updateAccess(id, data),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(queryKeys.userPatientAccess.check(updated.patientId), updated);
      queryClient.setQueriesData({ queryKey: [...queryKeys.userPatientAccess.all, 'my-patients'] }, (cached: any) => Array.isArray(cached) ? cached.map((item: any) => item.id === updated.id ? updated : item) : cached);
      void queryClient.refetchQueries({ queryKey: [...queryKeys.userPatientAccess.all, 'my-patients'], type: 'all' });
      notifyApiFeedback('Cập nhật liên kết thành công', 'info');
    },
    onError: () => {
      notifyApiFeedback('Lỗi khi cập nhật liên kết', 'error');
    },
  });
}

export function useRevokeAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userPatientAccessApi.revokeAccess(id),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData({ queryKey: [...queryKeys.userPatientAccess.all, 'my-patients'] }, (cached: any) => Array.isArray(cached) ? cached.filter((item: any) => item.id !== id) : cached);
      void queryClient.refetchQueries({ queryKey: [...queryKeys.userPatientAccess.all, 'my-patients'], type: 'all' });
      notifyApiFeedback('Hủy liên kết thành công', 'info');
    },
    onError: () => {
      notifyApiFeedback('Lỗi khi hủy liên kết', 'error');
    },
  });
}
