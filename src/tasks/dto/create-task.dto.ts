import { Transform } from 'class-transformer';
import { IsNotEmpty, IsDate, IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  readonly Title: string;

  @IsNotEmpty()
  @IsNumber()
  readonly Priority: number;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly Start_Date: Date;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  readonly End_Date: Date;

  @IsNotEmpty()
  @IsBoolean()
  readonly Concurrence: boolean;

  @IsNotEmpty()
  @IsString()
  readonly State: string;
}
