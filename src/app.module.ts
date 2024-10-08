import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantsModule } from './tenants/tenants.module';
import config from './config/config';
import { TasksModule } from './tasks/task.module';
import { EmployeessModule } from './employees/employees.module';
import { KpiModule } from './kpis/kpi.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
    TenantsModule,
    EmployeessModule,
    TasksModule,
    KpiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
