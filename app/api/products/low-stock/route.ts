import { NextRequest, NextResponse } from 'next/server'
import { getLowStockItems } from '@/lib/data-service'

export async function GET() {
  try {
    const lowStockItems = await getLowStockItems()
    return NextResponse.json(lowStockItems)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    )
  }
}