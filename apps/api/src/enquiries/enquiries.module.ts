import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enquiry } from './entities/enquiry.entity';
import { EnquiriesService } from './enquiries.service';
import { EnquiriesController } from './enquiries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Enquiry])],
  providers: [EnquiriesService],
  controllers: [EnquiriesController],
  exports: [EnquiriesService],
})
export class EnquiriesModule {}
