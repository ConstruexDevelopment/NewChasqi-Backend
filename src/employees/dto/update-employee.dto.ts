import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateEmployeeDto {
    @IsOptional()
    @IsString()
    readonly Name?: string;

    @IsOptional()
    @IsString()
    readonly Department?: string;

    @IsOptional()
    @IsString()
    readonly Work_position?: string;

    @IsOptional()
    @IsNumber()
    readonly Role: number;
}