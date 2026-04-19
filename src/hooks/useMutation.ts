import { useState } from 'react';

type MutationOptions<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
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
