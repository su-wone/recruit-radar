import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsModule } from './jobs/jobs.module';
import { CompaniesModule } from './companies/companies.module';
import { StatsModule } from './stats/stats.module';
import { CrawlerModule } from './crawler/crawler.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      database: process.env.DATABASE_NAME || 'jobscout',
      username: process.env.DATABASE_USER || 'jobscout',
      password: process.env.DATABASE_PASSWORD || 'jobscout',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    JobsModule,
    CompaniesModule,
    StatsModule,
    CrawlerModule,
    SchedulerModule,
  ],
})
export class AppModule {}
