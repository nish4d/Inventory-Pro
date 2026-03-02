import { NextRequest, NextResponse } from 'next/server'
import { permanentlyDeleteWarehouse } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Warehouse ID is required' },
        { status: 400 }
      )
    }
    
    await permanentlyDeleteWarehouse(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error permanently deleting warehouse:', error)
    return NextResponse.json(
      { error: 'Failed to permanently delete warehouse' },
      { status: 500 }
    )
  }
}