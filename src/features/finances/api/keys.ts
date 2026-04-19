export const financeKeys = {
  all: ['finances'] as const,
  purchases: () => [...financeKeys.all, 'purchases'] as const,
  purchaseList: (params: any) => [...financeKeys.purchases(), params] as const,
  invoices: () => [...financeKeys.all, 'invoices'] as const,
  invoiceList: (params: any) => [...financeKeys.invoices(), params] as const,
};
