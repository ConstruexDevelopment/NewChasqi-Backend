import { Connection } from 'mongoose';
import { Employee, EmployeeSchema } from 'src/employees/employee.schema';
import { Task, TaskSchema } from 'src/tasks/task.schema';

export const tenantModels = {
  employeeModel: {
    provide: 'EMPLOYEE_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Employee.name, EmployeeSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  taskModel: {
    provide: 'TASK_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Task.name, TaskSchema);
    },
    inject: ['TENANT_CONNECTION'],
  }
};
