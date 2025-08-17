import Papa from 'papaparse';

export class SalesService {
    constructor() {
        this.expectedColumns = ['date', 'product_title', 'units', 'revenue', 'views'];
    }

    /**
     * Parse and validate CSV sales data
     */
    async parseSalesCSV(csvData, products = []) {
        try {
            // Validate and map CSV data
            const validatedData = [];
            
            for (const row of csvData) {
                const salesRecord = this.validateSalesRow(row, products);
                if (salesRecord) {
                    validatedData.push(salesRecord);
                }
            }

            return validatedData;

        } catch (error) {
            console.error('Error parsing sales CSV:', error);
            throw new Error('Failed to parse sales data');
        }
    }

    /**
     * Validate individual sales row
     */
    validateSalesRow(row, products) {
        // Clean and validate date
        const date = this.parseDate(row.date);
        if (!date) {
            console.warn('Invalid date in row:', row);
            return null;
        }

        // Match product by title
        const productId = this.matchProduct(row.product_title, products);
        if (!productId) {
            console.warn('Could not match product:', row.product_title);
            // Create a placeholder or skip this row
            return null;
        }

        // Parse numeric values
        const units = parseInt(row.units) || 0;
        const revenue = parseFloat(row.revenue) || 0;
        const views = parseInt(row.views) || 0;

        return {
            product_id: productId,
            date: date,
            units: units,
            revenue: revenue,
            views: views
        };
    }

    /**
     * Parse date from various formats
     */
    parseDate(dateString) {
        if (!dateString) return null;

        // Try different date formats
        const formats = [
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
        ];

        const cleanDate = dateString.toString().trim();
        
        try {
            const parsedDate = new Date(cleanDate);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
            }
        } catch (error) {
            console.warn('Could not parse date:', cleanDate);
        }

