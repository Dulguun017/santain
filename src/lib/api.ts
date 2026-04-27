import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token =
    useAuthStore.getState().auth.accessToken ||
    import.meta.env.VITE_API_TOKEN ||
    ''
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type ApiNumeric = string | number | { s: number; e: number; d: number[] } | null

export type ApiProduct = {
  id: number
  barcode: string | null
  name: string
  price: ApiNumeric
  cost: ApiNumeric
  averageCost: ApiNumeric
  weightGrams: ApiNumeric
  quantityInStock: ApiNumeric
  note: string | null
  createdAt: string
  category: { id: number; name: string } | null
  supplier: { id: number; name: string } | null
  productType: { id: number; nameMn: string; nameEn: string | null } | null
  goldPurity: { id: number; purity: number; description: string | null } | null
}

export type ApiProductList = {
  total: number
  page: number
  limit: number
  items: ApiProduct[]
}

export type CreateSalePayload = {
  saleNumber?: string
  customerName?: string
  paymentMethod?: string
  discountAmount?: number
  note?: string
  items: Array<{
    productId: number
    quantity?: number
    unitPrice: number
    discountAmount?: number
  }>
}

export type ApiSale = {
  id: number
  saleNumber: string | null
  saleDate: string
  totalAmount: string | number
  paymentMethod: string | null
  customerName: string | null
}

type PrismaDecimal = { s: number; e: number; d: number[] }

const isDecimalObject = (v: unknown): v is PrismaDecimal =>
  !!v &&
  typeof v === 'object' &&
  'd' in (v as object) &&
  Array.isArray((v as PrismaDecimal).d)

const decimalObjectToNumber = (v: PrismaDecimal): number => {
  const { s, e, d } = v
  if (d.length === 0) return 0
  if (d.length === 1) {
    const head = d[0]
    const headDigits = String(head).length - 1
    return s * head * 10 ** (e - headDigits)
  }
  let str = String(d[0])
  for (let i = 1; i < d.length; i++) {
    str += String(d[i]).padStart(7, '0')
  }
  const intLen = e + 1
  const intPart = str.slice(0, intLen) || '0'
  const fracPart = str.slice(intLen)
  const n = Number(fracPart ? `${intPart}.${fracPart}` : intPart)
  return s < 0 ? -n : n
}

export const toNumber = (v: unknown): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  if (isDecimalObject(v)) return decimalObjectToNumber(v)
  return 0
}
