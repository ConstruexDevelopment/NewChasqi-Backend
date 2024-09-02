import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class AddFielDto{
    @IsString()
    @IsNotEmpty()
    fieldName: string;

    @IsString()
    @IsIn(['string', 'number', 'boolean', 'date'])
    fieldType: string;
}

