import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CsrfController } from './csrf.controller';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from './guards/csrf.guard';
import { CsrfMiddleware } from './middleware/csrf.middleware';

@Module({
  imports: [ConfigModule],
  controllers: [CsrfController],
  providers: [CsrfService, CsrfGuard],
  exports: [CsrfService, CsrfGuard],
})
export class CsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply CSRF middleware globally
    consumer.apply(CsrfMiddleware).forRoutes('*');
  }
}
