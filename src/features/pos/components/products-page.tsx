import { useState } from 'react'
import { Plus, Upload } from 'lucide-react'
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
import { sampleProducts } from '@/features/pos/data/products'

const categories = [
  'Орос монет',
  'Эзмэг',
  'Бөгж',
  'Хослол',
  'Бугуйвч',
  'Зүүлт',
  'Гинж',
  'Сөйх',
]

const suppliers = ['Нийлүүлэгч 1', 'Нийлүүлэгч 2', 'Нийлүүлэгч 3']

const formatCurrency = (n: number) =>
  n.toLocaleString('mn-MN', { maximumFractionDigits: 0 })

export function ProductsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className='flex h-full flex-col gap-4 p-4'>
      {/* Form toggle */}
      {!showForm && (
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-[#1a2744]'>
            Бүртгэлтэй бараа
          </h2>
          <Button
            onClick={() => setShowForm(true)}
            className='bg-[#C9A84C] text-white hover:bg-[#b8973e]'
          >
            <Plus className='mr-2 h-4 w-4' />
            Бараа нэмэх
          </Button>
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
              <TableHead className='text-right'>Үнэ</TableHead>
              <TableHead>Бүлэг</TableHead>
              <TableHead>Нэгж</TableHead>
              <TableHead>Нийлүүлэгч</TableHead>
              <TableHead className='text-center'>Тоо</TableHead>
              <TableHead className='text-right'>Нэгж өртөг</TableHead>
              <TableHead className='text-right'>Дундаж өртөг</TableHead>
              <TableHead className='text-right'>Нийт өртөг</TableHead>
              <TableHead className='text-right'>Нийт үнэ</TableHead>
              <TableHead>Огноо</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className='py-20 text-center text-muted-foreground'
                >
                  Бараа бүртгэгдээгүй байна
                </TableCell>
              </TableRow>
            ) : (
              sampleProducts.map((p) => (
                <TableRow key={p.barcode}>
                  <TableCell className='font-mono text-xs'>
                    {p.barcode}
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(p.price)}
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>{p.supplier}</TableCell>
                  <TableCell className='text-center'>{p.qty}</TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(p.unitCost)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(p.avgCost)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(p.totalCost)}
                  </TableCell>
                  <TableCell className='text-right'>
                    {formatCurrency(p.totalValue)}
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

function ProductForm({ onClose }: { onClose: () => void }) {
  const [price, setPrice] = useState('')
  const [unitCost, setUnitCost] = useState('')

  const priceNum = Number(price.replace(/,/g, '')) || 0
  const costNum = Number(unitCost.replace(/,/g, '')) || 0
  const profitPct =
    costNum > 0 ? (((priceNum - costNum) / costNum) * 100).toFixed(1) : '0.0'

  return (
    <div className='rounded-lg border border-[#e2e5ea] bg-white p-6'>
      <h3 className='mb-4 text-base font-semibold text-[#1a2744]'>
        Бараа бүртгэх
      </h3>
      <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
        {/* Left column */}
        <div className='space-y-4'>
          <div>
            <Label className='text-xs text-[#5a6577]'>Баркод</Label>
            <div className='flex gap-2'>
              <Input
                type='number'
                placeholder='2537'
                className='flex-1 border-[#e2e5ea]'
              />
              <Button
                variant='outline'
                size='sm'
                className='border-[#e2e5ea] text-[#5a6577]'
              >
                Үүсгэх
              </Button>
            </div>
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Барааны нэр</Label>
            <Input
              placeholder='Бөгж К271; раз-22, 22.5 3.65гр'
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Үнэ</Label>
            <Input
              type='text'
              placeholder='2,190,000'
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Бүлэг</Label>
            <Select>
              <SelectTrigger className='border-[#e2e5ea]'>
                <SelectValue placeholder='Сонгох...' />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Хэмжих нэгж</Label>
            <Select defaultValue='ширхэг'>
              <SelectTrigger className='border-[#e2e5ea]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ширхэг'>ширхэг</SelectItem>
                <SelectItem value='грамм'>грамм</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Нийлүүлэгч</Label>
            <Select>
              <SelectTrigger className='border-[#e2e5ea]'>
                <SelectValue placeholder='Сонгох...' />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Нэгж өртөг</Label>
            <Input
              type='text'
              placeholder='1,133,325'
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Ашгийн хувь</Label>
            <Input
              readOnly
              value={`${profitPct}%`}
              className='border-[#e2e5ea] bg-[#f8f9fb] text-[#5a6577]'
            />
          </div>
        </div>

        {/* Right column */}
        <div className='space-y-4'>
          <div>
            <Label className='text-xs text-[#5a6577]'>Б/У ангилал</Label>
            <Input defaultValue='6212000' className='border-[#e2e5ea]' />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Бөөн тоо</Label>
            <Input
              type='number'
              defaultValue={0}
              min={0}
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Бөөн үнэ</Label>
            <Input
              type='number'
              defaultValue={0}
              min={0}
              className='border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>
              Бусад / Тэмдэглэл
            </Label>
            <Textarea
              placeholder='Тэмдэглэл...'
              className='min-h-[80px] border-[#e2e5ea]'
            />
          </div>
          <div>
            <Label className='text-xs text-[#5a6577]'>Зураг</Label>
            <div className='flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-[#e2e5ea] bg-[#f8f9fb] transition-colors hover:border-[#C9A84C]/50'>
              <div className='flex flex-col items-center gap-1 text-[#9ba3b0]'>
                <Upload className='h-6 w-6' />
                <span className='text-xs'>Зураг оруулах</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className='mt-6 flex justify-end gap-3'>
        <Button
          variant='outline'
          onClick={onClose}
          className='border-[#e2e5ea] text-[#5a6577]'
        >
          Буцах
        </Button>
        <Button className='bg-[#C9A84C] text-white hover:bg-[#b8973e]'>
          Хадгалах
        </Button>
      </div>
    </div>
  )
}
