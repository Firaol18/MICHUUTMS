import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from '../tours/entities/tour.entity';
import { Event } from '../events/entities/event.entity';
import { BlogPost } from '../blog/entities/blog-post.entity';
import { Enquiry } from '../enquiries/entities/enquiry.entity';
import { Issue } from '../issues/entities/issue.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tour, Event, BlogPost, Enquiry, Issue]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
