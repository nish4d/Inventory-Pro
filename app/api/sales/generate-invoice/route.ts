import { NextRequest, NextResponse } from 'next/server'
import { getProducts, getWarehouses } from '@/lib/data-service'
import { Sale, Product, Warehouse } from '@/lib/types'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { saleId } = body

    if (!saleId) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      )
    }

    // Get sale details directly from database
    const client = await clientPromise
    const db = client.db('inventorydb')
    const saleDoc = await db.collection('sales').findOne({ _id: new ObjectId(saleId) })
    
    if (!saleDoc) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      )
    }

    const sale: Sale = {
      id: saleDoc._id.toString(),
      invoiceNo: saleDoc.invoiceNo,
      date: saleDoc.date,
      productId: saleDoc.productId,
      customer: saleDoc.customer,
      saleType: saleDoc.saleType,
      quantity: saleDoc.quantity,
      unitPrice: saleDoc.unitPrice,
      totalAmount: saleDoc.totalAmount,
      paymentMethod: saleDoc.paymentMethod,
      paymentStatus: saleDoc.paymentStatus,
      warehouseId: saleDoc.warehouseId,
      isArchived: saleDoc.isArchived
    }

    // Get product details
    const products = await getProducts()
    const product = products.find((p: Product) => p.id === sale.productId)

    // Get warehouse details
    const warehouses = await getWarehouses()
    const warehouse = warehouses.find((w: Warehouse) => w.id === sale.warehouseId)

    // Create invoice data
    const invoiceData = {
      sale: {
        ...sale,
        date: new Date(sale.date).toLocaleDateString(),
        time: new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      product: product || null,
      warehouse: warehouse || null,
      company: {
        name: "InventoryPro",
        address: "123 Business Street, Suite 100",
        city: "Business City, BC 12345",
        phone: "(123) 456-7890",
        email: "info@inventorypro.com"
      },
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(invoiceData)
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}