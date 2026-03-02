import { NextRequest, NextResponse } from 'next/server'
import { getArchivedSaleById } from '@/lib/data-service'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sale = await getArchivedSaleById(params.id)
    
    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error fetching archived sale:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived sale' },
      { status: 500 }
    )
  }
}