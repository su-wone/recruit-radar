import { BaseCrawler, CrawledJob } from './base-crawler';

export class WantedCrawler extends BaseCrawler {
  readonly sourceSite = 'wanted';
  async crawl(): Promise<CrawledJob[]> { return []; }
}
