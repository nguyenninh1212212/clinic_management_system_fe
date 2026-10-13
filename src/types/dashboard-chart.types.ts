export interface ChartDateQuery {
  dateFrom?: string;
  dateTo?: string;
  doctorId?: string;
}

export interface ChartPoint {
  date: string;
  count: number;
}

export interface AppointmentCharts {
  period: { dateFrom: string; dateTo: string };
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byDate: ChartPoint[];
}

export interface ExaminationCharts {
  period: { dateFrom: string; dateTo: string };
  total: number;
  byDate: ChartPoint[];
  byDoctor: Array<{ doctorId: string; doctorName: string; count: number }>;
}

export interface PrescriptionCharts {
  period: { dateFrom: string; dateTo: string };
  total: number;
  byPharmacyStatus: Array<{ status: string; count: number }>;
  byDate: ChartPoint[];
}

export interface InvoiceCharts {
  period: { dateFrom: string; dateTo: string };
  totalInvoices: number;
  totalAmount: number;
  byDate: Array<{ date: string; count: number; amount: number }>;
}

export interface TriageCharts {
  period: { dateFrom: string; dateTo: string };
  total: number;
  byTriageLevel: Array<{ level: string; count: number }>;
  byDate: ChartPoint[];
}

export interface StockTransactionCharts {
  period: { dateFrom: string; dateTo: string };
  totalTransactions: number;
  byType: Array<{ type: string; count: number; quantity: number }>;
  byDate: Array<{ date: string; count: number; quantity: number }>;
}

export interface InventoryCharts {
  summary: {
    batches: number;
    quantity: number;
    stockValue: number;
    expiredBatches: number;
    expiringWithin30Days: number;
  };
  lowestStockByMedicine: Array<{
    medicineId: string;
    medicineName: string;
    quantity: number;
    stockValue: number;
  }>;
}
