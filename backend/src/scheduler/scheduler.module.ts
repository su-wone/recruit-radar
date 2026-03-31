import { Module } from '@nestjs/common';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [CrawlerModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
