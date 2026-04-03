import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting, Company, TechStack, TechCategory, CrawlLog, CrawlStatus, SourceSite, EmploymentType } from 'src/entities';
import { CrawledJob, BaseCrawler } from './base-crawler';
import { WantedCrawler } from './wanted-crawler';
import { SaraminCrawler } from './saramin-crawler';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private crawlers: BaseCrawler[];

  constructor(
    @InjectRepository(JobPosting) private readonly jobRepo: Repository<JobPosting>,
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    @InjectRepository(TechStack) private readonly techStackRepo: Repository<TechStack>,
    @InjectRepository(CrawlLog) private readonly crawlLogRepo: Repository<CrawlLog>,
  ) {
    this.crawlers = [new WantedCrawler(), new SaraminCrawler()];
  }

  async runAll() {
    const results = [];
    for (const crawler of this.crawlers) results.push(await this.runOne(crawler));
    return results;
  }

  async runOne(crawler: BaseCrawler) {
    const startedAt = new Date();
    let newAdded = 0, updated = 0, totalFound = 0;
    try {
      const jobs = await crawler.crawl();
      totalFound = jobs.length;
      for (const job of jobs) {
        const result = await this.saveJob(job, crawler.sourceSite);
        if (result.isNew) newAdded++; else updated++;
      }
      const log = this.crawlLogRepo.create({ source_site: crawler.sourceSite as SourceSite, status: CrawlStatus.SUCCESS, total_found: totalFound, new_added: newAdded, updated, started_at: startedAt, finished_at: new Date() });
      await this.crawlLogRepo.save(log);
      return { source: crawler.sourceSite, status: 'success', totalFound, newAdded, updated };
    } catch (error) {
      const log = this.crawlLogRepo.create({ source_site: crawler.sourceSite as SourceSite, status: CrawlStatus.FAILED, total_found: totalFound, new_added: newAdded, updated, error_message: (error as Error).message, started_at: startedAt, finished_at: new Date() });
      await this.crawlLogRepo.save(log);
      this.logger.error(`Crawl failed for ${crawler.sourceSite}: ${(error as Error).message}`);
      return { source: crawler.sourceSite, status: 'failed', error: (error as Error).message };
    }
  }

  async saveJob(crawledJob: CrawledJob, sourceSite: string): Promise<{ isNew: boolean }> {
    let company = await this.companyRepo.findOne({ where: { name: crawledJob.company_name } });
    if (!company) {
      company = this.companyRepo.create({ name: crawledJob.company_name, industry: crawledJob.company_industry, size: crawledJob.company_size, logo_url: crawledJob.company_logo_url });
      company = await this.companyRepo.save(company);
    }
    const techStacks: TechStack[] = [];
    for (const stackName of crawledJob.tech_stacks) {
      let ts = await this.techStackRepo.findOne({ where: { name: stackName } });
      if (!ts) { ts = this.techStackRepo.create({ name: stackName, category: TechCategory.FRAMEWORK }); ts = await this.techStackRepo.save(ts); }
      techStacks.push(ts);
    }
    const existing = await this.jobRepo.findOne({ where: { source_site: sourceSite as SourceSite, source_id: crawledJob.source_id } });
    if (existing) {
      Object.assign(existing, { title: crawledJob.title, description: crawledJob.description, salary_min: crawledJob.salary_min ?? null, salary_max: crawledJob.salary_max ?? null, experience_min: crawledJob.experience_min ?? null, experience_max: crawledJob.experience_max ?? null, location: crawledJob.location, deadline: crawledJob.deadline ?? null, tech_stacks: techStacks });
      await this.jobRepo.save(existing);
      return { isNew: false };
    }
    const employmentMap: Record<string, EmploymentType> = { '정규직': EmploymentType.FULL_TIME, '계약직': EmploymentType.CONTRACT, '인턴': EmploymentType.INTERN };
    const job = this.jobRepo.create({ title: crawledJob.title, description: crawledJob.description, salary_min: crawledJob.salary_min, salary_max: crawledJob.salary_max, experience_min: crawledJob.experience_min, experience_max: crawledJob.experience_max, location: crawledJob.location, employment_type: employmentMap[crawledJob.employment_type] || EmploymentType.FULL_TIME, deadline: crawledJob.deadline, source_url: crawledJob.source_url, source_site: sourceSite as SourceSite, source_id: crawledJob.source_id, company, tech_stacks: techStacks });
    await this.jobRepo.save(job);
    return { isNew: true };
  }

  async getCrawlLogs() { return this.crawlLogRepo.find({ order: { started_at: 'DESC' }, take: 50 }); }
}
