import { axiosInstance } from "../../../api/axios"
import { TenantRequest, ApiResponse, Tenant } from "../../auth/types"

export const tenantApi = {
  registerTenant: async (request: TenantRequest): Promise<void> => {
    // @PostMapping("/tenant")
    // @PreAuthorize("hasRole('SUPER_ADMIN')")
    // public ResponseEntity<ApiResponse<String>> createTenant(@RequestBody TenantRequest request)
    await axiosInstance.post<ApiResponse<string>>("/auth/super/tenant", request)
  },

  getAllTenants: async (): Promise<Tenant[]> => {
    // @GetMapping
    // @PreAuthorize("hasRole('SUPER_ADMIN')")
    // public ResponseEntity<ApiResponse<List<Tenant>>> getAllTenants()
    const response = await axiosInstance.get<ApiResponse<Tenant[]>>("/auth/super")
    return response.data.data
  },
}
