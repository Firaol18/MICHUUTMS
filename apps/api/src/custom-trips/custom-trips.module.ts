import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomTrip } from './entities/custom-trip.entity';
import { CustomDestination } from './entities/custom-destination.entity';
import { CustomPricingConfig } from './entities/custom-pricing-config.entity';
import { CustomTripsService } from './custom-trips.service';
import { CustomTripsController } from './custom-trips.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomTrip, CustomDestination, CustomPricingConfig])],
  providers: [CustomTripsService],
  controllers: [CustomTripsController],
  exports: [CustomTripsService],
})
export class CustomTripsModule {}
