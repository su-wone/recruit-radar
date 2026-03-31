import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StatsService {
  constructor(private readonly dataSource: DataSource) {}

  async getTechStackRanking(): Promise<{ name: string; category: string; count: number }[]> {
    const rows = await this.dataSource.query(`
      SELECT ts.name, ts.category, COUNT(jpts."jobPostingsId")::int AS count
      FROM tech_stacks ts
      JOIN job_posting_tech_stacks jpts ON ts.id = jpts."techStacksId"
      JOIN job_postings jp ON jp.id = jpts."jobPostingsId" AND jp.is_active = true
      GROUP BY ts.name, ts.category ORDER BY count DESC LIMIT 20
    `);
    return rows.map((r: any) => ({ name: r.name, category: r.category, count: Number(r.count) }));
  }

  async getExperienceDistribution(): Promise<{ range: string; count: number }[]> {
    const rows = await this.dataSource.query(`
      SELECT CASE
        WHEN experience_min IS NULL OR experience_min = 0 THEN '신입'
        WHEN experience_min <= 3 THEN '1~3년'
        WHEN experience_min <= 5 THEN '3~5년'
        WHEN experience_min <= 10 THEN '5~10년'
        ELSE '10년+' END AS range,
        COUNT(*)::int AS count
      FROM job_postings WHERE is_active = true
      GROUP BY range ORDER BY MIN(COALESCE(experience_min, 0))
    `);
    return rows.map((r: any) => ({ range: r.range, count: Number(r.count) }));
  }

  async getTechStackCombos(): Promise<{ stacks: string[]; count: number }[]> {
    const rows = await this.dataSource.query(`
      SELECT STRING_AGG(ts.name, ',' ORDER BY ts.name) AS stacks, COUNT(*)::int AS count
      FROM (SELECT jpts."jobPostingsId", ts.name
        FROM job_posting_tech_stacks jpts
        JOIN tech_stacks ts ON ts.id = jpts."techStacksId"
        JOIN job_postings jp ON jp.id = jpts."jobPostingsId" AND jp.is_active = true
      ) ts GROUP BY ts.job_posting_id HAVING COUNT(*) >= 2
    `);
    const comboMap = new Map<string, number>();
    for (const row of rows) comboMap.set(row.stacks, (comboMap.get(row.stacks) || 0) + Number(row.count));
    return Array.from(comboMap.entries())
      .map(([stacks, count]) => ({ stacks: stacks.split(','), count }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
  }

  async getSummary() {
    const [totalJobs] = await this.dataSource.query(`SELECT COUNT(*)::int AS count FROM job_postings WHERE is_active = true`);
    const [totalCompanies] = await this.dataSource.query(`SELECT COUNT(DISTINCT company_id)::int AS count FROM job_postings WHERE is_active = true`);
    const topStack = await this.getTechStackRanking();
    const [avgExp] = await this.dataSource.query(`SELECT ROUND(AVG(experience_min), 1) AS avg FROM job_postings WHERE is_active = true AND experience_min IS NOT NULL`);
    return { total_jobs: totalJobs?.count || 0, total_companies: totalCompanies?.count || 0, top_stack: topStack[0] || null, avg_experience: Number(avgExp?.avg) || 0 };
  }
}
