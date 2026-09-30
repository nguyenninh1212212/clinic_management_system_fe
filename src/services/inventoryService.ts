import { api } from '@/api/axios';
import type { InventoryImportResponse } from '@/types/inventory';

export const inventoryService = {
  importExcel: (file: File): Promise<InventoryImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return api
      .post<InventoryImportResponse>('/inventory/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((response) => response.data);
  },
};