import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { SourceSite } from './job-posting.entity';

export enum CrawlStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

@Entity('crawl_logs')
export class CrawlLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SourceSite })
  source_site: SourceSite;

  @Column({ type: 'enum', enum: CrawlStatus })
  status: CrawlStatus;

  @Column({ default: 0 })
  total_found: number;

  @Column({ default: 0 })
  new_added: number;

  @Column({ default: 0 })
  updated: number;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'timestamp' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  finished_at: Date;
}
