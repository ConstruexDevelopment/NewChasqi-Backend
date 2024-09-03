import { InternalServerErrorException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

/* Proveedor de conexión para un tenant específico, utilizando la capacidad
de inyección de dependencias de NestJS*/

export const tenantConnectionProvider = {
  provide: 'TENANT_CONNECTION', // Idenrtificador del proveedor
  useFactory: async (request, connection: Connection) => {
    if (!request.tenantId) {
      throw new InternalServerErrorException(
        'Make sure to apply tenantsMiddleware',
      );
    }
    return connection.useDb(`tenant_${request.tenantId}`);
  },
  inject: [REQUEST, getConnectionToken()],
};
