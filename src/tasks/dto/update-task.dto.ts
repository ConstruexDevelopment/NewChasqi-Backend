import { IsString, IsNotEmpty, IsDate, IsOptional, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  readonly Title?: string;

  @IsNumber()
  @IsOptional()
  readonly Priority?: number;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  readonly Start_Date?: Date;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  readonly End_Date?: Date;

  @IsOptional()
  @IsBoolean()
  readonly Concurrence?: boolean;

  @IsString()
  @IsOptional()
  readonly State?: number;
}