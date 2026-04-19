import { useFetch } from "@/hooks/useFetch";
import { getTables } from "@/api/orderApi";
import { orderKeys } from "../keys";

export function useTables() {
  return useFetch(orderKeys.tables, getTables);
}
