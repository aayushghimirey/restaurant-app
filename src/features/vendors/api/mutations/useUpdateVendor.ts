import { useMutation } from "@/hooks/useMutation";
import { apiClient } from "@/api/client";
import { Vendor, UpdateVendorPayload, ApiResponse } from "../../types";
import { vendorKeys } from "../keys";
import { invalidateKey } from "@/lib/eventBus";

export const updateVendor = async ({
  vendorId,
  payload,
}: {
  vendorId: string;
  payload: UpdateVendorPayload;
}): Promise<Vendor> => {
  const { data } = await apiClient.patch<ApiResponse<Vendor>>(
    `/vendors/${vendorId}`,
    payload,
  );
  return data.data;
};

export function useUpdateVendor() {
  return useMutation({
    mutationFn: updateVendor,
    onSuccess: (_, { vendorId }) => {
      invalidateKey(vendorKeys.lists());
      invalidateKey(vendorKeys.detail(vendorId));
    },
  });
}
