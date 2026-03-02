import { NextRequest, NextResponse } from 'next/server'
import { getProducts, saveProduct, updateProduct } from '@/lib/data-service'
import { Product } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const includeArchived = request.nextUrl.searchParams.get('archived') === 'true'
    const products = await getProducts(includeArchived)
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const product: Product = {
      id: '',
      name: body.name,
      categoryId: body.categoryId,
      warehouseId: body.warehouseId,
      sku: body.sku,
      barcode: body.barcode,
      purchasePrice: body.purchasePrice,
      wholesalePrice: body.wholesalePrice,
      retailPrice: body.retailPrice,
      quantity: body.quantity,
      unit: body.unit,
      date: body.date,
      reorderLevel: body.reorderLevel,
      costOfGoodsSold: body.costOfGoodsSold || 0,
      unitsSold: body.unitsSold || 0,
      lastRestockDate: body.lastRestockDate,
      isArchived: false
    }
    
    await saveProduct(product)
    
    return NextResponse.json({
      ...product,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract the ID and prepare updates object
    const { id, ...updates } = body
    
    // Update the product
    await updateProduct(id, updates)
    
    // Return the updated product
    return NextResponse.json({
      id,
      ...updates,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}