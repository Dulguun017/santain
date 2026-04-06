import { useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type CartItem = {
  barcode: string
  name: string
  qty: number
  price: number
  vat10: number
  vat2: number
  total: number
  notes: string
}

type PaymentMethod = {
  key: string
  label: string
  amount: number
}

const formatCurrency = (n: number) =>
  n.toLocaleString('mn-MN', { maximumFractionDigits: 0 })

export function SalePage() {
  const [barcode, setBarcode] = useState('')
  const [cart] = useState<CartItem[]>([])
  const [payments, setPayments] = useState<PaymentMethod[]>([
    { key: 'cash', label: 'Бэлнээр', amount: 0 },
    { key: 'card', label: 'Картаар', amount: 0 },
    { key: 'bank', label: 'Дансаар', amount: 0 },
    { key: 'credit', label: 'Авлагаар', amount: 0 },
  ])

  const totalVat10 = cart.reduce((s, i) => s + i.vat10, 0)
  const totalVat2 = cart.reduce((s, i) => s + i.vat2, 0)
  const grandTotal = cart.reduce((s, i) => s + i.total, 0)
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const change = Math.max(0, totalPaid - grandTotal)

  const updatePayment = (key: string, amount: number) => {
    setPayments((prev) =>
      prev.map((p) => (p.key === key ? { ...p, amount } : p))
    )
  }

  return (
    <div className='flex h-full gap-4 p-4'>
      {/* ===== Left Panel: Cart ===== */}
      <div className='flex flex-1 flex-col rounded-lg border bg-white'>
        {/* Barcode input */}
        <div className='flex items-center gap-2 border-b p-4'>
          <Input
            placeholder='Баркод оруулах...'
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className='flex-1 text-sm'
          />
          <Button
            size='icon'
            className='shrink-0 bg-[#C9A84C] text-white hover:bg-[#b8973e]'
          >
            <Search className='h-4 w-4' />
          </Button>
        </div>

        {/* Cart table */}
        <div className='flex-1 overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Баркод</TableHead>
                <TableHead>Барааны нэр</TableHead>
                <TableHead className='text-center'>Тоо</TableHead>
                <TableHead className='text-right'>Үнэ</TableHead>
                <TableHead className='text-right'>НӨАТ 10%</TableHead>
                <TableHead className='text-right'>НӨАТ 2%</TableHead>
                <TableHead className='text-right'>Нийт ₮</TableHead>
                <TableHead>Тэмдэглэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className='py-20 text-center text-muted-foreground'
                  >
                    Бараа нэмэгдээгүй байна
                  </TableCell>
                </TableRow>
              ) : (
                cart.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className='font-mono text-xs'>
                      {item.barcode}
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className='text-center'>{item.qty}</TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.vat10)}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.vat2)}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell className='text-xs text-muted-foreground'>
                      {item.notes}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Totals bar */}
        <div className='flex items-center justify-end gap-8 border-t bg-muted/50 px-6 py-3'>
          <div className='text-sm text-muted-foreground'>
            НӨАТ 10%:{' '}
            <span className='font-semibold text-foreground'>
              {formatCurrency(totalVat10)}
            </span>
          </div>
          <div className='text-sm text-muted-foreground'>
            НӨАТ 2%:{' '}
            <span className='font-semibold text-foreground'>
              {formatCurrency(totalVat2)}
            </span>
          </div>
          <div className='text-lg font-bold text-foreground'>
            НИЙТ: {formatCurrency(grandTotal)} ₮
          </div>
        </div>
      </div>

      {/* ===== Right Panel: Payment ===== */}
      <div className='flex w-80 shrink-0 flex-col gap-4'>
        {/* Payment methods */}
        <div className='rounded-lg border bg-white p-4'>
          <h3 className='mb-3 text-sm font-semibold'>Төлбөрийн хэлбэр</h3>
          <div className='space-y-2'>
            {payments.map((p) => (
              <div key={p.key} className='flex items-center gap-2'>
                <span className='w-20 text-sm text-muted-foreground'>
                  {p.label}
                </span>
                <Input
                  type='number'
                  min={0}
                  value={p.amount || ''}
                  onChange={(e) =>
                    updatePayment(p.key, Number(e.target.value) || 0)
                  }
                  placeholder='0'
                  className='flex-1 text-right text-sm tabular-nums'
                />
                <Button
                  size='icon'
                  variant='ghost'
                  className='h-8 w-8 shrink-0 text-[#C9A84C] hover:bg-[#C9A84C]/10'
                >
                  <Check className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary boxes */}
        <div className='space-y-2'>
          <SummaryBox
            label='Төлсөн дүн'
            value={formatCurrency(totalPaid)}
            variant='green'
          />
          <SummaryBox
            label='Төлөх дүн'
            value={formatCurrency(grandTotal)}
            variant='red'
          />
          <SummaryBox
            label='Хариулт'
            value={formatCurrency(change)}
            variant='blue'
          />
        </div>

        {/* Action buttons */}
        <div className='mt-auto flex gap-3'>
          <Button variant='outline' className='flex-1'>
            <X className='mr-2 h-4 w-4' />
            Буцах
          </Button>
          <Button className='flex-1 bg-[#C9A84C] text-white hover:bg-[#b8973e]'>
            Төлөлт хийх
          </Button>
        </div>
      </div>
    </div>
  )
}

function SummaryBox({
  label,
  value,
  variant,
}: {
  label: string
  value: string
  variant: 'green' | 'red' | 'blue'
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg px-4 py-3',
        variant === 'green' && 'bg-emerald-50 text-emerald-700',
        variant === 'red' && 'bg-red-50 text-red-700',
        variant === 'blue' && 'bg-blue-50 text-blue-700'
      )}
    >
      <span className='text-sm font-medium'>{label}</span>
      <span className='text-lg font-bold tabular-nums'>{value} ₮</span>
    </div>
  )
}
