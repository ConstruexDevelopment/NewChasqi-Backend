import { Transform } from "class-transformer";
import { IsBoolean, IsDate, IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateActivityDto {
    @IsNotEmpty()
    @IsString()
    readonly title: string;

    @IsNotEmpty()
    @IsBoolean()
    readonly isComplete: boolean;

    @IsNotEmpty()
    @IsDate()
    @Transform(({ value }) => new Date(value))
    readonly creationDate: Date;

    @IsNotEmpty()
    @IsMongoId()
    readonly employeeId: string;
}