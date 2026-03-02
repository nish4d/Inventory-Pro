import { Category, Warehouse, Product, Sale, Account } from './types'
import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

// Initialize data with default values if collections are empty
export async function initializeData() {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')

    // Check if categories collection exists and is empty
    const categoriesCount = await db.collection('categories').countDocuments()
    if (categoriesCount === 0) {
      const categories: Omit<Category, 'id'>[] = []
      // Only insert if there are categories to insert
      if (categories.length > 0) {
        await db.collection('categories').insertMany(categories)
      }
    }

    // Check if warehouses collection exists and is empty
    const warehousesCount = await db.collection('warehouses').countDocuments()
    if (warehousesCount === 0) {
      const warehouses: Omit<Warehouse, 'id'>[] = []
      // Only insert if there are warehouses to insert
      if (warehouses.length > 0) {
        await db.collection('warehouses').insertMany(warehouses)
      }
    }

    // Check if products collection exists and is empty
    const productsCount = await db.collection('products').countDocuments()
    if (productsCount === 0) {
      const products: Omit<Product, 'id'>[] = []
      // Only insert if there are products to insert
      if (products.length > 0) {
        await db.collection('products').insertMany(products)
      }
    }

    // Check if sales collection exists and is empty
    const salesCount = await db.collection('sales').countDocuments()
    if (salesCount === 0) {
      const sales: Omit<Sale, 'id'>[] = []
      // Only insert if there are sales to insert
      if (sales.length > 0) {
        await db.collection('sales').insertMany(sales)
      }
    }

    // Check if accounts collection exists and is empty
    const accountsCount = await db.collection('accounts').countDocuments()
    if (accountsCount === 0) {
      const defaultAccount = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // Default password
        role: 'admin',
        createdAt: new Date().toISOString()
      }
      
      await db.collection('accounts').insertOne(defaultAccount)
    }
  } catch (error) {
    console.error('Error initializing data:', error)
  }
}

// Product functions
export async function getProducts(includeArchived = false): Promise<Product[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const query = includeArchived ? {} : { isArchived: { $ne: true } }
    const products = await db.collection('products').find(query).toArray()
    return products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      categoryId: product.categoryId,
      warehouseId: product.warehouseId,
      sku: product.sku,
      barcode: product.barcode,
      purchasePrice: product.purchasePrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      quantity: product.quantity,
      unit: product.unit,
      date: product.date,
      reorderLevel: product.reorderLevel,
      costOfGoodsSold: product.costOfGoodsSold,
      unitsSold: product.unitsSold,
      lastRestockDate: product.lastRestockDate,
      isArchived: product.isArchived
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) })
    if (!product) return null
    return {
      id: product._id.toString(),
      name: product.name,
      categoryId: product.categoryId,
      warehouseId: product.warehouseId,
      sku: product.sku,
      barcode: product.barcode,
      purchasePrice: product.purchasePrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      quantity: product.quantity,
      unit: product.unit,
      date: product.date,
      reorderLevel: product.reorderLevel,
      costOfGoodsSold: product.costOfGoodsSold,
      unitsSold: product.unitsSold,
      lastRestockDate: product.lastRestockDate,
      isArchived: product.isArchived
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return null
  }
}

export async function saveProduct(product: Product) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    if (product.id) {
      // Update existing product
      const { id, ...productData } = product
      await db.collection('products').updateOne(
        { _id: new ObjectId(id) },
        { $set: productData }
      )
    } else {
      // Create new product
      const { id, ...productData } = product
      await db.collection('products').insertOne({
        ...productData,
        createdAt: new Date()
      })
    }
  } catch (error) {
    console.error('Error saving product:', error)
  }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )
  } catch (error) {
    console.error('Error updating product:', error)
  }
}

export async function deleteProduct(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('products').deleteOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error('Error deleting product:', error)
  }
}

export async function permanentlyDeleteProduct(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('products').deleteOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error('Error permanently deleting product:', error)
  }
}

export async function archiveProduct(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: true } }
    )
  } catch (error) {
    console.error('Error archiving product:', error)
  }
}

export async function unarchiveProduct(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('products').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: false } }
    )
  } catch (error) {
    console.error('Error unarchiving product:', error)
  }
}

