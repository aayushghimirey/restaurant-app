export type StaffRole = "ADMIN" | "MANAGER" | "STAFF" | string

export interface StaffResDto {
  id: string
  name: string
  address: string
  contactNumber: string
  permissions: string[]
  role: StaffRole
}

export interface StaffReqDto {
  name: string
  address: string
  contactNumber: string
  permissions: string[]
  role: StaffRole
}

export interface GetStaffQueryRequest {
  search?: string
  page?: number
  size?: number
}

