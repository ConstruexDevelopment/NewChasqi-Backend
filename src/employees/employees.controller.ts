import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Req, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AddFielEmployeeDto } from './dto/add-field-employee.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Get()
  getEmployees(@Req() req) {
    const tenantId = req['tenantId'];
    return this.employeesService.getEmployees(tenantId);
  }

  @Post()
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req) {
    const tenantId = req['tenantId'];
    return this.employeesService.createEmployee(createEmployeeDto, tenantId);
  }

  @Post('add-field')
  async addField(@Body() addFieldDto: AddFielEmployeeDto, @Req() req) {
    const tenantId = req['tenantId'];
    return this.employeesService.addFieldEmployee(addFieldDto, tenantId);
  }

  @Put(':id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.updateEmployee(id, updateEmployeeDto, tenantId);
  }

  @Delete(':id')
  async deleteEmployee(@Req() req, @Param('id') id: string): Promise<{ message: string }> {
    const tenantId = req['tenantId'];
    return this.employeesService.deleteEmployee(id, tenantId);
  }

  @Get(':id/name')
  async getEmployeeName(
    @Param('id') employeeId: string,
    @Req() req
  ): Promise<string> {
    const tenantId = req['tenantId'];
    return this.employeesService.getEmployeeName(employeeId, tenantId);
  }
}
  
