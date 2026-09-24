// src/api/endpoints/triage-results.api.ts
import { api } from '@/api/axios';
import {
  TriageResult,
  CreateTriageResultDto,
  UpdateTriageResultDto,
  TriageResultQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const triageResultsApi = {
  findAll: (params?: TriageResultQueryParams): Promise<PaginatedResponse<TriageResult>> =>
    api.get('/triage-results', { params }).then((r) => r.data),

  findById: (id: number): Promise<ApiResponse<TriageResult>> =>
    api.get(`/triage-results/${id}`).then((r) => r.data),

  create: (dto: CreateTriageResultDto): Promise<ApiResponse<TriageResult>> =>
    api.post('/triage-results', dto).then((r) => r.data),

  update: (id: number, dto: UpdateTriageResultDto): Promise<ApiResponse<TriageResult>> =>
    api.patch(`/triage-results/${id}`, dto).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/triage-results/${id}`).then((r) => r.data),
};
