import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantsService } from 'src/tenants/tenants.service';

/*Intercepta solicitudes HTTP entrantes y verificar que se incluya un
identificador de tenant ('tenantId') en los encabezados de la solicitud
para luego validar la existencia de ese tenant en el sistema*/

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  constructor(private tenantsService: TenantsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //Verifica que tenantId exista en los encabezados de la solicitud
    const tenantId = req.headers['x-tenant-id']?.toString();
    if (!tenantId) {
      throw new BadRequestException('X-TENANT-ID not provided');
    }

    // Verifica si el tenant existe llamando al servicio TenantsService
    const tenantExits = await this.tenantsService.getTenantById(tenantId);
    if (!tenantExits) {
      throw new NotFoundException('Tenant does not exist');
    }
    // Establece el tenantId en el objeto de solicitud para su acceso posterior
    req['tenantId'] = tenantId;
    next();
  }
}
