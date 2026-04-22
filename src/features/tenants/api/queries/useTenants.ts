import { useFetch } from '@/hooks/useFetch';
import { tenantApi } from "../tenantApi"

export const useTenants = () => {
  return useFetch(["tenants"], () => tenantApi.getAllTenants());
}
