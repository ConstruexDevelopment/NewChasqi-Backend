import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { KPIService } from './kpi.service';
import { KpiDto } from './dto/kpi.dto';

@Controller('kpis')
export class KPIController {
    constructor(private readonly KpiService: KPIService) { }

    @Get()
    async getAllKPIs(
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.KpiService.getAllKpis(tenantId);
    }

    @Post(':idTask')
    async createKpi(
        @Param('idTask') taskId: string,
        @Body() createKpiDto: KpiDto,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.KpiService.addKPItoTask(taskId, createKpiDto, tenantId);
    }

    @Get(':taskId/kpis')
    async getKPIsForTask(
        @Param('taskId') taskId: string,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.KpiService.getKPIsForTask(taskId, tenantId);
    }

    @Get('id/:kpiId')
    async getKPIById(
        @Param('kpiId') kpiId: string,
        @Req() req
    ) {
        const tenantId = req['tenantId'];
        return this.KpiService.getKPIbyID(kpiId, tenantId);
    }

}