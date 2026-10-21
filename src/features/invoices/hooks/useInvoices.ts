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
    onSuccess: (response) => {
      const created = response;
      queryClient.setQueryData(queryKeys.invoices.detail(created.id), created);
      queryClient.setQueriesData({ queryKey: queryKeys.invoices.lists() }, (cached: any) => {
        if (!cached || !Array.isArray(cached.data) || cached.data.some((item: any) => item.id === created.id) || cached.pagination?.page !== 1) return cached;
        return { ...cached, data: [created, ...cached.data].slice(0, cached.pagination?.limit ?? cached.data.length + 1), pagination: cached.pagination ? { ...cached.pagination, total: cached.pagination.total + 1 } : cached.pagination };
      });
      void queryClient.refetchQueries({ queryKey: queryKeys.invoices.lists(), type: 'all' });
      notifyApiFeedback('Tạo hóa đơn thành công', 'info');
    },
  });
}

export function useImportInvoices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => invoicesApi.importFromExcel(file),
    onSuccess: (result) => {
      // The import endpoint returns counts only, so reload rows instead of patching incomplete data.
      void queryClient.refetchQueries({ queryKey: queryKeys.invoices.lists(), type: 'all' });
      notifyApiFeedback(`Import hóa đơn thành công${result.count || result.importedCount ? `: ${result.count || result.importedCount} hóa đơn` : ''}`, 'info');
    },
  });
}
