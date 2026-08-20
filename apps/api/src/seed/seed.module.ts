import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Tour } from '../tours/entities/tour.entity';
import { Event } from '../events/entities/event.entity';
import { BlogPost } from '../blog/entities/blog-post.entity';
import { Enquiry } from '../enquiries/entities/enquiry.entity';
import { Issue } from '../issues/entities/issue.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Guide } from '../guides/entities/guide.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, Tour, Event, BlogPost, Enquiry, Issue,
      Supplier, Driver, Vehicle, Payment, Expense, Guide, Booking,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
