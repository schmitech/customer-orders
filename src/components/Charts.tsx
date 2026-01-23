import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { apiService } from '../services/api';
import { OrdersOverTimeData, RevenueByCustomerData, OrderStatusData } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { AlertCircle, Loader2, Info } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts: React.FC = () => {
  const [ordersOverTime, setOrdersOverTime] = useState<OrdersOverTimeData[]>([]);
  const [revenueByCustomer, setRevenueByCustomer] = useState<RevenueByCustomerData[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordersRange, setOrdersRange] = useState<7 | 14 | 30 | 90>(30);
  const [ordersMetric, setOrdersMetric] = useState<'orders' | 'revenue'>('orders');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersTrendError, setOrdersTrendError] = useState<string | null>(null);
  const initialTrendFetched = useRef(false);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setOrdersLoading(true);
        const [ordersData, revenueData, statusData] = await Promise.all([
          apiService.getOrdersOverTime(ordersRange),
          apiService.getRevenueByCustomer(10),
          apiService.getOrderStatusDistribution(),
        ]);

        setOrdersOverTime(ordersData.map(item => ({
          ...item,
          order_count: Number(item.order_count),
          revenue: Number(item.revenue),
        })));
        setRevenueByCustomer(revenueData.map(item => ({
          ...item,
          total_revenue: Number(item.total_revenue),
          order_count: Number(item.order_count),
        })));
        setOrderStatus(statusData.map(item => ({
          ...item,
          count: Number(item.count),
          total_value: Number(item.total_value),
        })));
        setError(null);
        setOrdersTrendError(null);
        initialTrendFetched.current = true;
      } catch (err) {
        setError('Failed to load chart data');
        console.error('Charts data error:', err);
      } finally {
        setLoading(false);
        setOrdersLoading(false);
      }
    };

    fetchChartData();
  }, []);

  useEffect(() => {
    if (!initialTrendFetched.current) {
      return;
    }

    let isMounted = true;

    const fetchOrdersTrend = async () => {
      try {
        setOrdersLoading(true);
        const ordersData = await apiService.getOrdersOverTime(ordersRange);
        if (!isMounted) return;
        setOrdersOverTime(ordersData.map(item => ({
          ...item,
          order_count: Number(item.order_count),
          revenue: Number(item.revenue),
        })));
        setOrdersTrendError(null);
      } catch (err) {
        console.error('Orders over time fetch error:', err);
        setOrdersTrendError('Unable to refresh the trend snapshot right now. Try again in a moment.');
      } finally {
        if (isMounted) {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrdersTrend();

    return () => {
      isMounted = false;
    };
  }, [ordersRange]);

  const ordersLineData = useMemo(() => {
    const labels = ordersOverTime.map(item => formatDate(item.date));
    const isRevenueView = ordersMetric === 'revenue';

    return {
      labels,
      datasets: [
        {
          label: isRevenueView ? 'Revenue' : 'Orders',
          data: ordersOverTime.map(item => isRevenueView ? item.revenue : item.order_count),
          borderColor: isRevenueView ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
          backgroundColor: isRevenueView ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: isRevenueView ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: isRevenueView ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        },
      ],
    };
  }, [ordersOverTime, ordersMetric]);

  // Revenue by customer chart data
  const revenueByCustomerData = {
    labels: revenueByCustomer.map(item => item.name),
    datasets: [
      {
        label: 'Revenue',
        data: revenueByCustomer.map(item => item.total_revenue),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  // Order status chart data
  const orderStatusData = {
    labels: orderStatus.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
    datasets: [
      {
        data: orderStatus.map(item => item.count),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const baseChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }), []);

  const ordersLineOptions = useMemo(() => {
    const isRevenueView = ordersMetric === 'revenue';

    return {
      ...baseChartOptions,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              if (isRevenueView) {
                return formatCurrency(value);
              }
              return value;
            },
          },
        },
      },
      plugins: {
        ...baseChartOptions.plugins,
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const prefix = isRevenueView ? 'Revenue' : 'Orders';
              const value = context.parsed.y;
              return `${prefix}: ${isRevenueView ? formatCurrency(value) : value}`;
            },
          },
        },
      },
    };
  }, [baseChartOptions, ordersMetric]);

  const barChartOptions = useMemo(() => ({
    ...baseChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
    plugins: {
      ...baseChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Revenue: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
  }), [baseChartOptions]);

  const averageOrders = useMemo(() => {
    if (!ordersOverTime.length) return null;
    const totals = ordersOverTime.reduce((acc, item) => {
      acc.orders += item.order_count;
      acc.revenue += item.revenue;
      return acc;
    }, { orders: 0, revenue: 0 });
    const days = ordersOverTime.length;
    return {
      orders: totals.orders / days,
      revenue: totals.revenue / days,
    };
  }, [ordersOverTime]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded-md w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center animate-shake">
        <div className="p-2 bg-red-100 rounded-lg mr-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <span className="text-red-700 font-medium">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Orders over time */}
      <div className="card p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gradient">Orders Over Time</h3>
            <p className="text-sm text-secondary-500">Explore order activity by switching range and focus.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-gray-100 rounded-full p-1">
              {[7, 14, 30, 90].map((range) => (
                <button
                  key={range}
                  onClick={() => setOrdersRange(range as 7 | 14 | 30 | 90)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    ordersRange === range
                      ? 'bg-white shadow text-primary-600'
                      : 'text-secondary-500 hover:text-primary-600'
                  }`}
                >
                  {range}d
                </button>
              ))}
            </div>
            <div className="flex bg-gray-100 rounded-full p-1">
              {['orders', 'revenue'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setOrdersMetric(metric as 'orders' | 'revenue')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                    ordersMetric === metric
                      ? 'bg-white shadow text-primary-600'
                      : 'text-secondary-500 hover:text-primary-600'
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>
        </div>
        {ordersTrendError && (
          <div className="mb-4 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
            {ordersTrendError}
          </div>
        )}
        <div className="h-64 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 relative">
          {ordersOverTime.length > 0 ? (
            <Line data={ordersLineData} options={ordersLineOptions} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-secondary-500 text-sm">
              <Info className="w-5 h-5 mb-2" />
              We need more data before a trend appears for this range.
            </div>
          )}
          {ordersLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          )}
        </div>
        {averageOrders && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-secondary-700">Avg daily orders:</span>
              <span className="text-secondary-900">{averageOrders.orders.toFixed(1)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-secondary-700">Avg daily revenue:</span>
              <span className="text-secondary-900">{formatCurrency(averageOrders.revenue)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by customer */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gradient mb-6">Top 10 Customers by Revenue</h3>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
            <Bar data={revenueByCustomerData} options={barChartOptions} />
          </div>
        </div>

        {/* Order status distribution */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-bold text-gradient mb-6">Order Status Distribution</h3>
          <div className="h-64 bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
            <Pie data={orderStatusData} options={baseChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
