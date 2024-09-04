import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TenantsMiddleware } from 'src/middlewares/tenants.middleware';
import { tenantModels } from 'src/providers/tenant-models.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './task.schema';
import { EmployeessModule } from 'src/employees/employees.module';
import { KpiModule } from 'src/kpis/kpi.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
        EmployeessModule,
        forwardRef(() => KpiModule),
    ],
    controllers: [TaskController],
    providers: [
        TaskService,
        tenantModels.taskModel,
    ],
    exports: [TaskService, tenantModels.taskModel],
})

export class TasksModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TenantsMiddleware).forRoutes(TaskController);
    }
}