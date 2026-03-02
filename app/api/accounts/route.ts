import { NextResponse } from 'next/server'
import { getAccounts, createAccount } from '../../../lib/data-service'

export async function GET() {
  try {
    const accounts = await getAccounts()
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    
    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }
    
    // Check if email already exists
    const existingAccount = await getAccounts()
    if (existingAccount.some(acc => acc.email === body.email)) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }
    
    const accountData = {
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || 'user',
      createdAt: new Date().toISOString()
    }
    
    const newAccount = await createAccount(accountData)
    
    if (newAccount) {
      return NextResponse.json(newAccount, { status: 201 })
    } else {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}