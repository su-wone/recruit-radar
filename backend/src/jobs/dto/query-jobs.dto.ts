import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SourceSite } from 'src/entities';

export class QueryJobsDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit: number = 20;
  @IsOptional() @IsEnum(SourceSite)
  source?: SourceSite;
  @IsOptional() @IsString()
  tech?: string;
  @IsOptional() @Type(() => Number) @IsInt()
  experience?: number;
  @IsOptional() @IsString()
  search?: string;
}
