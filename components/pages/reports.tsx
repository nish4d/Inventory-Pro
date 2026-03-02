'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  ScatterChart,
  ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign,
  ArrowUpDown,
  BarChart3,
  PieChartIcon,
  Activity,
  ChevronDown
} from 'lucide-react'
import { Product, Sale, Category, Warehouse } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns'

// Professional color palette for advanced charts
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  tertiary: '#8B5CF6',
  quaternary: '#F59E0B',
  quinary: '#EF4444',
  senary: '#06B6D4',
  septenary: '#A855F7',
  octonary: '#EC4899'
}

const RADAR_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']

// Chart configurations with advanced styling
const chartConfig = {
  sales: {
    label: "Sales",
    color: CHART_COLORS.primary,
  },
  revenue: {
    label: "Revenue",
    color: CHART_COLORS.secondary,
  },
  products: {
    label: "Products",
    color: CHART_COLORS.tertiary,
  },
  inventory: {
    label: "Inventory",
    color: CHART_COLORS.quaternary,
  },
  transactions: {
    label: "Transactions",
    color: CHART_COLORS.quinary,
  },
  growth: {
    label: "Growth",
    color: CHART_COLORS.senary,
  },
  performance: {
    label: "Performance",
    color: CHART_COLORS.septenary,
  },
  trend: {
    label: "Trend",
    color: CHART_COLORS.octonary,
  }
}

// Define types for our chart data
interface SalesByDateData {
  date: string
  sales: number
  transactions: number
  trend?: number
}

interface DetailedReportData {
  period: string
  sales: number
  transactions: number
  avgOrderValue: number
  topProduct?: string
  topCategory?: string
  totalProfit: number
}

// Time period options
const TIME_PERIODS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
]

