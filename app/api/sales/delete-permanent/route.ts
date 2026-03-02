import { NextRequest, NextResponse } from 'next/server'
import { permanentlyDeleteSale } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      )
    }
    
    await permanentlyDeleteSale(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error permanently deleting sale:', error)
    return NextResponse.json(
      { error: 'Failed to permanently delete sale' },
      { status: 500 }
    )
  }
}