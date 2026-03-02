import { NextRequest, NextResponse } from 'next/server'
import { runLowStockCheck } from '@/lib/data-service'

// This endpoint can be called by a cron job or scheduled task
// to periodically check for low stock items and generate alerts
export async function GET() {
  try {
    const result = await runLowStockCheck()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to run background low stock check',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}