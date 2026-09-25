import { BaseQueryParams } from './common.types';
import { Medicine } from './medicine.types';
import { Patient } from './patient.types';

export type InvoiceItemType = 'MEDICINE' | 'COST';

export interface InvoiceItem {
  id?: string;
  itemType: InvoiceItemType;
  medicineId?: string;
  medicine?: Medicine;
  description?: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerAddress?: string;
  buyerTaxCode?: string;
  patientId?: string;
  patient?: Patient;
  notes?: string;
  totalAmount?: number;
  items: InvoiceItem[];
  status?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInvoiceItemDto {
  itemType: InvoiceItemType;
  medicineId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceDto {
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  buyerAddress?: string;
  buyerTaxCode?: string;
  patientId?: string;
  notes?: string;
  items: CreateInvoiceItemDto[];
}

export interface InvoiceQueryParams extends BaseQueryParams {}

export interface InvoiceImportResult {
  message?: string;
  count?: number;
  importedCount?: number;
}