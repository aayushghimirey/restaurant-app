export enum DateSelection {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH'
}

export interface ReservationOrderInfo {
  orderCount: number;
  cancelledCount: number;
  successOrderCount: number;
}

export interface PurchaseInfo {
  purchaseCount: number;
  purchaseAmount: number;
}

export interface FinanceServiceInfo {
  totalPurchaseExpense: number;
  totalInvoiceRevenue: number;
  totalVatPaid: number;
}
