'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Eye, Filter, Package, ShoppingCart, Calculator, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Product, Category, Warehouse, Sale } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PriceList() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData, warehousesData, salesData] = await Promise.all([
          fetch('/api/products').then(res => res.json()),
          fetch('/api/categories').then(res => res.json()),
          fetch('/api/warehouses').then(res => res.json()),
          fetch('/api/sales').then(res => res.json())
        ])
        setProducts(productsData)
        setCategories(categoriesData)
        setWarehouses(warehousesData)
        setSales(salesData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load price list data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory
      const matchesWarehouse = selectedWarehouse === 'all' || p.warehouseId === selectedWarehouse

      return matchesSearch && matchesCategory && matchesWarehouse && !p.isArchived
    })
    .sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a]
      let bVal = b[sortBy as keyof typeof b]
      
      // Handle undefined values
      if (aVal === undefined && bVal === undefined) return 0
      if (aVal === undefined) return sortOrder === 'asc' ? -1 : 1
      if (bVal === undefined) return sortOrder === 'asc' ? 1 : -1
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

  // Filter sales for the selected products
  const filteredSales = sales.filter(sale => {
    return filteredProducts.some(product => product.id === sale.productId)
  })

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown'
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Unknown'
  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown'

  // Calculate product-based pricing data
  const productPricingData = filteredProducts.map(product => {
    const totalCost = product.quantity * product.purchasePrice
    const totalWholesale = product.quantity * product.wholesalePrice
    const totalRetail = product.quantity * product.retailPrice
    const wholesaleProfit = totalWholesale - totalCost
    const retailProfit = totalRetail - totalCost
    const marginPercent = totalRetail > 0 ? ((totalRetail - totalCost) / totalRetail) * 100 : 0

    return {
      ...product,
      totalCost,
      totalWholesale,
      totalRetail,
      wholesaleProfit,
      retailProfit,
      marginPercent
    }
  })

  // Calculate sales-based pricing data
  const salesPricingData = filteredSales.map(sale => {
    const product = products.find(p => p.id === sale.productId)
    if (!product) return null

    const totalSaleAmount = sale.totalAmount
    const costOfGoodsSold = sale.quantity * product.purchasePrice
    const grossProfit = totalSaleAmount - costOfGoodsSold
    const profitMargin = totalSaleAmount > 0 ? (grossProfit / totalSaleAmount) * 100 : 0

    return {
      ...sale,
      productName: product.name,
      costOfGoodsSold,
      grossProfit,
      profitMargin
    }
  }).filter(Boolean) as (Sale & { productName: string; costOfGoodsSold: number; grossProfit: number; profitMargin: number })[]

  // Calculate final price list with combined data
  const finalPriceList = productPricingData.map(product => {
    // Find related sales for this product
    const relatedSales = salesPricingData.filter(sale => sale.productId === product.id)
    
    // Calculate total sales for this product
    const totalSalesQuantity = relatedSales.reduce((sum, sale) => sum + sale.quantity, 0)
    const totalSalesAmount = relatedSales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalCostOfGoodsSold = relatedSales.reduce((sum, sale) => sum + sale.costOfGoodsSold, 0)
    const totalGrossProfit = relatedSales.reduce((sum, sale) => sum + sale.grossProfit, 0)
    
    // Calculate remaining inventory
    const remainingQuantity = product.quantity - totalSalesQuantity
    const remainingCostValue = remainingQuantity * product.purchasePrice
    const remainingRetailValue = remainingQuantity * product.retailPrice
    
    // Calculate overall metrics
    const overallProfitMargin = totalSalesAmount > 0 ? (totalGrossProfit / totalSalesAmount) * 100 : 0

    return {
      ...product,
      totalSalesQuantity,
      totalSalesAmount,
      totalCostOfGoodsSold,
      totalGrossProfit,
      remainingQuantity,
      remainingCostValue,
      remainingRetailValue,
      overallProfitMargin
    }
  })

  if (loading) {
    return <div className="p-6">Loading price list...</div>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Price List & Analytics</h1>
        <p className="text-muted-foreground">Comprehensive pricing analysis with product and sales data</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name, SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger>
                <SelectValue placeholder="Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {warehouses.map(wh => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="final" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Product Pricing
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Sales Analysis
          </TabsTrigger>
          <TabsTrigger value="final" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Final Price List
          </TabsTrigger>
        </TabsList>

        {/* Product Pricing Section */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Pricing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-right">Total Wholesale</TableHead>
                      <TableHead className="text-right">Total Retail</TableHead>
                      <TableHead className="text-right">W/S Profit</TableHead>
                      <TableHead className="text-right">Retail Profit</TableHead>
                      <TableHead className="text-right">Margin %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPricingData.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{getCategoryName(product.categoryId)}</Badge>
                        </TableCell>
                        <TableCell>{getWarehouseName(product.warehouseId)}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">${product.totalCost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${product.totalWholesale.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${product.totalRetail.toFixed(2)}</TableCell>
                        <TableCell className={`text-right ${product.wholesaleProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${product.wholesaleProfit.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right ${product.retailProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${product.retailProfit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{product.marginPercent.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {productPricingData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-semibold">No products found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Analysis Section */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Sales Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Sale Amount</TableHead>
                      <TableHead className="text-right">COGS</TableHead>
                      <TableHead className="text-right">Gross Profit</TableHead>
                      <TableHead className="text-right">Profit Margin</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesPricingData.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-semibold">{sale.invoiceNo}</TableCell>
                        <TableCell>{sale.productName}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell className="text-right">{sale.quantity}</TableCell>
                        <TableCell className="text-right">${sale.totalAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${sale.costOfGoodsSold.toFixed(2)}</TableCell>
                        <TableCell className={`text-right ${sale.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${sale.grossProfit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{sale.profitMargin.toFixed(1)}%</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {salesPricingData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-semibold">No sales data found</h3>
                  <p className="text-sm text-muted-foreground">No sales recorded for the selected products</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Final Price List Section */}
        <TabsContent value="final">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Final Price List & Inventory Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Sold Qty</TableHead>
                      <TableHead className="text-right">Remaining Qty</TableHead>
                      <TableHead className="text-right">Total Sales</TableHead>
                      <TableHead className="text-right">COGS</TableHead>
                      <TableHead className="text-right">Gross Profit</TableHead>
                      <TableHead className="text-right">Profit Margin</TableHead>
                      <TableHead className="text-right">Remaining Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {finalPriceList.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right">{product.totalSalesQuantity}</TableCell>
                        <TableCell className="text-right">{product.remainingQuantity}</TableCell>
                        <TableCell className="text-right">${product.totalSalesAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${product.totalCostOfGoodsSold.toFixed(2)}</TableCell>
                        <TableCell className={`text-right ${product.totalGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${product.totalGrossProfit.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{product.overallProfitMargin.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">${product.remainingRetailValue.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {finalPriceList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-semibold">No pricing data found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}