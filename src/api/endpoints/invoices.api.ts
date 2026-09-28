import { api } from '@/api/axios';
import {
  ApiResponse,
  CreateInvoiceDto,
  Invoice,
  InvoiceImportResult,
  InvoiceQueryParams,
  PaginatedResponse,
} from '@/types';

export const invoicesApi = {
  findAll: (params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> =>
    api.get('/invoices', { params }).then((response) => response.data),

  findById: (id: string): Promise<Invoice> =>
    api.get(`/invoices/${id}`).then((response) => response.data),

  create: (dto: CreateInvoiceDto): Promise<ApiResponse<Invoice>> =>
    api.post('/invoices', dto).then((response) => response.data),

  export: (id?: string) =>
    api.get('/invoices/export', {
      params: id ? { id } : undefined,
      responseType: 'blob',
    }),

  importFromExcel: (file: File): Promise<InvoiceImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/invoices/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((response) => response.data);
  },

  /** GET /invoices?patientId=xxx — lọc hóa đơn theo bệnh nhân */
  findByPatientId: (patientId: string): Promise<Invoice[]> =>
    api.get('/invoices').then((r) => {
      const invoices: Invoice[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      return invoices.filter((inv) => inv.patientId === patientId);
    }),
};