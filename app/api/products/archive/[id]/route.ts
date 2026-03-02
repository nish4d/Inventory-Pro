import { NextRequest, NextResponse } from 'next/server'
import { getArchivedProductById } from '@/lib/data-service'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await getArchivedProductById(params.id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching archived product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived product' },
      { status: 500 }
    )
  }
}