export async function getArchivedProducts(): Promise<Product[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const products = await db.collection('products').find({ isArchived: true }).toArray()
    return products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      categoryId: product.categoryId,
      warehouseId: product.warehouseId,
      sku: product.sku,
      barcode: product.barcode,
      purchasePrice: product.purchasePrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      quantity: product.quantity,
      unit: product.unit,
      date: product.date,
      reorderLevel: product.reorderLevel,
      costOfGoodsSold: product.costOfGoodsSold,
      unitsSold: product.unitsSold,
      lastRestockDate: product.lastRestockDate,
      isArchived: product.isArchived
    }))
  } catch (error) {
    console.error('Error fetching archived products:', error)
    return []
  }
}

export async function getArchivedProductById(id: string): Promise<Product | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const product = await db.collection('products').findOne({ _id: new ObjectId(id), isArchived: true })
    if (!product) return null
    return {
      id: product._id.toString(),
      name: product.name,
      categoryId: product.categoryId,
      warehouseId: product.warehouseId,
      sku: product.sku,
      barcode: product.barcode,
      purchasePrice: product.purchasePrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      quantity: product.quantity,
      unit: product.unit,
      date: product.date,
      reorderLevel: product.reorderLevel,
      costOfGoodsSold: product.costOfGoodsSold,
      unitsSold: product.unitsSold,
      lastRestockDate: product.lastRestockDate,
      isArchived: product.isArchived
    }
  } catch (error) {
    console.error('Error fetching archived product by ID:', error)
    return null
  }
}

// Sale functions
export async function getSales(includeArchived = false): Promise<Sale[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const query = includeArchived ? {} : { isArchived: { $ne: true } }
    const sales = await db.collection('sales').find(query).toArray()
    return sales.map(sale => ({
      id: sale._id.toString(),
      invoiceNo: sale.invoiceNo,
      date: sale.date,
      productId: sale.productId,
      customer: sale.customer,
      saleType: sale.saleType,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      warehouseId: sale.warehouseId,
      isArchived: sale.isArchived
    }))
  } catch (error) {
    console.error('Error fetching sales:', error)
    return []
  }
}

export async function saveSale(sale: Sale) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    if (sale.id) {
      // Update existing sale
      const { id, ...saleData } = sale
      await db.collection('sales').updateOne(
        { _id: new ObjectId(id) },
        { $set: saleData }
      )
    } else {
      // Create new sale
      const { id, ...saleData } = sale
      await db.collection('sales').insertOne({
        ...saleData,
        createdAt: new Date()
      })
    }
  } catch (error) {
    console.error('Error saving sale:', error)
  }
}

export async function updateSale(id: string, updates: Partial<Sale>) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('sales').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )
  } catch (error) {
    console.error('Error updating sale:', error)
  }
}

export async function archiveSale(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('sales').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: true } }
    )
  } catch (error) {
    console.error('Error archiving sale:', error)
  }
}

export async function unarchiveSale(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('sales').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: false } }
    )
  } catch (error) {
    console.error('Error unarchiving sale:', error)
  }
}

export async function permanentlyDeleteSale(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('sales').deleteOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error('Error permanently deleting sale:', error)
  }
}

export async function getArchivedSales(): Promise<Sale[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const sales = await db.collection('sales').find({ isArchived: true }).toArray()
    return sales.map(sale => ({
      id: sale._id.toString(),
      invoiceNo: sale.invoiceNo,
      date: sale.date,
      productId: sale.productId,
      customer: sale.customer,
      saleType: sale.saleType,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      warehouseId: sale.warehouseId,
      isArchived: sale.isArchived
    }))
  } catch (error) {
    console.error('Error fetching archived sales:', error)
    return []
  }
}

export async function getArchivedSaleById(id: string): Promise<Sale | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const sale = await db.collection('sales').findOne({ _id: new ObjectId(id), isArchived: true })
    if (!sale) return null
    return {
      id: sale._id.toString(),
      invoiceNo: sale.invoiceNo,
      date: sale.date,
      productId: sale.productId,
      customer: sale.customer,
      saleType: sale.saleType,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      paymentStatus: sale.paymentStatus,
      warehouseId: sale.warehouseId,
      isArchived: sale.isArchived
    }
  } catch (error) {
    console.error('Error fetching archived sale by ID:', error)
    return null
  }
}

