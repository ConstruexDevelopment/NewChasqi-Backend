import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Connection, Schema, Types } from 'mongoose';
import { Task } from './task.schema';
import { Employee } from '../employees/employee.schema';
import { isValidObjectId } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { KPIService } from 'src/kpis/kpi.service';

@Injectable()
export class TaskService {
    constructor(
        @Inject('TASK_MODEL') private TaskModel: Model<Task>,
        @Inject('EMPLOYEE_MODEL') private employeeModel: Model<Employee>, // Inyectar el modelo de empleados
        @Inject('TENANT_CONNECTION') private connection: Connection,
        private readonly kpiService: KPIService // Inyecta el servicio KPI
        ) { }

    private async getModelForTenant(tenantId: string): Promise<Model<Task & Document>> {
        const modelName = `Task_${tenantId}`;
        if (this.connection.models[modelName]) {
            return this.connection.models[modelName] as Model<Task & Document>;
        }

        // Create a new schema based on the existing schema and add any additional properties
        const schema = new Schema(this.TaskModel.schema.obj as any, { strict: false });

        // Register and return the new model
        return this.connection.model<Task & Document>(modelName, schema);
    }

    private async getEmployeeModelForTenant(tenantId: string): Promise<Model<Employee & Document>> {
        const modelName = `Employee_${tenantId}`;
        if (this.connection.models[modelName]) {
            return this.connection.models[modelName] as Model<Employee & Document>;
        }

        // Create a new schema based on the existing schema and add any additional properties
        const schema = new Schema(this.employeeModel.schema.obj as any, { strict: false });

        // Register and return the new model
        return this.connection.model<Employee & Document>(modelName, schema);
    }


    // <------------------------------------------------------ Tasks ------------------------------------>  

    async getAllTasks(tenantId: string) {
        const TaskModel = await this.getModelForTenant(tenantId);
        return TaskModel.find();
    }

    async addTaskToEmployee(employeeId: string, createTaskDto: CreateTaskDto, tenantId: string) {
        const TaskModel = await this.getModelForTenant(tenantId);

        if (!Types.ObjectId.isValid(employeeId)) {
            throw new BadRequestException('Invalid employee ID when Add task to employee');
        }

        // Crea una nueva tarea con la referencia al empleado y tenant
        const newTask = new TaskModel({ ...createTaskDto, employeeId, tenantId });
        await newTask.save();

        // Actualiza el emplado para que tenga la referencia a esta nueva tarea
        const EmployeeModel = await this.getEmployeeModelForTenant(tenantId);
        const updatedEmployee = await EmployeeModel.findOneAndUpdate(
            { _id: employeeId, tenantId },
            { $push: { Tasks: newTask._id } },
            { new: true, useFindAndModify: false }
        );

        if (!updatedEmployee) {
            throw new NotFoundException('Employee not found');
        }

        return newTask;
    }

    async getTasksOfEmployee(employeeId: string, tenantId: string) {
        const TaskModel = await this.getModelForTenant(tenantId);
        if (!Types.ObjectId.isValid(employeeId)) {
            throw new BadRequestException('Invalid employee ID with get Tasks of employee');
        }

        const tasks = await TaskModel.find({ employeeId, tenantId });
        if (!tasks || tasks.length === 0) {
            throw new NotFoundException('Employee not found');
        }

        return tasks;
    }

    async updateTask(taskId: string, updateTaskDto: UpdateTaskDto, tenantId: string): Promise<Task> {
        // Verificar si el taskId es válido
        if (!isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid Task ID');
        }

        // Obtener el modelo de Task para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);

        // Buscar y actualizar la tarea
        const task = await TaskModel.findOneAndUpdate(
            { _id: taskId, tenantId }, // No es necesario incluir employeeId ya que estamos usando el taskId único
            { $set: updateTaskDto },
            { new: true }
        );

        // Si la tarea no se encuentra, lanzar excepción
        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return task;
    }

    async deleteTask(employeeId: string, taskId: string, tenantId: string): Promise<{ message: string }> {
        // Verificar si los IDs son válidos
        if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid ID');
        }

