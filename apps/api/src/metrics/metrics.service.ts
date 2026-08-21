import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { Guide } from '../guides/entities/guide.entity';
import { User } from '../users/entities/user.entity';
import { Tour } from '../tours/entities/tour.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(Guide) private guideRepo: Repository<Guide>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tour) private tourRepo: Repository<Tour>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
  ) {}

  async getDashboardMetrics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      todaysBookings,
      pendingBookings,
      confirmedBookings,
      allBookingsThisMonth,
      allExpensesThisMonth,
      upcomingTours,
      activeCustomers,
      allGuides,
      availableVehicles,
    ] = await Promise.all([
      // Today's bookings
      this.bookingRepo.count({ where: { bookingDate: MoreThanOrEqual(todayStart) } }),

      // Pending bookings (awaiting review)
      this.bookingRepo.count({ where: { status: 'pending' } }),

      // Confirmed tours (confirmed + paid + completed)
      this.bookingRepo.count({ where: { status: 'confirmed' } }),

      // Monthly revenue — sum totalPrice for paid/confirmed/completed this month
      this.bookingRepo
        .createQueryBuilder('b')
        .select('COALESCE(SUM(b.totalPrice), 0)', 'total')
        .where('b.bookingDate BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .andWhere("b.status IN ('confirmed', 'paid', 'completed')")
        .getRawOne(),

      // Monthly expenses — sum amounts for this month
      this.expenseRepo
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.amount), 0)', 'total')
        .where('e.date BETWEEN :start AND :end', { start: monthStart.toISOString().split('T')[0], end: monthEnd.toISOString().split('T')[0] })
        .getRawOne()
        .catch(() => ({ total: 0 })),

      // Upcoming tours (departing in next 14 days)
      this.bookingRepo
        .createQueryBuilder('b')
        .where('b.travelDate BETWEEN :start AND :end', {
          start: todayStart.toISOString().split('T')[0],
          end: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        })
        .andWhere("b.status IN ('confirmed', 'paid')")
        .getCount(),

      // Active customers (registered users)
      this.userRepo.count().catch(() => 0),

      // All guides
      this.guideRepo.find(),

      // Available vehicles
      this.vehicleRepo.count({ where: { status: 'available' } }).catch(() => 0),
    ]);

    const monthlyRevenue = Number(allBookingsThisMonth?.total ?? 0);
    const monthlyExpenses = Number(allExpensesThisMonth?.total ?? 0);
    const netProfit = monthlyRevenue - monthlyExpenses;

    const availableGuides = allGuides.filter(
      (g) => g.availabilityStatus === 'Available' || g.status === 'Active',
    ).length;

    return {
      todaysBookings,
      pendingBookings,
      confirmedTours: confirmedBookings,
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyExpenses: Math.round(monthlyExpenses),
      netProfit: Math.round(netProfit),
      upcomingTours,
      activeCustomers,
      availableGuides,
      availableVehicles,
    };
  }
}
