import { createFileRoute } from '@tanstack/react-router'
import { PosLayout } from '@/features/pos/components/pos-layout'

export const Route = createFileRoute('/_pos')({
  component: PosLayout,
})
