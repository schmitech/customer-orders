import React, { useState, useEffect, useMemo } from 'react';
import { DashboardMetrics, Order, OrdersOverTimeData } from '../types';
import { apiService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertCircle,
  Package,
  DollarSign,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  UserPlus,
  Target,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Line } from 'react-chartjs-2';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersOverTime, setOrdersOverTime] = useState<OrdersOverTimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendRange, setTrendRange] = useState<7 | 14 | 30>(7);

  useEffect(() => {
    let isMounted = true;

    const fetchCoreData = async () => {
      try {
        setLoading(true);
        const [metricsData, ordersData] = await Promise.all([
          apiService.getDashboardMetrics(),
          apiService.getOrders({ page: 1, limit: 5 })
        ]);
        
        if (!isMounted) return;
        setMetrics(metricsData);
        setRecentOrders(ordersData.orders);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCoreData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTrend = async () => {
      try {
        setTrendLoading(true);
        const chartData = await apiService.getOrdersOverTime(trendRange);
        if (!isMounted) return;
        setOrdersOverTime(chartData);
      } catch (err) {
        console.error('Dashboard trend error:', err);
      } finally {
        if (isMounted) {
          setTrendLoading(false);
        }
      }
    };

    fetchTrend();

    return () => {
      isMounted = false;
    };
  }, [trendRange]);

  const revenueGrowth = 12.5; // Mock data - in real app, calculate from historical data
  const customerGrowth = 8.3; // Mock data

  const ordersTrend = useMemo(() => {
    if (!ordersOverTime.length) return null;
    const sorted = [...ordersOverTime].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first || !last) return null;
    const orderDiff = last.order_count - first.order_count;
    const percentChange = first.order_count === 0 ? 0 : (orderDiff / first.order_count) * 100;
    const totalRevenueWindow = sorted.reduce((acc, day) => acc + day.revenue, 0);
    const projectedMonthlyRevenue = sorted.length
      ? (totalRevenueWindow / sorted.length) * 30
      : 0;
    const bestDay = sorted.reduce((top, current) => {
      if (!top) return current;
      return current.revenue > top.revenue ? current : top;
    }, sorted[0]);

    return {
      orderDiff,
      percentChange,
      projectedMonthlyRevenue,
      bestDay,
    };
  }, [ordersOverTime]);

  const insights = useMemo(() => {
    if (!metrics) {
      if (ordersTrend) {
        return [];
      }

      return [
        {
          icon: Lightbulb,
          tone: 'info' as const,
          title: 'Collecting more signal',
          description: 'We need a few more days of order history before we can surface trend insights. Keep an eye on your performance this week.',
        },
      ];
    }

    const items: Array<{
      icon: React.ComponentType<{ className?: string }>;
      tone: 'positive' | 'warning' | 'info';
      title: string;
      description: string;
    }> = [];

    if (ordersTrend && ordersTrend.percentChange >= 10) {
      items.push({
        icon: Sparkles,
        tone: 'positive',
        title: 'Momentum is building',
        description: `Orders grew ${ordersTrend.percentChange.toFixed(1)}% across the last ${trendRange} days. Keep pushing the current campaigns.`,
      });
    } else if (ordersTrend && ordersTrend.percentChange <= -5) {
      items.push({
        icon: AlertTriangle,
        tone: 'warning',
        title: 'Order volume softened',
        description: `Orders dipped ${Math.abs(ordersTrend.percentChange).toFixed(1)}% over the last ${trendRange} days. Consider nudging upcoming promotions.`,
      });
    } else if (ordersTrend) {
      items.push({
        icon: Lightbulb,
        tone: 'info',
        title: 'Orders holding steady',
        description: `Order volume is mostly flat versus the start of the ${trendRange}-day window, so this is a good time to experiment.`,
      });
    } else {
      items.push({
        icon: Lightbulb,
        tone: 'info',
        title: 'Collecting more signal',
        description: 'We need a few more days of order history before we can surface trend insights. Keep an eye on your performance this week.',
      });
    }

    if (ordersTrend?.bestDay) {
      items.push({
        icon: TrendingUp,
        tone: 'positive',
        title: 'Top-performing day spotted',
        description: `${formatDate(ordersTrend.bestDay.date)} delivered ${ordersTrend.bestDay.order_count} orders and ${formatCurrency(ordersTrend.bestDay.revenue)} in revenue. Mirror what worked.`,
      });
    }

    const pendingRatio = metrics.pendingOrders / (metrics.totalOrders || 1);
    if (pendingRatio >= 0.25) {
      items.push({
        icon: AlertTriangle,
        tone: 'warning',
        title: 'Fulfillment queue is growing',
        description: `${metrics.pendingOrders} orders are still waiting (${(pendingRatio * 100).toFixed(0)}% of all orders). Triage high-value customers first.`,
      });
    } else {
      items.push({
        icon: Sparkles,
        tone: 'positive',
        title: 'Fulfillment running smooth',
        description: `Only ${metrics.pendingOrders} orders pending (${(pendingRatio * 100).toFixed(0)}% of the total). Great job keeping customers happy!`,
      });
    }

    return items.slice(0, 3);
  }, [metrics, ordersTrend, trendRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded-md w-1/2 mb-2"></div>
              <div className="w-12 h-12 bg-gray-200 rounded-full ml-auto"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
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

  if (!metrics) return null;

  // Calculate additional metrics
  const averageOrderValue = metrics.totalRevenue / (metrics.totalOrders || 1);
  const completionRate = ((metrics.totalOrders - metrics.pendingOrders) / (metrics.totalOrders || 1)) * 100;

  const mainMetrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: revenueGrowth,
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtext: `${metrics.pendingOrders} pending`
    },
    {
      title: 'Total Customers',
      value: metrics.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: customerGrowth,
      changeType: 'positive'
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(averageOrderValue),
      icon: DollarSign,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  // Mini chart data for 7-day trend
  const trendChartData = {
    labels: ordersOverTime.map(item => formatDate(item.date)),
    datasets: [{
      data: ordersOverTime.map(item => item.order_count),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 0,
      fill: true,
    }]
  };

  const miniChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="card p-6 hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-secondary-600 mb-2">{metric.title}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-secondary-800 to-secondary-600 bg-clip-text text-transparent">
                    {metric.value}
                  </p>
                  {metric.change && (
                    <div className="flex items-center mt-2">
                      {metric.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}%
                      </span>
                      <span className="text-sm text-secondary-500 ml-1">vs last month</span>
                    </div>
                  )}
                  {metric.subtext && (
                    <p className="text-sm text-secondary-500 mt-2">{metric.subtext}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Completion Rate */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gradient">Order Completion</h3>
            <Target className="w-5 h-5 text-primary-600" />
          </div>
          <div className="relative">
            <div className="text-4xl font-bold text-primary-600">{completionRate.toFixed(1)}%</div>
            <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-sm text-secondary-600 mt-2">
              {metrics.totalOrders - metrics.pendingOrders} of {metrics.totalOrders} orders completed
            </p>
          </div>
        </div>

        {/* 7-Day Order Trend */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gradient">7-Day Trend</h3>
            <div className="flex items-center space-x-2">
              {[7, 14, 30].map((range) => (
                <button
                  key={range}
                  onClick={() => setTrendRange(range as 7 | 14 | 30)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                    trendRange === range
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-secondary-500 hover:bg-gray-200'
                  }`}
                  aria-pressed={trendRange === range}
                >
                  {range}d
                </button>
              ))}
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          <div className="h-24 relative">
            {ordersOverTime.length > 0 ? (
              <Line data={trendChartData} options={miniChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-secondary-500">
                Not enough data for this window yet
              </div>
            )}
            {trendLoading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
              </div>
            )}
          </div>
          <p className="text-sm text-secondary-600 mt-2">
            Orders over the last {trendRange} days
          </p>
        </div>

        {/* Quick Stats */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gradient">Quick Stats</h3>
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">Today's Orders</span>
              <span className="text-sm font-semibold text-secondary-800">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">New Customers</span>
              <span className="text-sm font-semibold text-secondary-800">7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-secondary-600">Avg Processing Time</span>
              <span className="text-sm font-semibold text-secondary-800">2.4 days</span>
            </div>
            {ordersTrend && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Projected Monthly Revenue</span>
                <span className="text-sm font-semibold text-secondary-800">{formatCurrency(ordersTrend.projectedMonthlyRevenue)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const toneStyles = insight.tone === 'positive'
              ? {
                  wrapper: 'bg-green-50 text-green-700 border-green-100',
                  badge: 'bg-green-100 text-green-700'
                }
              : insight.tone === 'warning'
              ? {
                  wrapper: 'bg-orange-50 text-orange-700 border-orange-100',
                  badge: 'bg-orange-100 text-orange-700'
                }
              : {
                  wrapper: 'bg-blue-50 text-blue-700 border-blue-100',
                  badge: 'bg-blue-100 text-blue-700'
                };

            return (
              <div key={`${insight.title}-${index}`} className={`card p-5 border ${toneStyles.wrapper} transition-all duration-300 hover:shadow-lg`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${toneStyles.badge}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-800 mb-1">{insight.title}</p>
                    <p className="text-sm text-secondary-600 leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gradient">Recent Orders</h3>
            <Package className="w-5 h-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="grid grid-cols-3 gap-4 items-start">
                  <div className="col-span-2">
                    <p className="font-semibold text-secondary-900 text-base">#{order.id}</p>
                    <p className="text-sm text-secondary-700 mt-1">{order.customer_name}</p>
                    <p className="text-xs text-secondary-500 mt-1">{formatDate(order.order_date)}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-bold text-primary-600 text-lg">{formatCurrency(order.total)}</p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'completed' ? 'delivered' : order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="p-6 bg-white border border-dashed border-gray-200 rounded-lg text-center">
                <p className="text-sm font-medium text-secondary-700">No recent orders yet</p>
                <p className="text-xs text-secondary-500 mt-1">New sales will land here as soon as they come in.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products/Categories */}
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gradient">Top Categories</h3>
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <div className="space-y-4">
            {[
              { name: 'Electronics', revenue: 45320, orders: 156 },
              { name: 'Clothing', revenue: 38940, orders: 234 },
              { name: 'Home & Garden', revenue: 28760, orders: 189 },
              { name: 'Sports & Outdoors', revenue: 22150, orders: 98 },
              { name: 'Books & Media', revenue: 18430, orders: 167 }
            ].map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-secondary-800">{category.name}</p>
                  <p className="text-sm text-secondary-600">{category.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">{formatCurrency(category.revenue)}</p>
                  <div className="mt-1 bg-gray-200 rounded-full h-1.5 w-24 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                      style={{ width: `${(category.revenue / 45320) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <UserPlus className="w-8 h-8 text-green-600 p-2 bg-green-100 rounded-lg" />
            <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">+15%</span>
          </div>
          <h4 className="text-sm font-medium text-secondary-600">New Customers Today</h4>
          <p className="text-2xl font-bold text-secondary-800 mt-1">12</p>
        </div>

        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-blue-600 p-2 bg-blue-100 rounded-lg" />
            <span className="text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded-full">Weekly</span>
          </div>
          <h4 className="text-sm font-medium text-secondary-600">Active Customers</h4>
          <p className="text-2xl font-bold text-secondary-800 mt-1">342</p>
        </div>

        <div className="card p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-purple-600 p-2 bg-purple-100 rounded-lg" />
            <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full">Top 20%</span>
          </div>
          <h4 className="text-sm font-medium text-secondary-600">VIP Customers</h4>
          <p className="text-2xl font-bold text-secondary-800 mt-1">48</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
