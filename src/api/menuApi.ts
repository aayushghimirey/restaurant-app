import { axiosInstance, stripEmptyParams } from "./axios"
import type { ApiResponse, PaginatedData } from "@/types/api"
import type {
  CreateMenuRequest,
  GetMenusQueryRequest,
  MenuIngredientResponse,
  MenuResponse,
} from "@/features/menus/types"

export const getMenus = async (
  params: GetMenusQueryRequest = {},
): Promise<PaginatedData<MenuResponse[]>> => {
  const { data } = await axiosInstance.get<PaginatedData<MenuResponse[]>>("/menus", {
    params: stripEmptyParams(params),
  })
  return data
}

export const createMenu = async (payload: CreateMenuRequest): Promise<MenuResponse> => {
  const { data } = await axiosInstance.post<ApiResponse<MenuResponse>>("/menus", payload)
  return data.data
}

export const getMenuById = async (id: string): Promise<MenuResponse> => {
  const { data } = await axiosInstance.get<ApiResponse<MenuResponse>>(`/menus/${id}`)
  return data.data
}

export const getMenuIngredientsById = async (id: string): Promise<MenuIngredientResponse[]> => {
  const { data } = await axiosInstance.get<ApiResponse<MenuIngredientResponse[]>>(`/menus/${id}/ingredients`)
  return data.data
}
