import { NextRequest, NextResponse } from 'next/server'
import { unarchiveProduct } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    await unarchiveProduct(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unarchiving product:', error)
    return NextResponse.json(
      { error: 'Failed to unarchive product' },
      { status: 500 }
    )
  }
}