import { Body, Controller, Post, BadRequestException } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { Tenant } from "./tenant.schema";
import * as bcrypt from 'bcryptjs';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService){}

    @Post()
    async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<{ message: string, status: string, tenant?: Tenant }> {
        const { tenantId, password } = createTenantDto;

        // Verificar si el tenantId ya existe
        const existingTenant = await this.tenantsService.getTenantById(tenantId);
        if (existingTenant) {
            return {
                message: `El Tenant con ID ${tenantId} ya existe.`,
                status: 'error',
            };
        }

        // Verificar la validez de la contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=])[A-Za-z\d@#$%^&+=]{8,}$/;
        if (!passwordRegex.test(password)) {
            return {
                message: 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula, un número y un carácter especial.',
                status: 'error',
            };
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo tenant con la contraseña encriptada
        const newTenant = await this.tenantsService.createTenant({
            ...createTenantDto,
            password: hashedPassword,
        });

        return {
            message: 'Tenant creado exitosamente.',
            status: 'success',
            tenant: newTenant,
        };
    }

    // Autenticación de Tenant (Login)
    @Post('login')
    async loginTenant(@Body() loginDto: { tenantId: string, password: string }): Promise<{ message: string, status: string, tenantId?: string }> {
        const { tenantId, password } = loginDto;

        // Verificar si el tenantId existe
        const tenant = await this.tenantsService.getTenantById(tenantId);
        if (!tenant) {
            return {
                message: 'TenantId o password incorrectos.',
                status: 'error',
            };
        }

        // Verificar si la contraseña es correcta
        const isPasswordValid = await bcrypt.compare(password, tenant.password);
        if (!isPasswordValid) {
            return {
                message: 'TenantId o password incorrectos.',
                status: 'error',
            };
        }

        // Si todo es correcto, retornar un mensaje de bienvenida
        return {
            message: 'Bienvenido',
            status: 'success',
            tenantId: tenant.tenantId,
        };
    }
}