// Warehouse functions
export async function getWarehouses(includeArchived = false): Promise<Warehouse[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const query = includeArchived ? {} : { isArchived: { $ne: true } }
    const warehouses = await db.collection('warehouses').find(query).toArray()
    return warehouses.map(warehouse => ({
      id: warehouse._id.toString(),
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      address: warehouse.address,
      manager: warehouse.manager,
      phone: warehouse.phone,
      email: warehouse.email,
      capacity: warehouse.capacity,
      used: warehouse.used,
      isArchived: warehouse.isArchived
    }))
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return []
  }
}

export async function saveWarehouse(warehouse: Warehouse) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    if (warehouse.id) {
      // Update existing warehouse
      const { id, ...warehouseData } = warehouse
      await db.collection('warehouses').updateOne(
        { _id: new ObjectId(id) },
        { $set: warehouseData }
      )
    } else {
      // Create new warehouse
      const { id, ...warehouseData } = warehouse
      await db.collection('warehouses').insertOne({
        ...warehouseData,
        createdAt: new Date()
      })
    }
  } catch (error) {
    console.error('Error saving warehouse:', error)
  }
}

export async function archiveWarehouse(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('warehouses').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: true } }
    )
  } catch (error) {
    console.error('Error archiving warehouse:', error)
  }
}

export async function unarchiveWarehouse(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('warehouses').updateOne(
      { _id: new ObjectId(id) },
      { $set: { isArchived: false } }
    )
  } catch (error) {
    console.error('Error unarchiving warehouse:', error)
  }
}

export async function permanentlyDeleteWarehouse(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    await db.collection('warehouses').deleteOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error('Error permanently deleting warehouse:', error)
  }
}

export async function getArchivedWarehouses(): Promise<Warehouse[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const warehouses = await db.collection('warehouses').find({ isArchived: true }).toArray()
    return warehouses.map(warehouse => ({
      id: warehouse._id.toString(),
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      address: warehouse.address,
      manager: warehouse.manager,
      phone: warehouse.phone,
      email: warehouse.email,
      capacity: warehouse.capacity,
      used: warehouse.used,
      isArchived: warehouse.isArchived
    }))
  } catch (error) {
    console.error('Error fetching archived warehouses:', error)
    return []
  }
}

export async function getArchivedWarehouseById(id: string): Promise<Warehouse | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const warehouse = await db.collection('warehouses').findOne({ _id: new ObjectId(id), isArchived: true })
    if (!warehouse) return null
    return {
      id: warehouse._id.toString(),
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      address: warehouse.address,
      manager: warehouse.manager,
      phone: warehouse.phone,
      email: warehouse.email,
      capacity: warehouse.capacity,
      used: warehouse.used,
      isArchived: warehouse.isArchived
    }
  } catch (error) {
    console.error('Error fetching archived warehouse by ID:', error)
    return null
  }
}

export async function getWarehouseById(id: string): Promise<Warehouse | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const warehouse = await db.collection('warehouses').findOne({ _id: new ObjectId(id) })
    if (!warehouse) return null
    return {
      id: warehouse._id.toString(),
      name: warehouse.name,
      code: warehouse.code,
      location: warehouse.location,
      address: warehouse.address,
      manager: warehouse.manager,
      phone: warehouse.phone,
      email: warehouse.email,
      capacity: warehouse.capacity,
      used: warehouse.used,
      isArchived: warehouse.isArchived
    }
  } catch (error) {
    console.error('Error fetching warehouse by ID:', error)
    return null
  }
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const categories = await db.collection('categories').find({}).toArray()
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function saveCategory(category: Category) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    // Only allow creating new categories, not updating existing ones
    // Create new category with id field (custom format)
    const newId = new ObjectId().toString();
    const newCategory = {
      id: newId,
      name: category.name,
      color: category.color,
      icon: category.icon,
      createdAt: new Date()
    }
    
    await db.collection('categories').insertOne(newCategory)
    // Return the new category with its ID
    return { ...category, id: newId };
  } catch (error) {
    console.error('Error saving category:', error)
    throw error;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    if (!id) return null

    const client = await clientPromise
    const db = client.db('inventorydb')

    // Find by the custom `id` field (which is what we use for categories)
    const category = await db.collection('categories').findOne({ id: id })

    if (!category) return null

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon
    }
  } catch (error) {
    console.error('Error fetching category by ID:', error)
    return null
  }
}

