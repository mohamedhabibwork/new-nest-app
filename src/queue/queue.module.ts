import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './processors/email.processor';
import { EmailService } from '../auth/services/email.service';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT') || '6379'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailProcessor, EmailService],
  exports: [BullModule],
})
export class QueueModule {}
