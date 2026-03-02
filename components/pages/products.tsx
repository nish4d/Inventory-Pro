'use client'

import { useState, useEffect } from 'react'
import { 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  TrendingUp, 
  Archive, 
  Plus, 
  Search, 
  Filter,
  AlertTriangle,
  Download,
  Package,
  ArrowLeft
} from 'lucide-react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AddProductForm } from '@/components/forms/add-product-form'
import { useToast } from '@/hooks/use-toast'
import { Product, Category, Warehouse, Sale } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [lowStockItems, setLowStockItems] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Edit state
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  
  // View states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetailsPage, setShowProductDetailsPage] = useState(false)
  const [showProductHistoryPage, setShowProductHistoryPage] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productsData, categoriesData, warehousesData, lowStockData, salesData] = await Promise.all([
          fetch('/api/products').then(res => res.json()),
          fetch('/api/categories').then(res => res.json()),
          fetch('/api/warehouses').then(res => res.json()),
          fetch('/api/products/low-stock').then(res => res.json()),
          fetch('/api/sales').then(res => res.json())
        ])

        setProducts(productsData)
        setCategories(categoriesData)
        setWarehouses(warehousesData)
        setLowStockItems(lowStockData)
        setSales(salesData)
        
        // Always show a test notification to verify the system is working
        toast({
          title: "System Loaded",
          description: "Products page loaded successfully",
        })
        
        // Check for low stock alerts
        try {
          const alertResponse = await fetch('/api/alerts')
          if (alertResponse.ok) {
            const alerts = await alertResponse.json()
            if (alerts.length > 0) {
              toast({
                title: "Low Stock Alert",
                description: `You have ${alerts.length} items that need restocking`,
                variant: "destructive",
              })
            }
          } else {
            console.warn('Failed to fetch alerts:', alertResponse.status)
          }
        } catch (alertError) {
          console.error('Error checking for alerts:', alertError)
          // Don't show an error toast for this since it's just an alert check
        }
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load products data",
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
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory
      const matchesWarehouse = selectedWarehouse === 'all' || p.warehouseId === selectedWarehouse
      const matchesLowStock = !showLowStockOnly || p.quantity < p.reorderLevel

      return matchesSearch && matchesCategory && matchesWarehouse && matchesLowStock
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

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown'
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Unknown'
  const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0)
  const totalRetailValue = products.reduce((sum, p) => sum + (p.quantity * p.retailPrice), 0)

  const handleEditComplete = async () => {
    try {
      const [updatedProducts, updatedLowStock] = await Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/products/low-stock').then(res => res.json())
      ])
      setProducts(updatedProducts)
      setLowStockItems(updatedLowStock)
      setProductToEdit(null)
      
      // Dispatch notification update event
      window.dispatchEvent(new CustomEvent('notificationUpdate'))
      
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
    } catch (error) {
      console.error('Error refreshing products:', error)
      toast({
        title: "Error",
        description: "Failed to refresh products",
        variant: "destructive",
      })
    }
  }

  const handleProductAdded = async () => {
    try {
      const [updatedProducts, updatedLowStock] = await Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/products/low-stock').then(res => res.json())
      ])
      setProducts(updatedProducts)
      setLowStockItems(updatedLowStock)
      
      // Dispatch notification update event
      window.dispatchEvent(new CustomEvent('notificationUpdate'))
      
      toast({
        title: "Success",
        description: "Product added successfully",
      })
    } catch (error) {
      console.error('Error refreshing products:', error)
      toast({
        title: "Error",
        description: "Failed to refresh products",
        variant: "destructive",
      })
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/products/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to archive product')
      }
      
      // Refresh products data
      const [updatedProducts, updatedLowStock] = await Promise.all([
        fetch('/api/products').then(res => res.json()),
        fetch('/api/products/low-stock').then(res => res.json())
      ])
      setProducts(updatedProducts)
      setLowStockItems(updatedLowStock)
      
      // Dispatch notification update event
      window.dispatchEvent(new CustomEvent('notificationUpdate'))
      
      toast({
        title: "Success",
        description: "Product archived successfully",
      })
    } catch (error) {
      console.error('Error archiving product:', error)
      toast({
        title: "Error",
        description: "Failed to archive product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product)
  }

  // Add effect to listen for edit product close event
  useEffect(() => {
    const handleEditProductClosed = () => {
      setProductToEdit(null)
    }
    
    window.addEventListener('editProductClosed', handleEditProductClosed)
    
    return () => {
      window.removeEventListener('editProductClosed', handleEditProductClosed)
    }
  }, [])

  // Add effect to listen for notification updates (e.g., when sales are recorded)
  useEffect(() => {
    const handleNotificationUpdate = async () => {
      try {
        const [updatedProducts, updatedLowStock, updatedSales] = await Promise.all([
          fetch('/api/products').then(res => res.json()),
          fetch('/api/products/low-stock').then(res => res.json()),
          fetch('/api/sales').then(res => res.json())
        ])
        setProducts(updatedProducts)
        setLowStockItems(updatedLowStock)
        setSales(updatedSales)
      } catch (error) {
        console.error('Error refreshing products:', error)
      }
    }
    
    window.addEventListener('notificationUpdate', handleNotificationUpdate)
    
    return () => {
      window.removeEventListener('notificationUpdate', handleNotificationUpdate)
    }
  }, [])

  // Function to show product details on page
  const handleViewDetailsPage = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetailsPage(true)
  }

  // Function to show product history on page
  const handleViewHistoryPage = (product: Product) => {
    setSelectedProduct(product)
    setShowProductHistoryPage(true)
  }

  // Function to go back to product list
  const handleBackToProducts = () => {
    setShowProductDetailsPage(false)
    setShowProductHistoryPage(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return <div className="p-6">Loading products...</div>
  }

  // Render product details page when showProductDetailsPage is true
  if (showProductDetailsPage && selectedProduct) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToProducts}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold">Product Details</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{selectedProduct.name}</CardTitle>
            <p className="text-muted-foreground">Detailed information</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Product Name</h4>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">SKU</h4>
                  <p className="font-medium">{selectedProduct.sku}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Category</h4>
                  <p className="font-medium">{getCategoryName(selectedProduct.categoryId)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Warehouse</h4>
                  <p className="font-medium">{getWarehouseName(selectedProduct.warehouseId)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Unit</h4>
                  <p className="font-medium">{selectedProduct.unit}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Date Added</h4>
                  <p className="font-medium">{selectedProduct.date}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Purchase Price</h4>
                    <p className="text-2xl font-bold text-green-600">${selectedProduct.purchasePrice.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Wholesale Price</h4>
                    <p className="text-2xl font-bold text-blue-600">${selectedProduct.wholesalePrice.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Retail Price</h4>
                    <p className="text-2xl font-bold text-purple-600">${selectedProduct.retailPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Current Stock</h4>
                    <p className="text-2xl font-bold">{selectedProduct.quantity} {selectedProduct.unit}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Reorder Level</h4>
                    <p className="text-2xl font-bold">{selectedProduct.reorderLevel} {selectedProduct.unit}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Status</h4>
                    <Badge variant={selectedProduct.quantity < selectedProduct.reorderLevel ? "destructive" : "secondary"}>
                      {selectedProduct.quantity < selectedProduct.reorderLevel ? "Low Stock" : "In Stock"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {selectedProduct.barcode && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Barcode</h3>
                  <p className="font-mono text-lg">{selectedProduct.barcode}</p>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Total Cost Value</h4>
                    <p className="text-2xl font-bold">${(selectedProduct.quantity * selectedProduct.purchasePrice).toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Total Retail Value</h4>
                    <p className="text-2xl font-bold">${(selectedProduct.quantity * selectedProduct.retailPrice).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render product history page when showProductHistoryPage is true
  if (showProductHistoryPage && selectedProduct) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToProducts}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <h1 className="text-3xl font-bold">Product History</h1>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedProduct.name}</CardTitle>
              <p className="text-muted-foreground">Sales history and inventory movements</p>
            </CardHeader>
            <CardContent>
              <div className="py-4 space-y-6">
                {/* Product Information Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Original Data</CardTitle>
                      <p className="text-sm text-muted-foreground">When product was added</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{selectedProduct.quantity + selectedProduct.unitsSold}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Cost Value:</span>
                        <span className="font-medium">
                          ${((selectedProduct.quantity + selectedProduct.unitsSold) * selectedProduct.purchasePrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Units Sold:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cost of Goods Sold:</span>
                        <span className="font-medium">$0.00</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Data</CardTitle>
                      <p className="text-sm text-muted-foreground">After sales and movements</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span className="font-medium">{selectedProduct.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Cost Value:</span>
                        <span className="font-medium">
                          ${(selectedProduct.quantity * selectedProduct.purchasePrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Units Sold:</span>
                        <span className="font-medium">{selectedProduct.unitsSold}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cost of Goods Sold:</span>
                        <span className="font-medium">${selectedProduct.costOfGoodsSold.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Inventory Movement</h4>
                    <p className="text-2xl font-bold">
                      {selectedProduct.unitsSold > 0 ? `-${selectedProduct.unitsSold}` : '0'}
                    </p>
                    <p className="text-sm text-muted-foreground">Units sold</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Revenue Generated</h4>
                    <p className="text-2xl font-bold text-green-600">
                      ${(selectedProduct.unitsSold * selectedProduct.retailPrice).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Potential retail sales</p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Profit</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      ${((selectedProduct.unitsSold * selectedProduct.retailPrice) - selectedProduct.costOfGoodsSold).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Gross profit</p>
                  </div>
                </div>
                
                {/* Sales History Table */}
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Sales History</h3>
                  {sales.filter((s: Sale) => s.productId === selectedProduct.id).length > 0 ? (
                    <div className="rounded-lg border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Invoice No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sales
                            .filter((s: Sale) => s.productId === selectedProduct.id)
                            .map((sale: Sale) => (
                              <TableRow key={sale.id}>
                                <TableCell className="font-mono text-sm">{sale.invoiceNo}</TableCell>
                                <TableCell className="text-sm">
                                  {new Date(sale.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>{sale.customer}</TableCell>
                                <TableCell className="text-right">{sale.quantity}</TableCell>
                                <TableCell className="text-right">${sale.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ${sale.totalAmount.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No sales recorded for this product</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products Inventory</h1>
          <p className="text-muted-foreground">Mobile Accessories Management ({filteredProducts.length} active)</p>
        </div>
        <AddProductForm onProductAdded={handleProductAdded} />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Inventory Value</p>
            <p className="text-2xl font-bold mt-2">${(totalInventoryValue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground mt-1">{products.length} SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Retail Value</p>
            <p className="text-2xl font-bold mt-2">${(totalRetailValue / 1000).toFixed(1)}K</p>
            <p className="text-xs text-green-600 mt-1">↑ ${((totalRetailValue - totalInventoryValue) / 1000).toFixed(1)}K potential margin</p>
          </CardContent>
        </Card>
        <Card className={lowStockItems.length > 0 ? 'border-yellow-500/30 bg-yellow-500/5' : ''}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <p className="text-2xl font-bold mt-2">{lowStockItems.length}</p>
            <p className="text-xs text-yellow-600 mt-1">⚠️ {lowStockItems.length} need restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
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

            <Button 
              variant={showLowStockOnly ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </Button>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">SL No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Buy Price</TableHead>
                  <TableHead className="text-right">Wholesale</TableHead>
                  <TableHead className="text-right">Retail</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, idx) => {
                  const totalCost = product.quantity * product.purchasePrice
                  const isLowStock = product.quantity < product.reorderLevel

                  return (
                    <TableRow key={product.id} className={isLowStock ? 'bg-yellow-500/5 hover:bg-yellow-500/10' : 'hover:bg-muted/50'}>
                      <TableCell className="font-medium text-sm">{idx + 1}</TableCell>
                      <TableCell className="text-sm">{product.date}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{getCategoryName(product.categoryId)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{getWarehouseName(product.warehouseId)}</TableCell>
                      <TableCell className="text-sm">{product.unit}</TableCell>
                      <TableCell className="text-right text-sm">${product.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm">${product.wholesalePrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-sm">${product.retailPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
                          {product.quantity}
                          {isLowStock && ' ⚠️'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">${totalCost.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetailsPage(product)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistoryPage(product)}>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-orange-600"
                              onClick={() => handleArchive(product.id)}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold">No products found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {productToEdit && (
        <AddProductForm 
          productToEdit={productToEdit}
          onEditComplete={handleEditComplete}
        />
      )}
    </div>
  )
}