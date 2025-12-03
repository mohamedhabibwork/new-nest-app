import { Module } from '@nestjs/common';
import { AuthGrpcController } from './auth-grpc.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AuthGrpcController],
})
export class GrpcModule {}
