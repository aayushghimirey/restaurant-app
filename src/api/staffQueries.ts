import { useMutation } from "@/hooks/useMutation"
import { useFetch } from "@/hooks/useFetch"
import toast from "react-hot-toast"
import { getStaffs, createStaff } from "./staffApi"
import type { GetStaffQueryRequest, StaffReqDto, StaffResDto } from "@/types/staff"
import { invalidateKey } from "@/lib/eventBus"

const staffKeys = {
  all: ["staffs"] as const,
  lists: () => [...staffKeys.all, "list"] as const,
  list: (params: GetStaffQueryRequest) => [...staffKeys.lists(), params] as const,
}

export function useStaffs(params: GetStaffQueryRequest = {}) {
  return useFetch<{
    data: StaffResDto[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    message?: string
  }>(
    staffKeys.list(params),
    () => getStaffs(params)
  )
}

export function useCreateStaff() {
  return useMutation({
    mutationFn: (payload: StaffReqDto) => createStaff(payload),
    onSuccess: () => {
      invalidateKey(staffKeys.lists())
    },
    onError: () => {
      toast.error("Failed to create staff")
    },
    // We handle the success toast in the caller (AdministrationPage) because it can tailor the message.
  })
}

export type StaffsQueryResult = ReturnType<typeof useStaffs>

