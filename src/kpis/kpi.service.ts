import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Connection, Schema, Types } from 'mongoose';

import { KPI } from './kpi.schema';
import { Task } from 'src/tasks/task.schema';

import { isValidObjectId } from 'mongoose';
import { KpiDto } from './dto/kpi.dto';

@Injectable()
export class KPIService {
  constructor(
    @Inject('KPI_MODEL') private KpiModel: Model<KPI>,
    @Inject('TASK_MODEL') private TaskModel: Model<Task>, // Inyectar el modelo de empleados
    @Inject('TENANT_CONNECTION') private connection: Connection) { }

  private async getKpiModelForTenant(tenantId: string): Promise<Model<KPI & Document>> {
    const modelName = `Kpi_${tenantId}`;
    if (this.connection.models[modelName]) {
      return this.connection.models[modelName] as Model<KPI & Document>;
    }

    // Create a new schema based on the existing schema and add any additional properties
    const schema = new Schema(this.KpiModel.schema.obj as any, { strict: false });

    // Register and return the new model
    return this.connection.model<KPI & Document>(modelName, schema);
  }

  private async getTaskModelForTenant(tenantId: string): Promise<Model<Task & Document>> {
    const modelName = `Task_${tenantId}`;
    if (this.connection.models[modelName]) {
      return this.connection.models[modelName] as Model<Task & Document>;
    }

    // Create a new schema based on the existing schema and add any additional properties
    const schema = new Schema(this.TaskModel.schema.obj as any, { strict: false });

    // Register and return the new model
    return this.connection.model<Task & Document>(modelName, schema);
  }

  //<----------------------------------------CRUD KPIs--------------------------------------->

  async getAllKpis(tenantId: string) {
    const KpiModel = await this.getKpiModelForTenant(tenantId);
    return KpiModel.find();
  }

  async addKPItoTask(taskId: string, kpiDto: KpiDto, tenantId: string): Promise<KPI> {

    if (!isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid IDs');
    }

    const KpiModel = await this.getKpiModelForTenant(tenantId);

    // Validar que el timeUnit esté entre 0 y 5
    if (kpiDto.Time_Unit < 0 || kpiDto.Time_Unit > 5) {
      throw new BadRequestException('Invalid timeUnit value. It must be between 0 and 5.');
    }

    //Crear un nuevo KPI con la referencia a la tarea y tenantId
    const newKpi = new KpiModel({ ...kpiDto, taskId, tenantId });
    await newKpi.save();

    //Actualizar la referencia en la tarea
    const TaskModel = await this.getTaskModelForTenant(tenantId);
    const updateTask = await TaskModel.findOneAndUpdate(
      { _id: taskId, tenantId },
      { $push: { Kpis: newKpi._id } },
      { new: true, useFindAndModify: false }
    );

    if (!updateTask) {
      throw new NotFoundException('Task not found');
    }

    return newKpi;
  }

  async getKPIsForTask(taskId: string, tenantId: string) {
    if (!isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid IDs');
    }

    // Obtener el modelo de Task específico para el tenant
    const TaskModel = await this.getTaskModelForTenant(tenantId);

    // Obtener el modelo de KPI
    const KPIModel = await this.getKpiModelForTenant(tenantId);

    // Buscar la tarea por ID
    const task = await TaskModel.findOne({ _id: taskId, tenantId });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Obtener los KPIs asociados a la tarea
    const kpis = await KPIModel.find({ _id: { $in: task.Kpis } });

    return kpis;
  }

  async getKPIbyID(kpiId: string, tenantId: string): Promise<KPI> {
    
    if (!isValidObjectId(kpiId)) {
      throw new BadRequestException('Invalid KPI Id');
    }

    const KPIModel = await this.getKpiModelForTenant(tenantId);

    // Buscar la tarea por ID
    const kpi = await KPIModel.findOne({ _id: kpiId, tenantId });

    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }
    
    return kpi;
  }

}