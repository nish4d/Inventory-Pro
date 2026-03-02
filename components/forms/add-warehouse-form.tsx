'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { Warehouse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

interface AddWarehouseFormProps {
  onWarehouseAdded?: () => void
  onSubmit?: (warehouse: Warehouse) => void
}

export function AddWarehouseForm({ onWarehouseAdded, onSubmit }: AddWarehouseFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    manager: '',
    phone: '',
    email: '',
    capacity: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!formData.name || !formData.code || !formData.location || !formData.capacity) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          location: formData.location,
          address: formData.address,
          manager: formData.manager,
          phone: formData.phone,
          email: formData.email,
          capacity: parseInt(formData.capacity) || 0,
          used: 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create warehouse')
      }

      const newWarehouse: Warehouse = await response.json()

      // Call parent handler if provided
      if (onSubmit) {
        onSubmit(newWarehouse)
      }

      // Reset form
      setFormData({
        name: '',
        code: '',
        location: '',
        address: '',
        manager: '',
        phone: '',
        email: '',
        capacity: '',
      })

      setLoading(false)
      setOpen(false)
      onWarehouseAdded?.()
      
      toast({
        title: "Success",
        description: "Warehouse created successfully",
      })
    } catch (error) {
      console.error('Error creating warehouse:', error)
      toast({
        title: "Error",
        description: "Failed to create warehouse",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Warehouse</DialogTitle>
          <DialogDescription>
            Create a new warehouse location for your inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Main Store"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="code">Warehouse Code *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g., WH-001"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Downtown"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="e.g., 123 Tech Street, City, Country"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Manager Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Manager Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manager">Manager Name</Label>
                <Input
                  id="manager"
                  name="manager"
                  placeholder="e.g., John Doe"
                  value={formData.manager}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="e.g., +1-555-0001"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g., manager@store.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Capacity Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Capacity Information</h3>
            
            <div>
              <Label htmlFor="capacity">Total Capacity (Units) *</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                placeholder="e.g., 5000"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Total number of items this warehouse can hold</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Warehouse'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}