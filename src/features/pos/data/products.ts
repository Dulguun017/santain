export type Product = {
  barcode: string
  name: string
  price: number
  category: string
  unit: string
  supplier: string
  qty: number
  unitCost: number
  avgCost: number
  totalCost: number
  totalValue: number
  dateAdded: string
}

export const sampleProducts: Product[] = [
  {
    barcode: '2537',
    name: 'Бөгж К271; раз-22, 22.5 3.65гр',
    price: 2190000,
    category: 'Орос монет',
    unit: 'ширхэг',
    supplier: 'Нийлүүлэгч 1',
    qty: 1,
    unitCost: 1133325,
    avgCost: 1133325,
    totalCost: 1133325,
    totalValue: 2190000,
    dateAdded: '2025-01-15',
  },
  {
    barcode: '2211',
    name: 'Бөгж к2282; раз-20, 3.45гр',
    price: 1725000,
    category: 'Орос монет',
    unit: 'ширхэг',
    supplier: 'Нийлүүлэгч 1',
    qty: 1,
    unitCost: 900450,
    avgCost: 900450,
    totalCost: 900450,
    totalValue: 1725000,
    dateAdded: '2025-01-18',
  },
  {
    barcode: '3012',
    name: 'Эзмэг К585; 5.2гр',
    price: 3120000,
    category: 'Эзмэг',
    unit: 'ширхэг',
    supplier: 'Нийлүүлэгч 2',
    qty: 2,
    unitCost: 1560000,
    avgCost: 1560000,
    totalCost: 3120000,
    totalValue: 6240000,
    dateAdded: '2025-02-01',
  },
  {
    barcode: '1845',
    name: 'Хослол К750; 8.1гр',
    price: 5670000,
    category: 'Хослол',
    unit: 'ширхэг',
    supplier: 'Нийлүүлэгч 1',
    qty: 1,
    unitCost: 2940000,
    avgCost: 2940000,
    totalCost: 2940000,
    totalValue: 5670000,
    dateAdded: '2025-02-10',
  },
  {
    barcode: '4201',
    name: 'Бугуйвч К585; 12.3гр',
    price: 7380000,
    category: 'Бугуйвч',
    unit: 'ширхэг',
    supplier: 'Нийлүүлэгч 3',
    qty: 1,
    unitCost: 3810000,
    avgCost: 3810000,
    totalCost: 3810000,
    totalValue: 7380000,
    dateAdded: '2025-02-14',
  },
  {
    barcode: '2890',
    name: 'Зүүлт К375; 1.8гр',
    price: 810000,
    category: 'Зүүлт',
    unit: 'ширхэг',
    supplier: 'Нийлүүлэгч 2',
    qty: 3,
    unitCost: 405000,
    avgCost: 405000,
    totalCost: 1215000,
    totalValue: 2430000,
    dateAdded: '2025-03-01',
  },
]
