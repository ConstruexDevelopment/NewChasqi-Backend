import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Connection, Schema, Types } from 'mongoose';
import { Task } from './task.schema';
import { Employee } from '../employees/employee.schema';

import { isValidObjectId } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
    constructor(@Inject('TASK_MODEL') private TaskModel: Model<Task>,
        @Inject('TENANT_CONNECTION') private connection: Connection) { }

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

    // <------------------------------------------------------ Tasks ------------------------------------>  

    async getAllTasks(tenantId: string) {
        const TaskModel = await this.getModelForTenant(tenantId);
        return TaskModel.find();
    }

    async addTaskToEmployee(employeeId: string, createTaskDto: CreateTaskDto, tenantId: string) {
        const TaskModel = await this.getModelForTenant(tenantId);

        if (!Types.ObjectId.isValid(employeeId)) {
            throw new BadRequestException('Invalid employee ID');
        }

        // Crea una nueva tarea con la referencia al empleado y tenant
        const newTask = new TaskModel({ ...createTaskDto, employeeId, tenantId });
        await newTask.save();

        // Actualiza el emplado para que tenga la referencia a esta nueva tarea
        const EmployeeModel = await this.getModelForTenant(tenantId);
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
            throw new BadRequestException('Invalid employee ID');
        }

        const tasks = await TaskModel.find({ employeeId, tenantId });
        if (!tasks || tasks.length === 0) {
            throw new NotFoundException('Employee not found');
        }

        return tasks;
    }

    async updateTask(employeeId: string, taskId: string, updateTaskDto: UpdateTaskDto, tenantId: string): Promise<Task> {
        if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid ID');
        }

        const TaskModel = await this.getModelForTenant(tenantId);
        const task = await TaskModel.findOneAndUpdate(
            { _id: taskId, employeeId, tenantId },
            { $set: updateTaskDto },
            { new: true }
        );

        if (!task) {
            throw new NotFoundException('Employee or Task not found');
        }

        return task;
    }

    async deleteTask(employeeId: string, taskId: string, tenantId: string): Promise<{ message: string }> {
        if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
            throw new BadRequestException('Invalid ID');
        }

        const TaskModel = await this.getModelForTenant(tenantId);
        const task = await TaskModel.findOneAndDelete({ _id: taskId, employeeId, tenantId });

        if (!task) {
            throw new NotFoundException('Employee or Task not found');
        }

        // También actualiza la lista de tareas del empleado para eliminar la referencia a la tarea eliminada
        const EmployeeModel = await this.getModelForTenant(tenantId);
        await EmployeeModel.findOneAndUpdate(
            { _id: employeeId, tenantId },
            { $pull: { Tasks: taskId } },
            { new: true }
        );

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
            { title: 1} //Proyección: seleccionar solo el titulo de la tarea
        )

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        // Retornar el título de la tarea
        return task.title; // Acceder al título de la tarea específica
    }

}