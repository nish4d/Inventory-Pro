'use client'

import { Menu, Search, Bell, Sun, Moon, ChevronRight, LogOut, User, HelpCircle, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState, useEffect } from 'react'

interface TopNavProps {
  onMobileMenuClick?: () => void
  currentPage?: string
}

interface Alert {
  id: string
  productId: string
  productName: string
  currentQty: number
  reorderLevel: number
  type: string
  resolved: boolean
  createdAt: string
}

export function TopNav({ onMobileMenuClick, currentPage = 'dashboard' }: TopNavProps) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
    
    // Load alerts
    loadAlerts()
    
    // Set up interval to check for new alerts
    const interval = setInterval(loadAlerts, 30000) // Check every 30 seconds
    
    // Listen for notification update events
    const handleNotificationUpdate = () => {
      loadAlerts()
    }
    
    window.addEventListener('notificationUpdate', handleNotificationUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('notificationUpdate', handleNotificationUpdate)
    }
  }, [])

  const loadAlerts = async () => {
    try {
      const response = await fetch('/api/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
        setUnreadCount(data.length)
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const toggleTheme = () => {
    if (!mounted) return
    const html = document.documentElement
    html.classList.toggle('dark')
    setIsDark(!isDark)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Map page IDs to display names
  const pageNames: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    sales: 'Sales',
    inventory: 'Inventory',
    pricelist: 'Price List',
    tools: 'Tools',
    reports: 'Reports',
    archive: 'Archive',
    settings: 'Settings',
    alerts: 'Alerts',
    categories: 'Categories'
  }

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/60 animate-fadeIn">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden transition-smooth hover:bg-muted"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <span>Home</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{pageNames[currentPage] || currentPage}</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block relative">
            <Input
              placeholder="Search... ⌘K"
              className="w-64 pl-10 transition-smooth focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative transition-smooth hover:bg-muted">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-info animate-pulse-slow">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 animate-scaleIn">
              <div className="space-y-4">
                <h4 className="font-semibold">Notifications</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div key={alert.id} className="border-b border-border pb-2 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2 w-2 rounded-full bg-destructive"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Low Stock Alert</p>
                            <p className="text-xs text-muted-foreground">
                              {alert.productName} is low on stock ({alert.currentQty}/{alert.reorderLevel})
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(alert.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="transition-smooth hover:bg-muted"
          >
            {isDark ? (
              <Sun className="h-5 w-5 transition-transform duration-300 rotate-0" />
            ) : (
              <Moon className="h-5 w-5 transition-transform duration-300 rotate-0" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 transition-smooth hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-linear-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                    AD
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scaleIn">
              <DropdownMenuItem className="transition-smooth">
                <User className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="transition-smooth">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="transition-smooth">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive transition-smooth">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}