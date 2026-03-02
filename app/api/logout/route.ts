import { NextResponse } from 'next/server'

export async function POST() {
  // This is a simple logout endpoint that clears the authentication cookie
  // In a real application, you would also invalidate the session on the server
  const response = NextResponse.json({ success: true })
  
  // Clear the authentication cookie
  response.cookies.delete('isAuthenticated')
  
  return response
}