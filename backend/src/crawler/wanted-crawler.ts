import { BaseCrawler, CrawledJob } from './base-crawler';

interface WantedJobDetail {
  job: {
    id: number;
    position: string;
    detail: {
      requirements: string;
      main_tasks: string;
      intro: string;
      benefits: string;
      preferred_points: string;
    };
    company: {
      id: number;
      name: string;
      logo_img: { thumb: string };
      industry_name: string;
    };
    address: {
      location: string;
    };
    annual_from: number | null;
    annual_to: number | null;
    skill_tags: { title: string }[];
    due_time: string | null;
  };
}

export class WantedCrawler extends BaseCrawler {
  readonly sourceSite = 'wanted';

  private readonly headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://www.wanted.co.kr/wdlist/518',
  };

  async crawl(): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const jobIds = await this.fetchJobList();
    console.log(`[Wanted] Found ${jobIds.length} job IDs`);

    for (const id of jobIds.slice(0, 50)) {
      try {
        const job = await this.fetchJobDetail(id);
        if (job) jobs.push(job);
        await this.randomDelay();
      } catch (err) {
        console.error(`[Wanted] Failed to fetch job ${id}:`, (err as Error).message);
      }
    }

    console.log(`[Wanted] Successfully crawled ${jobs.length} jobs`);
    return jobs;
  }

  private async fetchJobList(): Promise<number[]> {
    const ids: number[] = [];
    const limit = 20;

    for (let offset = 0; offset < 100; offset += limit) {
      try {
        const url = `https://www.wanted.co.kr/api/v4/jobs?job_sort=job.latest_order&country=kr&job_group_id=518&offset=${offset}&limit=${limit}`;
        const res = await fetch(url, { headers: this.headers });
        if (!res.ok) {
          console.error(`[Wanted] List API returned ${res.status}`);
          break;
        }
        const data = await res.json();
        const jobList = data.data || [];
        if (jobList.length === 0) break;
        for (const item of jobList) ids.push(item.id);
        await this.randomDelay();
      } catch (err) {
        console.error(`[Wanted] List fetch error:`, (err as Error).message);
        break;
      }
    }
    return ids;
  }

  private async fetchJobDetail(id: number): Promise<CrawledJob | null> {
    const url = `https://www.wanted.co.kr/api/v4/jobs/${id}`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) return null;

    const data: WantedJobDetail = await res.json();
    const job = data.job;
    if (!job) return null;

    const description = [
      job.detail?.intro,
      job.detail?.main_tasks,
      job.detail?.requirements,
      job.detail?.preferred_points,
      job.detail?.benefits,
    ].filter(Boolean).join('\n\n');

    const techStacks = (job.skill_tags || []).map(t => t.title);

    return {
      title: job.position,
      company_name: job.company?.name || 'Unknown',
      description,
      salary_min: job.annual_from ? Math.round(job.annual_from / 10000) : undefined,
      salary_max: job.annual_to ? Math.round(job.annual_to / 10000) : undefined,
      location: job.address?.location || '',
      employment_type: '정규직',
      deadline: job.due_time || undefined,
      source_url: `https://www.wanted.co.kr/wd/${id}`,
      source_id: String(id),
      tech_stacks: techStacks,
      company_industry: job.company?.industry_name,
      company_logo_url: job.company?.logo_img?.thumb,
    };
  }
}
