import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmployeeLoginHistory } from './entities/employee-login-history.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmployeeLoginHistory)
    private readonly loginHistoryRepository: Repository<EmployeeLoginHistory>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email },
    });
    if (existing) {
      throw new BadRequestException('Employee with this email already exists');
    }

    const employee = this.employeeRepository.create(createEmployeeDto);
    const saved = await this.employeeRepository.save(employee);

    // Create a dummy login history entry so the dashboard has active history immediately
    const loginHistory = this.loginHistoryRepository.create({
      employeeId: saved.id,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });
    await this.loginHistoryRepository.save(loginHistory);

    return this.findOne(saved.id);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    isActive?: boolean;
    roleId?: number;
  }) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const queryBuilder = this.employeeRepository.createQueryBuilder('employee')
      .leftJoinAndSelect('employee.role', 'role')
      .orderBy('employee.id', 'DESC');

    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(employee.name) LIKE :search OR LOWER(employee.email) LIKE :search OR LOWER(employee.phone) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` }
      );
    }

    if (query.department) {
      queryBuilder.andWhere('employee.department = :department', { department: query.department });
    }

    if (query.isActive !== undefined) {
      const activeVal = String(query.isActive) === 'true';
      queryBuilder.andWhere('employee.isActive = :isActive', { isActive: activeVal });
    }

    if (query.roleId) {
      queryBuilder.andWhere('employee.roleId = :roleId', { roleId: Number(query.roleId) });
    }

    const [items, total] = await queryBuilder
      .take(limit)
      .skip(skip)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existing = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });
      if (existing) {
        throw new BadRequestException('Employee with this email already exists');
      }
    }

    this.employeeRepository.merge(employee, updateEmployeeDto);
    await this.employeeRepository.save(employee);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.remove(employee);
  }
}
