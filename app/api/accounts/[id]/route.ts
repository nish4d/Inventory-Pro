import { NextRequest, NextResponse } from 'next/server'
import { getAccountById, updateAccount, deleteAccount } from '../../../../lib/data-service'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params promise
    const { id } = await params
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 })
    }
    
    const account = await getAccountById(id)
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    
    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params promise
    const { id } = await params
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 })
    }
    
    const body = await request.json()
    
    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
      }
    }
    
    // Validate password strength if provided
    if (body.password && body.password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }
    
    const success = await updateAccount(id, body)
    
    if (success) {
      const updatedAccount = await getAccountById(id)
      return NextResponse.json(updatedAccount)
    } else {
      return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params promise
    const { id } = await params
    
    // Validate ID format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 })
    }
    
    const success = await deleteAccount(id)
    
    if (success) {
      return NextResponse.json({ message: 'Account deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}