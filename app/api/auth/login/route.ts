import { NextResponse } from 'next/server'
import { getAccounts } from '../../../../lib/data-service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Fetch all accounts from the database
    const accounts = await getAccounts()

    // Check if any account matches the provided credentials
    // We'll check both email and name as username
    const account = accounts.find(acc => 
      (acc.email === username || acc.name === username) && acc.password === password
    )

    if (account) {
      // Return the authenticated account (excluding password for security)
      const { password, ...accountWithoutPassword } = account
      return NextResponse.json({ 
        success: true, 
        account: accountWithoutPassword 
      })
    }

    // Also check the default admin credentials for backward compatibility
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({ 
        success: true, 
        account: {
          id: 'default-admin',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}