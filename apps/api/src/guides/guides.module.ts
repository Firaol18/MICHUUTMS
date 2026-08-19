import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guide } from './entities/guide.entity';
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guide])],
  providers: [GuidesService],
  controllers: [GuidesController],
  exports: [GuidesService],
})
export class GuidesModule {}
