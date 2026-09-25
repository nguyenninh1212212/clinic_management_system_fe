// src/api/endpoints/medicines.api.ts
import { api } from '@/api/axios';
import {
  Medicine,
  CreateMedicineDto,
  UpdateMedicineDto,
  MedicineQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types';

export const medicinesApi = {
  findAll: (params?: MedicineQueryParams): Promise<PaginatedResponse<Medicine>> =>
    api.get('/medicines', { params }).then((r) => r.data),

  findById: (id: string): Promise<ApiResponse<Medicine>> =>
    api.get(`/medicines/${id}`).then((r) => r.data),

  create: (dto: CreateMedicineDto): Promise<ApiResponse<Medicine>> =>
    api.post('/medicines', dto).then((r) => r.data),

  update: (id: string, dto: UpdateMedicineDto): Promise<ApiResponse<Medicine>> =>
    api.patch(`/medicines/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/medicines/${id}`).then((r) => r.data),

  importFromExcel: (file: File | Blob): Promise<{ message?: string; count?: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    return api
      .post('/medicines/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((r) => r.data);
  },
};
