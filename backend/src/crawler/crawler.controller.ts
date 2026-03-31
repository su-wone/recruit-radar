import { Controller, Get, Post } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

@Controller('crawl')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}
  @Post('trigger') trigger() { return this.crawlerService.runAll(); }
  @Get('logs') getLogs() { return this.crawlerService.getCrawlLogs(); }
}
