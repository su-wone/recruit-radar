import { BaseCrawler, CrawledJob } from './base-crawler';

export class SaraminCrawler extends BaseCrawler {
  readonly sourceSite = 'saramin';
  async crawl(): Promise<CrawledJob[]> { return []; }
}
