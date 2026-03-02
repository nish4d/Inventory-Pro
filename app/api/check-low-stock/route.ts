import { NextRequest, NextResponse } from 'next/server'
import { runLowStockCheck } from '@/lib/data-service'

export async function POST() {
  try {
    const result = await runLowStockCheck()
    
    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check low stock items' 
      },
      { status: 500 }
    )
  }
}