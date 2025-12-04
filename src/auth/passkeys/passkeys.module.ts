import { Module, forwardRef } from '@nestjs/common';
import { PasskeysController } from './passkeys.controller';
import { PasskeysService } from './passkeys.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule), // Import AuthModule to get AuthService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: (configService.get('JWT_EXPIRES_IN') || '24h') as string &
            number,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PasskeysController],
  providers: [PasskeysService],
  exports: [PasskeysService],
})
export class PasskeysModule {}
