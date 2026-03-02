'use client'

import { Package, LayoutDashboard, ShoppingCart, Warehouse, BarChart3, Settings, ChevronLeft, Archive, Tags, DollarSign, Wifi, RefreshCw, Bell, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  mobile?: boolean
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'sales', label: 'Sales', icon: ShoppingCart },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
  { id: 'pricelist', label: 'Price List', icon: DollarSign },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({
  currentPage,
  onPageChange,
  collapsed = false,
  onCollapsedChange = () => {},
  mobile = false,
}: SidebarProps) {
  const [isConnected, setIsConnected] = useState(true)
  const [lastChecked, setLastChecked] = useState('2m')
  const { logout, user } = useAuth()
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const timer = setInterval(() => {
      setLastChecked('now')
    }, 120000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Get current user from localStorage
    const currentUserData = localStorage.getItem('currentUser')
    if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser({
          name: user.name || 'User',
          email: user.email || 'user@example.com'
        })
      } catch (error) {
        console.error('Error parsing current user data:', error)
        setCurrentUser({
          name: 'User',
          email: 'user@example.com'
        })
      }
    } else {
      // Fallback to demo data
      setCurrentUser({
        name: 'Admin User',
        email: 'admin@company.com'
      })
    }
  }, [])

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    // Hide settings for non-admin users
    if (item.id === 'settings' && !isAdmin) {
      return false
    }
    return true
  })

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card border-r border-border transition-all duration-300 animate-slideInLeft',
        collapsed && !mobile ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn('border-b border-border p-4', collapsed && !mobile ? 'flex justify-center' : '')}>
        <div className="flex items-center justify-between w-full">
          {!collapsed && !mobile && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent transition-smooth hover:shadow-lg">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="font-bold text-sm">InventoryPro</h1>
                <p className="text-xs text-muted-foreground">Management</p>
              </div>
            </div>
          )}
          {!collapsed && !mobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCollapsedChange(true)}
              className="h-8 w-8 p-0 transition-smooth hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {collapsed && !mobile && (
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent transition-smooth hover:shadow-lg cursor-pointer"
              onClick={() => onCollapsedChange(false)}
            >
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
          )}
          {mobile && (
            <div className="flex items-center gap-3 animate-fadeIn">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sm">InventoryPro</h1>
                <p className="text-xs text-muted-foreground">Management</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredMenuItems.map((item, idx) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 transition-smooth animate-slideInLeft',
                isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
                !isActive && 'hover:bg-muted/50 text-foreground hover:text-foreground',
                collapsed && !mobile && 'justify-center p-0 h-10 w-10'
              )}
              onClick={() => onPageChange(item.id)}
              title={collapsed && !mobile ? item.label : ''}
              style={{
                animationDelay: `${idx * 50}ms`
              }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && !mobile && <span className="text-sm font-medium">{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-border p-4 space-y-4 animate-slideUp', collapsed && !mobile ? 'flex flex-col items-center justify-center' : '')}>
        {!collapsed && !mobile && (
          <div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs space-y-2 transition-smooth hover:bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">Connected</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted transition-smooth"
                  onClick={() => {
                    setLastChecked('now')
                    setTimeout(() => setLastChecked('1s'), 1000)
                  }}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-muted-foreground">Last: {lastChecked} ago</div>
            </div>
            <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer transition-smooth mt-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                  {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{currentUser?.email || 'user@example.com'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2"
              onClick={async () => {
                await logout()
                window.location.reload()
              }}
            >
              Logout
            </Button>
          </div>
        )}

        {collapsed && !mobile && (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-6"
              onClick={async () => {
                await logout()
                window.location.reload()
              }}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}