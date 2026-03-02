'use client'

import { Package, DollarSign, TrendingUp, PiggyBank, ShoppingBag, AlertTriangle, Plus, ShoppingCart, PackageIcon, BarChart, CheckCircle, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Product, Sale, Category } from '@/lib/types'

export function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [lowStockItems, setLowStockItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, salesData, categoriesData, lowStockData] = await Promise.all([
          fetch('/api/products').then(res => res.json()),
          fetch('/api/sales').then(res => res.json()),
          fetch('/api/categories').then(res => res.json()),
          fetch('/api/products/low-stock').then(res => res.json())
        ])
        setProducts(productsData)
        setSales(salesData)
        setCategories(categoriesData)
        setLowStockItems(lowStockData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const totalProducts = products.filter(p => !p.isArchived).length
  const totalStockValue = products.filter(p => !p.isArchived).reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0)
  const totalRetailValue = products.filter(p => !p.isArchived).reduce((sum, p) => sum + (p.quantity * p.retailPrice), 0)
  const expectedProfit = totalRetailValue - totalStockValue
  const todaySales = sales.filter(s => !s.isArchived && s.date.startsWith(new Date().toISOString().split('T')[0])).reduce((sum, s) => sum + s.totalAmount, 0)
  
  const actualProfit = sales.filter(s => !s.isArchived).reduce((sum, s) => {
    const product = products.find(p => p.id === s.productId)
    if (!product) return sum
    const cost = s.quantity * product.purchasePrice
    const revenue = s.totalAmount
    return sum + (revenue - cost)
  }, 0)

  const totalRevenue = sales.filter(s => !s.isArchived).reduce((sum, s) => sum + s.totalAmount, 0)
  const profitMarginPercent = totalRevenue > 0 ? ((actualProfit / totalRevenue) * 100).toFixed(1) : '0'

  const categoryData = categories.map(cat => {
    const count = products.filter(p => !p.isArchived && p.categoryId === cat.id).length
    return { name: cat.name, value: count, fill: cat.color }
  })

  const lowStockProducts = lowStockItems.slice(0, 10)

  if (loading) {
    return <div className="p-6">Loading dashboard data...</div>
  }

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Package, label: 'Total Products', value: totalProducts.toLocaleString(), trend: '+12.5%', color: 'blue' },
          { icon: DollarSign, label: 'Stock Value', value: `$${(totalStockValue / 1000).toFixed(1)}K`, trend: '+8.2%', color: 'success' },
          { icon: TrendingUp, label: 'Retail Value', value: `$${(totalRetailValue / 1000).toFixed(1)}K`, trend: '+15.3%', color: 'info' },
          { icon: PiggyBank, label: 'Expected Profit', value: `$${(expectedProfit / 1000).toFixed(0)}K`, subtext: `${((expectedProfit / totalRetailValue) * 100).toFixed(1)}% margin`, color: 'success' },
        ].map((stat, idx) => (
          <StatCard key={idx} {...stat} delay={idx} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ShoppingBag, label: "Today's Revenue", value: `$${todaySales.toLocaleString()}`, subtext: `${sales.filter(s => !s.isArchived && s.date.startsWith(new Date().toISOString().split('T')[0])).length} sales`, color: 'warning' },
          { icon: TrendingDown, label: 'Actual Profit', value: `$${(actualProfit / 1000).toFixed(1)}K`, subtext: `${profitMarginPercent}% margin`, color: 'success' },
          { icon: ShoppingCart, label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, subtext: `${sales.filter(s => !s.isArchived).length} transactions`, color: 'blue' },
          { icon: AlertTriangle, label: 'Low Stock Items', value: lowStockItems.length.toString(), alert: true, color: 'destructive' },
        ].map((stat, idx) => (
          <StatCard key={idx} {...stat} delay={idx + 4} />
        ))}
      </div>

      {/* Category Overview */}
      <Card className="animate-slideUp">
        <CardHeader>
          <CardTitle>Products by Category</CardTitle>
          <CardDescription>Distribution across categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-smooth" style={{animationDelay: `${idx * 50}ms`}}>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.fill}}></div>
                  <div>
                    <p className="font-medium text-sm">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.value} products</p>
                  </div>
                </div>
                <Badge variant="outline">{cat.value}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Card className={lowStockItems.length > 0 ? 'border-warning/30 bg-warning/5 animate-slideUp' : 'animate-slideUp'} style={{animationDelay: '200ms'}}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Low Stock Alert</CardTitle>
          </div>
          <Badge variant="outline" className={lowStockItems.length > 0 ? 'bg-warning/20' : 'bg-success/20'}>
            {lowStockItems.length} items
          </Badge>
        </CardHeader>
        <CardContent>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg border border-warning/20 bg-warning/5 hover:bg-warning/10 transition-smooth animate-slideInLeft" style={{animationDelay: `${idx * 50}ms`}}>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{product.quantity}/{product.reorderLevel} units • Reorder level: {product.reorderLevel}</p>
                  </div>
                  <Button size="sm" variant="outline" className="transition-smooth hover:bg-warning/20">Restock</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
              <CheckCircle className="h-12 w-12 text-success mb-2" />
              <p className="font-semibold">All products have sufficient stock</p>
              <p className="text-sm text-muted-foreground mt-1">Inventory is well-stocked</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  trend?: string
  subtext?: string
  alert?: boolean
  color: string
  delay?: number
}

function StatCard({ icon: Icon, label, value, trend, subtext, alert, color, delay = 0 }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    purple: 'bg-accent/10 text-accent',
    info: 'bg-info/10 text-info',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
  }

  function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <Card className={cn(alert ? 'border-destructive/30 bg-destructive/5' : '', 'animate-slideUp transition-smooth hover:shadow-lg')} style={{animationDelay: `${delay * 50}ms`}}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend && <p className="text-xs text-success mt-1">↑ {trend} from last month</p>}
            {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue} transition-transform duration-300 hover:scale-110`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}