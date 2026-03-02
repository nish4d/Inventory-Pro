export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface Warehouse {
  id: string
  name: string
  code: string
  location: string
  address: string
  manager: string
  phone: string
  email: string
  capacity: number
  used: number
  isArchived?: boolean
}

export interface Product {
  id: string
  name: string
  categoryId: string
  warehouseId: string
  sku: string
  barcode: string
  purchasePrice: number
  wholesalePrice: number
  retailPrice: number
  quantity: number
  unit: string
  date: string
  reorderLevel: number
  costOfGoodsSold: number
  unitsSold: number
  lastRestockDate: string
  isArchived?: boolean
}

// ... existing code ...

export interface Sale {
  id: string
  invoiceNo: string
  date: string
  productId: string
  customer: string
  saleType: 'wholesale' | 'retail'
  quantity: number
  unitPrice: number
  totalAmount: number
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'credit'
  paymentStatus: 'paid' | 'pending' | 'partial'
  warehouseId: string
  isArchived?: boolean
}

// ... existing code ...

export interface StockHistory {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  date: string
}

export interface LowStockAlert {
  id: string
  productId: string
  currentQty: number
  reorderLevel: number
  date: string
}

export interface ArchivedItem {
  id: string
  type: 'product' | 'sale' | 'warehouse'
  name: string
  date: string
  details: any
}

export interface Account {
  id: string
  name: string
  email: string
  password: string
  role: string
  createdAt: string
}
