import { NextRequest, NextResponse } from 'next/server'
import { archiveWarehouse, getArchivedWarehouses } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Warehouse ID is required' },
        { status: 400 }
      )
    }
    
    await archiveWarehouse(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error archiving warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to archive warehouse' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const archivedWarehouses = await getArchivedWarehouses()
    return NextResponse.json(archivedWarehouses)
  } catch (error) {
    console.error('Error fetching archived warehouses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived warehouses' },
      { status: 500 }
    )
  }
}