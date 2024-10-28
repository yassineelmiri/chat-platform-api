import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MessagePaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 50;
}