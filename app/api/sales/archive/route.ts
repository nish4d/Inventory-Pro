import { NextRequest, NextResponse } from 'next/server'
import { archiveSale, getArchivedSales } from '@/lib/data-service'

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Sale ID is required' },
        { status: 400 }
      )
    }
    
    await archiveSale(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error archiving sale:', error)
    return NextResponse.json(
      { error: 'Failed to archive sale' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const archivedSales = await getArchivedSales()
    return NextResponse.json(archivedSales)
  } catch (error) {
    console.error('Error fetching archived sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived sales' },
      { status: 500 }
    )
  }
}