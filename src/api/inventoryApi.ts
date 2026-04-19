import { axiosInstance, stripEmptyParams } from "./axios"
import type {
  ApiResponse,
  PaginatedData,
} from "@/types/api"
import type {
  GetStockQueryRequest,
  GetStockVariantsQueryRequest,
  GetStockTransactionsQueryRequest,
  StockAdjustmentCommand,
  StockReqDto,
  StockResponse,
  StockTransactionResponse,
  StockVariantsResponse,
  StockUpdateCommand,
  VerifyVariantUnitResponse,
} from "@/types/inventory"

export const getStocks = async (
  params: GetStockQueryRequest = {},
): Promise<PaginatedData<StockResponse[]>> => {
  const { data } = await axiosInstance.get<PaginatedData<StockResponse[]>>("/stocks", {
    params: stripEmptyParams(params),
  })
  return data
}

export const createStock = async (payload: StockReqDto): Promise<StockResponse> => {
  const { data } = await axiosInstance.post<ApiResponse<StockResponse>>("/stocks", payload)
  return data.data
}

export const updateStock = async (id: string, command: StockUpdateCommand): Promise<StockResponse> => {
  const { data } = await axiosInstance.patch<ApiResponse<StockResponse>>(`/stocks/${id}`, command)
  return data.data
}

export const adjustStock = async (command: StockAdjustmentCommand): Promise<void> => {
  await axiosInstance.post("/stocks/adjustments", command)
}

export const getStockVariants = async (
  stockId: string,
  params: GetStockVariantsQueryRequest = {},
): Promise<StockVariantsResponse> => {
  const { data } = await axiosInstance.get<StockVariantsResponse>(`/stocks/${stockId}/variants`, {
    params: stripEmptyParams(params),
  })
  return data
}

export const verifyVariantUnit = async (variantId: string, unitId: string): Promise<boolean> => {
  const { data } = await axiosInstance.get<VerifyVariantUnitResponse>(
    `/stocks/variants/${variantId}/units/${unitId}/exists`,
  )
  return data.data
}

export const getStockTransactions = async (
  params: GetStockTransactionsQueryRequest = {},
): Promise<PaginatedData<StockTransactionResponse[]>> => {
  const { data } = await axiosInstance.get<PaginatedData<StockTransactionResponse[]>>(
    "/stocks/transactions",
    {
      params: stripEmptyParams(params),
    },
  )
  return data
}

export const getVariantTransactions = async (
  variantId: string,
  params: GetStockTransactionsQueryRequest = {},
): Promise<PaginatedData<StockTransactionResponse[]>> => {
  const { data } = await axiosInstance.get<PaginatedData<StockTransactionResponse[]>>(
    `/stocks/transactions/${variantId}`,
    {
      params: stripEmptyParams(params),
    },
  )
  return data
}

