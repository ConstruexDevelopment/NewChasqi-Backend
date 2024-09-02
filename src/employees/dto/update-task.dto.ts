import { IsString, IsNotEmpty, IsDate, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  readonly title?: string;

  @IsNumber()
  @IsOptional()
  readonly priority?: number;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  readonly startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  readonly endDate?: Date;

  @IsOptional()
  @IsBoolean()
  readonly concurrence?: boolean;

  @IsString()
  @IsOptional()
  readonly state?: number;
}