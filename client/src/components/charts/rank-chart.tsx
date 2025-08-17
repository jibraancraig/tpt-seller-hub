import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface RankChartProps {
  keywords: Array<{
    id: string;
    phrase: string;
    current_rank?: number;
    previous_rank?: number;
    last_checked?: string;
  }>;
}

export default function RankChart({ keywords }: RankChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !keywords || keywords.length === 0) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Generate mock historical data for demonstration
    // In a real app, this would come from the ranks table
    const generateHistoricalData = (keyword: any) => {
      const currentRank = keyword.current_rank || 50;
      const data = [];
      
      // Generate 14 days of mock data
      for (let i = 13; i >= 0; i--) {
        const variation = Math.random() * 10 - 5; // ±5 position variation
        const rank = Math.max(1, Math.min(100, currentRank + variation));
        data.push(rank);
      }
      
      return data;
    };

    // Use first keyword for the chart or show empty state
    const selectedKeyword = keywords[0];
    const historicalData = generateHistoricalData(selectedKeyword);
    
    const labels = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `${selectedKeyword.phrase}`,
            data: historicalData,
            borderColor: 'hsl(142.1, 70.6%, 45.3%)',
            backgroundColor: 'hsl(142.1, 70.6%, 45.3%, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 4,
            pointBackgroundColor: 'hsl(142.1, 70.6%, 45.3%)',
            pointBorderColor: '#fff',
            pointBorderWidth: 1
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
            borderColor: 'hsl(142.1, 70.6%, 45.3%)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Rank: #${Math.round(context.parsed.y)}`;
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
              display: false
            }
          },
          y: {
            reverse: true, // Lower rank numbers are better
            beginAtZero: false,
            min: 1,
            max: 100,
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
                return '#' + value;
              },
              stepSize: 20
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
  }, [keywords]);

  if (!keywords || keywords.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg" data-testid="chart-no-data">
        <div className="text-center">
          <i className="fas fa-chart-line text-2xl text-gray-300 mb-2"></i>
          <p className="text-sm text-gray-500">No rank data</p>
          <p className="text-xs text-gray-400">Add keywords to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 relative" data-testid="rank-chart">
      <canvas ref={chartRef} className="absolute inset-0 w-full h-full"></canvas>
      <div className="absolute top-2 left-2 text-xs text-gray-500">
        {keywords[0]?.phrase}
      </div>
    </div>
  );
}
