import { SetMetadata } from '@nestjs/common';
import { CorporateRole } from '../enums/corporate.enums';

export const CORPORATE_ROLES_KEY = 'corporateRoles';

/**
 * Restricts a route to users who have at least one of the specified corporate roles
 * within their company context. Works alongside JwtAuthGuard.
 *
 * @example
 * @CorporateRoles(CorporateRole.CORPORATE_ADMIN, CorporateRole.TRAVEL_MANAGER)
 */
export const CorporateRoles = (...roles: CorporateRole[]) =>
  SetMetadata(CORPORATE_ROLES_KEY, roles);
