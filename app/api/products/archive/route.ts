import { NextRequest, NextResponse } from 'next/server'
import { archiveProduct, getArchivedProducts } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }
    
    await archiveProduct(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error archiving product:', error)
    return NextResponse.json(
      { error: 'Failed to archive product' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const archivedProducts = await getArchivedProducts()
    return NextResponse.json(archivedProducts)
  } catch (error) {
    console.error('Error fetching archived products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived products' },
      { status: 500 }
    )
  }
}