import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailService } from './mail.service';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    PassportModule.register({}),
    // Access tokens: 15 minutes (short-lived)
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback-secret-key-12345',
      signOptions: { expiresIn: '15m' },
    }),
    // Rate limiting: 60 requests per minute globally (auth endpoints add stricter limits)
    ThrottlerModule.forRoot([{
      name: 'default',
      ttl: 60000,
      limit: 60,
    }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    MailService,
    // Apply throttler globally within this module scope
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule, MailService],
})
export class AuthModule {}
