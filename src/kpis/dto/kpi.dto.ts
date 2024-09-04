import { IsString, IsNotEmpty, IsDate, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class KpiDto {
  @IsString()
  @IsNotEmpty()
  readonly Title: string;

  @IsNumber()
  @IsNotEmpty()
  readonly Target: number;

  @IsNumber()
  @IsNotEmpty()
  readonly Time_Unit: number;

  @IsString()
  @IsNotEmpty()
  readonly Field_To_Be_Evaluated: string;
}