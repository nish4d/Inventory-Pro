import { NextRequest, NextResponse } from 'next/server'
import { getSales, saveSale, archiveSale, permanentlyDeleteSale, recordSale } from '@/lib/data-service'
import { Sale } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const includeArchived = request.nextUrl.searchParams.get('archived') === 'true'
    const sales = await getSales(includeArchived)
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sale: Sale = {
      id: '',
      invoiceNo: body.invoiceNo,
      date: body.date,
      productId: body.productId,
      customer: body.customer,
      saleType: body.saleType,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      totalAmount: body.totalAmount,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus,
      warehouseId: body.warehouseId,
      isArchived: false
    }
    
    // Use recordSale instead of saveSale to properly update inventory
    await recordSale(sale)
    
    return NextResponse.json({
      ...sale,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}