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
    ){
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

    @Put(':id/tasks/:taskId')
    updateTask(
        @Param('id') id: string,
        @Param('taskId') taskId: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.taskService.updateTask(id, taskId, updateTaskDto, tenantId);
    }

    @Delete(':id/tasks/:taskId')
    async deleteTask(
        @Param('id') employeeId: string,
        @Param('taskId') taskId: string,
        @Req() req
    ): Promise<{ message: string }> {
        const tenantId = req['tenantId'];
        return this.taskService.deleteTask(employeeId, taskId, tenantId);
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

}