        return null;
    }

    /**
     * Match product title to existing products
     */
    matchProduct(productTitle, products) {
        if (!productTitle || !products.length) return null;

        const title = productTitle.toString().toLowerCase().trim();

        // Exact match first
        let match = products.find(p => 
            p.title.toLowerCase().trim() === title
        );

        if (match) return match.id;

        // Partial match (contains)
        match = products.find(p => 
            p.title.toLowerCase().includes(title) || 
            title.includes(p.title.toLowerCase())
        );

        if (match) return match.id;

        // Fuzzy match (similar words)
        match = products.find(p => {
            const productWords = p.title.toLowerCase().split(' ');
            const titleWords = title.split(' ');
            
            const commonWords = productWords.filter(word => 
                titleWords.some(titleWord => 
                    titleWord.includes(word) || word.includes(titleWord)
                )
            );

            return commonWords.length >= Math.min(productWords.length, titleWords.length) / 2;
        });

        return match ? match.id : null;
    }

    /**
     * Generate analytics from sales data
     */
    generateAnalytics(salesData) {
        if (!salesData.length) {
            return {
                totalRevenue: 0,
                totalUnits: 0,
                totalViews: 0,
                averageOrderValue: 0,
                conversionRate: 0,
                revenueByMonth: [],
                topProducts: [],
                performanceMetrics: {}
            };
        }

        const totalRevenue = salesData.reduce((sum, sale) => sum + (sale.revenue || 0), 0);
        const totalUnits = salesData.reduce((sum, sale) => sum + (sale.units || 0), 0);
        const totalViews = salesData.reduce((sum, sale) => sum + (sale.views || 0), 0);

        const averageOrderValue = totalUnits > 0 ? totalRevenue / totalUnits : 0;
        const conversionRate = totalViews > 0 ? (totalUnits / totalViews) * 100 : 0;

        // Group by month for trend analysis
        const revenueByMonth = this.groupByMonth(salesData);

        // Product performance analysis
        const topProducts = this.analyzeProductPerformance(salesData);

        return {
            totalRevenue,
            totalUnits,
            totalViews,
            averageOrderValue,
            conversionRate,
            revenueByMonth,
            topProducts,
            performanceMetrics: {
                bestMonth: this.getBestMonth(revenueByMonth),
                topProduct: topProducts[0] || null,
                growthRate: this.calculateGrowthRate(revenueByMonth)
            }
        };
    }

    /**
     * Group sales data by month
     */
    groupByMonth(salesData) {
        const monthlyData = {};

        salesData.forEach(sale => {
            const month = sale.date.substring(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    month,
                    revenue: 0,
                    units: 0,
                    views: 0
                };
            }

            monthlyData[month].revenue += sale.revenue || 0;
            monthlyData[month].units += sale.units || 0;
            monthlyData[month].views += sale.views || 0;
        });

        return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    }

    /**
     * Analyze product performance
     */
    analyzeProductPerformance(salesData) {
        const productPerformance = {};

        salesData.forEach(sale => {
            if (!productPerformance[sale.product_id]) {
                productPerformance[sale.product_id] = {
                    productId: sale.product_id,
                    revenue: 0,
                    units: 0,
                    views: 0,
                    salesCount: 0
                };
            }

            const perf = productPerformance[sale.product_id];
            perf.revenue += sale.revenue || 0;
            perf.units += sale.units || 0;
            perf.views += sale.views || 0;
            perf.salesCount++;
        });

        // Calculate derived metrics and sort by revenue
        return Object.values(productPerformance)
            .map(perf => ({
                ...perf,
                averageOrderValue: perf.units > 0 ? perf.revenue / perf.units : 0,
                conversionRate: perf.views > 0 ? (perf.units / perf.views) * 100 : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }

    getBestMonth(monthlyData) {
        if (!monthlyData.length) return null;
        return monthlyData.reduce((best, current) => 
            current.revenue > best.revenue ? current : best
        );
    }

    calculateGrowthRate(monthlyData) {
        if (monthlyData.length < 2) return 0;

        const firstMonth = monthlyData[0];
        const lastMonth = monthlyData[monthlyData.length - 1];

        if (firstMonth.revenue === 0) return 0;

        return ((lastMonth.revenue - firstMonth.revenue) / firstMonth.revenue) * 100;
    }

    /**
     * Export analytics data to various formats
     */
    exportAnalytics(analyticsData, format = 'csv') {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(analyticsData);
            case 'json':
                return JSON.stringify(analyticsData, null, 2);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    exportToCSV(analyticsData) {
        let csvContent = 'Metric,Value\n';
        
        csvContent += `Total Revenue,${analyticsData.totalRevenue}\n`;
        csvContent += `Total Units,${analyticsData.totalUnits}\n`;
        csvContent += `Total Views,${analyticsData.totalViews}\n`;
        csvContent += `Average Order Value,${analyticsData.averageOrderValue.toFixed(2)}\n`;
        csvContent += `Conversion Rate,${analyticsData.conversionRate.toFixed(2)}%\n`;

        if (analyticsData.revenueByMonth.length > 0) {
            csvContent += '\n\nMonthly Revenue\n';
            csvContent += 'Month,Revenue,Units,Views\n';
            analyticsData.revenueByMonth.forEach(month => {
                csvContent += `${month.month},${month.revenue},${month.units},${month.views}\n`;
            });
        }

        return csvContent;
    }

    /**
     * Validate CSV structure
     */
    validateCSVStructure(csvData) {
        if (!csvData || !csvData.length) {
            throw new Error('CSV file is empty');
        }

        const firstRow = csvData[0];
        const hasRequiredColumns = this.expectedColumns.every(col => 
            firstRow.hasOwnProperty(col)
        );

        if (!hasRequiredColumns) {
            const availableColumns = Object.keys(firstRow);
            throw new Error(`CSV missing required columns. Expected: ${this.expectedColumns.join(', ')}. Found: ${availableColumns.join(', ')}`);
        }

        return true;
    }
}

// Export functions for direct use
export async function parseSalesCSV(csvData, products) {
    const salesService = new SalesService();
    return await salesService.parseSalesCSV(csvData, products);
}

export function generateSalesAnalytics(salesData) {
    const salesService = new SalesService();
    return salesService.generateAnalytics(salesData);
}

export function validateSalesCSV(csvData) {
    const salesService = new SalesService();
    return salesService.validateCSVStructure(csvData);
}

// Export singleton instance
export const salesService = new SalesService();
