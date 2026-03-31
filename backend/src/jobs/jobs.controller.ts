import { Controller, Get, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { QueryJobsDto } from './dto/query-jobs.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  @Get()
  findAll(@Query() query: QueryJobsDto) { return this.jobsService.findAll(query); }
  @Get(':id')
  findOne(@Param('id') id: string) { return this.jobsService.findOne(id); }
}
