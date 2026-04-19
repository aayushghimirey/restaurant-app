import { axiosInstance } from "../../../api/axios"
import { TenantRequest, ApiResponse } from "../../auth/types"

export const tenantApi = {
  registerTenant: async (request: TenantRequest): Promise<void> => {
    // @PostMapping("/tenant")
    // @PreAuthorize("hasRole('SUPER_ADMIN')")
    // public ResponseEntity<ApiResponse<String>> createTenant(@RequestBody TenantRequest request)
    await axiosInstance.post<ApiResponse<string>>("/auth/super/tenant", request)
  },
}