// Add this new function for deleting categories
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    // Delete the category regardless of whether products are using it
    const result = await db.collection('categories').deleteOne({ id: id })
    return result.deletedCount > 0
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    const result = await db.collection('categories').updateOne(
      { id: id },
      { $set: updates }
    )
    
    return result.modifiedCount > 0
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Utility functions
export async function getLowStockItems(): Promise<Product[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const products = await db.collection('products').find({
      isArchived: { $ne: true },
      $expr: { $lt: ["$quantity", "$reorderLevel"] }
    }).toArray()
    return products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      categoryId: product.categoryId,
      warehouseId: product.warehouseId,
      sku: product.sku,
      barcode: product.barcode,
      purchasePrice: product.purchasePrice,
      wholesalePrice: product.wholesalePrice,
      retailPrice: product.retailPrice,
      quantity: product.quantity,
      unit: product.unit,
      date: product.date,
      reorderLevel: product.reorderLevel,
      costOfGoodsSold: product.costOfGoodsSold,
      unitsSold: product.unitsSold,
      lastRestockDate: product.lastRestockDate,
      isArchived: product.isArchived
    }))
  } catch (error) {
    console.error('Error fetching low stock items:', error)
    return []
  }
}

export async function getStockTurnover(productId: string): Promise<number> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) })
    if (!product || product.costOfGoodsSold === 0) return 0
    return product.costOfGoodsSold / (product.quantity * product.purchasePrice || 1)
  } catch (error) {
    console.error('Error calculating stock turnover:', error)
    return 0
  }
}

export async function restockProduct(productId: string, quantity: number, costPerUnit: number) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    // Update product quantity
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) })
    if (product) {
      const oldQuantity = product.quantity
      await db.collection('products').updateOne(
        { _id: new ObjectId(productId) },
        { 
          $inc: { quantity: quantity },
          $set: { lastRestockDate: new Date().toISOString().split('T')[0] }
        }
      )
    }
  } catch (error) {
    console.error('Error restocking product:', error)
  }
}

export async function recordSale(sale: Sale) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    // Save the sale
    await saveSale(sale)
    
    // Update product quantity
    const product = await db.collection('products').findOne({ _id: new ObjectId(sale.productId) })
    if (product) {
      await db.collection('products').updateOne(
        { _id: new ObjectId(sale.productId) },
        { 
          $inc: { 
            quantity: -sale.quantity,
            unitsSold: sale.quantity,
            costOfGoodsSold: sale.quantity * product.purchasePrice
          }
        }
      )
    }
  } catch (error) {
    console.error('Error recording sale:', error)
  }
}

// Alert functions
export async function checkLowStockAndGenerateAlerts() {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    // Get all low stock items
    const lowStockItems = await getLowStockItems()
    
    // Get existing unresolved alerts
    const existingAlerts = await db.collection('alerts').find({ 
      type: 'low_stock',
      resolved: { $ne: true }
    }).toArray()
    
    // Create alerts for new low stock items
    for (const item of lowStockItems) {
      // Check if an alert already exists for this product
      const existingAlert = existingAlerts.find(alert => alert.productId === item.id)
      
      if (!existingAlert) {
        // Create a new alert
        const alert = {
          productId: item.id,
          productName: item.name,
          currentQty: item.quantity,
          reorderLevel: item.reorderLevel,
          type: 'low_stock',
          resolved: false,
          createdAt: new Date()
        }
        
        await db.collection('alerts').insertOne(alert)
      }
    }
    
    return lowStockItems.length
  } catch (error) {
    console.error('Error checking low stock items:', error)
    return 0
  }
}

export async function getActiveAlerts() {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const alerts = await db.collection('alerts').find({ 
      type: 'low_stock',
      resolved: { $ne: true }
    }).sort({ createdAt: -1 }).toArray()
    
    return alerts.map(alert => ({
      id: alert._id.toString(),
      productId: alert.productId,
      productName: alert.productName,
      currentQty: alert.currentQty,
      reorderLevel: alert.reorderLevel,
      type: alert.type,
      resolved: alert.resolved,
      createdAt: alert.createdAt
    }))
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return []
  }
}

