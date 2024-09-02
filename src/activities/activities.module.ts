import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantsMiddleware } from 'src/middlewares/tenants.middleware';
import { tenantModels } from 'src/providers/tenant-models.provider';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';

@Module({
    controllers: [ActivitiesController],
    providers: [
        ActivitiesService,
        tenantModels.activityModel,
    ],
})

export class ActivityModule implements NestModule {
    configure(consumer: MiddlewareConsumer){
        consumer.apply(TenantsMiddleware).forRoutes(ActivitiesController);
    }
}

