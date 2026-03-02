import { NextRequest, NextResponse } from 'next/server'
import { unarchiveWarehouse } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Warehouse ID is required' },
        { status: 400 }
      )
    }
    
    await unarchiveWarehouse(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unarchiving warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to unarchive warehouse' },
      { status: 500 }
    )
  }
}