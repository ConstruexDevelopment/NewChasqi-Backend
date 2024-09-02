import { Transform } from 'class-transformer';
import { IsNotEmpty, IsDate, IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsNumber()
  readonly priority: number;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly startDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly endDate: Date;

  @IsNotEmpty()
  @IsBoolean()
  readonly concurrence: boolean;

  @IsNotEmpty()
  @IsString()
  readonly state: string;
}
