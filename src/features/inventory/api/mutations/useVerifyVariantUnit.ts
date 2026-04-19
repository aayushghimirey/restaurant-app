import { useMutation } from "@/hooks/useMutation"
import { verifyVariantUnit } from "@/api/inventoryApi"

export function useVerifyVariantUnit() {
  return useMutation({
    mutationFn: ({ vId, uId }: { vId: string; uId: string }) => verifyVariantUnit(vId, uId),
  })
}
