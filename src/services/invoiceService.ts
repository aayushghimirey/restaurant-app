import api from '../lib/api';
import type { ApiResponse, PagedResponse, InvoiceResponse, ProcessInvoiceRequest, InvoiceStatus, InvoiceSummaryResponse } from '../types';
import { DateFilter } from '../types';

export const invoiceService = {
  getAll: async (status?: InvoiceStatus, dateFilter: DateFilter = DateFilter.TODAY, page = 0, size = 10) => {
    const res = await api.get<ApiResponse<PagedResponse<InvoiceResponse>>>('/invoices', {
      params: {
        status,
        dateFilter,
        page,
        size
      }
    });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<ApiResponse<InvoiceResponse>>(`/invoices/${id}`);
    return res.data;
  },

  process: async (data: ProcessInvoiceRequest) => {
    const res = await api.post<ApiResponse<InvoiceResponse>>('/invoices/process', data);
    return res.data;
  },

  getSummary: async (dateFilter: DateFilter) => {
    const res = await api.get<ApiResponse<InvoiceSummaryResponse>>('/invoices/summary', {
      params: {
        dateFilter,
      }
    });
    return res.data;
  },

  issueReceiptToken: async (invoiceId: string) => {
    const res = await api.post<ApiResponse<{ token: string }>>(`/invoices/${invoiceId}/receipt-token`);
    return res.data;
  },
};
