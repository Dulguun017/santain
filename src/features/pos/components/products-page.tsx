import { useMemo, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { toNumber } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  useCategories,
  useCreateProduct,
  useGoldPurities,
  useProductTypes,
  useProducts,
  useSuppliers,
} from '@/features/pos/data/api'

const formatCurrency = (n: number) =>
  n.toLocaleString('mn-MN', { maximumFractionDigits: 0 })

const NONE = '__none__'

const numOrUndef = (v: string): number | undefined => {
  if (v.trim() === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

export function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const { data, isLoading, isError, error } = useProducts({
    search: search || undefined,
    limit: 200,
  })

  const rows = useMemo(() => {
    const items = data?.items ?? []
    return items.map((p) => ({
      id: p.id,
      barcode: p.barcode ?? String(p.id),
      name: p.name,
      price: toNumber(p.price),
      cost: toNumber(p.cost),
      qty: toNumber(p.quantityInStock),
      weight: toNumber(p.weightGrams),
      category: p.category?.name ?? '—',
      type: p.productType?.nameMn ?? '—',
      supplier: p.supplier?.name ?? '—',
      dateAdded: p.createdAt?.slice(0, 10) ?? '',
    }))
  }, [data])

  return (
    <div className='flex h-full flex-col gap-4 p-4'>
      {/* Form toggle */}
      {!showForm && (
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold text-[#1a2744]'>
            Бүртгэлтэй бараа
            {data ? (
              <span className='ml-2 text-sm font-normal text-[#9ba3b0]'>
                ({data.total})
              </span>
            ) : null}
          </h2>
          <div className='flex items-center gap-2'>
            <Input
              placeholder='Хайх (нэр, баркод)...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-64 border-[#e2e5ea]'
            />
            <Button
              onClick={() => setShowForm(true)}
              className='bg-[#C9A84C] text-white hover:bg-[#b8973e]'
            >
              <Plus className='mr-2 h-4 w-4' />
              Бараа нэмэх
            </Button>
          </div>
        </div>
      )}

      {/* Product entry form */}
      {showForm && <ProductForm onClose={() => setShowForm(false)} />}

      {/* Product list table */}
      <div className='flex-1 overflow-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Баркод</TableHead>
              <TableHead>Барааны нэр</TableHead>
              <TableHead>Төрөл</TableHead>
              <TableHead>Бүлэг</TableHead>
              <TableHead>Нийлүүлэгч</TableHead>
              <TableHead className='text-right'>Жин (гр)</TableHead>
              <TableHead className='text-right'>Өртөг</TableHead>
              <TableHead className='text-right'>Үнэ</TableHead>
              <TableHead className='text-center'>Тоо</TableHead>
              <TableHead>Огноо</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className='py-20 text-center text-muted-foreground'
                >
                  <span className='inline-flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Ачааллаж байна...
                  </span>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className='py-20 text-center text-red-600'
                >
                  Серверийн алдаа: {(error as Error)?.message ?? 'Тодорхойгүй'}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className='py-20 text-center text-muted-foreground'
                >
                  Бараа бүртгэгдээгүй байна
                </TableCell>
              </TableRow>
            ) : (
              rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className='font-mono text-xs'>
                    {p.barcode}
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.supplier}</TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {p.weight ? p.weight.toFixed(3) : '—'}
                  </TableCell>
                  <TableCell className='text-right tabular-nums'>
                    {p.cost ? formatCurrency(p.cost) : '—'}
                  </TableCell>
                  <TableCell className='text-right tabular-nums font-medium'>
                    {formatCurrency(p.price)}
                  </TableCell>
                  <TableCell className='text-center tabular-nums'>
                    {p.qty}
                  </TableCell>
                  <TableCell className='text-xs text-muted-foreground'>
                    {p.dateAdded}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

type FormState = {
  name: string
  price: string
  barcode: string
  productTypeId: string
  categoryId: string
  supplierId: string
  goldPurityId: string
  ringSize: string
  weightGrams: string
  cost: string
  wholesalePrice: string
  wholesaleMinQty: string
  note: string
}

const emptyForm: FormState = {
  name: '',
  price: '',
  barcode: '',
  productTypeId: NONE,
  categoryId: NONE,
  supplierId: NONE,
  goldPurityId: NONE,
  ringSize: '',
  weightGrams: '',
  cost: '',
  wholesalePrice: '',
  wholesaleMinQty: '',
  note: '',
}

function ProductForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const categoriesQ = useCategories()
  const suppliersQ = useSuppliers()
  const productTypesQ = useProductTypes()
  const goldPuritiesQ = useGoldPurities()
  const createMut = useCreateProduct()

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }))

  const canSubmit =
    form.name.trim().length > 0 &&
    numOrUndef(form.price) !== undefined &&
    !createMut.isPending

  const handleSubmit = async () => {
    const price = numOrUndef(form.price)
    if (!form.name.trim() || price === undefined) return

    const payload = {
      name: form.name.trim(),
      price,
      barcode: form.barcode.trim() || undefined,
      productTypeId:
        form.productTypeId !== NONE ? Number(form.productTypeId) : undefined,
      categoryId:
        form.categoryId !== NONE ? Number(form.categoryId) : undefined,
      supplierId:
        form.supplierId !== NONE ? Number(form.supplierId) : undefined,
      goldPurityId:
        form.goldPurityId !== NONE ? Number(form.goldPurityId) : undefined,
      ringSize: numOrUndef(form.ringSize),
      weightGrams: numOrUndef(form.weightGrams),
      cost: numOrUndef(form.cost),
      wholesalePrice: numOrUndef(form.wholesalePrice),
      wholesaleMinQty: numOrUndef(form.wholesaleMinQty),
      note: form.note.trim() || undefined,
    }

    try {
      await createMut.mutateAsync(payload)
      toast.success(`Бараа бүртгэгдлээ: ${payload.name}`)
      onClose()
    } catch (err) {
      toast.error(`Хадгалж чадсангүй: ${(err as Error)?.message ?? ''}`)
    }
  }

  return (
    <div className='rounded-lg border border-[#e2e5ea] bg-white p-6'>
      <h3 className='mb-4 text-base font-semibold text-[#1a2744]'>
        Бараа бүртгэх
      </h3>
      <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
        {/* Left column — required + identification */}
        <div className='space-y-4'>
          <div>
            <Label className='text-xs text-[#5a6577]'>
              Барааны нэр <span className='text-red-500'>*</span>
            </Label>
            <Input
              placeholder='Gold Ring 18K'
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>
              Үнэ (₮) <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='number'
              min={0}
              placeholder='150000'
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Баркод</Label>
            <Input
              placeholder='8901234567890'
              value={form.barcode}
              onChange={(e) => update('barcode', e.target.value)}
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Бүлэг</Label>
            <LookupSelect
              value={form.categoryId}
              onChange={(v) => update('categoryId', v)}
              loading={categoriesQ.isLoading}
              items={(categoriesQ.data ?? []).map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Төрөл</Label>
            <LookupSelect
              value={form.productTypeId}
              onChange={(v) => update('productTypeId', v)}
              loading={productTypesQ.isLoading}
              items={(productTypesQ.data ?? []).map((t) => ({
                value: String(t.id),
                label: t.nameMn,
              }))}
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Нийлүүлэгч</Label>
            <LookupSelect
              value={form.supplierId}
              onChange={(v) => update('supplierId', v)}
              loading={suppliersQ.isLoading}
              items={(suppliersQ.data ?? []).map((s) => ({
                value: String(s.id),
                label: s.name,
              }))}
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Алтны сорьц</Label>
            <LookupSelect
              value={form.goldPurityId}
              onChange={(v) => update('goldPurityId', v)}
              loading={goldPuritiesQ.isLoading}
              items={(goldPuritiesQ.data ?? []).map((g) => ({
                value: String(g.id),
                label: g.description ?? String(g.purity),
              }))}
            />
          </div>
        </div>

        {/* Right column — optional details */}
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='text-xs text-[#5a6577]'>Бөгжний хэмжээ</Label>
              <Input
                type='number'
                step='0.5'
                placeholder='17.5'
                value={form.ringSize}
                onChange={(e) => update('ringSize', e.target.value)}
                className='border-[#e2e5ea]'
              />
            </div>
            <div>
              <Label className='text-xs text-[#5a6577]'>Жин (гр)</Label>
              <Input
                type='number'
                step='0.001'
                placeholder='5.123'
                value={form.weightGrams}
                onChange={(e) => update('weightGrams', e.target.value)}
                className='border-[#e2e5ea]'
              />
            </div>
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Өртөг (₮)</Label>
            <Input
              type='number'
              min={0}
              placeholder='0'
              value={form.cost}
              onChange={(e) => update('cost', e.target.value)}
              className='border-[#e2e5ea]'
            />
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <Label className='text-xs text-[#5a6577]'>Бөөний үнэ (₮)</Label>
              <Input
                type='number'
                min={0}
                placeholder='0'
                value={form.wholesalePrice}
                onChange={(e) => update('wholesalePrice', e.target.value)}
                className='border-[#e2e5ea]'
              />
            </div>
            <div>
              <Label className='text-xs text-[#5a6577]'>Бөөний хам.тоо</Label>
              <Input
                type='number'
                min={0}
                placeholder='0'
                value={form.wholesaleMinQty}
                onChange={(e) => update('wholesaleMinQty', e.target.value)}
                className='border-[#e2e5ea]'
              />
            </div>
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Тэмдэглэл</Label>
            <Textarea
              placeholder='Тэмдэглэл...'
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              className='min-h-[80px] border-[#e2e5ea]'
            />
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className='mt-6 flex justify-end gap-3'>
        <Button
          variant='outline'
          onClick={onClose}
          disabled={createMut.isPending}
          className='border-[#e2e5ea] text-[#5a6577]'
        >
          Буцах
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className='bg-[#C9A84C] text-white hover:bg-[#b8973e]'
        >
          {createMut.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : null}
          Хадгалах
        </Button>
      </div>
    </div>
  )
}

function LookupSelect({
  value,
  onChange,
  items,
  loading,
}: {
  value: string
  onChange: (v: string) => void
  items: Array<{ value: string; label: string }>
  loading: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='border-[#e2e5ea]'>
        <SelectValue placeholder={loading ? 'Ачааллаж...' : 'Сонгох...'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>—</SelectItem>
        {items.map((it) => (
          <SelectItem key={it.value} value={it.value}>
            {it.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
