// src/api/endpoints/prescriptions.api.ts
import { api } from '@/api/axios';
import {
  Prescription,
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
  PrescriptionQueryParams,
  PaginatedResponse,
  ApiResponse,
  ChartDateQuery,
  PrescriptionCharts,
} from '@/types';

export const prescriptionsApi = {
  getCharts: (params?: ChartDateQuery): Promise<ApiResponse<PrescriptionCharts>> =>
    api.get('/prescriptions/charts', { params }).then((r) => r.data),
  findAll: (params?: PrescriptionQueryParams): Promise<PaginatedResponse<Prescription>> =>
    api.get('/prescriptions', { params }).then((r) => r.data),

  findByPatient: (id:string,params?: PrescriptionQueryParams): Promise<PaginatedResponse<Prescription>> =>
    api.get(`/prescriptions`, { params:{...params,patientId:id} }).then((r) => r.data),

  findById: (id: string): Promise<Prescription> =>
    api.get(`/prescriptions/${id}`).then((r) => r.data),

  issue:(id:string):Promise<Prescription>=>api.post(`/prescriptions/${id}/issue`).then(r=>r.data),
  create:(dto:CreatePrescriptionDto):Promise<Prescription>=>api.post('/prescriptions',{
    examinationId:dto.examinationId,notes:dto.notes,validUntil:dto.validUntil,
    items:dto.items?.map(item=>({medicineId:item.medicineId,quantity:item.quantity,dosage:item.dosage,frequency:item.frequency,duration:item.duration||`${item.durationDays||1} ngày`,note:item.note||item.instructions||undefined})),
  }).then(r=>r.data),

  update: (id: string, dto: UpdatePrescriptionDto): Promise<ApiResponse<Prescription>> =>
    api.patch(`/prescriptions/${id}`, dto).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    api.delete(`/prescriptions/${id}`).then((r) => r.data),
};
