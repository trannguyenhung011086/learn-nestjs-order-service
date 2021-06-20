import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CronService } from './cron/cron.service';
import { UtilsService } from './utils/utils.service';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot(), DatabaseModule],
  controllers: [AppController],
  providers: [
    {
      provide: 'PAYMENT_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: configService.get('PAYMENT_SERVICE_HOST') || 'localhost',
            port: configService.get('PAYMENT_SERVICE_PORT') || '3002',
          },
        }),
    },
    AppService,
    CronService,
    UtilsService,
  ],
})
export class AppModule {}
