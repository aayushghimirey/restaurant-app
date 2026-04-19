export type {
  GetStockQueryRequest,
  GetStockVariantsQueryRequest,
  StockAdjustmentCommand,
  StockReqDto,
  StockResponse,
  StockUpdateCommand,
  StockType,
  UnitDto,
  UnitType,
  VariantDto,
  VariantResponse,
} from "@/types/inventory"

export type { ApiResponse, PaginatedData } from "@/types/api"

// Backwards-compatible aliases for older feature components.
export type Stock = import("@/types/inventory").StockResponse
export type Variant = import("@/types/inventory").VariantDto
export type Unit = import("@/types/inventory").UnitDto
