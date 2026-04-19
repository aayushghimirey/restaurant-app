import { useMutation } from "@/hooks/useMutation";
import { apiClient } from "@/api/client";
import { Vendor, CreateVendorPayload, ApiResponse } from "../../types";
import { vendorKeys } from "../keys";
import { invalidateKey } from "@/lib/eventBus";

export const createVendor = async (
  payload: CreateVendorPayload,
): Promise<Vendor> => {
  const { data } = await apiClient.post<ApiResponse<Vendor>>(
    "/vendors",
    payload,
  );
  return data.data;
};

export function useCreateVendor() {
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      invalidateKey(vendorKeys.lists());
    },
  });
}
