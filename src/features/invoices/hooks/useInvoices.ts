import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/api/endpoints/invoices.api';
import { notifyApiFeedback } from '@/api/axios';
import { queryKeys } from '@/api/queryKeys';
import { CreateInvoiceDto, InvoiceQueryParams } from '@/types';

export function useInvoices(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params || {}),
    queryFn: () => invoicesApi.findAll(params),
    placeholderData: keepPreviousData,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoicesApi.findById(id),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => invoicesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      notifyApiFeedback('Tạo hóa đơn thành công', 'info');
    },
  });
}

export function useImportInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => invoicesApi.importFromExcel(file),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
      notifyApiFeedback(`Import hóa đơn thành công${result.count || result.importedCount ? `: ${result.count || result.importedCount} hóa đơn` : ''}`, 'info');
    },
  });
}