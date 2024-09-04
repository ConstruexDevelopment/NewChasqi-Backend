import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { KPIService } from './kpi.service';
import { KPIController } from './kpi.controller';
import { TenantsMiddleware } from 'src/middlewares/tenants.middleware';
import { tenantModels } from 'src/providers/tenant-models.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { KPI, KPISchema } from './kpi.schema';
import { TasksModule } from 'src/tasks/task.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: KPI.name, schema: KPISchema}]),
        forwardRef(() => TasksModule),
    ],
    controllers: [KPIController],
    providers: [
        KPIService,
        tenantModels.kpiModel,
    ],
    exports: [KPIService, tenantModels.kpiModel],
})

export class KpiModule implements NestModule {
    configure(consumer: MiddlewareConsumer){
        consumer.apply(TenantsMiddleware).forRoutes(KPIController);
    }
}