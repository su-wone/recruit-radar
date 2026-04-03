import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { JobPosting } from './job-posting.entity';

export enum TechCategory {
  LANGUAGE = 'language',
  FRAMEWORK = 'framework',
  TOOL = 'tool',
  DB = 'db',
}

@Entity('tech_stacks')
export class TechStack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'enum', enum: TechCategory })
  category: TechCategory;

  @ManyToMany(() => JobPosting, (jp) => jp.tech_stacks)
  job_postings: JobPosting[];
}
