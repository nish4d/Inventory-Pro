'use client'

import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Category } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

const ICONS = ['Zap', 'Shield', 'Package', 'Battery', 'Headphones', 'Square', 'Mountain', 'Users']
const COLORS = ['#3B82F6', '#A855F7', '#EC4899', '#F97316', '#22C55E', '#06B6D4', '#8B5CF6', '#EAB308', '#EF4444', '#14B8A6']

interface EditCategoryFormProps {
  category: Category
  onCategoryUpdated?: () => void
}

export function EditCategoryForm({ category, onCategoryUpdated }: EditCategoryFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: 'Package',
  })

  // Initialize form with category data when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: category.name,
        color: category.color,
        icon: category.icon,
      })
    }
  }, [open, category])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          color: formData.color,
          icon: formData.icon,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }

      setLoading(false)
      setOpen(false)
      onCategoryUpdated?.()
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      })
    } catch (error: any) {
      console.error('Error updating category:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update category",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  return (
    <>
      <button
        className="w-full flex items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-4 w-4 mr-2" />
        Edit Category
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details for {category.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Phone Cases, Chargers"
                value={formData.name}
                onChange={handleInputChange}
                className="transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      formData.color === color ? 'border-gray-800 scale-105' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-4 gap-2">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    className={`p-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.icon === icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {loading ? 'Updating...' : 'Update Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}