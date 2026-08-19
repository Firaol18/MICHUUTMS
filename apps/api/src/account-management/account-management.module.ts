import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { PermissionResource } from './entities/permission-resource.entity';
import { PermissionAction } from './entities/permission-action.entity';
import { RolePermissionResource } from './entities/role-permission-resource.entity';
import { RolePermissionResourceAction } from './entities/role-permission-resource-action.entity';
import { Employee } from './entities/employee.entity';
import { ServiceAccount } from './entities/service-account.entity';
import { EmployeeLoginHistory } from './entities/employee-login-history.entity';

import { RoleService } from './role.service';
import { EmployeeService } from './employee.service';
import { ServiceAccountService } from './service-account.service';
import { PermissionService } from './permission.service';

import { RoleController } from './role.controller';
import { EmployeeController } from './employee.controller';
import { ServiceAccountController } from './service-account.controller';
import { PermissionController } from './permission.controller';
import { LoginHistoryController } from './login-history.controller';

import { AccountManagementSeeder } from './account-management.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      PermissionResource,
      PermissionAction,
      RolePermissionResource,
      RolePermissionResourceAction,
      Employee,
      ServiceAccount,
      EmployeeLoginHistory,
    ]),
  ],
  providers: [
    RoleService,
    EmployeeService,
    ServiceAccountService,
    PermissionService,
    AccountManagementSeeder,
  ],
  controllers: [
    RoleController,
    EmployeeController,
    ServiceAccountController,
    PermissionController,
    LoginHistoryController,
  ],
  exports: [
    RoleService,
    EmployeeService,
    ServiceAccountService,
    PermissionService,
  ],
})
export class AccountManagementModule {}
