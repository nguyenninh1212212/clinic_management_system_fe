// src/features/users/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { usersApi } from "@/api/endpoints/users.api";
import { positionsApi } from "@/api/endpoints/positions.api";
import { notifyApiFeedback } from "@/api/axios";
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryParams,
  PositionQueryParams,
} from "@/types";

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

export function useActivePositions(
  params?: Pick<PositionQueryParams, "search" | "level" | "departmentId">,
) {
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
    onSuccess: (created) => {
      queryClient.setQueryData(queryKeys.users.detail(created.id), created);
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.lists() },
        (cached: any) => {
          if (
            !cached ||
            !Array.isArray(cached.data) ||
            cached.data.some((item: any) => item.id === created.id) ||
            cached.pagination?.page !== 1
          )
            return cached;
          return {
            ...cached,
            data: [created, ...cached.data].slice(
              0,
              cached.pagination?.limit ?? cached.data.length + 1,
            ),
            pagination: cached.pagination
              ? { ...cached.pagination, total: cached.pagination.total + 1 }
              : cached.pagination,
          };
        },
      );
      void queryClient.refetchQueries({
        queryKey: queryKeys.users.lists(),
        type: "all",
      });
      notifyApiFeedback("Tạo tài khoản người dùng thành công", "info");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUserDto }) =>
      usersApi.update(id, dto),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(queryKeys.users.detail(variables.id), updated);
      queryClient.setQueriesData(
        { queryKey: queryKeys.users.lists() },
        (cached: any) =>
          cached && Array.isArray(cached.data)
            ? {
                ...cached,
                data: cached.data.map((item: any) =>
                  item.id === updated.id ? updated : item,
                ),
              }
            : cached,
      );
      void queryClient.refetchQueries({
        queryKey: queryKeys.users.lists(),
        type: "all",
      });
      notifyApiFeedback("Cập nhật tài khoản thành công", "info");
    },
  });
}

export function useUploadUserAvatar() {
  return useMutation({
    mutationFn: (payload: { file: File; id?: string }) =>
      usersApi.uploadAvatar(payload.file, payload?.id),
  });
}

export function useChangeUserPassword() {
  return useMutation({
    mutationFn: ({ id, newPass }: { id: string; newPass: string }) =>
      usersApi.resetPassword(id, newPass),
    onSuccess: () => {
      notifyApiFeedback("Đổi mật khẩu thành công", "info");
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
