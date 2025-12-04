import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { AuthController } from './auth.controller';
import { AuthPublicController } from './auth-public.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth/optional-jwt-auth.guard';
import { EmailService } from './services/email.service';
import { SessionService } from './services/session.service';
import { TwoFactorService } from './services/two-factor.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PasskeysModule } from './passkeys/passkeys.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    forwardRef(() => PasskeysModule), // Use forwardRef to handle circular dependency
    BullModule.registerQueue({
      name: 'email',
    }),
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
  controllers: [AuthController, AuthPublicController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    OptionalJwtAuthGuard,
    EmailService,
    SessionService,
    TwoFactorService,
  ],
  exports: [AuthService, SessionService, TwoFactorService],
})
export class AuthModule {}
