import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

// NOTE: PrismaService is kept for backwards compatibility but this app uses TypeORM as the primary ORM.
// Prisma client types may not be fully generated in this environment.
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // No-op: TypeORM handles DB connections
  }

  async onModuleDestroy() {
    // No-op: TypeORM handles DB disconnections
  }
}
