export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface PaginatedData<T> {
  data: T;
  totalElements: number;
  totalPages: number;
  size: number;
  number?: number;
  page?: number;
  message?: string;
  last?: boolean;
  status?: string;
}

