'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddCategoryForm } from '@/components/forms/add-category-form'
import { EditCategoryForm } from '@/components/forms/edit-category-form'
import { Category } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await fetch('/api/categories').then(res => res.json())
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load categories data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const handleCategoryAdded = async () => {
    try {
      const updatedCategories = await fetch('/api/categories').then(res => res.json())
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Error refreshing categories:', error)
      toast({
        title: "Error",
        description: "Failed to refresh categories",
        variant: "destructive",
      })
    }
  }

  const handleCategoryUpdated = async () => {
    try {
      const updatedCategories = await fetch('/api/categories').then(res => res.json())
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Error refreshing categories:', error)
      toast({
        title: "Error",
        description: "Failed to refresh categories",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      let result = { error: 'Unknown error' };
      try {
        result = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, continue with default error object
      }

      if (response.ok) {
        // Remove the deleted category from state
        setCategories(categories.filter(category => category.id !== id))
        toast({
          title: "Success",
          description: `Category "${name}" deleted successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete category",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading categories...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">Manage your product categories ({categories.length} total)</p>
        </div>
        <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
      </div>

      <div className="rounded-md border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Icon</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Actions</th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {categories.map(category => (
              <tr key={category.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td className="p-4 align-middle">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon.charAt(0)}
                  </div>
                </td>
                <td className="p-4 align-middle font-medium">{category.name}</td>
                <td className="p-4 align-middle">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <EditCategoryForm category={category} onCategoryUpdated={handleCategoryUpdated} />
                      <DropdownMenuItem 
                        className="text-red-500 focus:text-red-600 focus:bg-red-50"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Category
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <div className="rounded-md border border-dashed">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">Icon</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td colSpan={3} className="p-12 text-center align-middle">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold">No categories yet</h3>
                  <p className="text-sm text-muted-foreground">Create your first category to get started</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}