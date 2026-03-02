import { NextRequest, NextResponse } from 'next/server'
import { getWarehouseById } from '@/lib/data-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const warehouse = await getWarehouseById(params.id)
    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(warehouse)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch warehouse' },
      { status: 500 }
    )
  }
}