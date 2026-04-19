export const purchaseKeys = {
  all: ['purchases'] as const,
  lists: () => [...purchaseKeys.all, 'list'] as const,
  list: (params: any) => [...purchaseKeys.lists(), params] as const,
};
