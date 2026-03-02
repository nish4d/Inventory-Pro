'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Download, Eye, Pencil, Trash2, MoreHorizontal, Search, Filter, Archive, TrendingUp, AlertTriangle } from 'lucide-react'
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
import { AddWarehouseForm } from '@/components/forms/add-warehouse-form'
import { EditWarehouseForm } from '@/components/forms/edit-warehouse-form'
import { Warehouse, Product } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function Inventory() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // View states
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [showWarehouseDetails, setShowWarehouseDetails] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [warehousesData, productsData] = await Promise.all([
          fetch('/api/warehouses').then(res => res.json()),
          fetch('/api/products').then(res => res.json())
        ])
        setWarehouses(warehousesData)
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load inventory data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredWarehouses = warehouses
    .filter(w => {
      return w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getWarehouseProductCount = (warehouseId: string) => {
    return products.filter(p => p.warehouseId === warehouseId && !p.isArchived).length
  }

  const getWarehouseTotalValue = (warehouseId: string) => {
    return products
      .filter(p => p.warehouseId === warehouseId && !p.isArchived)
      .reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0)
  }
  
  // Function to show warehouse details
  const handleViewDetails = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setShowWarehouseDetails(true)
  }

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch('/api/warehouses/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to archive warehouse')
      }
      
      // Refresh warehouses data
      const updatedWarehouses = await fetch('/api/warehouses').then(res => res.json())
      setWarehouses(updatedWarehouses)
      
      toast({
        title: "Success",
        description: "Warehouse archived successfully",
      })
    } catch (error) {
      console.error('Error archiving warehouse:', error)
      toast({
        title: "Error",
        description: "Failed to archive warehouse",
        variant: "destructive",
      })
    }
  }

  const handleWarehouseAdded = async () => {
    try {
      const updatedWarehouses = await fetch('/api/warehouses').then(res => res.json())
      setWarehouses(updatedWarehouses)
    } catch (error) {
      console.error('Error refreshing warehouses:', error)
      toast({
        title: "Error",
        description: "Failed to refresh warehouses",
        variant: "destructive",
      })
    }
  }
  
  const handleWarehouseUpdated = async () => {
    try {
      const updatedWarehouses = await fetch('/api/warehouses').then(res => res.json())
      setWarehouses(updatedWarehouses)
    } catch (error) {
      console.error('Error refreshing warehouses:', error)
      toast({
        title: "Error",
        description: "Failed to refresh warehouses",
        variant: "destructive",
      })
    }
  }
  
  // Function to go back to warehouse list
  const handleBackToWarehouses = () => {
    setShowWarehouseDetails(false)
    setSelectedWarehouse(null)
  }

  if (loading) {
    return <div className="p-6">Loading inventory...</div>
  }
  
  // Render warehouse details page when showWarehouseDetails is true
  if (showWarehouseDetails && selectedWarehouse) {
    const productCount = getWarehouseProductCount(selectedWarehouse.id)
    const totalValue = getWarehouseTotalValue(selectedWarehouse.id)
    const usagePercentage = Math.round((selectedWarehouse.used / selectedWarehouse.capacity) * 100)
    
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToWarehouses}>
            <Package className="h-4 w-4 mr-2" />
            Back to Warehouses
          </Button>
          <h1 className="text-3xl font-bold">Warehouse Details</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{selectedWarehouse.name}</CardTitle>
            <p className="text-muted-foreground">Detailed information</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Warehouse Name</h4>
                  <p className="font-medium">{selectedWarehouse.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Code</h4>
                  <p className="font-medium">{selectedWarehouse.code}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Location</h4>
                  <p className="font-medium">{selectedWarehouse.location}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Address</h4>
                  <p className="font-medium">{selectedWarehouse.address}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Manager</h4>
                  <p className="font-medium">{selectedWarehouse.manager}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Phone</h4>
                  <p className="font-medium">{selectedWarehouse.phone}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground">Email</h4>
                  <p className="font-medium">{selectedWarehouse.email}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Capacity Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Total Capacity</h4>
                    <p className="text-2xl font-bold">{selectedWarehouse.capacity.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Used Capacity</h4>
                    <p className="text-2xl font-bold">{selectedWarehouse.used.toLocaleString()}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Usage</h4>
                    <p className="text-2xl font-bold">{usagePercentage}%</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Products</h4>
                    <p className="text-2xl font-bold">{productCount}</p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-muted-foreground">Total Value</h4>
                    <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
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
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your warehouse locations and stock distribution</p>
        </div>
        <AddWarehouseForm onWarehouseAdded={handleWarehouseAdded} />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Warehouses</p>
            <p className="text-2xl font-bold mt-2">{warehouses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold mt-2">
              {products.filter(p => !p.isArchived).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across all warehouses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Inventory Value</p>
            <p className="text-2xl font-bold mt-2">
              ${products
                .filter(p => !p.isArchived)
                .reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">At purchase price</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWarehouses.map((warehouse) => {
                  const productCount = getWarehouseProductCount(warehouse.id)
                  const totalValue = getWarehouseTotalValue(warehouse.id)
                  const usagePercentage = Math.round((warehouse.used / warehouse.capacity) * 100)
                  
                  return (
                    <TableRow key={warehouse.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="font-medium">{warehouse.name}</div>
                        <div className="text-sm text-muted-foreground">{warehouse.address}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{warehouse.code}</Badge>
                      </TableCell>
                      <TableCell>{warehouse.location}</TableCell>
                      <TableCell>
                        <div className="font-medium">{warehouse.manager}</div>
                        <div className="text-sm text-muted-foreground">{warehouse.phone}</div>
                      </TableCell>
                      <TableCell className="text-right">{productCount}</TableCell>
                      <TableCell className="text-right">{warehouse.capacity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div>{warehouse.used.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{usagePercentage}% used</div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${totalValue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(warehouse)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <EditWarehouseForm 
                              warehouse={warehouse} 
                              onWarehouseUpdated={handleWarehouseUpdated} 
                            />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-orange-600"
                              onClick={() => handleArchive(warehouse.id)}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Warehouse
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

          {filteredWarehouses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold">No warehouses found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}