'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Download, Eye, Pencil, Trash2, MoreHorizontal, Search, Filter, Archive, Calendar, TrendingUp, ArrowLeft, FileText } from 'lucide-react'
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
import { AddSaleForm } from '@/components/forms/add-sale-form'
import { Sale, Product, Warehouse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [selectedWarehouse, setSelectedWarehouse] = useState('all')
  const [saleType, setSaleType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // View state
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showSaleDetailsPage, setShowSaleDetailsPage] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesData, productsData, warehousesData] = await Promise.all([
          fetch('/api/sales').then(res => res.json()),
          fetch('/api/products').then(res => res.json()),
          fetch('/api/warehouses').then(res => res.json())
        ])
        setSales(salesData)
        setProducts(productsData)
        setWarehouses(warehousesData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load sales data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredSales = sales
    .filter(s => {
      const product = products.find(p => p.id === s.productId)
      const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesProduct = selectedProduct === 'all' || s.productId === selectedProduct
      const matchesWarehouse = selectedWarehouse === 'all' || s.warehouseId === selectedWarehouse
      const matchesSaleType = saleType === 'all' || s.saleType === saleType

      return matchesSearch && matchesProduct && matchesWarehouse && matchesSaleType
    })
    .sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a]
      let bVal = b[sortBy as keyof typeof b]
      
      // Handle date sorting specially
      if (sortBy === 'date') {
        const aDate = new Date(a.date).getTime()
        const bDate = new Date(b.date).getTime()
        aVal = aDate as any
        bVal = bDate as any
      }
      
      // Handle undefined values
      if (aVal === undefined && bVal === undefined) return 0
      if (aVal === undefined) return sortOrder === 'asc' ? -1 : 1
      if (bVal === undefined) return sortOrder === 'asc' ? 1 : -1
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      }
      return aVal < bVal ? 1 : -1
    })

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown'
  const getWarehouseName = (id: string) => warehouses.find(w => w.id === id)?.name || 'Unknown'
  const getProductInfo = (id: string) => products.find(p => p.id === id) || null
  const totalSales = sales.filter(s => !s.isArchived).reduce((sum, s) => sum + s.totalAmount, 0)
  const totalTransactions = sales.filter(s => !s.isArchived).length

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/sales/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to archive sale')
      }
      
      // Refresh sales data
      const updatedSales = await fetch('/api/sales').then(res => res.json())
      setSales(updatedSales)
      
      toast({
        title: "Success",
        description: "Sale archived successfully",
      })
    } catch (error) {
      console.error('Error archiving sale:', error)
      toast({
        title: "Error",
        description: "Failed to archive sale",
        variant: "destructive",
      })
    }
  }

  const handleSaleAdded = async () => {
    try {
      const updatedSales = await fetch('/api/sales').then(res => res.json())
      setSales(updatedSales)
      
      // Also refresh products data to reflect updated quantities
      try {
        const updatedProducts = await fetch('/api/products').then(res => res.json())
        // Dispatch notification update event to refresh products in other components
        window.dispatchEvent(new CustomEvent('notificationUpdate'))
      } catch (error) {
        console.error('Error refreshing products:', error)
      }
    } catch (error) {
      console.error('Error refreshing sales:', error)
      toast({
        title: "Error",
        description: "Failed to refresh sales",
        variant: "destructive",
      })
    }
  }

  // Function to show sale details on page
  const handleViewDetailsPage = (sale: Sale) => {
    setSelectedSale(sale)
    setShowSaleDetailsPage(true)
  }

  // Function to generate and download PDF invoice
  const handleGenerateInvoice = async (sale: Sale) => {
    try {
      const response = await fetch('/api/sales/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saleId: sale.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }

      const invoiceData = await response.json()
      
      // Dynamically import jsPDF to avoid server-side issues
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      // Create PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Company header with professional design (0-45mm)
      // Dark blue background
      doc.setFillColor(25, 118, 210); // Professional blue
      doc.rect(0, 0, 210, 45, 'F');
      
      // Company logo area (simulated with text)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(invoiceData.company.name, 20, 18);
      
      // Company contact info
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceData.company.address, 20, 26);
      doc.text(invoiceData.company.city, 20, 32);
      doc.text(`Phone: ${invoiceData.company.phone}`, 20, 38);
      doc.text(`Email: ${invoiceData.company.email}`, 20, 44);
      
      // Invoice title and number (50-70mm)
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 150, 55);
      
      // Invoice number badge
      doc.setFillColor(25, 118, 210);
      doc.roundedRect(140, 60, 50, 12, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(`#${sale.invoiceNo}`, 165, 68, { align: 'center' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Bill to and Invoice details section (75-105mm)
      doc.setFontSize(10);
      
      // Bill To section
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('BILL TO', 20, 80);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(sale.customer, 20, 87);
      
      // Invoice details
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('INVOICE DATE', 130, 80);
      doc.text('PAYMENT STATUS', 130, 90);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(sale.date).toLocaleDateString(), 165, 80);
      doc.text(sale.paymentStatus || 'N/A', 165, 90);
      
      // Items table header (110-120mm)
      doc.setFillColor(245, 245, 245); // Light gray background
      doc.rect(15, 110, 180, 10, 'F');
      doc.setTextColor(25, 118, 210);
      doc.setFont('helvetica', 'bold');
      doc.text('ITEM', 20, 117);
      doc.text('QTY', 110, 117);
      doc.text('UNIT PRICE', 135, 117);
      doc.text('TOTAL', 180, 117, { align: 'right' });
      
      // Items table content (120-135mm)
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setDrawColor(220, 220, 220);
      doc.line(15, 120, 195, 120);
      doc.line(15, 135, 195, 135);
      
      const product = invoiceData.product;
      doc.text(product ? product.name : 'N/A', 20, 130);
      doc.text(sale.quantity.toString(), 110, 130);
      doc.text(`$${sale.unitPrice.toFixed(2)}`, 135, 130);
      doc.text(`$${sale.totalAmount.toFixed(2)}`, 185, 130, { align: 'right' });
      
      // Payment method section (140-150mm)
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(25, 118, 210);
      doc.text('PAYMENT METHOD', 20, 145);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(sale.paymentMethod || 'N/A', 20, 152);
      
      // Summary section (155-180mm)
      doc.setFillColor(245, 245, 245);
      doc.rect(130, 155, 65, 25, 'F');
      
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', 135, 165);
      doc.text(`$${sale.totalAmount.toFixed(2)}`, 185, 165, { align: 'right' });
      
      doc.text('Tax (0%):', 135, 172);
      doc.text('$0.00', 185, 172, { align: 'right' });
      
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL:', 135, 179);
      doc.text(`$${sale.totalAmount.toFixed(2)}`, 185, 179, { align: 'right' });
      
      // Notes section (185-200mm)
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your business!', 20, 190);
      
      // Footer with border (205-230mm)
      doc.setDrawColor(220, 220, 220);
      doc.line(15, 205, 195, 205);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text('This invoice was generated by InventoryPro', 105, 215, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 105, 220, { align: 'center' });
      
      // Page number
      doc.text('Page 1 of 1', 180, 285);
      
      // Save the PDF with .pdf extension
      doc.save(`invoice-${sale.invoiceNo}.pdf`);
      
      toast({
        title: "Success",
        description: "Invoice generated and downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Function to go back to sales list
  const handleBackToSales = () => {
    setShowSaleDetailsPage(false)
    setSelectedSale(null)
  }

  if (loading) {
    return <div className="p-6">Loading sales...</div>
  }

  // Render sale details page when showSaleDetailsPage is true
  if (showSaleDetailsPage && selectedSale) {
    const product = getProductInfo(selectedSale.productId)
    
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToSales}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sales
          </Button>
          <h1 className="text-3xl font-bold">Sale Details</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <p className="text-muted-foreground">Detailed transaction information</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Invoice Number</h4>
                  <p className="font-mono font-medium text-lg">{selectedSale.invoiceNo}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Date & Time</h4>
                  <p className="font-medium">
                    {new Date(selectedSale.date).toLocaleDateString()} at {new Date(selectedSale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Product</h4>
                  <p className="font-medium">{getProductName(selectedSale.productId)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Customer</h4>
                  <p className="font-medium">{selectedSale.customer}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Warehouse</h4>
                  <p className="font-medium">{getWarehouseName(selectedSale.warehouseId)}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Sale Type</h4>
                  <Badge variant={selectedSale.saleType === 'wholesale' ? 'default' : 'secondary'}>
                    {selectedSale.saleType}
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Quantity</h4>
                    <p className="text-2xl font-bold">{selectedSale.quantity}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Unit Price</h4>
                    <p className="text-2xl font-bold">${selectedSale.unitPrice.toFixed(2)}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Total Amount</h4>
                    <p className="text-2xl font-bold">${selectedSale.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {product && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground">Current Stock</h4>
                      <p className="text-2xl font-bold">{product.quantity} {product.unit}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground">Purchase Price</h4>
                      <p className="text-2xl font-bold text-green-600">${product.purchasePrice.toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground">Wholesale Price</h4>
                      <p className="text-2xl font-bold text-blue-600">${product.wholesalePrice.toFixed(2)}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground">Retail Price</h4>
                      <p className="text-2xl font-bold text-purple-600">${product.retailPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Management</h1>
          <p className="text-muted-foreground">Track and manage your sales transactions</p>
        </div>
        <AddSaleForm onSaleAdded={handleSaleAdded} />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold mt-2">${totalSales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalTransactions} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Today's Sales</p>
            <p className="text-2xl font-bold mt-2">
              ${sales
                .filter(s => !s.isArchived && s.date.startsWith(new Date().toISOString().split('T')[0]))
                .reduce((sum, s) => sum + s.totalAmount, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {sales.filter(s => !s.isArchived && s.date.startsWith(new Date().toISOString().split('T')[0])).length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Retail Sales</p>
            <p className="text-2xl font-bold mt-2">
              ${sales
                .filter(s => !s.isArchived && s.saleType === 'retail')
                .reduce((sum, s) => sum + s.totalAmount, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {sales.filter(s => !s.isArchived && s.saleType === 'retail').length} transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Wholesale Sales</p>
            <p className="text-2xl font-bold mt-2">
              ${sales
                .filter(s => !s.isArchived && s.saleType === 'wholesale')
                .reduce((sum, s) => sum + s.totalAmount, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {sales.filter(s => !s.isArchived && s.saleType === 'wholesale').length} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, customer, invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map(prod => (
                  <SelectItem key={prod.id} value={prod.id}>
                    {prod.name}
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

            <Select value={saleType} onValueChange={setSaleType}>
              <SelectTrigger>
                <SelectValue placeholder="Sale Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Sale Type</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm font-semibold">{sale.invoiceNo}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(sale.date).toLocaleDateString()}<br />
                      <span className="text-xs text-muted-foreground">
                        {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{getProductName(sale.productId)}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{getWarehouseName(sale.warehouseId)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.saleType === 'wholesale' ? 'default' : 'secondary'}>
                        {sale.saleType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right">${sale.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">${sale.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetailsPage(sale)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateInvoice(sale)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Inv Generate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-orange-600"
                            onClick={() => handleArchive(sale.id)}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archive Sale
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSales.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold">No sales found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}