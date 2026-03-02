import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Get all active low stock alerts
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const alerts = await db.collection('alerts').find({ 
      type: 'low_stock',
      resolved: { $ne: true }
    }).sort({ createdAt: -1 }).toArray()
    
    return NextResponse.json(alerts.map(alert => ({
      id: alert._id.toString(),
      ...alert
    })))
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// Create a new alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    const alert = {
      ...body,
      type: 'low_stock',
      resolved: false,
      createdAt: new Date()
    }
    
    const result = await db.collection('alerts').insertOne(alert)
    
    return NextResponse.json({
      id: result.insertedId.toString(),
      ...alert
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// Resolve an alert
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    await db.collection('alerts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { resolved: true, resolvedAt: new Date() } }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to resolve alert' },
      { status: 500 }
    )
  }
}