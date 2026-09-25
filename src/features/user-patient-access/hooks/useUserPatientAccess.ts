import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { userPatientAccessApi } from '@/api/endpoints/user-patient-access.api';
import { notifyApiFeedback } from '@/api/axios';
import { GrantAccessDto, UpdateAccessDto } from '@/types';

export function useMyPatients() {
  return useQuery({
    queryKey: queryKeys.userPatientAccess.myPatients(),
    queryFn: userPatientAccessApi.getMyPatients,
  });
}

export function useCheckAccess(patientId: string) {
  return useQuery({
    queryKey: queryKeys.userPatientAccess.check(patientId),
    queryFn: () => userPatientAccessApi.checkAccess(patientId),
    enabled: !!patientId,
  });
}

export function usePatientAccessors(patientId: string) {
  return useQuery({
    queryKey: queryKeys.userPatientAccess.accessors(patientId),
    queryFn: () => userPatientAccessApi.getAccessors(patientId),
    enabled: !!patientId,
  });
}

export function useGrantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GrantAccessDto) => userPatientAccessApi.grantAccess(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPatientAccess.myPatients() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPatientAccess.myPatients() });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userPatientAccess.myPatients() });
      notifyApiFeedback('Hủy liên kết thành công', 'info');
    },
    onError: () => {
      notifyApiFeedback('Lỗi khi hủy liên kết', 'error');
    },
  });
}
