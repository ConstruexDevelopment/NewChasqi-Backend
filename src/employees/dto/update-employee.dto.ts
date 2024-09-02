import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class UpdateEmployeeDto {
    @IsOptional()
    @IsString()
    readonly name?: string;

    @IsOptional()
    @IsString()
    readonly department?: string;

    @IsOptional()
    @IsString()
    readonly work_position?: string;
}