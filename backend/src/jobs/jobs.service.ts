import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobPosting } from 'src/entities';
import { QueryJobsDto } from './dto/query-jobs.dto';

@Injectable()
export class JobsService {
  constructor(@InjectRepository(JobPosting) private readonly jobRepo: Repository<JobPosting>) {}

  async findAll(query: QueryJobsDto) {
    const { page, limit, source, tech, experience, search } = query;
    const qb = this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoinAndSelect('job.tech_stacks', 'tech_stack');
    if (source) qb.andWhere('job.source_site = :source', { source });
    if (tech) qb.andWhere('tech_stack.name ILIKE :tech', { tech: `%${tech}%` });
    if (experience !== undefined) qb.andWhere('(job.experience_min <= :exp OR job.experience_min IS NULL)', { exp: experience });
    if (search) qb.andWhere('(job.title ILIKE :search OR company.name ILIKE :search)', { search: `%${search}%` });
    qb.orderBy('job.created_at', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return this.jobRepo.findOne({ where: { id }, relations: ['company', 'tech_stacks'] });
  }
}
