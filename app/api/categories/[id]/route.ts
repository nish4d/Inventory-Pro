import { NextRequest, NextResponse } from 'next/server'
import { getCategoryById, deleteCategory, updateCategory } from '@/lib/data-service'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params promise
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }
    
    const category = await getCategoryById(id)
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error in GET /api/categories/[id]:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params promise
    const { id } = await params;
    
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
    console.error('Error in DELETE /api/categories/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params promise
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const updates = {
      name: body.name,
      color: body.color,
      icon: body.icon
    }
    
    const updated = await updateCategory(id, updates)
    
    if (updated) {
      return NextResponse.json({ message: 'Category updated successfully' })
    } else {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Error in PUT /api/categories/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
      { status: 500 }
    )
  }
}