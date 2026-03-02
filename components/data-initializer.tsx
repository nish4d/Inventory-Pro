// This component runs on the server to initialize data
export async function DataInitializer() {
  try {
    // Dynamically import the data service to avoid bundling MongoDB in client bundles
    const { initializeData, runLowStockCheck } = await import('@/lib/data-service')
    await initializeData()
    // Run low stock check to generate initial alerts
    await runLowStockCheck()
    return <div className="hidden">Data initialized</div>
  } catch (error) {
    console.error('Error initializing data:', error)
    return <div className="hidden">Error initializing data</div>
  }
}