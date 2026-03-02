import { NextRequest, NextResponse } from 'next/server'
import { getArchivedWarehouseById } from '@/lib/data-service'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const warehouse = await getArchivedWarehouseById(params.id)
    
    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(warehouse)
  } catch (error) {
    console.error('Error fetching archived warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived warehouse' },
      { status: 500 }
    )
  }
}