'use client'

import { useState, useEffect } from 'react'
import { Package, Search, RotateCcw, Trash2, MoreHorizontal, AlertCircle, Calendar, Filter } from 'lucide-react'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Product, Sale, Warehouse, Category } from '@/lib/types'

export function Archive() {
  const [activeTab, setActiveTab] = useState('products')
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([])
  const [archivedSales, setArchivedSales] = useState<Sale[]>([])
  const [archivedWarehouses, setArchivedWarehouses] = useState<Warehouse[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          archivedProductsData, 
          archivedSalesData, 
          archivedWarehousesData,
          categoriesData,
          warehousesData,
          allProductsData
        ] = await Promise.all([
          fetch('/api/products/archive').then(res => res.json()),
          fetch('/api/sales/archive').then(res => res.json()),
          fetch('/api/warehouses/archive').then(res => res.json()),
          fetch('/api/categories').then(res => res.json()),
          fetch('/api/warehouses').then(res => res.json()),
          fetch('/api/products?includeArchived=true').then(res => res.json())
        ])
        
        setArchivedProducts(archivedProductsData)
        setArchivedSales(archivedSalesData)
        setArchivedWarehouses(archivedWarehousesData)
        setCategories(categoriesData)
        setWarehouses(warehousesData)
        setAllProducts(allProductsData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load archive data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredArchivedProducts = archivedProducts
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory
      const matchesWarehouse = selectedWarehouse === 'all' || p.warehouseId === selectedWarehouse
      return matchesSearch && matchesCategory && matchesWarehouse
    })

  const filteredArchivedSales = archivedSales
    .filter(s => {
      const product = allProducts.find(p => p.id === s.productId)
      return product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
             s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
    })

  const filteredArchivedWarehouses = archivedWarehouses
    .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()) || w.code.toLowerCase().includes(searchTerm.toLowerCase()))

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown'
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Unknown'
  const getProductName = (id: string) => allProducts.find(p => p.id === id)?.name || 'Unknown'

  const handleRestoreProduct = async (id: string) => {
    try {
      const response = await fetch('/api/products/unarchive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to restore product')
      }
      
      // Refresh archived products
      const updatedArchivedProducts = await fetch('/api/products/archive').then(res => res.json())
      setArchivedProducts(updatedArchivedProducts)
      
      toast({
        title: "Success",
        description: "Product restored successfully",
      })
    } catch (error) {
      console.error('Error restoring product:', error)
      toast({
        title: "Error",
        description: "Failed to restore product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProductPermanently = async (id: string) => {
    if (confirm('Permanently delete this product? This cannot be undone.')) {
      try {
        const response = await fetch('/api/products/delete-permanent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete product permanently')
        }
        
        // Refresh archived products
        const updatedArchivedProducts = await fetch('/api/products/archive').then(res => res.json())
        setArchivedProducts(updatedArchivedProducts)
        
        toast({
          title: "Success",
          description: "Product deleted permanently",
        })
      } catch (error) {
        console.error('Error deleting product:', error)
        toast({
          title: "Error",
          description: "Failed to delete product permanently",
          variant: "destructive",
        })
      }
    }
  }

  const handleRestoreSale = async (id: string) => {
    try {
      const response = await fetch('/api/sales/unarchive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to restore sale')
      }
      
      // Refresh archived sales
      const updatedArchivedSales = await fetch('/api/sales/archive').then(res => res.json())
      setArchivedSales(updatedArchivedSales)
      
      toast({
        title: "Success",
        description: "Sale restored successfully",
      })
    } catch (error) {
      console.error('Error restoring sale:', error)
      toast({
        title: "Error",
        description: "Failed to restore sale",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSalePermanently = async (id: string) => {
    if (confirm('Permanently delete this sale? This cannot be undone.')) {
      try {
        const response = await fetch('/api/sales/delete-permanent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete sale permanently')
        }
        
        // Refresh archived sales
        const updatedArchivedSales = await fetch('/api/sales/archive').then(res => res.json())
        setArchivedSales(updatedArchivedSales)
        
        toast({
          title: "Success",
          description: "Sale deleted permanently",
        })
      } catch (error) {
        console.error('Error deleting sale:', error)
        toast({
          title: "Error",
          description: "Failed to delete sale permanently",
          variant: "destructive",
        })
      }
    }
  }

  const handleRestoreWarehouse = async (id: string) => {
    try {
      const response = await fetch('/api/warehouses/unarchive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to restore warehouse')
      }
      
      // Refresh archived warehouses
      const updatedArchivedWarehouses = await fetch('/api/warehouses/archive').then(res => res.json())
      setArchivedWarehouses(updatedArchivedWarehouses)
      
      toast({
        title: "Success",
        description: "Warehouse restored successfully",
      })
    } catch (error) {
      console.error('Error restoring warehouse:', error)
      toast({
        title: "Error",
        description: "Failed to restore warehouse",
        variant: "destructive",
      })
    }
  }

  const handleDeleteWarehousePermanently = async (id: string) => {
    if (confirm('Permanently delete this warehouse? This cannot be undone.')) {
      try {
        const response = await fetch('/api/warehouses/delete-permanent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete warehouse permanently')
        }
        
        // Refresh archived warehouses
        const updatedArchivedWarehouses = await fetch('/api/warehouses/archive').then(res => res.json())
        setArchivedWarehouses(updatedArchivedWarehouses)
        
        toast({
          title: "Success",
          description: "Warehouse deleted permanently",
        })
      } catch (error) {
        console.error('Error deleting warehouse:', error)
        toast({
          title: "Error",
          description: "Failed to delete warehouse permanently",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return <div className="p-6">Loading archive data...</div>
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Archive</h1>
        <p className="text-muted-foreground">Recover archived items or permanently delete them</p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative md:col-span-2 lg:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search archived items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
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
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map(wh => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b">
          <TabsList className="border-0 rounded-none bg-transparent">
            <TabsTrigger value="products" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Products ({filteredArchivedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Sales ({filteredArchivedSales.length})
            </TabsTrigger>
            <TabsTrigger value="warehouses" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Warehouses ({filteredArchivedWarehouses.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">SL</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArchivedProducts.length > 0 ? (
                      filteredArchivedProducts.map((product, idx) => {
                        const totalValue = product.quantity * product.retailPrice
                        return (
                          <TableRow key={product.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium text-sm">{idx + 1}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{getCategoryName(product.categoryId)}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{product.quantity}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">${totalValue.toLocaleString()}</TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">{product.date}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    className="text-blue-600 cursor-pointer"
                                    onClick={() => handleRestoreProduct(product.id)}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive cursor-pointer"
                                    onClick={() => handleDeleteProductPermanently(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Forever
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No archived products</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Invoice</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead className="w-12">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArchivedSales.length > 0 ? (
                      filteredArchivedSales.map((sale) => (
                        <TableRow key={sale.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm font-semibold">{sale.invoiceNo}</TableCell>
                          <TableCell className="text-sm">{getProductName(sale.productId)}</TableCell>
                          <TableCell className="text-sm">{sale.customer}</TableCell>
                          <TableCell className="text-right">{sale.quantity}</TableCell>
                          <TableCell className="text-right font-semibold">${sale.totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{sale.date}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  className="text-blue-600 cursor-pointer"
                                  onClick={() => handleRestoreSale(sale.id)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive cursor-pointer"
                                  onClick={() => handleDeleteSalePermanently(sale.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Forever
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No archived sales</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredArchivedWarehouses.length > 0 ? (
              filteredArchivedWarehouses.map((warehouse) => (
                <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-base">{warehouse.name}</p>
                        <Badge variant="outline" className="mt-2">{warehouse.code}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-blue-600 cursor-pointer"
                            onClick={() => handleRestoreWarehouse(warehouse.id)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive cursor-pointer"
                            onClick={() => handleDeleteWarehousePermanently(warehouse.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Forever
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">{warehouse.location}</p>
                      <p className="text-muted-foreground">Manager: {warehouse.manager}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No archived warehouses</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}