export async function resolveAlert(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    await db.collection('alerts').updateOne(
      { _id: new ObjectId(id) },
      { $set: { resolved: true, resolvedAt: new Date() } }
    )
    
    return true
  } catch (error) {
    console.error('Error resolving alert:', error)
    return false
  }
}

// Function to be called periodically to check for low stock and generate alerts
export async function runLowStockCheck() {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    // Get all low stock items
    const lowStockItems = await getLowStockItems()
    
    // Get existing unresolved alerts
    const existingAlerts = await db.collection('alerts').find({ 
      type: 'low_stock',
      resolved: { $ne: true }
    }).toArray()
    
    let newAlertsCount = 0
    let resolvedAlertsCount = 0
    
    // Create alerts for new low stock items
    for (const item of lowStockItems) {
      // Check if an alert already exists for this product
      const existingAlert = existingAlerts.find(alert => alert.productId === item.id)
      
      if (!existingAlert) {
        // Create a new alert
        const alert = {
          productId: item.id,
          productName: item.name,
          currentQty: item.quantity,
          reorderLevel: item.reorderLevel,
          type: 'low_stock',
          resolved: false,
          createdAt: new Date()
        }
        
        await db.collection('alerts').insertOne(alert)
        newAlertsCount++
      }
    }
    
    // Resolve alerts for items that are no longer low stock
    for (const alert of existingAlerts) {
      const isStillLowStock = lowStockItems.some(item => item.id === alert.productId)
      
      if (!isStillLowStock) {
        // Resolve the alert
        await db.collection('alerts').updateOne(
          { _id: new ObjectId(alert._id) },
          { $set: { resolved: true, resolvedAt: new Date() } }
        )
        resolvedAlertsCount++
      }
    }
    
    return {
      lowStockItems: lowStockItems.length,
      newAlerts: newAlertsCount,
      resolvedAlerts: resolvedAlertsCount
    }
  } catch (error) {
    console.error('Error running low stock check:', error)
    return {
      lowStockItems: 0,
      newAlerts: 0,
      resolvedAlerts: 0
    }
  }
}

// Account functions
export async function getAccounts(): Promise<Account[]> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const accounts = await db.collection('accounts').find({}).toArray()
    return accounts.map(account => ({
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      password: account.password,
      role: account.role,
      createdAt: account.createdAt
    }))
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return []
  }
}

export async function createAccount(account: Omit<Account, 'id'>): Promise<Account | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    const newAccount = {
      ...account,
      createdAt: new Date().toISOString()
    }
    
    const result = await db.collection('accounts').insertOne(newAccount)
    
    if (result.insertedId) {
      return {
        id: result.insertedId.toString(),
        ...newAccount
      }
    }
    
    return null
  } catch (error) {
    console.error('Error creating account:', error)
    return null
  }
}

export async function updateAccount(id: string, updates: Partial<Account>): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    // Remove id from updates if present
    const { id: _, ...updateData } = updates as any
    
    const result = await db.collection('accounts').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    return result.modifiedCount > 0
  } catch (error) {
    console.error('Error updating account:', error)
    return false
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    
    const result = await db.collection('accounts').deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  } catch (error) {
    console.error('Error deleting account:', error)
    return false
  }
}

export async function getAccountByEmail(email: string): Promise<Account | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const account = await db.collection('accounts').findOne({ email })
    
    if (!account) return null
    
    return {
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      password: account.password,
      role: account.role,
      createdAt: account.createdAt
    }
  } catch (error) {
    console.error('Error fetching account by email:', error)
    return null
  }
}

export async function getAccountById(id: string): Promise<Account | null> {
  try {
    const client = await clientPromise
    const db = client.db('inventorydb')
    const account = await db.collection('accounts').findOne({ _id: new ObjectId(id) })
    
    if (!account) return null
    
    return {
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      password: account.password,
      role: account.role,
      createdAt: account.createdAt
    }
  } catch (error) {
    console.error('Error fetching account by ID:', error)
    return null
  }
}
