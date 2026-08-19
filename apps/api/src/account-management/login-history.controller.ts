import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeLoginHistory } from './entities/employee-login-history.entity';

@ApiTags('login-history')
@Controller('login-history')
export class LoginHistoryController {
  constructor(
    @InjectRepository(EmployeeLoginHistory)
    private readonly loginHistoryRepository: Repository<EmployeeLoginHistory>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of login history records' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const pageNum = Number(page ?? 1);
    const limitNum = Number(limit ?? 10);
    const skip = (pageNum - 1) * limitNum;

    const queryBuilder = this.loginHistoryRepository.createQueryBuilder('history')
      .leftJoinAndSelect('history.employee', 'employee')
      .orderBy('history.loginTime', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(employee.name) LIKE :search OR LOWER(employee.email) LIKE :search OR LOWER(history.ipAddress) LIKE :search)',
        { search: `%${search.toLowerCase()}%` }
      );
    }

    const [items, total] = await queryBuilder
      .take(limitNum)
      .skip(skip)
      .getManyAndCount();

    return {
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }
}
