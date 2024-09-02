import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTenantDto {
    @IsNotEmpty()
    @IsString()
    readonly companyName: string;

    @IsNotEmpty()
    @IsString()
    readonly tenantId: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}



