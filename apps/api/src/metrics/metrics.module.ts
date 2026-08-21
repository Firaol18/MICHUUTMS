import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { Booking } from '../bookings/entities/booking.entity';
import { Guide } from '../guides/entities/guide.entity';
import { User } from '../users/entities/user.entity';
import { Tour } from '../tours/entities/tour.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Guide, User, Tour, Expense, Vehicle])],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
