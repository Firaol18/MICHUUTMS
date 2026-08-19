export interface MetricCardData {
  id: string;
  title: string;
  value: string | number;
  changePercent?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  iconName?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
