import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { TenantsMiddleware } from 'src/middlewares/tenants.middleware';
import { tenantModels } from 'src/providers/tenant-models.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Employee, EmployeeSchema } from './employee.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema}])],
  controllers: [EmployeesController],
  providers: [
    EmployeesService,
    tenantModels.employeeModel,
  ],
  exports: [EmployeesService]
})
export class EmployeessModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware).forRoutes(EmployeesController);
  }
}
