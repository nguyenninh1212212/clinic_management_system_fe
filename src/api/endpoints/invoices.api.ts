import { api } from '@/api/axios';
import {
  ApiResponse,
  CreateInvoiceDto,
  Invoice,
  InvoiceImportResult,
  InvoiceQueryParams,
  PaginatedResponse,
  ChartDateQuery,
  InvoiceCharts,
} from '@/types';

export const invoicesApi = {
  getCharts: (params?: ChartDateQuery): Promise<ApiResponse<InvoiceCharts>> =>
    api.get('/legacy/invoices/charts', { params }).then((r) => r.data),
  findAll: (params?: InvoiceQueryParams): Promise<PaginatedResponse<Invoice>> =>
    api.get('/legacy/invoices', { params }).then((response) => response.data),

  findById: (id: string): Promise<Invoice> =>
    api.get(`/legacy/invoices/${id}`).then((response) => response.data),

  create: (dto: CreateInvoiceDto): Promise<Invoice> =>
    api.post('/legacy/invoices', dto).then((response) => response.data),

  export: (id?: string) =>
    api.get('/legacy/invoices/export', {
      params: id ? { id } : undefined,
      responseType: 'blob',
    }),

  importFromExcel: (file: File): Promise<InvoiceImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return api
      .post('/legacy/invoices/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((response) => response.data);
  },

  /** GET /invoices?patientId=xxx — lọc hóa đơn theo bệnh nhân */
  findByPatientId: (patientId: string): Promise<Invoice[]> =>
    api.get('/legacy/invoices', { params: {patientId} }).then((r) => {
      const invoices: Invoice[] = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
      return invoices.filter((inv) => inv.patientId === patientId);
    }),
};
