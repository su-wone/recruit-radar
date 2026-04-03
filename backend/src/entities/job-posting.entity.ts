import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany,
  JoinTable, CreateDateColumn, UpdateDateColumn, Unique, JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { TechStack } from './tech-stack.entity';

export enum SourceSite {
  WANTED = 'wanted',
  SARAMIN = 'saramin',
  JUMPIT = 'jumpit',
  LINKEDIN = 'linkedin',
}

export enum EmploymentType {
  FULL_TIME = '정규직',
  CONTRACT = '계약직',
  INTERN = '인턴',
}

@Entity('job_postings')
@Unique(['source_site', 'source_id'])
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, (c) => c.job_postings, { eager: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  salary_min: number;

  @Column({ nullable: true })
  salary_max: number;

  @Column({ nullable: true })
  experience_min: number;

  @Column({ nullable: true })
  experience_max: number;

  @Column({ default: '' })
  location: string;

  @Column({ type: 'enum', enum: EmploymentType, default: EmploymentType.FULL_TIME })
  employment_type: EmploymentType;

  @Column({ type: 'date', nullable: true })
  deadline: string;

  @Column()
  source_url: string;

  @Column({ type: 'enum', enum: SourceSite })
  source_site: SourceSite;

  @Column()
  source_id: string;

  @Column({ default: true })
  is_active: boolean;

  @ManyToMany(() => TechStack, (ts) => ts.job_postings, { eager: true })
  @JoinTable({ name: 'job_posting_tech_stacks' })
  tech_stacks: TechStack[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
