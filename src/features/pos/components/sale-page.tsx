import { useMemo, useRef, useState } from 'react'
import { Check, Minus, Plus, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { sampleProducts } from '@/features/pos/data/products'

type CartItem = {
  barcode: string
  name: string
  qty: number
  unitPrice: number
  notes: string
}

type PaymentMethod = {
  key: 'cash' | 'card' | 'bank' | 'credit'
  label: string
  amount: number
}

const VAT10_RATE = 0.1
const VAT2_RATE = 0.02

const formatCurrency = (n: number) =>
  n.toLocaleString('mn-MN', { maximumFractionDigits: 0 })

const emptyPayments = (): PaymentMethod[] => [
  { key: 'cash', label: 'Бэлнээр', amount: 0 },
  { key: 'card', label: 'Картаар', amount: 0 },
  { key: 'bank', label: 'Дансаар', amount: 0 },
  { key: 'credit', label: 'Авлагаар', amount: 0 },
]

export function SalePage() {
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [payments, setPayments] = useState<PaymentMethod[]>(emptyPayments)
  const [mode, setMode] = useState<'demo' | 'production'>('demo')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<number | null>(null)
  const barcodeRef = useRef<HTMLInputElement>(null)

  const { totalNet, totalVat10, totalVat2, grandTotal } = useMemo(() => {
    const net = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0)
    const vat10 = net * VAT10_RATE
    const vat2 = net * VAT2_RATE
    return {
      totalNet: net,
      totalVat10: Math.round(vat10),
      totalVat2: Math.round(vat2),
      grandTotal: Math.round(net + vat10 + vat2),
    }
  }, [cart])

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)
  const change = Math.max(0, totalPaid - grandTotal)
  const shortfall = Math.max(0, grandTotal - totalPaid)
  const canPay = cart.length > 0 && totalPaid >= grandTotal

  const addByBarcode = () => {
    const code = barcode.trim()
    if (!code) return
    const product = sampleProducts.find((p) => p.barcode === code)
    if (!product) {
      toast.error(`Баркод олдсонгүй: ${code}`)
      return
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.barcode === product.barcode)
      if (existing) {
        return prev.map((i) =>
          i.barcode === product.barcode ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [
        ...prev,
        {
          barcode: product.barcode,
          name: product.name,
          qty: 1,
          unitPrice: product.price,
          notes: '',
        },
      ]
    })
    setBarcode('')
    barcodeRef.current?.focus()
  }

  const changeQty = (barcode: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.barcode === barcode ? { ...i, qty: i.qty + delta } : i
        )
        .filter((i) => i.qty > 0)
    )
  }

  const removeItem = (barcode: string) => {
    setCart((prev) => prev.filter((i) => i.barcode !== barcode))
  }

  const updateNotes = (barcode: string, notes: string) => {
    setCart((prev) =>
      prev.map((i) => (i.barcode === barcode ? { ...i, notes } : i))
    )
  }

  const updatePayment = (key: PaymentMethod['key'], amount: number) => {
    setPayments((prev) =>
      prev.map((p) => (p.key === key ? { ...p, amount } : p))
    )
  }

  const fillExactCash = () => {
    setPayments(emptyPayments().map((p) =>
      p.key === 'cash' ? { ...p, amount: grandTotal } : p
    ))
  }

  const clearPayments = () => setPayments(emptyPayments())

  const resetSale = () => {
    setCart([])
    setBarcode('')
    setPayments(emptyPayments())
    barcodeRef.current?.focus()
  }

  const submitPayment = () => {
    if (!canPay) return
    const receipt = Math.floor(100000 + Math.random() * 900000)
    setLastReceipt(receipt)
    setConfirmOpen(true)
    if (mode === 'demo') {
      toast.success(`Демо горим: баримт #${receipt} үүслээ`)
    } else {
      toast.success(`Төлбөр хийгдлээ — баримт #${receipt}`)
    }
  }

  const closeAndReset = () => {
    setConfirmOpen(false)
    resetSale()
  }

  return (
    <div className='flex h-full gap-4 p-4'>
      {/* ===== Left Panel: Cart ===== */}
      <div className='flex flex-1 flex-col rounded-lg border bg-white'>
        {/* Barcode input + mode toggle */}
        <div className='flex items-center gap-3 border-b p-4'>
          <Input
            ref={barcodeRef}
            placeholder='Баркод оруулах... (2537, 2211, 3012...)'
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addByBarcode()
              }
            }}
            className='flex-1 text-sm'
            autoFocus
          />
          <Button
            size='icon'
            onClick={addByBarcode}
            className='shrink-0 bg-[#C9A84C] text-white hover:bg-[#b8973e]'
          >
            <Search className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-2 rounded-md border border-[#e2e5ea] bg-[#f8f9fb] px-3 py-1.5'>
            <span
              className={cn(
                'text-xs font-medium',
                mode === 'demo' ? 'text-[#C9A84C]' : 'text-[#9ba3b0]'
              )}
            >
              Демо
            </span>
            <Switch
              checked={mode === 'production'}
              onCheckedChange={(v) => setMode(v ? 'production' : 'demo')}
              aria-label='Демо/Бодит горим'
            />
            <span
              className={cn(
                'text-xs font-medium',
                mode === 'production' ? 'text-emerald-600' : 'text-[#9ba3b0]'
              )}
            >
              Бодит
            </span>
          </div>
        </div>

        {/* Cart table */}
        <div className='flex-1 overflow-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[110px]'>Баркод</TableHead>
                <TableHead>Барааны нэр</TableHead>
                <TableHead className='w-[140px] text-center'>Тоо</TableHead>
                <TableHead className='text-right'>Үнэ</TableHead>
                <TableHead className='text-right'>НӨАТ 10%</TableHead>
                <TableHead className='text-right'>НӨАТ 2%</TableHead>
                <TableHead className='text-right'>Нийт ₮</TableHead>
                <TableHead className='w-[200px]'>Тэмдэглэл</TableHead>
                <TableHead className='w-[48px]' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className='py-20 text-center text-muted-foreground'
                  >
                    Бараа нэмэгдээгүй байна — баркод оруулна уу
                  </TableCell>
                </TableRow>
              ) : (
                cart.map((item) => {
                  const lineNet = item.unitPrice * item.qty
                  const lineVat10 = Math.round(lineNet * VAT10_RATE)
                  const lineVat2 = Math.round(lineNet * VAT2_RATE)
                  const lineTotal = lineNet + lineVat10 + lineVat2
                  return (
                    <TableRow key={item.barcode}>
                      <TableCell className='font-mono text-xs'>
                        {item.barcode}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div className='flex items-center justify-center gap-1'>
                          <Button
                            size='icon'
                            variant='outline'
                            className='h-7 w-7'
                            onClick={() => changeQty(item.barcode, -1)}
                          >
                            <Minus className='h-3 w-3' />
                          </Button>
                          <span className='w-8 text-center tabular-nums'>
                            {item.qty}
                          </span>
                          <Button
                            size='icon'
                            variant='outline'
                            className='h-7 w-7'
                            onClick={() => changeQty(item.barcode, 1)}
                          >
                            <Plus className='h-3 w-3' />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatCurrency(lineVat10)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatCurrency(lineVat2)}
                      </TableCell>
                      <TableCell className='text-right font-medium tabular-nums'>
                        {formatCurrency(lineTotal)}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.notes}
                          onChange={(e) =>
                            updateNotes(item.barcode, e.target.value)
                          }
                          placeholder='...'
                          className='h-8 text-xs'
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600'
                          onClick={() => removeItem(item.barcode)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Totals bar */}
        <div className='flex items-center justify-end gap-8 border-t bg-muted/50 px-6 py-3'>
          <div className='text-sm text-muted-foreground'>
            Дүн:{' '}
            <span className='font-semibold text-foreground tabular-nums'>
              {formatCurrency(totalNet)}
            </span>
          </div>
          <div className='text-sm text-muted-foreground'>
            НӨАТ 10%:{' '}
            <span className='font-semibold text-foreground tabular-nums'>
              {formatCurrency(totalVat10)}
            </span>
          </div>
          <div className='text-sm text-muted-foreground'>
            НӨАТ 2%:{' '}
            <span className='font-semibold text-foreground tabular-nums'>
              {formatCurrency(totalVat2)}
            </span>
          </div>
          <div className='text-lg font-bold text-foreground tabular-nums'>
            НИЙТ: {formatCurrency(grandTotal)} ₮
          </div>
        </div>
      </div>

      {/* ===== Right Panel: Payment ===== */}
      <div className='flex w-80 shrink-0 flex-col gap-4'>
        {/* Payment methods */}
        <div className='rounded-lg border bg-white p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h3 className='text-sm font-semibold text-[#1a2744]'>
              Төлбөрийн хэлбэр
            </h3>
            <button
              type='button'
              onClick={clearPayments}
              className='text-xs text-[#9ba3b0] hover:text-[#5a6577]'
            >
              Цэвэрлэх
            </button>
          </div>
          <div className='space-y-2'>
            {payments.map((p) => (
              <div key={p.key} className='flex items-center gap-2'>
                <Label className='w-20 text-sm text-[#5a6577]'>
                  {p.label}
                </Label>
                <Input
                  type='number'
                  min={0}
                  value={p.amount || ''}
                  onChange={(e) =>
                    updatePayment(p.key, Math.max(0, Number(e.target.value) || 0))
                  }
                  placeholder='0'
                  className='flex-1 text-right text-sm tabular-nums'
                />
                <Button
                  size='icon'
                  variant='ghost'
                  onClick={() =>
                    p.key === 'cash'
                      ? fillExactCash()
                      : updatePayment(p.key, grandTotal - totalPaid + p.amount)
                  }
                  title='Үлдэгдэл дүнгээр бөглөх'
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
            label={shortfall > 0 ? 'Дутуу' : 'Хариулт'}
            value={formatCurrency(shortfall > 0 ? shortfall : change)}
            variant={shortfall > 0 ? 'red' : 'blue'}
          />
        </div>

        {/* Action buttons */}
        <div className='mt-auto flex gap-3'>
          <Button
            variant='outline'
            onClick={resetSale}
            disabled={cart.length === 0 && totalPaid === 0}
            className='flex-1'
          >
            <X className='mr-2 h-4 w-4' />
            Буцах
          </Button>
          <Button
            onClick={submitPayment}
            disabled={!canPay}
            className={cn(
              'flex-1 text-white',
              canPay
                ? 'bg-[#C9A84C] hover:bg-[#b8973e]'
                : 'cursor-not-allowed bg-[#C9A84C]/40'
            )}
          >
            {mode === 'demo' ? 'Демо төлөлт' : 'Төлөлт хийх'}
          </Button>
        </div>
      </div>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) closeAndReset()
          else setConfirmOpen(open)
        }}
      >
        <DialogContent className='pos-scope sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <span
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full',
                  mode === 'demo'
                    ? 'bg-[#C9A84C]/15 text-[#C9A84C]'
                    : 'bg-emerald-100 text-emerald-600'
                )}
              >
                <Check className='h-4 w-4' />
              </span>
              {mode === 'demo' ? 'Демо төлбөр амжилттай' : 'Төлбөр амжилттай'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'demo'
                ? 'Энэ нь жинхэнэ гүйлгээ биш — зөвхөн тестийн горим.'
                : 'Баримт хэвлэгдэж, бараа зарагдсанаар бүртгэгдэнэ.'}
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2 rounded-md bg-[#f8f9fb] p-4 text-sm'>
            <div className='flex justify-between'>
              <span className='text-[#5a6577]'>Баримт №</span>
              <span className='font-mono font-medium'>
                {lastReceipt ?? '—'}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-[#5a6577]'>Бараа тоо</span>
              <span className='tabular-nums'>
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-[#5a6577]'>Нийт дүн</span>
              <span className='font-semibold tabular-nums'>
                {formatCurrency(grandTotal)} ₮
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-[#5a6577]'>Хариулт</span>
              <span className='tabular-nums'>
                {formatCurrency(change)} ₮
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={closeAndReset}
              className='w-full bg-[#C9A84C] text-white hover:bg-[#b8973e]'
            >
              Шинэ гүйлгээ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
