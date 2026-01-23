import React, { useState, useEffect, useMemo } from 'react';
import { Order, PaginationInfo, OrderFilters } from '../types';
import { apiService } from '../services/api';
import { formatCurrency, formatDate, getStatusColor, capitalizeFirst } from '../utils/formatters';
import { Filter, ChevronLeft, ChevronRight, AlertCircle, ShoppingCart, Search, X, RefreshCw } from 'lucide-react';

const OrdersTable: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 250);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const fetchOrders = async (newFilters: OrderFilters) => {
    try {
      setLoading(true);
      const response = await apiService.getOrders(newFilters);
      setOrders(response.orders);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof OrderFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when changing filters
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const displayedOrders = useMemo(() => {
    if (!debouncedSearch) return orders;

    return orders.filter((order) => {
      const idMatch = `#${order.id}`.includes(debouncedSearch);
      const nameMatch = order.customer_name?.toLowerCase().includes(debouncedSearch);
      const emailMatch = order.customer_email?.toLowerCase().includes(debouncedSearch);
      return idMatch || nameMatch || emailMatch;
    });
  }, [orders, debouncedSearch]);

  const statusSummary = useMemo(() => {
    const summary: Record<string, number> = {
      all: orders.length,
      pending: 0,
      processing: 0,
      completed: 0,
      shipped: 0,
      cancelled: 0,
    };

    orders.forEach((order) => {
      summary[order.status] = (summary[order.status] || 0) + 1;
    });

    return summary;
  }, [orders]);

  const activePageSize = filters.limit || 10;

  if (loading && orders.length === 0) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-md w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-md"></div>
            ))}
          </div>
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

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center mb-4 sm:mb-0 group">
            <div className="p-2 bg-primary-100 rounded-lg mr-3 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gradient">Orders</h3>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, customer, or email"
                className="input-field pl-9 pr-8 w-full sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-xs font-medium text-secondary-500 uppercase tracking-wide">Page size</label>
              <select
                id="page-size"
                value={activePageSize}
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
                className="input-field h-9 w-24"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchOrders(filters)}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-secondary-500 mt-2">Search filters this page. Use advanced filters to query the API and update results.</p>

        {showFilters && (
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date || ''}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.end_date || ''}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'All', value: undefined },
            { key: 'pending', label: 'Pending', value: 'pending' },
            { key: 'processing', label: 'Processing', value: 'processing' },
            { key: 'completed', label: 'Completed', value: 'completed' },
            { key: 'shipped', label: 'Shipped', value: 'shipped' },
            { key: 'cancelled', label: 'Cancelled', value: 'cancelled' },
          ].map((statusChip) => {
            if (statusChip.key !== 'processing' && statusChip.key !== 'all' && !(statusChip.key in statusSummary)) {
              return null;
            }

            const count = statusChip.key === 'all'
              ? statusSummary.all
              : statusSummary[statusChip.key] || 0;

            if (statusChip.key === 'processing' && count === 0) {
              return null;
            }

            const isActive = statusChip.value ? filters.status === statusChip.value : !filters.status;

            return (
              <button
                key={statusChip.key}
                onClick={() => handleFilterChange('status', statusChip.value || '')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                    : 'border-gray-200 text-secondary-500 hover:border-primary-200 hover:text-primary-600'
                }`}
              >
                <span>{statusChip.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-secondary-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-sm text-gray-500">{order.customer_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(order.order_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {capitalizeFirst(order.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.payment_method ? capitalizeFirst(order.payment_method.replace('_', ' ')) : 'N/A'}
                </td>
              </tr>
            ))}
            {displayedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center space-y-2 text-secondary-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">No orders match this view</p>
                    {debouncedSearch ? (
                      <p className="text-xs">Try loosening your search keywords or adjusting filters.</p>
                    ) : (
                      <p className="text-xs">Adjust the filters above to explore different segments.</p>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * activePageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * activePageSize, pagination.totalCount)} of{' '}
            {pagination.totalCount} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
