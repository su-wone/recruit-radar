import { Controller, Get, Param, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}
  @Get()
  findAll(@Query('industry') industry?: string, @Query('size') size?: string) {
    return this.companiesService.findAll({ industry, size });
  }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.companiesService.findOne(id); }
}
