import { useState } from 'react';
import { useBusinessStore } from '@/features/business-details/store/businessStore';
import toast from 'react-hot-toast';

type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  bypassGlobalBlock?: boolean;
};

export function useMutation<TData = unknown, TVariables = void>(
  options: MutationOptions<TData, TVariables>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    variables: TVariables,
    mutateOptions?: { onSuccess?: () => void; onError?: () => void }
  ) => {
    if (!options.bypassGlobalBlock && useBusinessStore.getState().isBusinessDetailsMissing) {
      toast.error("Operations are disabled until Business Details are complete");
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      const data = await options.mutationFn(variables);
      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
      if (mutateOptions?.onSuccess) {
        mutateOptions.onSuccess();
      }
      return data;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      if (options.onError) {
        options.onError(e, variables);
      }
      if (mutateOptions?.onError) {
        mutateOptions.onError();
      }
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending, error };
}
