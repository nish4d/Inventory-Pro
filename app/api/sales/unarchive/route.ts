import { NextRequest, NextResponse } from 'next/server'
import { unarchiveSale } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      )
    }
    
    await unarchiveSale(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unarchiving sale:', error)
    return NextResponse.json(
      { error: 'Failed to unarchive sale' },
      { status: 500 }
    )
  }
}