'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppShellProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export function AppShell({ children, currentPage, onPageChange }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          currentPage={currentPage}
          onPageChange={onPageChange}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 border-0">
          <Sidebar
            currentPage={currentPage}
            onPageChange={(page) => {
              onPageChange(page)
              setSidebarOpen(false)
            }}
            collapsed={false}
            onCollapsedChange={() => {}}
            mobile
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav onMobileMenuClick={() => setSidebarOpen(!sidebarOpen)} currentPage={currentPage} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}