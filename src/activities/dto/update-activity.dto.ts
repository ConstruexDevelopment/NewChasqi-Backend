import { Transform } from "class-transformer";
import { IsOptional, IsBoolean, IsDate, IsString } from "class-validator";

export class UpdateActivityDto {
    @IsOptional()
    @IsString()
    readonly title?: string;

    @IsOptional()
    @IsBoolean()
    readonly isComplete?: boolean;

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    readonly creationDate?: Date;

    @IsOptional()
    @IsString()
    readonly description?: string;
}