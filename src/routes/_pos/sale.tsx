import { createFileRoute } from '@tanstack/react-router'
import { SalePage } from '@/features/pos/components/sale-page'

export const Route = createFileRoute('/_pos/sale')({
  component: SalePage,
})
