// src/features/users/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { usersApi } from '@/api/endpoints/users.api';
import { positionsApi } from '@/api/endpoints/positions.api';
import { notifyApiFeedback } from '@/api/axios';
import { CreateUserDto, UpdateUserDto, UserQueryParams, PositionQueryParams } from '@/types';

interface UseUserListParams extends UserQueryParams {
  page: number;
  limit: number;
}

export function useUserList(params: UseUserListParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.findAll(params),
    staleTime: 60_000,
  });
}

export function useActivePositions(params?: Pick<PositionQueryParams, 'search' | 'level' | 'departmentId'>) {
  return useQuery({
    queryKey: queryKeys.positions.active(params),
    queryFn: () => positionsApi.getActive(params),
    staleTime: 5 * 60_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      notifyApiFeedback('Tạo tài khoản người dùng thành công', 'info');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      usersApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      notifyApiFeedback('Cập nhật tài khoản thành công', 'info');
    },
  });
}

export function useChangeUserPassword() {
  return useMutation({
    mutationFn: ({ id, newPass }: { id: string; newPass: string }) =>
      usersApi.resetPassword(id, newPass),
    onSuccess: () => {
      notifyApiFeedback('Đổi mật khẩu thành công', 'info');
    },
  });
}

export function useUsersDropdown(limit = 100) {
  return useQuery({
    queryKey: queryKeys.users.list({ limit }),
    queryFn: () => usersApi.findAll({ limit }),
    staleTime: 60_000,
  });
}
