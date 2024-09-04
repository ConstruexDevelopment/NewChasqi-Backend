import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Connection, Schema, Types } from 'mongoose';
import { Employee } from './employee.schema';

import { isValidObjectId } from 'mongoose';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AddFielEmployeeDto } from './dto/add-field-employee.dto';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';
import { KpiDto } from '../kpis/dto/kpi.dto';

@Injectable()
export class EmployeesService {
  constructor(@Inject('EMPLOYEE_MODEL') private EmployeeModel: Model<Employee>,
    @Inject('TENANT_CONNECTION') private connection: Connection
  ) { }

  private async getModelForTenant(tenantId: string): Promise<Model<Employee & Document>> {
    const modelName = `Employee_${tenantId}`;
    if (this.connection.models[modelName]) {
      return this.connection.models[modelName] as Model<Employee & Document>;
    }

    // Create a new schema based on the existing schema and add any additional properties
    const schema = new Schema(this.EmployeeModel.schema.obj as any, { strict: false });

    // Register and return the new model
    return this.connection.model<Employee & Document>(modelName, schema);
  }

  async getEmployees(tenantId: string) {
    const EmployeeModel = await this.getModelForTenant(tenantId);
    return EmployeeModel.find();
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto, tenantId: string): Promise<Employee> {
    const EmployeeModel = await this.getModelForTenant(tenantId);
    const createdEmployee = new EmployeeModel({
      ...createEmployeeDto,
      tenantId,
    });
    return createdEmployee.save();
  }

  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto, tenantId: string): Promise<Employee> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const EmployeeModel = await this.getModelForTenant(tenantId)
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      { _id: id, tenantId },
      { $set: updateEmployeeDto },
      { new: true }
    );
    if (!updatedEmployee) {
      throw new NotFoundException('Employee not found');
    }
    return updatedEmployee;
  }

  async deleteEmployee(id: string, tenantId: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const EmployeeModel = await this.getModelForTenant(tenantId);
    const deletedEmployee = await EmployeeModel.findByIdAndDelete({ _id: id, tenantId }).exec();

    if (!deletedEmployee) {
      throw new NotFoundException('Employee not found');
    }

    return { message: 'Employee successfully deleted' };
  }

  async getEmployeeName(employeeId: string, tenantId: string): Promise<string> {
    const EmployeeModel = await this.getModelForTenant(tenantId);

    // Validar que el ID del empleado es válido
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    // Buscar el empleado por ID y tenantId, y solo seleccionar el campo "name"
    const employee = await EmployeeModel.findOne({ _id: employeeId, tenantId }, { Name: 1 });

    // Si no se encuentra el empleado, lanzar una excepción
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Retornar el nombre del empleado
    return employee.Name;
  }

  async addFieldEmployee(addFieldDto: AddFielEmployeeDto, tenantId: string): Promise<{ message: string }> {
    const { fieldName, fieldType } = addFieldDto;

    const validTypes = ['string', 'number', 'boolean', 'date'];
    if (!validTypes.includes(fieldType)) {
      throw new BadRequestException('Invalid field type');
    }

    let defaultValue: any;
    switch (fieldType) {
      case 'string':
        defaultValue = '';
        break;
      case 'number':
        defaultValue = 0;
        break;
      case 'boolean':
        defaultValue = false;
      case 'date':
        defaultValue = new Date();
        break;
      default:
        throw new BadRequestException('Invalid field type');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);
    const schema = EmployeeModel.schema;
    schema.add({ [fieldName]: { type: fieldType, default: defaultValue } });

    await EmployeeModel.updateMany({ tenantId }, { $set: { [fieldName]: defaultValue } });

    return { message: `Field '${fieldName}' of type '${fieldType}' added successfully` };
  }


  /* 


  //<-------------------------------------- EVALUATION METHOD ----------------------------------------->

  async getSpecificTaskLogValues(
    employeeId: string,
    taskId: string,
    kpiId: string, // Nuevo parámetro para el ID del KPI
    startDate: Date,
    endDate: Date,
    excludedDays: string[],
    tenantId: string
  ): Promise<{ values: any[], kpiPercentage: number, totalCount: number, daysConsidered: number, targetSales: number }> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId) || !isValidObjectId(kpiId)) {
      throw new BadRequestException('Invalid ID');
    }

    // Utilizar la función para obtener el KPI por ID
    const kpi = await this.getKPIbyID(employeeId, taskId, kpiId, tenantId);

    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);

    const employee = await EmployeeModel.findOne(
      { _id: employeeId, 'tasks._id': taskId, tenantId },
      { 'tasks.$': 1 }
    );

    if (!employee) {
      throw new NotFoundException('Employee or Task not found');
    }

    const task = employee.tasks[0];
    const taskLogs = task.tasklogs;

    if (!taskLogs || taskLogs.length === 0) {
      return { values: [], kpiPercentage: 0, totalCount: 0, daysConsidered: 0, targetSales: 0 };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const dayMapping: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const excludedDayIndices = excludedDays.map(day => dayMapping[day.toLowerCase()]).filter(dayIndex => dayIndex !== undefined);

    const filteredTaskLogs = taskLogs.filter(log => {
      const logDate = new Date(log.registerDate);
      const dayOfWeek = logDate.getDay();
      return logDate >= start && logDate <= end && !excludedDayIndices.includes(dayOfWeek);
    });

    const key = kpi.fieldtobeevaluated;

    const values = filteredTaskLogs.map((log) => log[key]).filter((value) => value !== undefined);

    const uniqueValues = [...new Set(values)];

    const kpiTarget = kpi.target || 0;
    const timeUnit = kpi.timeUnit || 1;

    let daysConsidered = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (!excludedDayIndices.includes(dayOfWeek)) {
        daysConsidered++;
      }
    }

    const exactQuotient = daysConsidered / timeUnit;
    const targetSales = exactQuotient * kpiTarget;

    const kpiPercentage = targetSales ? (uniqueValues.length / targetSales) * 100 : 0;
    const totalCount = values.length;

    return { values, kpiPercentage, totalCount, daysConsidered, targetSales };
  }

  //<-------------------------------------- KPI's ----------------------------------------->

  async getUniqueDepartments(tenantId: string): Promise<string[]> {
    // Eliminamos la validación de ObjectId si tenantId no es un ObjectId.

    const EmployeeModel = await this.getModelForTenant(tenantId);

    // Usar el método `distinct` para obtener los valores únicos del campo "department"
    const uniqueDepartments = await EmployeeModel.distinct('department', { tenantId });

    if (!uniqueDepartments || uniqueDepartments.length === 0) {
      throw new NotFoundException('No departments found');
    }

    return uniqueDepartments;
  }

  */ 

}