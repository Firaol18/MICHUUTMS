import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Event } from '../events/entities/event.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ToursModule } from '../tours/tours.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Event]),
    ToursModule,
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
