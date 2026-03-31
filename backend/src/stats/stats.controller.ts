import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}
  @Get('summary') getSummary() { return this.statsService.getSummary(); }
  @Get('tech-stacks') getTechStackRanking() { return this.statsService.getTechStackRanking(); }
  @Get('experience') getExperienceDistribution() { return this.statsService.getExperienceDistribution(); }
  @Get('combos') getTechStackCombos() { return this.statsService.getTechStackCombos(); }
}
