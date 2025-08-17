import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    units: number;
    views: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare data for last 30 days
    const sortedData = data.slice(-30);
    const labels = sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: sortedData.map(item => item.revenue),
            borderColor: 'hsl(221.2, 83.2%, 53.3%)',
            backgroundColor: 'hsl(221.2, 83.2%, 53.3%, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: 'hsl(221.2, 83.2%, 53.3%)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'hsl(221.2, 83.2%, 53.3%)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Revenue: $${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            border: {
              display: false
            },
            ticks: {
              maxTicksLimit: 7,
              color: 'hsl(215.4, 16.3%, 46.9%)'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'hsl(214.3, 31.8%, 91.4%)',
              drawBorder: false
            },
            border: {
              display: false
            },
            ticks: {
              color: 'hsl(215.4, 16.3%, 46.9%)',
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        hover: {
          mode: 'nearest',
          intersect: false
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg" data-testid="chart-no-data">
        <div className="text-center">
          <i className="fas fa-chart-line text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No revenue data available</p>
          <p className="text-sm text-gray-400">Upload sales data to see your revenue trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 relative" data-testid="revenue-chart">
      <canvas ref={chartRef} className="absolute inset-0 w-full h-full"></canvas>
    </div>
  );
}
