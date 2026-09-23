// src/types/common.types.ts

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  message?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
