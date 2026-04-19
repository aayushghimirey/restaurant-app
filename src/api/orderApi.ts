import { axiosInstance, stripEmptyParams } from "./axios"
import type { ApiResponse, PaginatedData } from "@/types/api"
import type { TableResponse, CreateTableRequest } from "@/features/orders/types"
import type { 
  ReservationResponse, 
  CreateReservationRequest,
  ReservationStatus 
} from "@/types/reservations"

// Table Management

export const getTables = async (): Promise<TableResponse[]> => {
  const { data } = await axiosInstance.get<ApiResponse<TableResponse[]>>("/tables")
  return data.data
}

export const createTable = async (payload: CreateTableRequest): Promise<TableResponse> => {
  const { data } = await axiosInstance.post<ApiResponse<TableResponse>>("/tables", payload)
  return data.data
}

// Reservation & Order Management

export const getReservations = async (status: ReservationStatus): Promise<PaginatedData<ReservationResponse[]>> => {
  const { data } = await axiosInstance.get<PaginatedData<ReservationResponse[]>>("/reservations", {
    params: stripEmptyParams({ status }),
  })
  return data
}

export const createReservation = async (payload: CreateReservationRequest): Promise<ReservationResponse> => {
  const { data } = await axiosInstance.post<ApiResponse<ReservationResponse>>("/reservations", payload)
  return data.data
}
