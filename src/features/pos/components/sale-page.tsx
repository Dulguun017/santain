import { useMemo, useRef, useState } from 'react'
import {
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { toNumber } from '@/lib/api'
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
import { fetchProductByBarcode, useCreateSale } from '@/features/pos/data/api'

type CartItem = {
  productId: number
  barcode: string
  name: string
  qty: number
  unitPrice: number
  notes: string
}

type PayMethod = 'cash' | 'card' | null

const VAT10_RATE = 0.1
const VAT2_RATE = 0.02

const formatCurrency = (n: number) =>
  n.toLocaleString('mn-MN', { maximumFractionDigits: 0 })

export function SalePage() {
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [payMethod, setPayMethod] = useState<PayMethod>(null)
  const [mode, setMode] = useState<'demo' | 'production'>('demo')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lastReceipt, setLastReceipt] = useState<string | number | null>(null)
  const barcodeRef = useRef<HTMLInputElement>(null)

  const createSale = useCreateSale()

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

  const canPay =
    cart.length > 0 && payMethod !== null && !createSale.isPending

  const addByBarcode = async () => {
    const code = barcode.trim()
    if (!code) return
    setLookupLoading(true)
    try {
      const product = await fetchProductByBarcode(code)
      if (!product) {
        toast.error(`Баркод олдсонгүй: ${code}`)
        return
      }
      const price = toNumber(product.price)
      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product.id)
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, qty: i.qty + 1 } : i
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            barcode: product.barcode ?? String(product.id),
            name: product.name,
            qty: 1,
            unitPrice: price,
            notes: '',
          },
        ]
      })
      setBarcode('')
    } catch (err) {
      toast.error(
        `Сервертэй холбогдож чадсангүй: ${(err as Error)?.message ?? ''}`
      )
    } finally {
      setLookupLoading(false)
      barcodeRef.current?.focus()
    }
  }

  const changeQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + delta } : i
        )
        .filter((i) => i.qty > 0)
    )
  }

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }

  const updateNotes = (productId: number, notes: string) => {
    setCart((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, notes } : i))
    )
  }

  const resetSale = () => {
    setCart([])
    setBarcode('')
    setPayMethod(null)
    barcodeRef.current?.focus()
  }

  const submitPayment = async () => {
    if (!canPay || !payMethod) return

    if (mode === 'demo') {
      const receipt = Math.floor(100000 + Math.random() * 900000)
      setLastReceipt(receipt)
      setConfirmOpen(true)
      toast.success(`Демо горим: баримт #${receipt} үүслээ`)
      return
    }

    try {
      const sale = await createSale.mutateAsync({
        paymentMethod: payMethod,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.qty,
          unitPrice: i.unitPrice,
        })),
        note: cart.map((i) => i.notes).filter(Boolean).join(' | ') || undefined,
      })
      setLastReceipt(sale.saleNumber ?? sale.id)
      setConfirmOpen(true)
      toast.success(`Төлбөр амжилттай — баримт #${sale.saleNumber ?? sale.id}`)
    } catch (err) {
      toast.error(
        `Гүйлгээ хадгалж чадсангүй: ${(err as Error)?.message ?? ''}`
      )
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
            placeholder='Баркод оруулах...'
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
            disabled={lookupLoading}
          />
          <Button
            size='icon'
            onClick={addByBarcode}
            disabled={lookupLoading}
            className='shrink-0 bg-[#C9A84C] text-white hover:bg-[#b8973e]'
          >
            {lookupLoading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Search className='h-4 w-4' />
            )}
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
                    <TableRow key={item.productId}>
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
                            onClick={() => changeQty(item.productId, -1)}
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
                            onClick={() => changeQty(item.productId, 1)}
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
                            updateNotes(item.productId, e.target.value)
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
                          onClick={() => removeItem(item.productId)}
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
        {/* Payment method picker */}
        <div className='rounded-lg border bg-white p-4'>
          <h3 className='mb-3 text-sm font-semibold text-[#1a2744]'>
            Төлбөрийн хэлбэр
          </h3>
          <div className='grid grid-cols-2 gap-2'>
            <PayMethodButton
              label='Бэлнээр'
              icon={<Banknote className='h-5 w-5' />}
              active={payMethod === 'cash'}
              disabled={cart.length === 0}
              onClick={() => setPayMethod('cash')}
            />
            <PayMethodButton
              label='Картаар'
              icon={<CreditCard className='h-5 w-5' />}
              active={payMethod === 'card'}
              disabled={cart.length === 0}
              onClick={() => setPayMethod('card')}
            />
          </div>
        </div>

        {/* Summary boxes */}
        <div className='space-y-2'>
          <SummaryBox
            label='Төлсөн дүн'
            value={formatCurrency(payMethod ? grandTotal : 0)}
            variant='green'
          />
          <SummaryBox
            label='Төлөх дүн'
            value={formatCurrency(grandTotal)}
            variant='red'
          />
          <Label className='block px-1 pt-2 text-xs text-[#9ba3b0]'>
            {payMethod
              ? `Төлбөрийн хэлбэр: ${
                  payMethod === 'cash' ? 'Бэлнээр' : 'Картаар'
                }`
              : 'Бэлэн / Карт сонгоно уу'}
          </Label>
        </div>

        {/* Action buttons */}
        <div className='mt-auto flex gap-3'>
          <Button
            variant='outline'
            onClick={resetSale}
            disabled={cart.length === 0 && payMethod === null}
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
            {createSale.isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
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
              <span className='text-[#5a6577]'>Төлбөрийн хэлбэр</span>
              <span className='tabular-nums'>
                {payMethod === 'cash'
                  ? 'Бэлнээр'
                  : payMethod === 'card'
                    ? 'Картаар'
                    : '—'}
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

function PayMethodButton({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 rounded-lg border px-3 py-4 text-sm font-medium transition-all',
        active
          ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C] shadow-sm'
          : 'border-[#e2e5ea] bg-white text-[#5a6577] hover:border-[#C9A84C]/40 hover:bg-[#f8f9fb]',
        disabled && 'cursor-not-allowed opacity-50 hover:border-[#e2e5ea] hover:bg-white'
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
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
