import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { JobPosting } from './job-posting.entity';

export enum ApplicationStatus {
  BOOKMARKED = '스크랩',
  APPLIED = '지원중',
  INTERVIEW = '면접',
  ACCEPTED = '합격',
  REJECTED = '불합격',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => JobPosting, { eager: true })
  @JoinColumn({ name: 'job_posting_id' })
  job_posting: JobPosting;

  @Column({ type: 'enum', enum: ApplicationStatus })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @Column({ type: 'date', nullable: true })
  applied_at: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
