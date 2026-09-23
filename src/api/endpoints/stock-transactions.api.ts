// src/api/endpoints/stock-transactions.api.ts
import { api } from '@/api/axios';
import {
  StockTransaction,
  CreateStockTransactionDto,
  StockTransactionQueryParams,
  PaginatedResponse,
} from '@/types';

export const stockTransactionsApi = {
  findAll: (params?: StockTransactionQueryParams): Promise<PaginatedResponse<StockTransaction>> =>
    api.get('/stock-transactions', { params }).then((r) => r.data),

  findById: (id: number): Promise<StockTransaction> =>
    api.get(`/stock-transactions/${id}`).then((r) => r.data),

  create: (dto: CreateStockTransactionDto): Promise<StockTransaction> =>
    api.post('/stock-transactions', dto).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/stock-transactions/${id}`).then((r) => r.data),
};
