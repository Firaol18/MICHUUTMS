import { http } from './apiClient';

export interface MonthlyDataPoint {
  month: string;
  revenue: number;
  bookings: number;
  expenses: number;
  profit: number;
  customers: number;
}

export interface DestinationStat {
  name: string;
  region: string;
  bookings: number;
  revenue: number;
  share: number;
  color: string;
}
export type PopularDestination = DestinationStat;

export interface PackageStat {
  title: string;
  category: string;
  bookings: number;
  revenue: string;
  price: string;
  margin: string;
}
export type PopularPackage = PackageStat;

export interface CategoryProfitability {
  category: string;
  revenue: number;
  expenses: number;
  margin: number;
  color: string;
}

export const analyticsService = {
  async getMonthlyRevenue(months = 8): Promise<MonthlyDataPoint[]> {
    const res = await http.get('/analytics/monthly-revenue', { params: { months } });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getPopularDestinations(limit = 5): Promise<DestinationStat[]> {
    const res = await http.get('/analytics/popular-destinations', { params: { limit } });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getPopularPackages(limit = 5): Promise<PackageStat[]> {
    const res = await http.get('/analytics/popular-packages', { params: { limit } });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getProfitability(): Promise<CategoryProfitability[]> {
    const res = await http.get('/analytics/profitability');
    return Array.isArray(res.data) ? res.data : [];
  },
};
