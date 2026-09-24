// src/api/endpoints/prescription-items.api.ts
import { api } from '@/api/axios';
import {
  PrescriptionItem,
  CreatePrescriptionItemDto,
  UpdatePrescriptionItemDto,
  ApiResponse,
} from '@/types';

export const prescriptionItemsApi = {
  findByPrescription: (prescriptionId: string): Promise<PrescriptionItem[]> =>
    api.get('/prescription-items', { params: { prescriptionId } }).then((r) => {
      const res = r.data;
      return Array.isArray(res) ? res : res?.data || [];
    }),

  findById: (id: string): Promise<ApiResponse<PrescriptionItem>> =>
    api.get(`/prescription-items/${id}`).then((r) => r.data),

  create: (dto: CreatePrescriptionItemDto): Promise<ApiResponse<PrescriptionItem>> =>
    api.post('/prescription-items', dto).then((r) => r.data),

  update: (id: string, dto: UpdatePrescriptionItemDto): Promise<ApiResponse<PrescriptionItem>> =>
    api.patch(`/prescription-items/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/prescription-items/${id}`).then((r) => r.data),
};
