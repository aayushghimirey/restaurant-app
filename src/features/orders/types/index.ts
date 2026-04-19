export type TableStatus = 'OPEN' | 'RESERVED' | 'CLOSE';

export interface TableResponse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: TableStatus;
}

export interface CreateTableRequest {
  name: string;
  location: string;
  capacity: number;
}
