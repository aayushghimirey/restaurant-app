import { axiosInstance } from "./axios"
import type { ApiResponse } from "@/types/api"
import type { BusinessDetailRequest, BusinessDetailResponse, BusinessDetailUpdate } from "@/types/businessDetail"

export const getBusinessDetail = async (): Promise<BusinessDetailResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<BusinessDetailResponse>>(`/business-details`)
  return data.data
}

export const createBusinessDetail = async (payload: BusinessDetailRequest): Promise<BusinessDetailResponse> => {
  const { data } = await axiosInstance.post<ApiResponse<BusinessDetailResponse>>("/business-details", payload)
  return data.data
}

export const updateBusinessDetail = async (payload: BusinessDetailUpdate): Promise<BusinessDetailResponse> => {
  const { data } = await axiosInstance.patch<ApiResponse<BusinessDetailResponse>>(`/business-details`, payload)
  return data.data
}
