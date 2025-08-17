// Sales service for TPT Seller Hub
export const salesService = {
  // Get sales data for a user
  async getSalesData(userId, period = "30d") {
    try {
      // TODO: Implement actual sales data fetching
      return this.getStubSalesData(userId, period)
    } catch (error) {
      console.error("Error fetching sales data:", error)
      throw error
    }
  },

  // Generate stub sales data
  getStubSalesData(userId, period) {
    const today = new Date()
    const sales = []

    // Generate sample sales data for the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Generate random sales (more realistic pattern)
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const baseSales = isWeekend ? 2 : 5 // More sales on weekdays
      const randomSales = Math.floor(Math.random() * baseSales)

      if (randomSales > 0) {
        sales.push({
          id: Date.now() + i,
          date: date.toISOString(),
          sales_count: randomSales,
          revenue: parseFloat(
            (randomSales * (Math.random() * 20 + 5)).toFixed(2)
          ),
          products_sold: this.generateRandomProducts(randomSales),
        })
      }
    }

    return sales
  },

  // Generate random product sales
  generateRandomProducts(count) {
    const sampleProducts = [
      "Algebra Task Cards",
      "Geometry Worksheets",
      "Fractions Activities",
      "Reading Comprehension",
      "Science Experiments",
      "Writing Prompts",
      "Math Games",
      "Social Studies Unit",
    ]

    const products = []
    for (let i = 0; i < count; i++) {
      const randomProduct =
        sampleProducts[Math.floor(Math.random() * sampleProducts.length)]
      products.push({
        name: randomProduct,
        price: parseFloat((Math.random() * 20 + 5).toFixed(2)),
        quantity: 1,
      })
    }

    return products
  },

  // Calculate sales metrics
  calculateMetrics(salesData) {
    if (!salesData || salesData.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        bestSellingProduct: null,
        salesTrend: "stable",
      }
    }

    const totalSales = salesData.reduce(
      (sum, sale) => sum + sale.sales_count,
      0
    )
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.revenue, 0)
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Find best selling product
    const productCounts = {}
    salesData.forEach((sale) => {
      sale.products_sold.forEach((product) => {
        productCounts[product.name] =
          (productCounts[product.name] || 0) + product.quantity
      })
    })

    const bestSellingProduct = Object.entries(productCounts).sort(
      ([, a], [, b]) => b - a
    )[0]

    // Calculate sales trend
    const recentSales = salesData
      .slice(-7)
      .reduce((sum, sale) => sum + sale.sales_count, 0)
    const previousSales = salesData
      .slice(-14, -7)
      .reduce((sum, sale) => sum + sale.sales_count, 0)

    let salesTrend = "stable"
    if (recentSales > previousSales * 1.1) salesTrend = "increasing"
    else if (recentSales < previousSales * 0.9) salesTrend = "decreasing"

    return {
      totalSales,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      bestSellingProduct: bestSellingProduct
        ? {
            name: bestSellingProduct[0],
            sales: bestSellingProduct[1],
          }
        : null,
      salesTrend,
    }
  },

  // Import sales from CSV
  async importSalesFromCSV(csvData, userId) {
    try {
      // TODO: Implement CSV parsing and sales import
      showToast("Sales import functionality coming soon", "info")
      return []
    } catch (error) {
      console.error("Error importing sales:", error)
      throw error
    }
  },
}
