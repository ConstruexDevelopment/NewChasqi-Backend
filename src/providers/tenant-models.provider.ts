import { Connection } from 'mongoose';
import { Employee, EmployeeSchema } from 'src/employees/employee.schema';
import { Task, TaskSchema } from 'src/tasks/task.schema';
import { tenantConnectionProvider } from './tenant-connection.provider';
import { KPI, KPISchema } from 'src/kpis/kpi.schema';
import { Inject } from '@nestjs/common';

export const tenantModels = {
  employeeModel: {
    provide: 'EMPLOYEE_MODEL', //Token para inyectar el modelo de empleados en otros módulos o servicios
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Employee.name, EmployeeSchema);
    },
    //Se inyecta la conexión específica del tenant creada en (tenant-connection.providers.ts) para usarla en la creación del modelo
    inject: ['TENANT_CONNECTION'], 
  },
  taskModel: {
    provide: 'TASK_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Task.name, TaskSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  kpiModel: {
    provide: 'KPI_MODEL',
    useFactory: async(tenantConnection: Connection) => {
      return tenantConnection.model(KPI.name, KPISchema);
    },
    inject: ['TENANT_CONNECTION']
  },
};
