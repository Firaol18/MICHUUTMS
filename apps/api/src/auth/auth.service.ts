import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from './mail.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  // ── Helpers ────────────────────────────────────────────────────────────────

  private generateSecureToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }

  private buildTokenPair(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: ACCESS_TOKEN_EXPIRY }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh-fallback',
      }),
    };
  }

  // ── Register ───────────────────────────────────────────────────────────────

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.getUserByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const user = await this.usersService.createUser(dto);

    // Generate email verification token
    const rawToken = this.generateSecureToken();
    const hashed = await this.hashToken(rawToken);
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await this.usersRepo.update(user.id, {
      emailVerificationToken: hashed,
      emailVerificationExpiry: expiry,
      emailVerified: false,
    });

    // Send verification email (non-blocking)
    this.mailService.sendEmailVerification(user.email, user.name, rawToken).catch(() => {});

    const { password, ...safe } = user as any;
    const { accessToken, refreshToken } = this.buildTokenPair(user.id, user.email);
    const hashedRefresh = await this.hashToken(refreshToken);
    await this.usersRepo.update(user.id, { refreshToken: hashedRefresh });

    return {
      user: { ...safe, emailVerified: false },
      accessToken,
      refreshToken, // caller sets this in HttpOnly cookie
    };
  }

  // ── Login ──────────────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const cleanEmail = (dto.email || '').toLowerCase().trim();

    const user = await this.usersRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('LOWER(u.email) = :email', { email: cleanEmail })
      .addSelect('u.password')
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Account lockout check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(
        `Account temporarily locked due to too many failed attempts. Try again in ${remaining} minute${remaining !== 1 ? 's' : ''}.`,
      );
    }

    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(dto.password, user.password).catch(() => false);
      if (!isMatch && dto.password === user.password) {
        isMatch = true;
        const hashed = await bcrypt.hash(dto.password, 10);
        await this.usersRepo.update(user.id, { password: hashed });
      }
    }

    if (!isMatch) {
      const newAttempts = (user.loginAttempts || 0) + 1;
      const updates: Partial<User> = { loginAttempts: newAttempts };

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
        updates.loginAttempts = 0;
        await this.usersRepo.update(user.id, updates);
        throw new ForbiddenException(
          `Too many failed attempts. Your account has been locked for 10 minutes.`,
        );
      }

      await this.usersRepo.update(user.id, updates);
      const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      throw new UnauthorizedException(
        `Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`,
      );
    }

    // Successful login — reset lockout counters
    await this.usersRepo.update(user.id, { loginAttempts: 0, lockUntil: null });

    const { accessToken, refreshToken } = this.buildTokenPair(user.id, user.email);
    const hashedRefresh = await this.hashToken(refreshToken);
    await this.usersRepo.update(user.id, { refreshToken: hashedRefresh });

    const { password, role, ...safe } = user as any;
    const resolvedRole = user.roleName || (role?.name ? role.name.toLowerCase() : 'tourist');
    return {
      user: {
        ...safe,
        role: resolvedRole,
      },
      accessToken,
      access_token: accessToken,
      refreshToken,
    };
  }


  // ── Refresh Tokens ─────────────────────────────────────────────────────────

  async refresh(incomingRefreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(incomingRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'refresh-fallback',
      });
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired. Please log in again.');
    }

    const user = await this.usersRepo.findOne({
      where: { id: payload.sub },
      select: ['id', 'email', 'refreshToken'],
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Session not found. Please log in again.');
    }

    const isMatch = await bcrypt.compare(incomingRefreshToken, user.refreshToken);
    if (!isMatch) {
      // Possible token reuse — invalidate all sessions
      await this.usersRepo.update(user.id, { refreshToken: null });
      throw new UnauthorizedException('Refresh token reuse detected. All sessions invalidated.');
    }

    // Rotate: issue new pair
    const { accessToken, refreshToken: newRefresh } = this.buildTokenPair(user.id, user.email);
    const hashedRefresh = await this.hashToken(newRefresh);
    await this.usersRepo.update(user.id, { refreshToken: hashedRefresh });

    return { accessToken, refreshToken: newRefresh };
  }

  // ── Email Verification ─────────────────────────────────────────────────────

  async verifyEmail(rawToken: string) {
    const users = await this.usersRepo.find({
      select: ['id', 'email', 'emailVerificationToken', 'emailVerificationExpiry', 'emailVerified'],
    });

    let matched: User | null = null;
    for (const u of users) {
      if (u.emailVerified) continue;
      if (!u.emailVerificationToken) continue;
      if (u.emailVerificationExpiry && u.emailVerificationExpiry < new Date()) continue;
      const ok = await bcrypt.compare(rawToken, u.emailVerificationToken);
      if (ok) { matched = u; break; }
    }

    if (!matched) {
      throw new BadRequestException('This verification link is invalid or has expired.');
    }

    await this.usersRepo.update(matched.id, {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    });

    return { success: true, message: 'Email verified successfully! You can now book tours and events.' };
  }

  // ── Forgot Password ────────────────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.usersService.getUserByEmail(email);

    // Always return success to prevent user enumeration
    if (!user) {
      return { success: true, message: 'If that email exists, a reset link has been sent.' };
    }

    const rawToken = this.generateSecureToken();
    const hashed = await this.hashToken(rawToken);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.usersRepo.update(user.id, {
      passwordResetToken: hashed,
      passwordResetExpiry: expiry,
    });

    this.mailService.sendPasswordReset(user.email, user.name, rawToken).catch(() => {});

    return { success: true, message: 'If that email exists, a reset link has been sent.' };
  }

  // ── Reset Password ─────────────────────────────────────────────────────────

  async resetPassword(rawToken: string, newPassword: string) {
    const users = await this.usersRepo.find({
      select: ['id', 'email', 'passwordResetToken', 'passwordResetExpiry'],
    });

    let matched: User | null = null;
    for (const u of users) {
      if (!u.passwordResetToken) continue;
      if (u.passwordResetExpiry && u.passwordResetExpiry < new Date()) continue;
      const ok = await bcrypt.compare(rawToken, u.passwordResetToken);
      if (ok) { matched = u; break; }
    }

    if (!matched) {
      throw new BadRequestException('This reset link is invalid or has expired.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.usersRepo.update(matched.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
      refreshToken: null, // invalidate all sessions
      loginAttempts: 0,
      lockUntil: null,
    });

    return { success: true, message: 'Password reset successfully. Please log in with your new password.' };
  }

  // ── Logout ─────────────────────────────────────────────────────────────────

  async logout(userId?: string) {
    if (userId) {
      await this.usersRepo.update(userId, { refreshToken: null });
    }
    return { success: true, message: 'Logged out successfully.' };
  }
}
