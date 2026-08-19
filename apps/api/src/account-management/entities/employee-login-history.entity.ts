import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Employee } from './employee.entity';

@Entity('employee_login_histories')
export class EmployeeLoginHistory {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  employeeId: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @ApiProperty()
  @CreateDateColumn()
  loginTime: Date;
}
