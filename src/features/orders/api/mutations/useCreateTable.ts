import { useMutation } from "@/hooks/useMutation";
import { createTable } from "@/api/orderApi";
import type { CreateTableRequest } from "../../types";
import { orderKeys } from "../keys";
import { invalidateKey } from "@/lib/eventBus";

export function useCreateTable() {
  return useMutation({
    mutationFn: (payload: CreateTableRequest) => createTable(payload),
    onSuccess: () => {
      invalidateKey(orderKeys.tables);
    },
  });
}
