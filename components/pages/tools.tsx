'use client'

import { useState } from 'react'
import { Bell, Tags, Wrench, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alerts } from '@/components/pages/alerts'
import { Categories } from '@/components/pages/categories'

export function Tools() {
  const [activeTab, setActiveTab] = useState('categories')

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Tools</h1>
        <p className="text-muted-foreground">Manage system tools and configurations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Tool Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={activeTab === 'categories' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('categories')}
            >
              <Tags className="h-4 w-4" />
              Categories
            </Button>
            <Button
              variant={activeTab === 'alerts' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('alerts')}
            >
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {activeTab === 'categories' ? (
                <div className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Categories
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerts
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === 'categories' ? <Categories /> : <Alerts />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}