import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersMicroController } from './users.micro.controller';
import { User } from './entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Booking]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key-12345',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController, UsersMicroController],
  exports: [UsersService],
})
export class UsersModule {}
