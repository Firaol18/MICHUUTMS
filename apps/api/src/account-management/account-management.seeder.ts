import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { PermissionResource } from './entities/permission-resource.entity';
import { PermissionAction } from './entities/permission-action.entity';
import { RolePermissionResource } from './entities/role-permission-resource.entity';
import { RolePermissionResourceAction } from './entities/role-permission-resource-action.entity';
import { Employee } from './entities/employee.entity';
import { ServiceAccount } from './entities/service-account.entity';
import { EmployeeLoginHistory } from './entities/employee-login-history.entity';

@Injectable()
export class AccountManagementSeeder implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(PermissionResource)
    private readonly resourceRepository: Repository<PermissionResource>,
    @InjectRepository(PermissionAction)
    private readonly actionRepository: Repository<PermissionAction>,
    @InjectRepository(RolePermissionResource)
    private readonly rolePermissionResourceRepository: Repository<RolePermissionResource>,
    @InjectRepository(RolePermissionResourceAction)
    private readonly rolePermissionResourceActionRepository: Repository<RolePermissionResourceAction>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(ServiceAccount)
    private readonly serviceAccountRepository: Repository<ServiceAccount>,
    @InjectRepository(EmployeeLoginHistory)
    private readonly loginHistoryRepository: Repository<EmployeeLoginHistory>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const roleCount = await this.roleRepository.count();
    if (roleCount > 0) {
      console.log('[Seeder] Database already contains roles. Skipping seeding.');
      return;
    }

    console.log('[Seeder] Seeding default account management data...');

    const resourcesData = [
      { name: 'Employee', description: 'Access to employee profiles and details', draft: false },
      { name: 'ServiceAccount', description: 'Access to system API service accounts', draft: false },
      { name: 'Role', description: 'Access to roles and RBAC configurations', draft: false },
      { name: 'User', description: 'Access to registered users', draft: false },
      { name: 'PermissionResource', description: 'Access to system resource metadata', draft: false },
      { name: 'PermissionAction', description: 'Access to system action metadata', draft: false },
    ];
    const resources: PermissionResource[] = [];
    for (const data of resourcesData) {
      const res = this.resourceRepository.create(data);
      resources.push(await this.resourceRepository.save(res));
    }

    const actionsData = [
      { action: 'Create', description: 'Create resources', draft: false },
      { action: 'Read', description: 'Read/view resources', draft: false },
      { action: 'Update', description: 'Update resources', draft: false },
      { action: 'Delete', description: 'Delete/remove resources', draft: false },
    ];
    const actions: PermissionAction[] = [];
    for (const data of actionsData) {
      const act = this.actionRepository.create(data);
      actions.push(await this.actionRepository.save(act));
    }

    const superAdminRole = await this.roleRepository.save(
      this.roleRepository.create({
        name: 'Super Admin',
        description: 'Full administrative access to the entire system.',
        is_active: true,
        isLocked: true,
        editable: false,
        switchable: false,
      }),
    );

    const managerRole = await this.roleRepository.save(
      this.roleRepository.create({
        name: 'Manager',
        description: 'Read and update access, but cannot delete sensitive records.',
        is_active: true,
        isLocked: false,
        editable: true,
        switchable: true,
      }),
    );

    const employeeRole = await this.roleRepository.save(
      this.roleRepository.create({
        name: 'Employee',
        description: 'Standard access to view profiles and edit self details.',
        is_active: true,
        isLocked: false,
        editable: true,
        switchable: true,
      }),
    );

    // 5. Seed Role Permissions
    // Super Admin gets all permissions
    for (const res of resources) {
      const rpr = await this.rolePermissionResourceRepository.save(
        this.rolePermissionResourceRepository.create({
          role_id: superAdminRole.id,
          permission_resource_id: res.id,
        }),
      );

      const actionsToSave = actions.map((act) => {
        return this.rolePermissionResourceActionRepository.create({
          role_permission_resource_id: rpr.id,
          permission_action_id: act.id,
        });
      });
      await this.rolePermissionResourceActionRepository.save(actionsToSave);
    }

    // Manager gets Read, Update on Employee, ServiceAccount, User
    const managerTargetResources = ['Employee', 'ServiceAccount', 'User'];
    const managerTargetActions = ['Read', 'Update'];
    for (const res of resources) {
      if (managerTargetResources.includes(res.name)) {
        const rpr = await this.rolePermissionResourceRepository.save(
          this.rolePermissionResourceRepository.create({
            role_id: managerRole.id,
            permission_resource_id: res.id,
          }),
        );

        const actionsToSave = actions
          .filter((act) => managerTargetActions.includes(act.action))
          .map((act) => {
            return this.rolePermissionResourceActionRepository.create({
              role_permission_resource_id: rpr.id,
              permission_action_id: act.id,
            });
          });
        if (actionsToSave.length > 0) {
          await this.rolePermissionResourceActionRepository.save(actionsToSave);
        }
      }
    }

    // Employee gets Read on Employee and User
    for (const res of resources) {
      if (['Employee', 'User'].includes(res.name)) {
        const readAction = actions.find((a) => a.action === 'Read');
        if (readAction) {
          const rpr = await this.rolePermissionResourceRepository.save(
            this.rolePermissionResourceRepository.create({
              role_id: employeeRole.id,
              permission_resource_id: res.id,
            }),
          );

          await this.rolePermissionResourceActionRepository.save(
            this.rolePermissionResourceActionRepository.create({
              role_permission_resource_id: rpr.id,
              permission_action_id: readAction.id,
            }),
          );
        }
      }
    }

    // 6. Seed Employees
    const employeesData = [
      { name: 'Alice Smith', email: 'alice.smith@company.com', phone: '+1-555-0199', department: 'Engineering', roleId: superAdminRole.id, isActive: true },
      { name: 'Bob Jones', email: 'bob.jones@company.com', phone: '+1-555-0142', department: 'Operations', roleId: managerRole.id, isActive: true },
      { name: 'Charlie Miller', email: 'charlie.miller@company.com', phone: '+1-555-0128', department: 'Marketing', roleId: employeeRole.id, isActive: true },
      { name: 'Diana Prince', email: 'diana.prince@company.com', phone: '+1-555-0177', department: 'HR', roleId: managerRole.id, isActive: true },
      { name: 'Evan Wright', email: 'evan.wright@company.com', phone: '+1-555-0185', department: 'Engineering', roleId: employeeRole.id, isActive: false },
    ];
    const employees: Employee[] = [];
    for (const emp of employeesData) {
      employees.push(await this.employeeRepository.save(this.employeeRepository.create(emp)));
    }

    // 7. Seed Service Accounts
    const serviceAccountsData = [
      { name: 'GitHub Actions CI/CD', clientId: 'sa_github_ci_cd', clientSecret: 'sec_git_runner_secret_9988ff', roleId: superAdminRole.id, isActive: true },
      { name: 'Google Analytics Importer', clientId: 'sa_analytics_sync', clientSecret: 'sec_ga_importer_secret_3344cc', roleId: employeeRole.id, isActive: true },
      { name: 'Stripe Webhook Handler', clientId: 'sa_stripe_webhooks', clientSecret: 'sec_stripe_wh_secret_7755aa', roleId: managerRole.id, isActive: true },
    ];
    for (const sa of serviceAccountsData) {
      await this.serviceAccountRepository.save(this.serviceAccountRepository.create(sa));
    }

    // 8. Seed Employee Login History
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];
    const ips = ['192.168.1.50', '203.0.113.195', '198.51.100.12', '127.0.0.1'];

    for (let i = 0; i < 15; i++) {
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
      const randomIp = ips[Math.floor(Math.random() * ips.length)];
      const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
      const loginTime = new Date();
      loginTime.setMinutes(loginTime.getMinutes() - Math.floor(Math.random() * 10000));

      await this.loginHistoryRepository.save(
        this.loginHistoryRepository.create({
          employeeId: randomEmployee.id,
          ipAddress: randomIp,
          userAgent: randomUA,
          loginTime,
        }),
      );
    }

    console.log('[Seeder] Database seeding finished successfully!');
  }
}
