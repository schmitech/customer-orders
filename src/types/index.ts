export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  created_at: string;
  updated_at: string;
  order_count?: number;
  total_spent?: number;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  order_date: string;
  total: number;
  status: 'pending' | 'completed' | 'shipped' | 'cancelled';
  shipping_address?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  pendingOrders: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface OrdersOverTimeData {
  date: string;
  order_count: number;
  revenue: number;
}

export interface RevenueByCustomerData {
  name: string;
  total_revenue: number;
  order_count: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
  total_value: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface OrderFilters {
  status?: string;
  customer_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}