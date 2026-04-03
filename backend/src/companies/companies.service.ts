import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from 'src/entities';

@Injectable()
export class CompaniesService {
  constructor(@InjectRepository(Company) private readonly companyRepo: Repository<Company>) {}

  async findAll(filter: { industry?: string; size?: string }) {
    const where: Record<string, string> = {};
    if (filter.industry) where.industry = filter.industry;
    if (filter.size) where.size = filter.size;
    return this.companyRepo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    return this.companyRepo.findOne({ where: { id }, relations: ['job_postings', 'job_postings.tech_stacks'] });
  }
}
