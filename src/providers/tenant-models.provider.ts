import { Connection } from 'mongoose';
import { Activity, ActivitySchema } from 'src/activities/activity.schema';
import { Employee, EmployeeSchema } from 'src/employees/employee.schema';

export const tenantModels = {
  employeeModel: {
    provide: 'EMPLOYEE_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Employee.name, EmployeeSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  activityModel: {
    provide: 'ACTIVITY_MODEL',
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(Activity.name, ActivitySchema);
    },
    inject: ['TENANT_CONNECTION'],
  }
};
