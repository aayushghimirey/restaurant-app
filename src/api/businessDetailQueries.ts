import { useMutation } from "@/hooks/useMutation"
import { useFetch } from "@/hooks/useFetch"
import toast from "react-hot-toast"
import { getBusinessDetail, createBusinessDetail, updateBusinessDetail } from "./businessDetailApi"
import type { BusinessDetailRequest, BusinessDetailUpdate } from "@/types/businessDetail"
import { invalidateKey } from "@/lib/eventBus"

const businessDetailKeys = {
  all: ["business-details"] as const,
  detail: () => [...businessDetailKeys.all, "detail"] as const,
}

export function useBusinessDetail() {
  return useFetch(
    businessDetailKeys.detail(),
    () => getBusinessDetail()
  )
}

export function useCreateBusinessDetail() {
  return useMutation({
    bypassGlobalBlock: true,
    mutationFn: (payload: BusinessDetailRequest) => createBusinessDetail(payload),
    onSuccess: () => {
      invalidateKey(businessDetailKeys.detail())
      toast.success("Business details created successfully")
    },
    onError: () => {
      toast.error("Failed to create business details")
    },
  })
}

export function useUpdateBusinessDetail() {
  return useMutation({
    bypassGlobalBlock: true,
    mutationFn: (payload: BusinessDetailUpdate) => updateBusinessDetail(payload),
    onSuccess: () => {
      invalidateKey(businessDetailKeys.detail())
      toast.success("Business details updated successfully")
    },
    onError: () => {
      toast.error("Failed to update business details")
    },
  })
}
