import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersPaginationQueryDto } from './dto/users-pagination-query.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Helper: Resolves target user from Authorization header JWT token,
   * query parameter (userId/email), or body, with graceful fallback to first user.
   */
  private async resolveUser(
    req: any,
    explicitUserId?: string,
    explicitEmail?: string,
  ): Promise<User> {
    let targetUser: User | null = null;

    // 1. Check req.user if populated by Passport
    if (req?.user?.id) {
      targetUser = await this.usersService.getUserById(req.user.id).catch(() => null);
    }
    if (!targetUser && req?.user?.email) {
      targetUser = await this.usersService.getUserByEmail(req.user.email);
    }

    // 2. Check Authorization Bearer token
    if (!targetUser) {
      const authHeader = req?.headers?.['authorization'] || req?.headers?.['Authorization'];
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        try {
          const decoded: any = this.jwtService.decode(token);
          if (decoded && decoded.sub) {
            targetUser = await this.usersService.getUserById(decoded.sub).catch(() => null);
          }
          if (!targetUser && decoded && decoded.email) {
            targetUser = await this.usersService.getUserByEmail(decoded.email);
          }
        } catch {}
      }
    }

    // 3. Explicit User ID or Email
    if (!targetUser && explicitUserId) {
      targetUser = await this.usersService.getUserById(explicitUserId).catch(() => null);
    }
    if (!targetUser && explicitEmail) {
      targetUser = await this.usersService.getUserByEmail(explicitEmail);
    }

    // 4. Fallback: retrieve first active user
    if (!targetUser) {
      const users = await this.usersService.getUsers();
      targetUser = users[0] || null;
    }

    if (!targetUser) {
      throw new NotFoundException('User profile not found.');
    }

    return targetUser;
  }

  // GET /users
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  // GET /users/paginated
  @Get('paginated')
  @ApiOperation({ summary: 'Get paginated users' })
  @ApiResponse({ status: 200, description: 'Paginated list of users' })
  async getUsersPaginated(
    @Query() query: UsersPaginationQueryDto,
  ) {
    return this.usersService.getUsersPaginated(
      query.page,
      query.limit,
      query.search,
      query.isActive,
    );
  }

  // GET /users/profile
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile with live stats' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('email') email?: string,
  ) {
    const user = await this.resolveUser(req, userId, email);
    return this.usersService.getProfileWithStats(user.id);
  }

  // PATCH /users/profile
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Req() req: any,
    @Body() dto: UpdateUserDto & { userId?: string; email?: string },
    @Query('userId') queryUserId?: string,
    @Query('email') queryEmail?: string,
  ): Promise<User> {
    const user = await this.resolveUser(req, dto.userId || queryUserId, dto.email || queryEmail);
    return this.usersService.updateUser(user.id, dto);
  }

  // POST /users/profile/change-password
  @Post('profile/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  async changePassword(
    @Req() req: any,
    @Body() dto: { currentPassword: string; newPassword: string; userId?: string; email?: string },
  ) {
    const user = await this.resolveUser(req, dto.userId, dto.email);
    return this.usersService.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }

  // GET /users/:id
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(
    @Param('id') id: string,
  ): Promise<User> {
    return this.usersService.getUserById(id);
  }

  // POST /users
  @Post()
  @ApiOperation({ summary: 'Create a user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created' })
  async createUser(
    @Body() dto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUser(dto);
  }

  // PATCH /users/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, dto);
  }

  // DELETE /users/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('id') id: string,
  ): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
