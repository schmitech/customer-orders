import React, { useState, useEffect } from 'react';
import { Customer, PaginationInfo } from '../types';
import { apiService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Search, ChevronLeft, ChevronRight, AlertCircle, Users } from 'lucide-react';

const CustomersTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchCustomers = async (page: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      const response = await apiService.getCustomers(page, 10, searchTerm);
      setCustomers(response.customers);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load customers');
      console.error('Customers fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const showInitialSkeleton = loading && customers.length === 0;
  const showEmptyState = !loading && customers.length === 0;

  return (
    <div className="card overflow-hidden" aria-busy={loading}>
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center mb-4 sm:mb-0 group">
            <div className="p-2 bg-primary-100 rounded-lg mr-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gradient">Customers</h3>
          </div>
          <form onSubmit={handleSearch} className="flex">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field rounded-l-lg pl-10"
              />
            </div>
            <button
              type="submit"
              className="btn-primary rounded-l-none rounded-r-lg"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" aria-sort="none">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" aria-sort="none">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" aria-sort="none">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" aria-sort="none">
                Orders
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" aria-sort="none">
                Total Spent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" aria-sort="none">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {showInitialSkeleton &&
              [...Array(5)].map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-6 py-4" colSpan={6}>
                    <div className="h-4 bg-gray-200 rounded-md w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded-md w-1/4"></div>
                  </td>
                </tr>
              ))}
            {!showInitialSkeleton && customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500">ID: {customer.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.city || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{customer.country || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.order_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(customer.total_spent || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(customer.created_at)}
                </td>
              </tr>
            ))}
            {showEmptyState && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center space-y-2 text-secondary-500">
                    <AlertCircle className="w-5 h-5" />
                    <p className="text-sm font-medium">No customers match this view</p>
                    <p className="text-xs">Try adjusting search keywords or filters.</p>
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
            Showing {((pagination.currentPage - 1) * 10) + 1} to{' '}
            {Math.min(pagination.currentPage * 10, pagination.totalCount)} of{' '}
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

export default CustomersTable;
