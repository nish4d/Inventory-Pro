'use client'

import { useState, useEffect } from 'react'
import { Bell, Package, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

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

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await fetch('/api/alerts')
        if (response.ok) {
          const data = await response.json()
          setAlerts(data)
        }
      } catch (error) {
        console.error('Error loading alerts:', error)
        toast({
          title: "Error",
          description: "Failed to load alerts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const handleResolveAlert = async (id: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== id))
        toast({
          title: "Success",
          description: "Alert resolved successfully",
        })
      } else {
        throw new Error('Failed to resolve alert')
      }
    } catch (error) {
      console.error('Error resolving alert:', error)
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading alerts...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Alerts</h1>
        <p className="text-muted-foreground">Manage your inventory alerts and notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
              <h3 className="font-semibold">No active alerts</h3>
              <p className="text-sm text-muted-foreground">All your inventory items are well-stocked</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{alert.productName}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{alert.currentQty}</Badge>
                      </TableCell>
                      <TableCell>{alert.reorderLevel}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">Low Stock</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(alert.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}