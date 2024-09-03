import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateEmployeeDto {
    @IsNotEmpty()
    @IsString()
    readonly Name: string;

    @IsNotEmpty()
    @IsString()
    readonly Department: string;

    @IsNotEmpty()
    @IsString()
    readonly Work_position: string;

    @IsNotEmpty()
    @IsNumber()
    readonly Role: number;
}