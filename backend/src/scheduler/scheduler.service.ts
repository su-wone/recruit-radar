import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrawlerService } from 'src/crawler/crawler.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  constructor(private readonly crawlerService: CrawlerService) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async handleCrawl() {
    this.logger.log('Starting scheduled crawl...');
    const results = await this.crawlerService.runAll();
    this.logger.log(`Crawl completed: ${JSON.stringify(results)}`);
  }
}
