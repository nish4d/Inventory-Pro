import { NextRequest, NextResponse } from 'next/server'
import { getWarehouses, saveWarehouse, archiveWarehouse, permanentlyDeleteWarehouse } from '@/lib/data-service'
import { Warehouse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const includeArchived = request.nextUrl.searchParams.get('archived') === 'true'
    const warehouses = await getWarehouses(includeArchived)
    return NextResponse.json(warehouses)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const warehouse: Warehouse = {
      id: '',
      name: body.name,
      code: body.code,
      location: body.location,
      address: body.address,
      manager: body.manager,
      phone: body.phone,
      email: body.email,
      capacity: body.capacity,
      used: body.used,
      isArchived: false
    }
    
    await saveWarehouse(warehouse)
    
    return NextResponse.json({
      ...warehouse,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create warehouse' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const warehouse: Warehouse = {
      id: body.id,
      name: body.name,
      code: body.code,
      location: body.location,
      address: body.address,
      manager: body.manager,
      phone: body.phone,
      email: body.email,
      capacity: body.capacity,
      used: body.used,
      isArchived: body.isArchived || false
    }
    
    await saveWarehouse(warehouse)
    
    return NextResponse.json(warehouse)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update warehouse' },
      { status: 500 }
    )
  }
}
