import { NextRequest, NextResponse } from 'next/server'
import { permanentlyDeleteProduct } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    await permanentlyDeleteProduct(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error permanently deleting product:', error)
    return NextResponse.json(
      { error: 'Failed to permanently delete product' },
      { status: 500 }
    )
  }
}