import { NextRequest, NextResponse } from 'next/server'
import { getCategories, saveCategory, deleteCategory } from '@/lib/data-service'
import { Category } from '@/lib/types'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error in GET /api/categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const category: Category = {
      id: '',
      name: body.name,
      color: body.color,
      icon: body.icon
    }
    
    const savedCategory = await saveCategory(category)
    
    return NextResponse.json(savedCategory || category)
  } catch (error) {
    console.error('Error in POST /api/categories:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }
    
    const deleted = await deleteCategory(id)
    
    if (deleted) {
      return NextResponse.json({ message: 'Category deleted successfully' })
    } else {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error in DELETE /api/categories:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    )
  }
}