        // Convertir los IDs de string a ObjectId
        const employeeObjectId = new Types.ObjectId(employeeId);
        const taskObjectId = new Types.ObjectId(taskId);

        // Obtener el modelo de Employee para el tenant
        const EmployeeModel = await this.getEmployeeModelForTenant(tenantId);
        console.log(`EmployeeModel for tenant ${tenantId}:`, EmployeeModel.schema.obj);

        // Buscar al empleado
        const employee = await EmployeeModel.findOne({ _id: employeeObjectId, tenantId });
        console.log(`Employee found:`, employee);

        if (!employee) {
            throw new NotFoundException('Employee not found');
        }

        // Verificar si la tarea está en la lista de tareas del empleado
        const taskIndex = employee.Tasks.indexOf(taskObjectId);
        if (taskIndex === -1) {
            return { message: 'Task not associated with this employee' };
        }

        // Eliminar la referencia a la tarea del empleado
        employee.Tasks.splice(taskIndex, 1);
        await employee.save();
        console.log(`Employee updated with task removed:`, employee);

        // Obtener el modelo de Task para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);
        console.log(`TaskModel for tenant ${tenantId}:`, TaskModel.schema.obj);

        // Buscar y eliminar la tarea
        const task = await TaskModel.findOneAndDelete({ _id: taskObjectId, tenantId });
        console.log(`Deleted Task:`, task);

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        return { message: 'Task successfully deleted' };
    }

    async getTaskOfEmployee(employeeId: string, taskId: string, tenantId: string) {//get a specific task

        if (!Types.ObjectId.isValid(employeeId) || !Types.ObjectId.isValid(taskId)) {
            throw new BadRequestException('Invalid employee ID or task ID');
        }

        // Obtener el modelo de Task específico para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);

        // Buscar la tarea por ID y asegurar que pertenezca al empleado y al tenant
        const task = await TaskModel.findOne({ _id: taskId, employeeId: employeeId });

        if (!task) {
            throw new NotFoundException('Task not found for the given employee');
        }

        return task;
    }

    // Método en el servicio para recuperar el título de la tarea
    async getTaskTitle(taskId: string, tenantId: string): Promise<string> {
        // Obtener el modelo de Employee para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);

        // Validar que ambos IDs sean válidos
        if (!Types.ObjectId.isValid(taskId)) {
            throw new BadRequestException('Invalid task ID');
        }

        // Buscar la tarea por ID y asegurar que pertenezca al empleado y al tenant
        const task = await TaskModel.findOne(
            { _id: taskId },
            { Title: 1 } //Proyección: seleccionar solo el titulo de la tarea
        )

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Retornar el título de la tarea
        return task.Title; // Acceder al título de la tarea específica
    }


    //<-------------------------------------------------TASKLOGS----------------------------------------->

    async addTaskLogToTask(taskId: string, taskLogDto: any, tenantId: string): Promise<Task> {
        if (!isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid ID');
        }

        // Obtener el modelo de Task específico para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);

        // Agregar el log de tarea al array Task_Logs
        const taskWithLogs = await TaskModel.findOneAndUpdate(
            { _id: taskId, tenantId },
            { $push: { Task_Logs: taskLogDto } },  // Corregido: referencia directa a Task_Logs
            { new: true }
        );

        if (!taskWithLogs) {
            throw new NotFoundException('Task not found');
        }

        return taskWithLogs;
    }

    async getTasksLogsToTask(taskId: string, tenantId: string): Promise<any[]> {
        if (!isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid ID');
        }

        // Obtener el modelo de Task específico para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);

        // Find the employee and the specific task within the employee's tasks array
        const task = await TaskModel.findOne(
            { _id: taskId, tenantId },
            { Task_Logs: 1 } // Only select the task that matches taskId
        );

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Return the tasklogs of the specific task
        return task.Task_Logs;
    }

    async getTaskKeys(taskId: string, tenantId: string): Promise<string[]> {
        if (!isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid ID');
        }

        // Obtener el modelo de Task específico para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);

        const task = await TaskModel.findOne(
            { _id: taskId, tenantId });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Obtener las claves del esquema del modelo de Task
        const schemaKeys = Object.keys(TaskModel.schema.paths);

        // Obtener todas las claves del documento recuperado
        const taskKeys = Object.keys(task.toObject());

        // Filtrar solo las claves adicionales (no definidas en el esquema)
        const additionalKeys = taskKeys.filter(key => !schemaKeys.includes(key));

        return additionalKeys;
    }

    async addTaskToEmployeesByField(
        field: string,
        value: string,
        taskDto: CreateTaskDto,
        tenantId: string
    ): Promise<{ message: string }> {
        console.log('Field:', field);
        console.log('Value:', value);
        console.log('Task DTO:', taskDto);
        console.log('Tenant ID:', tenantId);

        // Obtener el modelo de Employee y Task específico para el tenant
        const EmployeeModel = await this.getEmployeeModelForTenant(tenantId);
        const TaskModel = await this.getModelForTenant(tenantId);

        // Buscar empleados que cumplen con la condición de field y value
        const employees = await EmployeeModel.find({ [field]: value });

        console.log('Found Employees:', employees);

        if (!employees || employees.length === 0) {
            console.log('No employees found matching the criteria');
            throw new NotFoundException('No employees found matching the criteria');
        }

        // Crear una nueva tarea para cada empleado
        const tasks = employees.map(async (employee) => {
            console.log('Creating task for employee:', employee._id);

            if (!isValidObjectId(employee._id)) {
                throw new BadRequestException('Invalid ID employee');
            }

            // Crear una nueva tarea en la colección Task
            const newTask = new TaskModel({
                ...taskDto,
                _id: new Types.ObjectId(), // Generar un nuevo ID para la tarea
                employeeId: employee._id, // Asociar la tarea con el ID del empleado
                tenantId: tenantId,
            });

            // Guardar la tarea en la colección Task
            const savedTask = await newTask.save();
            console.log('Saved Task:', savedTask);

            // Añadir el ID de la tarea al array de tareas del empleado
            await EmployeeModel.updateOne(
                { _id: employee._id },
                { $push: { Tasks: savedTask._id } }
            ).exec();

            console.log('Task ID added to employee:', employee._id);
        });

        // Esperar a que todas las tareas sean creadas
        await Promise.all(tasks);

        console.log('All tasks have been created and added to employees');

        return { message: `${employees.length} employees updated with new tasks` };
    }

    async getSpecificTaskLogValues(
        taskId: string,
        kpiId: string,
        startDate: Date,
        endDate: Date,
        excludedDays: string[],
        tenantId: string
    ): Promise<{ values: any[], kpiPercentage: number, totalCount: number, daysConsidered: number, targetSales: number }> {
        if (!isValidObjectId(taskId) || !isValidObjectId(kpiId)) {
            throw new BadRequestException('Invalid ID');
        }
    
        // Obtener el KPI usando el servicio KPI
        const kpi = await this.kpiService.getKPIbyID(kpiId, tenantId);
    
        if (!kpi) {
            throw new NotFoundException('KPI not found');
        }
    
        // Obtener el modelo de Task específico para el tenant
        const TaskModel = await this.getModelForTenant(tenantId);
    
        // Buscar la tarea utilizando el taskId
        const task = await TaskModel.findOne(
            { _id: taskId, tenantId }
        );
    
        if (!task) {
            throw new NotFoundException('Task not found');
        }
    
        const taskLogs = task.Task_Logs;
    
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
    
        const excludedDayIndices = excludedDays
            .map(day => dayMapping[day.toLowerCase()])
            .filter(dayIndex => dayIndex !== undefined);
    
        const filteredTaskLogs = taskLogs.filter(log => {
            const logDate = new Date(log.registerDate);
            const dayOfWeek = logDate.getDay();
            return logDate >= start && logDate <= end && !excludedDayIndices.includes(dayOfWeek);
        });
    
        const key = kpi.Field_To_Be_Evaluated;
        const values = filteredTaskLogs.map((log) => log[key]).filter((value) => value !== undefined);
    
        const uniqueValues = [...new Set(values)];
    
        const kpiTarget = kpi.Target || 0;
        const timeUnit = kpi.Time_Unit || 1;
    
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
    

}