import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  type ApiProduct,
  type ApiProductList,
  type ApiSale,
  type CreateSalePayload,
} from '@/lib/api'

export type LookupItem = { id: number; name: string }
export type ProductType = { id: number; nameMn: string; nameEn: string | null }
export type GoldPurity = {
  id: number
  purity: number
  description: string | null
}

export type CreateProductPayload = {
  name: string
  price: number
  barcode?: string
  productTypeId?: number
  categoryId?: number
  supplierId?: number
  goldPurityId?: number
  ringSize?: number
  weightGrams?: number
  cost?: number
  wholesalePrice?: number
  wholesaleMinQty?: number
  note?: string
}

export const productKeys = {
  all: ['products'] as const,
  list: (params?: {
    search?: string
    inStock?: boolean
    limit?: number
  }) => [...productKeys.all, 'list', params ?? {}] as const,
  byBarcode: (barcode: string) =>
    [...productKeys.all, 'barcode', barcode] as const,
}

export function useProducts(params?: {
  search?: string
  inStock?: boolean
  limit?: number
}) {
  return useQuery({
    queryKey: productKeys.list({
      search: params?.search,
      inStock: params?.inStock,
      limit: params?.limit,
    }),
    queryFn: async () => {
      const { data } = await api.get<ApiProductList>('/products', {
        params: {
          search: params?.search,
          inStock: params?.inStock,
          limit: params?.limit ?? 100,
        },
      })
      return data
    },
  })
}

export async function fetchProductByBarcode(
  barcode: string
): Promise<ApiProduct | null> {
  const { data } = await api.get<ApiProductList>('/products', {
    params: { search: barcode, limit: 5 },
  })
  return (
    data.items.find((p) => p.barcode === barcode) ??
    data.items[0] ??
    null
  )
}

export function useCategories() {
  return useQuery({
    queryKey: ['lookups', 'categories'],
    queryFn: async () => {
      const { data } = await api.get<LookupItem[]>('/categories')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['lookups', 'suppliers'],
    queryFn: async () => {
      const { data } = await api.get<LookupItem[]>('/suppliers')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useProductTypes() {
  return useQuery({
    queryKey: ['lookups', 'product-types'],
    queryFn: async () => {
      const { data } = await api.get<ProductType[]>('/product-types')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useGoldPurities() {
  return useQuery({
    queryKey: ['lookups', 'gold-purities'],
    queryFn: async () => {
      const { data } = await api.get<GoldPurity[]>('/gold-purities')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { data } = await api.post<ApiProduct>('/products', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      const { data } = await api.post<ApiSale>('/sales', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
