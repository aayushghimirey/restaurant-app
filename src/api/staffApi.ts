import { axiosInstance, stripEmptyParams } from "./axios"
import type { ApiResponse } from "@/types/api"
import type { GetStaffQueryRequest, StaffReqDto, StaffResDto } from "@/types/staff"

export const getStaffs = async (
  params: GetStaffQueryRequest = {},
): Promise<{
  data: StaffResDto[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  message?: string
}> => {
  const { data } = await axiosInstance.get<{
    data: StaffResDto[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    message?: string
  }>("/staffs", { params: stripEmptyParams(params) })
  return data
}

export const createStaff = async (payload: StaffReqDto): Promise<StaffResDto> => {
  const { data } = await axiosInstance.post<ApiResponse<StaffResDto>>("/staffs", payload)
  return data.data
}

