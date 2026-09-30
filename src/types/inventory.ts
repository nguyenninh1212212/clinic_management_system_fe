export interface InventoryImportResponse {
  message?: string;
  importedCount?: number;
  count?: number;
  data?: {
    message?: string;
    importedCount?: number;
    count?: number;
  };
}

export interface InventoryImportColumn {
  name: string;
  description: string;
  required: boolean;
}

export const inventoryImportColumns: InventoryImportColumn[] = [
  {
    name: 'medicineId hoặc medicineName',
    description: 'Mã hoặc tên thuốc trong danh mục',
    required: true,
  },
  {
    name: 'warehouseLocation',
    description: 'Vị trí lưu trữ trong kho',
    required: false,
  },
  {
    name: 'batchNumber',
    description: 'Số lô thuốc',
    required: true,
  },
  {
    name: 'expiryDate',
    description: 'Ngày hết hạn, định dạng YYYY-MM-DD',
    required: true,
  },
  {
    name: 'quantity',
    description: 'Số lượng nhập kho',
    required: true,
  },
  {
    name: 'unitCost',
    description: 'Giá vốn trên mỗi đơn vị',
    required: true,
  },
];

export const inventoryImportHeaders = [
  'medicineId',
  'medicineName',
  'warehouseLocation',
  'batchNumber',
  'expiryDate',
  'quantity',
  'unitCost',
];