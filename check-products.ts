import { getProducts } from './lib/data-service'

async function checkProducts() {
  try {
    console.log('Checking products and their category references...')
    const products = await getProducts()
    console.log(`Found ${products.length} products:`)
    
    // Show first few products and their category IDs
    products.slice(0, 5).forEach((product, index) => {
      console.log(`${index + 1}. Product: ${product.name}, Category ID: ${product.categoryId}`)
    })
    
    // Check if any products reference the categories you mentioned
    const categoryIds = ['69245de58d7ece66902bf6c7', '69245df18d7ece66902bf6c9', '69245e048d7ece66902bf6cb']
    const matchingProducts = products.filter(product => 
      categoryIds.includes(product.categoryId)
    )
    
    console.log(`\nFound ${matchingProducts.length} products referencing your categories:`)
    matchingProducts.forEach(product => {
      console.log(`- ${product.name} (ID: ${product.id}) references category ${product.categoryId}`)
    })
  } catch (error) {
    console.error('Error checking products:', error)
  }
}

checkProducts()