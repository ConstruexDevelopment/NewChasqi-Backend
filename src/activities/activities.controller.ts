import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query, Req } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { AddFielDto } from './dto/add-field-activity.dto';

@Controller('activities')
export class ActivitiesController {
    constructor(private readonly activitiesService: ActivitiesService) { }

    @Get()
    getActivities(@Req() req, @Query('employeeId') employeeId: string) {
        const tenantId = req['tenantId'];
        console.log('Received tenantId:', tenantId);  // Verifica que tenantId se recibe correctamente
        console.log('Received employeeId:', employeeId);  // Verifica que employeeId se recibe correctamente
        return this.activitiesService.getActivities(tenantId, employeeId);
    }

    @Post()
    createActivity(@Body() createActivityDto: CreateActivityDto, @Req() req) {
        const tenantId = req['tenantId'];
        return this.activitiesService.createActivity(createActivityDto, tenantId);
    }

    @Post('add-field')
    async addField(@Body() addFieldDto: AddFielDto, @Req() req) {
        const tenantId = req['tenantId'];
        return this.activitiesService.addField(addFieldDto, tenantId);
    }

    @Put(':id')
    updateActivity(
        @Param('id') id: string,
        @Body() updateActivityDto: UpdateActivityDto,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.activitiesService.updateActivity(id, updateActivityDto, tenantId);
    }

    @Delete(':id')
    async deleteActivity(
        @Req() req,
        @Param('id') id: string
    ): Promise<{ message: string }> {
        const tenantId = req['tenantId'];
        return this.activitiesService.deleteActivity(id, tenantId);
    }
}