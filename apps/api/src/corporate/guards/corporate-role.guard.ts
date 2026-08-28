import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorporateMember } from '../entities/corporate-member.entity';
import { CorporateRole } from '../enums/corporate.enums';
import { CORPORATE_ROLES_KEY } from '../decorators/corporate-roles.decorator';

/**
 * Validates that the authenticated user has a required corporate role within
 * any active company, or within the company referenced in the route/query params.
 *
 * Must be used AFTER JwtAuthGuard so req.user is populated.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard, CorporateRoleGuard)
 *   @CorporateRoles(CorporateRole.CORPORATE_ADMIN)
 */
@Injectable()
export class CorporateRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(CorporateMember)
    private readonly memberRepo: Repository<CorporateMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CorporateRole[]>(CORPORATE_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are declared, allow all authenticated users through
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.id) {
      throw new UnauthorizedException('Authentication required');
    }

    // Super-admin bypass — system role 'admin' or 'super_admin' skips corporate role check
    const systemRole = (user.roleName || '').toLowerCase();
    if (systemRole === 'admin' || systemRole === 'super_admin') {
      return true;
    }

    // Determine the company context from route params or query
    const companyId =
      request.params?.companyId ||
      request.params?.id ||
      request.query?.companyId ||
      request.body?.companyId;

    // Find all active memberships for this user
    const whereClause: any = { userId: user.id, isActive: true };
    if (companyId) {
      whereClause.companyId = companyId;
    }

    const memberships = await this.memberRepo.find({ where: whereClause });

    if (!memberships.length) {
      throw new ForbiddenException('You are not a member of any corporate account');
    }

    // Check if any membership has one of the required roles
    const hasRole = memberships.some((m) => requiredRoles.includes(m.corporateRole));
    if (!hasRole) {
      throw new ForbiddenException(
        `You need one of the following corporate roles: ${requiredRoles.join(', ')}`,
      );
    }

    // Attach memberships to request for downstream use
    request.corporateMemberships = memberships;

    return true;
  }
}
