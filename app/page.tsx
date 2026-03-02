'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { Dashboard } from '@/components/pages/dashboard'
import { Products } from '@/components/pages/products'
import { Sales } from '@/components/pages/sales'
import { Inventory } from '@/components/pages/inventory'
import { PriceList } from '@/components/pages/pricelist'
import { Reports } from '@/components/pages/reports'
import { Archive } from '@/components/pages/archive'
import { Settings } from '@/components/pages/settings'
import { Tools } from '@/components/pages/tools'
import { Login } from '@/components/pages/login'
import { useAuth } from '@/contexts/auth-context'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuth()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect non-admin users away from settings page
  useEffect(() => {
    if (currentPage === 'settings' && !isAdmin) {
      setCurrentPage('dashboard')
    }
  }, [currentPage, isAdmin])

  if (!mounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-xl font-semibold">Loading InventoryPro...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'products':
        return <Products />
      case 'sales':
        return <Sales />
      case 'inventory':
        return <Inventory />
      case 'pricelist':
        return <PriceList />
      case 'tools':
        return <Tools />
      case 'reports':
        return <Reports />
      case 'archive':
        return <Archive />
      case 'settings':
        // Only allow admin users to access settings
        if (isAdmin) {
          return <Settings />
        } else {
          // Redirect to dashboard if not admin
          setCurrentPage('dashboard')
          return <Dashboard />
        }
      default:
        return <Dashboard />
    }
  }

  return (
    <AppShell currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </AppShell>
  )
}