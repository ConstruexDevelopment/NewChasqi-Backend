import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TenantsMiddleware } from 'src/middlewares/tenants.middleware';
import { tenantModels } from 'src/providers/tenant-models.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './task.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])],
    controllers: [TaskController],
    providers: [
        TaskService,
        tenantModels.taskModel,
    ],
    exports: [TaskService]
})
export class TasksModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(TenantsMiddleware).forRoutes(TaskController);
    }
}