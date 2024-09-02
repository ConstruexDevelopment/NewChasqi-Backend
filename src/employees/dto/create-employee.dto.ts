import { Transform } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CreateEmployeeDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsString()
    readonly department: string;

    @IsNotEmpty()
    @IsString()
    readonly work_position: string;
}