import { 
  Customer, 
  Order, 
  DashboardMetrics, 
  PaginationInfo,
  OrdersOverTimeData,
  RevenueByCustomerData,
  OrderStatusData,
  OrderFilters
} from '../types';

const API_BASE_URL = `http://localhost:${import.meta.env.VITE_PORT || '3001'}/api`;

class ApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.fetchWithErrorHandling<DashboardMetrics>(`${API_BASE_URL}/dashboard`);
  }

  async getCustomers(page: number = 1, limit: number = 10, search: string = ''): Promise<{
    customers: Customer[];
    pagination: PaginationInfo;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    
    return this.fetchWithErrorHandling(`${API_BASE_URL}/customers?${params}`);
  }

  async getOrders(filters: OrderFilters = {}): Promise<{
    orders: Order[];
    pagination: PaginationInfo;
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return this.fetchWithErrorHandling(`${API_BASE_URL}/orders?${params}`);
  }

  async getOrdersOverTime(days: number = 30): Promise<OrdersOverTimeData[]> {
    return this.fetchWithErrorHandling<OrdersOverTimeData[]>(
      `${API_BASE_URL}/charts/orders-over-time?days=${days}`
    );
  }

  async getRevenueByCustomer(limit: number = 10): Promise<RevenueByCustomerData[]> {
    return this.fetchWithErrorHandling<RevenueByCustomerData[]>(
      `${API_BASE_URL}/charts/revenue-by-customer?limit=${limit}`
    );
  }

  async getOrderStatusDistribution(): Promise<OrderStatusData[]> {
    return this.fetchWithErrorHandling<OrderStatusData[]>(`${API_BASE_URL}/charts/order-status`);
  }

  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return this.fetchWithErrorHandling(`${API_BASE_URL}/health`);
  }
}

export const apiService = new ApiService();