import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { UpdateTaskDto } from '../tasks/dto/update-task.dto';

@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    //<-------------------------------------- Tasks ----------------------------------------->

    @Get('/')
    async getAllTasks(
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.taskService.getAllTasks(tenantId);
    }

    @Post(':id')
    async createTask(
        @Param('id') employeeId: string,
        @Body() createTaskDto: CreateTaskDto,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.taskService.addTaskToEmployee(employeeId, createTaskDto, tenantId);
    }

    @Get(':id/tasks-employee')
    async getTasks(
        @Param('id') employeeId: string,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.taskService.getTasksOfEmployee(employeeId, tenantId);
    }

    @Put(':taskId')
    updateTask(
        @Param('taskId') taskId: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @Req() req
    ) {
        const tenantId = req['tenantId']; // Obtener el tenantId del request
        return this.taskService.updateTask(taskId, updateTaskDto, tenantId); // Llamar a la función de actualización con los parámetros necesarios
    }

    @Delete(':id/deletasks/:taskId')
    async deleteTask(
        @Param('id') employeeId: string,
        @Param('taskId') taskId: string,
        @Req() req
    ): Promise<{ message: string }> {
        const tenantId = req['tenantId']; // Obtener el tenantId del request
        return this.taskService.deleteTask(employeeId, taskId, tenantId); // Llamar a la función de eliminación con los parámetros necesarios
    }

    @Get(':id/tasks/:taskId')//get a specific task
    async getTask(
        @Param('id') employeeId: string,
        @Param('taskId') taskId: string,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.taskService.getTaskOfEmployee(employeeId, taskId, tenantId);
    }

    @Get(':taskId/title')
    async getTaskTitle(
        @Param('taskId') taskId: string,
        @Req() req
    ): Promise<string> {
        const tenantId = req['tenantId'];
        return this.taskService.getTaskTitle(taskId, tenantId);
    }

    //<--------------------------------------------------TASKLOGS---------------------------------->
    @Post(':taskId/tasklogs')
    async addTaskLogToTask(
        @Param('taskId') taskId: string,
        @Body() taskLogDto: any,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.taskService.addTaskLogToTask(taskId, taskLogDto, tenantId);
    }

    @Get(':taskId/get-tasklogs')
    getTasksLogsToTaskId(
        @Param('taskId') taskId: string,
        @Req() req
    ): Promise<any[]> {
        const tenantId = req['tenantId'];
        return this.taskService.getTasksLogsToTask(taskId, tenantId);
    }

    @Get(':taskId/task-keys')
    async getTaskKeys(
        @Param('taskId') taskId: string,
        @Req() req
    ): Promise<string[]> {
        const tenantId = req['tenantId'];
        return this.taskService.getTaskKeys(taskId, tenantId);
    }

    //<--------------------EVALUATION-------------------------->

    @Post(':taskId/kpi/:kpiId/evaluation')
    async getTaskLogValues(
        @Param('taskId') taskId: string,
        @Param('kpiId') kpiId: string,
        @Body() body: { startDate: Date, endDate: Date, excludedDays: string[] },
        @Req() req
    ) {
        const { startDate, endDate, excludedDays } = body;
        const tenantId = req['tenantId'];
        return await this.taskService.getSpecificTaskLogValues(taskId, kpiId, startDate, endDate, excludedDays, tenantId);
    }

    //<--------------Create Task for Field ------------------->

    @Post('/tasksf/tasks-by-field')
    async addTaskToEmployeesByField(
        @Body('task') taskDto: CreateTaskDto, // Ahora acepta directamente los campos
        @Body('field') field: string,
        @Body('value') value: string,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.taskService.addTaskToEmployeesByField(field, value, taskDto, tenantId);
    }


}