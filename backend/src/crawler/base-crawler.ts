export interface CrawledJob {
  title: string; company_name: string; description: string;
  salary_min?: number; salary_max?: number;
  experience_min?: number; experience_max?: number;
  location: string; employment_type: string; deadline?: string;
  source_url: string; source_id: string; tech_stacks: string[];
  company_industry?: string; company_size?: string; company_logo_url?: string;
}

export abstract class BaseCrawler {
  abstract readonly sourceSite: string;
  abstract crawl(): Promise<CrawledJob[]>;
  protected delay(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }
  protected randomDelay(): Promise<void> { return this.delay(1000 + Math.random() * 2000); }
}
