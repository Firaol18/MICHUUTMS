import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './internal-chat/messages.module';
import { User } from './users/entities/user.entity';
import { Message } from './internal-chat/entities/message.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AccountManagementModule } from './account-management/account-management.module';
import { ToursModule } from './tours/tours.module';
import { BookingsModule } from './bookings/bookings.module';
import { EventsModule } from './events/events.module';
import { BlogModule } from './blog/blog.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { IssuesModule } from './issues/issues.module';
import { CustomTripsModule } from './custom-trips/custom-trips.module';
import { SeedModule } from './seed/seed.module';

import { GuidesModule } from './guides/guides.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ExpensesModule } from './expenses/expenses.module';
import { PaymentsModule } from './payments/payments.module';

const useDatabaseUrl = !!process.env.DATABASE_URL;

const connectionOptions = useDatabaseUrl
  ? { 
      type: 'postgres' as const,
      url: process.env.DATABASE_URL,
    }
  : {
      type: 'postgres' as const,
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER ?? 'postgres',
      // Do not default to a password value here — prefer explicit env var
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? 'nest_db',
    };

if (!useDatabaseUrl && !process.env.DB_PASSWORD) {
  // eslint-disable-next-line no-console
  console.warn('[Config] DB_PASSWORD is not set; authentication may fail. Set DB_PASSWORD or provide DATABASE_URL.');
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...connectionOptions,
      entities: [User, Message],
      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    UsersModule,
    MessagesModule,
    AuthModule,
    AccountManagementModule,
    ToursModule,
    BookingsModule,
    EventsModule,
    BlogModule,
    EnquiriesModule,
    IssuesModule,
    CustomTripsModule,
    GuidesModule,
    DriversModule,
    VehiclesModule,
    SuppliersModule,
    ExpensesModule,
    PaymentsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}



