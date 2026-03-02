'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Product } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface AddProductFormProps {
  onProductAdded?: () => void
  productToEdit?: Product | null
  onEditComplete?: () => void
}

export function AddProductForm({ onProductAdded, productToEdit, onEditComplete }: AddProductFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    warehouseId: '',
    sku: '',
    barcode: '',
    purchasePrice: '',
    wholesalePrice: '',
    retailPrice: '',
    quantity: '',
    unit: 'Piece',
    reorderLevel: '',
  })

  // Reset form when dialog opens/closes or when editing a different product
  useEffect(() => {
    if (productToEdit) {
      setIsEditing(true)
      setOpen(true)
      setFormData({
        name: productToEdit.name,
        categoryId: productToEdit.categoryId,
        warehouseId: productToEdit.warehouseId,
        sku: productToEdit.sku,
        barcode: productToEdit.barcode || '',
        purchasePrice: productToEdit.purchasePrice.toString(),
        wholesalePrice: productToEdit.wholesalePrice.toString(),
        retailPrice: productToEdit.retailPrice.toString(),
        quantity: productToEdit.quantity.toString(),
        unit: productToEdit.unit,
        reorderLevel: productToEdit.reorderLevel.toString(),
      })
    } else if (!open) {
      // Reset form when closing
      setIsEditing(false)
      setFormData({
        name: '',
        categoryId: '',
        warehouseId: '',
        sku: '',
        barcode: '',
        purchasePrice: '',
        wholesalePrice: '',
        retailPrice: '',
        quantity: '',
        unit: 'Piece',
        reorderLevel: '',
      })
    }
  }, [productToEdit, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!formData.name || !formData.categoryId || !formData.warehouseId || !formData.sku) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      if (isEditing && productToEdit) {
        // Update existing product
        const response = await fetch('/api/products', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: productToEdit.id,
            name: formData.name,
            categoryId: formData.categoryId,
            warehouseId: formData.warehouseId,
            sku: formData.sku,
            barcode: formData.barcode,
            purchasePrice: parseFloat(formData.purchasePrice) || 0,
            wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
            retailPrice: parseFloat(formData.retailPrice) || 0,
            quantity: parseInt(formData.quantity) || 0,
            unit: formData.unit,
            date: productToEdit.date, // Keep original date
            reorderLevel: parseInt(formData.reorderLevel) || 50,
            costOfGoodsSold: productToEdit.costOfGoodsSold,
            unitsSold: productToEdit.unitsSold,
            lastRestockDate: productToEdit.lastRestockDate,
            isArchived: productToEdit.isArchived,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update product')
        }

        const updatedProduct: Product = await response.json()
        
        // Dispatch notification update event before closing the dialog
        window.dispatchEvent(new CustomEvent('notificationUpdate'))
        
        setLoading(false)
        setOpen(false)
        onEditComplete?.()
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        // Create new product
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            categoryId: formData.categoryId,
            warehouseId: formData.warehouseId,
            sku: formData.sku,
            barcode: formData.barcode,
            purchasePrice: parseFloat(formData.purchasePrice) || 0,
            wholesalePrice: parseFloat(formData.wholesalePrice) || 0,
            retailPrice: parseFloat(formData.retailPrice) || 0,
            quantity: parseInt(formData.quantity) || 0,
            unit: formData.unit,
            date: new Date().toISOString().split('T')[0],
            reorderLevel: parseInt(formData.reorderLevel) || 50,
            costOfGoodsSold: 0,
            unitsSold: 0,
            lastRestockDate: new Date().toISOString().split('T')[0],
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create product')
        }

        const newProduct: Product = await response.json()
        
        // Dispatch notification update event before closing the dialog
        window.dispatchEvent(new CustomEvent('notificationUpdate'))
        
        // Reset form
        setFormData({
          name: '',
          categoryId: '',
          warehouseId: '',
          sku: '',
          barcode: '',
          purchasePrice: '',
          wholesalePrice: '',
          retailPrice: '',
          quantity: '',
          unit: 'Piece',
          reorderLevel: '',
        })

        setLoading(false)
        setOpen(false)
        onProductAdded?.()
        
        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} product`,
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  // Fetch categories and warehouses for the form
  const [categories, setCategories] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])

  useEffect(() => {
    const fetchCategoriesAndWarehouses = async () => {
      try {
        const [categoriesRes, warehousesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/warehouses')
        ])
        
        if (categoriesRes.ok && warehousesRes.ok) {
          const categoriesData = await categoriesRes.json()
          const warehousesData = await warehousesRes.json()
          setCategories(categoriesData)
          setWarehouses(warehousesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    fetchCategoriesAndWarehouses()
  }, [])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        // Reset when closing
        setIsEditing(false)
        // Notify parent component that editing is complete
        if (isEditing) {
          onEditComplete?.()
        }
      }
    }}>
      <DialogTrigger asChild>
        {isEditing ? null : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update product details' : 'Enter product details to add it to your inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Product Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., USB-C Fast Charger 65W"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange('categoryId', value)}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="warehouseId">Warehouse *</Label>
                <Select value={formData.warehouseId} onValueChange={(value) => handleSelectChange('warehouseId', value)}>
                  <SelectTrigger id="warehouseId">
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(wh => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  placeholder="e.g., UFC-65W-001"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  readOnly={isEditing} // SKU shouldn't be changed for existing products
                />
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  placeholder="e.g., 123456789012"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Piece">Piece</SelectItem>
                    <SelectItem value="Pack">Pack</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Set">Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Pricing Information</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Purchase Price *</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="wholesalePrice">Wholesale Price</Label>
                <Input
                  id="wholesalePrice"
                  name="wholesalePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.wholesalePrice}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="retailPrice">Retail Price *</Label>
                <Input
                  id="retailPrice"
                  name="retailPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.retailPrice}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Inventory Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Inventory Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Initial Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  name="reorderLevel"
                  type="number"
                  placeholder="50"
                  value={formData.reorderLevel}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Product' : 'Add Product')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                // Also reset the productToEdit in the parent component
                if (isEditing) {
                  onEditComplete?.()
                }
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}