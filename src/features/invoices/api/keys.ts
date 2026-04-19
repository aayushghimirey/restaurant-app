export const invoiceKeys = {
  all: ['invoices'] as const,
  pending: () => [...invoiceKeys.all, 'pending'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
};
