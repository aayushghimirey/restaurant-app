export interface Vendor {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
  panNumber: string;
}

export interface CreateVendorPayload {
  name: string;
  address: string;
  contactNumber: string;
  panNumber: string;
}

export interface UpdateVendorPayload {
  name: string;
  address: string;
  contactNumber: string;
  panNumber: string;
}

export interface VendorQueryParams {
  name?: string;
  contactNumber?: string;
  panNumber?: string;
  page?: number;
  size?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PagedResponse<T> {
  data: T;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
