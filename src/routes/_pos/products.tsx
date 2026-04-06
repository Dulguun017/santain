import { createFileRoute } from '@tanstack/react-router'
import { ProductsPage } from '@/features/pos/components/products-page'

export const Route = createFileRoute('/_pos/products')({
  component: ProductsPage,
})