export function Reports() {
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState('daily')
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 5
  const { toast } = useToast()

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, salesData, categoriesData, warehousesData] = await Promise.all([
          fetch('/api/products').then(res => res.json()),
          fetch('/api/sales').then(res => res.json()),
          fetch('/api/categories').then(res => res.json()),
          fetch('/api/warehouses').then(res => res.json())
        ])
        setProducts(productsData)
        setSales(salesData)
        setCategories(categoriesData)
        setWarehouses(warehousesData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load reports data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Update date range when time period changes
  useEffect(() => {
    const today = new Date()
    let newStart, newEnd
    
    switch (timePeriod) {
      case 'daily':
        newStart = subDays(today, 7)
        newEnd = today
        break
      case 'weekly':
        newStart = subWeeks(today, 4)
        newEnd = today
        break
      case 'monthly':
        newStart = subMonths(today, 12)
        newEnd = today
        break
      default:
        newStart = subDays(today, 30)
        newEnd = today
    }
    
    setStartDate(format(newStart, 'yyyy-MM-dd'))
    setEndDate(format(newEnd, 'yyyy-MM-dd'))
  }, [timePeriod])

  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    if (!sale.date || sale.isArchived) return false
    const saleDate = new Date(sale.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Include the entire end day
    return saleDate >= start && saleDate <= end
  })

  // Group sales by period
  const groupSalesByPeriod = (sales: Sale[], period: string): SalesByDateData[] => {
    const grouped: Record<string, SalesByDateData> = {}
    
    sales.forEach(sale => {
      if (!sale.date) return
      
      let key: string
      const saleDate = new Date(sale.date)
      
      switch (period) {
        case 'daily':
          key = format(saleDate, 'yyyy-MM-dd')
          break
        case 'weekly':
          const weekStart = startOfWeek(saleDate, { weekStartsOn: 1 }) // Monday as start of week
          key = format(weekStart, 'yyyy-MM-dd')
          break
        case 'monthly':
          key = format(saleDate, 'yyyy-MM')
          break
        default:
          key = format(saleDate, 'yyyy-MM-dd')
      }
      
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          sales: 0,
          transactions: 0
        }
      }
      
      grouped[key].sales += sale.totalAmount
      grouped[key].transactions += 1
    })
    
    // Convert to array and sort by date
    return Object.values(grouped).sort((a, b) => {
      // Handle different date formats
      let dateA: Date;
      let dateB: Date;
      
      if (period === 'monthly') {
        // Monthly data is in 'yyyy-MM' format
        const [yearA, monthA] = a.date.split('-');
        const [yearB, monthB] = b.date.split('-');
        dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, 1);
        dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, 1);
      } else {
        // Daily and weekly data are in 'yyyy-MM-dd' format
        dateA = new Date(a.date);
        dateB = new Date(b.date);
      }
      
      return dateA.getTime() - dateB.getTime();
    }).map(item => ({
      ...item,
      sales: parseFloat(item.sales.toFixed(2))
    }))
  }

  // Generate chart data with appropriate number of data points
  const generateChartData = (): SalesByDateData[] => {
    const groupedData = groupSalesByPeriod(filteredSales, timePeriod);
    
    // For the chart, we want to show a specific number of data points based on the time period
    switch (timePeriod) {
      case 'daily':
        // For daily view, show last 5 days
        return generateDailyChartData(groupedData, 5);
      case 'weekly':
        // For weekly view, show last 7 weeks
        return generateWeeklyChartData(groupedData, 7);
      case 'monthly':
        // For monthly view, show last 30 months
        return generateMonthlyChartData(groupedData, 30);
      default:
        return groupedData;
    }
  }

  // Generate daily chart data with zero-filled gaps
  const generateDailyChartData = (groupedData: SalesByDateData[], days: number): SalesByDateData[] => {
    const result: SalesByDateData[] = [];
    const today = new Date();
    
    // Create a map for quick lookup
    const dataMap = new Map(groupedData.map(item => [item.date, item]));
    
    // Generate data for the last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (dataMap.has(dateStr)) {
        result.push(dataMap.get(dateStr)!);
      } else {
        result.push({
          date: dateStr,
          sales: 0,
          transactions: 0
        });
      }
    }
    
    // Sort the result by date
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Generate weekly chart data with zero-filled gaps
  const generateWeeklyChartData = (groupedData: SalesByDateData[], weeks: number): SalesByDateData[] => {
    const result: SalesByDateData[] = [];
    const today = new Date();
    
    // Create a map for quick lookup
    const dataMap = new Map(groupedData.map(item => [item.date, item]));
    
    // Generate data for the last N weeks
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      
      if (dataMap.has(weekStartStr)) {
        result.push(dataMap.get(weekStartStr)!);
      } else {
        result.push({
          date: weekStartStr,
          sales: 0,
          transactions: 0
        });
      }
    }
    
    // Sort the result by date
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Generate monthly chart data with zero-filled gaps
  const generateMonthlyChartData = (groupedData: SalesByDateData[], months: number): SalesByDateData[] => {
    const result: SalesByDateData[] = [];
    const today = new Date();
    
    // Create a map for quick lookup
    const dataMap = new Map(groupedData.map(item => [item.date, item]));
    
    // Generate data for the last N months
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = subMonths(today, i);
      const monthStartStr = format(monthStart, 'yyyy-MM');
      
      // Find matching data (monthly data is stored by yyyy-MM format)
      if (dataMap.has(monthStartStr)) {
        result.push(dataMap.get(monthStartStr)!);
      } else {
        result.push({
          date: monthStartStr,
          sales: 0,
          transactions: 0
        });
      }
    }
    
    // Sort the result by date
    return result.sort((a, b) => {
      const [yearA, monthA] = a.date.split('-');
      const [yearB, monthB] = b.date.split('-');
      const dateA = new Date(parseInt(yearA), parseInt(monthA) - 1, 1);
      const dateB = new Date(parseInt(yearB), parseInt(monthB) - 1, 1);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Generate detailed report data for daily/weekly/monthly views
  const generateDetailedReportData = (): DetailedReportData[] => {
    const groupedSales = groupSalesByPeriod(filteredSales, timePeriod)
    
    return groupedSales.map(item => {
      const periodSales = filteredSales.filter(sale => {
        if (!sale.date) return false
        const saleDate = new Date(sale.date)
        
        switch (timePeriod) {
          case 'daily':
            return format(saleDate, 'yyyy-MM-dd') === item.date
          case 'weekly': {
            const weekStart = startOfWeek(saleDate, { weekStartsOn: 1 })
            return format(weekStart, 'yyyy-MM-dd') === item.date
          }
          case 'monthly':
            return format(saleDate, 'yyyy-MM') === item.date
          default:
            return format(saleDate, 'yyyy-MM-dd') === item.date
        }
      })
      
      // Calculate total profit for this period
      let totalProfit = 0
      periodSales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId)
        if (product) {
          const cost = product.purchasePrice * sale.quantity
          const revenue = sale.totalAmount
          totalProfit += (revenue - cost)
        }
      })

      // Find top product for this period
      const productSalesMap: Record<string, { quantity: number; revenue: number }> = {}
      periodSales.forEach(sale => {
        if (!productSalesMap[sale.productId]) {
          productSalesMap[sale.productId] = { quantity: 0, revenue: 0 }
        }
        productSalesMap[sale.productId].quantity += sale.quantity
        productSalesMap[sale.productId].revenue += sale.totalAmount
      })
      
      const topProductId = Object.entries(productSalesMap)
        .sort(([,a], [,b]) => b.revenue - a.revenue)[0]?.[0]
      
      const topProduct = products.find(p => p.id === topProductId)
      
      // Find top category for this period
      const categorySalesMap: Record<string, number> = {}
      periodSales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId)
        if (product) {
          if (!categorySalesMap[product.categoryId]) {
            categorySalesMap[product.categoryId] = 0
          }
          categorySalesMap[product.categoryId] += sale.totalAmount
        }
      })
      
      const topCategoryId = Object.entries(categorySalesMap)
        .sort(([,a], [,b]) => b - a)[0]?.[0]
      
      const topCategory = categories.find(c => c.id === topCategoryId)
      
      return {
        period: item.date,
        sales: item.sales,
        transactions: item.transactions,
        avgOrderValue: item.transactions > 0 ? parseFloat((item.sales / item.transactions).toFixed(2)) : 0,
        topProduct: topProduct?.name,
        topCategory: topCategory?.name,
        totalProfit: parseFloat(totalProfit.toFixed(2))
      }
    })
  }

  // Sales by date data with trend calculation
  const salesByDateData: SalesByDateData[] = groupSalesByPeriod(filteredSales, timePeriod)
    .map((item, index, arr) => {
      // Calculate trend as percentage change from previous period
      if (index > 0 && arr[index-1].sales > 0) {
        item.trend = parseFloat(((item.sales - arr[index-1].sales) / arr[index-1].sales * 100).toFixed(2))
      } else {
        item.trend = 0
      }
      return item
    })

  // Chart data with appropriate number of data points
  const chartData: SalesByDateData[] = generateChartData()
    .map((item, index, arr) => {
      // Calculate trend as percentage change from previous period
      if (index > 0 && arr[index-1].sales > 0) {
        item.trend = parseFloat(((item.sales - arr[index-1].sales) / arr[index-1].sales * 100).toFixed(2))
      } else {
        item.trend = 0
      }
      return item
    })

  // Detailed report data for tables
  const detailedReportData = generateDetailedReportData()

  // Sales by category data with additional metrics
  const salesByCategoryData = categories.map(category => {
    const categorySales = filteredSales
      .filter(s => !s.isArchived)
      .reduce((sum, sale) => {
        const product = products.find(p => p.id === sale.productId)
        if (product && product.categoryId === category.id) {
          return sum + sale.totalAmount
        }
        return sum
      }, 0)
    
    const productCount = products.filter(p => p.categoryId === category.id && !p.isArchived).length
    
    return {
      name: category.name,
      value: parseFloat(categorySales.toFixed(2)),
      products: productCount,
      color: category.color || Object.values(CHART_COLORS)[categories.indexOf(category) % Object.values(CHART_COLORS).length]
    }
  }).filter(item => item.name)
  .sort((a, b) => b.value - a.value)
  .slice(0, 15) // Show up to 15 categories

  // Top selling products with enhanced metrics
  const topSellingProducts = products
    .filter(p => !p.isArchived)
    .map(product => {
      const productSales = filteredSales
        .filter(s => !s.isArchived && s.productId === product.id)
        .reduce((sum, sale) => sum + sale.quantity, 0)
      
      const revenue = filteredSales
        .filter(s => !s.isArchived && s.productId === product.id)
        .reduce((sum, sale) => sum + sale.totalAmount, 0)
      
      // Calculate margin and other metrics
      const cost = product.purchasePrice * productSales;
      const margin = productSales > 0 ? ((revenue - cost) / revenue * 100) : 0;
      const profit = revenue - cost;
      
      // Calculate growth trend (simplified - comparing first half vs second half of sales)
      const productSalesData = filteredSales
        .filter(s => !s.isArchived && s.productId === product.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let growth = 0;
      if (productSalesData.length > 1) {
        const midpoint = Math.floor(productSalesData.length / 2);
        const firstHalf = productSalesData.slice(0, midpoint).reduce((sum, sale) => sum + sale.quantity, 0);
        const secondHalf = productSalesData.slice(midpoint).reduce((sum, sale) => sum + sale.quantity, 0);
        growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf * 100) : 0;
      }
      
      return {
        name: product.name,
        sales: productSales,
        revenue: parseFloat(revenue.toFixed(2)),
        price: product.retailPrice,
        margin: parseFloat(margin.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
        growth: parseFloat(growth.toFixed(2)),
        quantity: product.quantity,
        category: categories.find(c => c.id === product.categoryId)?.name || 'Unknown'
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20) // Show 20 products for better visualization

  // Inventory value by warehouse with additional metrics
  const inventoryValueByWarehouse = warehouses
    .filter(w => !w.isArchived)
    .map(warehouse => {
      const warehouseProducts = products.filter(p => p.warehouseId === warehouse.id && !p.isArchived)
      const totalValue = warehouseProducts.reduce((sum, product) => 
        sum + (product.quantity * product.purchasePrice), 0)
      
      const totalQuantity = warehouseProducts.reduce((sum, product) => 
        sum + product.quantity, 0)
      
      // Use reorderLevel instead of minStock
      const lowStockItems = warehouseProducts.filter(p => p.quantity <= p.reorderLevel).length
      
      return {
        name: warehouse.name,
        value: parseFloat(totalValue.toFixed(2)),
        quantity: totalQuantity,
        lowStock: lowStockItems,
        utilization: Math.min(100, (totalQuantity / (warehouse.capacity || 1000)) * 100)
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Show up to 10 warehouses

  // Generate performance data based on real metrics
  const performanceData = [
    {
      subject: 'Sales Growth',
      A: Math.min(150, filteredSales.filter(s => !s.isArchived).length > 0 ? 
        parseFloat(((filteredSales.filter(s => !s.isArchived).length / (sales.length || 1)) * 100).toFixed(0)) : 0),
      fullMark: 150,
    },
    {
      subject: 'Product Diversity',
      A: Math.min(150, categories.length > 0 && products.filter(p => !p.isArchived).length > 0 ? 
        parseFloat(((categories.length / (categories.length || 1)) * 50 + 
        (products.filter(p => !p.isArchived).length / (products.length || 1)) * 100).toFixed(0)) : 0),
      fullMark: 150,
    },
    {
      subject: 'Inventory Health',
      A: Math.min(150, products.filter(p => !p.isArchived).length > 0 ? 
        parseFloat(((products.filter(p => p.quantity > p.reorderLevel && !p.isArchived).length / (products.filter(p => !p.isArchived).length || 1)) * 150).toFixed(0)) : 0),
      fullMark: 150,
    },
    {
      subject: 'Warehouse Utilization',
      A: Math.min(150, warehouses.filter(w => !w.isArchived).length > 0 && inventoryValueByWarehouse.length > 0 ? 
        parseFloat(((inventoryValueByWarehouse.reduce((sum, w) => sum + w.utilization, 0) / (warehouses.filter(w => !w.isArchived).length || 1))).toFixed(0)) : 0),
      fullMark: 150,
    },
    {
      subject: 'Operational Efficiency',
      A: Math.min(150, chartData.length > 0 ? 
        parseFloat(((chartData[chartData.length - 1].transactions || 0) * 10).toFixed(0)) : 0),
      fullMark: 150,
    },
    {
      subject: 'Revenue Performance',
      A: Math.min(150, filteredSales.filter(s => !s.isArchived).reduce((sum, s) => sum + s.totalAmount, 0) > 0 ? 
        parseFloat(((filteredSales.filter(s => !s.isArchived).reduce((sum, s) => sum + s.totalAmount, 0) / 10000) * 50).toFixed(0)) : 0),
      fullMark: 150,
    },
    {
      subject: 'Customer Retention',
      A: Math.min(150, filteredSales.filter(s => !s.isArchived).length > 0 ? 
        parseFloat(((filteredSales.filter(s => !s.isArchived).length / (sales.length || 1)) * 100).toFixed(0)) : 0),
      fullMark: 150,
    },
    {
      subject: 'Profit Margin',
      A: Math.min(150, filteredSales.filter(s => !s.isArchived).length > 0 ? 
        parseFloat(((filteredSales.filter(s => !s.isArchived).reduce((sum, s) => sum + s.totalAmount, 0) / (sales.reduce((sum, s) => sum + s.totalAmount, 0) || 1)) * 100).toFixed(0)) : 0),
      fullMark: 150,
    },
  ]
  // Filter out any entries with invalid data
  .filter(item => item.subject && !isNaN(item.A) && item.A >= 0)

  // Export report data to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"
    
    // Add header
    csvContent += "Period,Sales ($),Profit ($),Transactions,Avg Order Value ($),Top Product,Top Category\n"
    
    // Add data rows (export all data, not just current page)
    detailedReportData.forEach(row => {
      const periodLabel = 
        timePeriod === 'daily' ? format(new Date(row.period), 'MMM dd, yyyy') :
        timePeriod === 'weekly' ? `Week of ${format(new Date(row.period), 'MMM dd, yyyy')}` :
        format(new Date(row.period), 'MMMM yyyy')
      
      csvContent += `${periodLabel},${row.sales},${row.totalProfit},${row.transactions},${row.avgOrderValue},"${row.topProduct || 'N/A'}","${row.topCategory || 'N/A'}"\n`
    })
    
    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `sales_report_${timePeriod}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    document.body.appendChild(link)
    
    // Trigger download
    link.click()
    
    // Clean up
    document.body.removeChild(link)
    
    toast({
      title: "Export Successful",
      description: "Sales report exported to CSV successfully",
    })
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage
  const currentRecords = detailedReportData.slice(indexOfFirstRecord, indexOfLastRecord)
  const totalPages = Math.ceil(detailedReportData.length / recordsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return <div className="p-6">Loading reports...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Analytics Dashboard</h1>
        <p className="text-muted-foreground">Professional insights into your inventory and sales performance</p>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Time Period</label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map((period: { value: string; label: string }) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${filteredSales
                    .filter(s => !s.isArchived)
                    .reduce((sum, s) => sum + s.totalAmount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">
                  {filteredSales.filter(s => !s.isArchived).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">
                  {products.filter(p => !p.isArchived).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-bold">
                  ${filteredSales.filter(s => !s.isArchived).length > 0 
                    ? (filteredSales
                        .filter(s => !s.isArchived)
                        .reduce((sum, s) => sum + s.totalAmount, 0) / 
                       filteredSales.filter(s => !s.isArchived).length)
                        .toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Sales Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Period</th>
                  <th className="text-left py-3 px-4">Sales ($)</th>
                  <th className="text-left py-3 px-4">Profit ($)</th>
                  <th className="text-left py-3 px-4">Transactions</th>
                  <th className="text-left py-3 px-4">Avg. Order Value</th>
                  <th className="text-left py-3 px-4">Top Product</th>
                  <th className="text-left py-3 px-4">Top Category</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((report, index) => (
                  <tr key={indexOfFirstRecord + index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {timePeriod === 'daily' && format(new Date(report.period), 'MMM dd, yyyy')}
                      {timePeriod === 'weekly' && `Week of ${format(new Date(report.period), 'MMM dd, yyyy')}`}
                      {timePeriod === 'monthly' && format(new Date(report.period), 'MMMM yyyy')}
                    </td>
                    <td className="py-3 px-4 font-medium">${report.sales.toLocaleString()}</td>
                    <td className="py-3 px-4 font-medium text-green-600">${report.totalProfit.toLocaleString()}</td>
                    <td className="py-3 px-4">{report.transactions}</td>
                    <td className="py-3 px-4">${report.avgOrderValue}</td>
                    <td className="py-3 px-4">{report.topProduct || 'N/A'}</td>
                    <td className="py-3 px-4">{report.topCategory || 'N/A'}</td>
                  </tr>
                ))}
                {/* Summary Row */}
                <tr className="border-t-2 border-gray-300 font-bold bg-gray-50">
                  <td className="py-3 px-4">Total</td>
                  <td className="py-3 px-4">${detailedReportData.reduce((sum, report) => sum + report.sales, 0).toLocaleString()}</td>
                  <td className="py-3 px-4 text-green-600">${detailedReportData.reduce((sum, report) => sum + report.totalProfit, 0).toLocaleString()}</td>
                  <td className="py-3 px-4">{detailedReportData.reduce((sum, report) => sum + report.transactions, 0)}</td>
                  <td className="py-3 px-4">
                    ${detailedReportData.length > 0 
                      ? (detailedReportData.reduce((sum, report) => sum + report.sales, 0) / detailedReportData.reduce((sum, report) => sum + report.transactions, 0)).toFixed(2)
                      : '0.00'}
                  </td>
                  <td className="py-3 px-4" colSpan={2}>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, detailedReportData.length)} of {detailedReportData.length} entries
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1
            // Show first, last, current, and nearby pages
            if (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
            ) {
              return (
                <Button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                >
                  {pageNumber}
                </Button>
              )
            }
            
            // Show ellipsis for skipped pages
            if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
              return <span key={pageNumber} className="px-2 py-1">...</span>
            }
            
            return null
          })}
          
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Advanced Sales Trend Chart */}
        <Card className="col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-96 w-full">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    if (timePeriod === 'daily') return format(new Date(value), 'MMM dd')
                    if (timePeriod === 'weekly') return `Week of ${format(new Date(value), 'MMM dd')}`
                    if (timePeriod === 'monthly') {
                      // Monthly data is stored as 'yyyy-MM' format
                      const [year, month] = value.split('-')
                      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                      return format(date, 'MMM yyyy')
                    }
                    return value
                  }}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => {
                        if (name === 'sales') return [`$${value}`, 'Sales']
                        if (name === 'trend') return [`${value}%`, 'Trend']
                        return [value, name]
                      }}
                      labelFormatter={(label) => {
                        if (timePeriod === 'daily') return format(new Date(label), 'MMMM d, yyyy')
                        if (timePeriod === 'weekly') return `Week of ${format(new Date(label), 'MMMM d, yyyy')}`
                        if (timePeriod === 'monthly') {
                          // Monthly data is stored as 'yyyy-MM' format
                          const [year, month] = label.split('-')
                          const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                          return format(date, 'MMMM yyyy')
                        }
                        return label
                      }}
                    />
                  } 
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="sales" 
                  stroke={CHART_COLORS.primary} 
                  fill={CHART_COLORS.primary} 
                  fillOpacity={0.1}
                  name="Sales ($)" 
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="trend" 
                  stroke={CHART_COLORS.secondary} 
                  name="Growth Trend (%)" 
                  strokeWidth={3}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="transactions" 
                  stroke={CHART_COLORS.tertiary} 
                  name="Transactions" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Advanced Category Performance Radar */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-purple-500" />
              Business Performance Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                <PolarGrid strokeOpacity={0.5} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                />
                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value) => [value, 'Score']}
                      labelFormatter={(label) => `Metric: ${label}`}
                    />
                  } 
                />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Advanced Sales by Category */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Category Revenue & Product Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <ComposedChart data={salesByCategoryData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => {
                        if (name === 'value') return [`$${value}`, 'Revenue']
                        if (name === 'products') return [value, 'Products']
                        return [value, name]
                      }}
                    />
                  } 
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar 
                  yAxisId="left"
                  dataKey="value" 
                  name="Revenue ($)"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                >
                  {salesByCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="products" 
                  stroke={CHART_COLORS.secondary} 
                  name="Products" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Advanced Top Selling Products */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5 text-orange-500" />
              Top Products Performance Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <ScatterChart data={topSellingProducts}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  type="number" 
                  dataKey="sales" 
                  name="Units Sold" 
                  label={{ value: 'Units Sold', position: 'insideBottom', offset: -5 }}
                  domain={[0, 'dataMax + 10']}
                />
                <YAxis 
                  type="number" 
                  dataKey="revenue" 
                  name="Revenue ($}" 
                  label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 'dataMax + 100']}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name, item) => {
                        if (name === 'margin') return [`${value}%`, 'Margin'];
                        if (name === 'growth') return [`${value}%`, 'Growth'];
                        if (name === 'profit') return [`$${value}`, 'Profit'];
                        if (name === 'sales') return [value, 'Units Sold'];
                        if (name === 'revenue') return [`$${value}`, 'Revenue'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Product: ${label}`}
                      indicator="dot"
                    />
                  } 
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Scatter 
                  name="Products" 
                  dataKey="margin" 
                  fill={CHART_COLORS.primary}
                  stroke={CHART_COLORS.primary}
                  strokeWidth={1}
                >
                  {topSellingProducts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.growth >= 0 ? CHART_COLORS.secondary : CHART_COLORS.quinary}
                      stroke={entry.growth >= 0 ? CHART_COLORS.secondary : CHART_COLORS.quinary}
                    />
                  ))}
                </Scatter>
                {/* Add reference lines for average values */}
                <ReferenceLine 
                  x={topSellingProducts.length > 0 ? topSellingProducts.reduce((sum, p) => sum + p.sales, 0) / topSellingProducts.length : 0} 
                  stroke={CHART_COLORS.tertiary} 
                  strokeDasharray="3 3" 
                  label={{ value: 'Avg Units', position: 'top', fill: CHART_COLORS.tertiary }}
                />
                <ReferenceLine 
                  y={topSellingProducts.length > 0 ? topSellingProducts.reduce((sum, p) => sum + p.revenue, 0) / topSellingProducts.length : 0} 
                  stroke={CHART_COLORS.tertiary} 
                  strokeDasharray="3 3" 
                  label={{ value: 'Avg Revenue', position: 'right', fill: CHART_COLORS.tertiary }}
                />
                <ReferenceLine 
                  y={topSellingProducts.length > 0 ? topSellingProducts.reduce((sum, p) => sum + p.margin, 0) / topSellingProducts.length : 0} 
                  stroke={CHART_COLORS.secondary} 
                  strokeDasharray="5 5" 
                  label={{ value: 'Avg Margin', position: 'left', fill: CHART_COLORS.secondary }}
                />
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Advanced Inventory Value by Warehouse */}
        <Card className="col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-red-500" />
              Warehouse Inventory Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <BarChart data={inventoryValueByWarehouse}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      formatter={(value, name) => {
                        if (name === 'value') return [`$${value}`, 'Inventory Value']
                        if (name === 'utilization') return [`${value}%`, 'Capacity Utilization']
                        if (name === 'lowStock') return [value, 'Low Stock Items']
                        return [value, name]
                      }}
                    />
                  } 
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar 
                  yAxisId="left"
                  dataKey="value" 
                  name="Inventory Value ($)"
                  fill={CHART_COLORS.quaternary}
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="utilization" 
                  stroke={CHART_COLORS.primary} 
                  name="Capacity Utilization (%)" 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="lowStock" 
                  stroke={CHART_COLORS.quinary} 
                  name="Low Stock Items" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportToCSV} variant="outline" className="gap-2 bg-white hover:bg-gray-50 shadow">
          <Download className="h-4 w-4" />
          Export Advanced Report
        </Button>
      </div>
    </div>
  )
}