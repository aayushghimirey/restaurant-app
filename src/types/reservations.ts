export enum ReservationStatus {
  PENDING = 'PENDING',
  UPDATED = 'UPDATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ReservationItemRequest {
  menuId: string;
  quantity: number;
}

export interface ReservationItemResponse {
  menuItemId: string;
  price: number;
  quantity: number;
}

export interface ReservationResponse {
  sessionId: string;
  tableId: string;
  status: ReservationStatus;
  billAmount: number;
  items: ReservationItemResponse[];
  reservationTime: string;
  reservationEndTime?: string | null;
}

export interface CreateReservationRequest {
  tableId: string;
  items: ReservationItemRequest[];
}

export interface UpdateReservationItemRequest {
  menuId: string;
  quantity: number;
}

export interface UpdateOrderItemCommand {
  items: UpdateReservationItemRequest[];
}
