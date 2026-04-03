import * as cheerio from 'cheerio';
import { BaseCrawler, CrawledJob } from './base-crawler';

export class SaraminCrawler extends BaseCrawler {
  readonly sourceSite = 'saramin';

  private readonly headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  };

  async crawl(): Promise<CrawledJob[]> {
    const jobs: CrawledJob[] = [];
    const keywords = ['프론트엔드', '백엔드', '풀스택', '개발자'];

    for (const keyword of keywords) {
      try {
        const pageJobs = await this.searchAndParse(keyword);
        console.log(`[Saramin] "${keyword}" → ${pageJobs.length} jobs found`);
        for (const job of pageJobs) {
          if (!jobs.some(j => j.source_id === job.source_id)) jobs.push(job);
        }
        await this.randomDelay();
      } catch (err) {
        console.error(`[Saramin] Failed to search "${keyword}":`, (err as Error).message);
      }
    }

    console.log(`[Saramin] Total unique jobs: ${jobs.length}`);
    return jobs.slice(0, 50);
  }

  private async searchAndParse(keyword: string): Promise<CrawledJob[]> {
    const url = `https://www.saramin.co.kr/zf_user/search/recruit?searchType=search&searchword=${encodeURIComponent(keyword)}&recruitPage=1&recruitSort=relation&recruitPageCount=40`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      console.error(`[Saramin] Search returned ${res.status}`);
      return [];
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const jobs: CrawledJob[] = [];

    $('.item_recruit').each((_, el) => {
      try {
        const $el = $(el);
        const linkHref = $el.find('.job_tit a').attr('href') || '';
        const recIdx = linkHref.match(/rec_idx=(\d+)/)?.[1] || $el.attr('value');
        if (!recIdx) return;

        const title = $el.find('.job_tit a').text().trim();
        const companyName = $el.find('.corp_name a').text().trim();
        if (!title || !companyName) return;

        const conditions: string[] = [];
        $el.find('.job_condition span').each((_, cond) => { conditions.push($(cond).text().trim()); });

        const location = conditions[0] || '';
        const experience = conditions[1] || '';
        const employmentType = conditions[2] || '정규직';

        const deadline = $el.find('.job_date .date').text().trim();

        const techStacks: string[] = [];
        $el.find('.job_sector span').each((_, tag) => {
          const t = $(tag).text().trim();
          if (t && t !== '외' && !/^\d/.test(t) && !t.includes('수정일') && !t.includes('등록일')) techStacks.push(t);
        });

        let experienceMin: number | undefined;
        let experienceMax: number | undefined;
        if (experience.includes('신입')) {
          experienceMin = 0;
        } else {
          const match = experience.match(/(\d+)~?(\d+)?년/);
          if (match) {
            experienceMin = parseInt(match[1]);
            experienceMax = match[2] ? parseInt(match[2]) : undefined;
          }
        }

        jobs.push({
          title,
          company_name: companyName,
          description: title,
          experience_min: experienceMin,
          experience_max: experienceMax,
          location: location.replace(/\s+/g, ' '),
          employment_type: employmentType || '정규직',
          deadline: deadline && !deadline.includes('마감') ? deadline : undefined,
          source_url: `https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=${recIdx}`,
          source_id: String(recIdx),
          tech_stacks: techStacks,
        });
      } catch {
        // Skip malformed entries
      }
    });

    return jobs;
  }
}
