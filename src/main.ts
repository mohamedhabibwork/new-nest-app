import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import { CsrfService } from './csrf/csrf.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const csrfService = app.get(CsrfService);

  // Cookie parser (required for CSRF)
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CSRF protection middleware - exclude public endpoints
  // Only enable if CSRF_ENABLED is true (default: true)
  const csrfEnabled = configService.get('CSRF_ENABLED') !== 'false';
  
  if (csrfEnabled) {
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Exclude public endpoints from CSRF protection
      const publicPaths = [
        '/auth/register',
        '/auth/login',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
        '/health',
        '/api',
        '/csrf/token',
      ];

      if (publicPaths.some((path) => req.path.startsWith(path))) {
        return next();
      }

      // Get secret from cookie or generate new one
      let secret: string = (req.cookies?.['csrf-secret'] as string) || '';
      if (!secret) {
        secret = csrfService.generateSecret();
        res.cookie('csrf-secret', secret, csrfService.getCookieOptions());
      }

      // Get token from header
      const token = req.headers['x-csrf-token'] as string;

      if (!token || !csrfService.verifyToken(secret, token)) {
        return res.status(403).json({ message: 'Invalid CSRF token' });
      }

      next();
    });
    console.log('✅ CSRF protection enabled');
  } else {
    console.log('⚠️  CSRF protection disabled (CSRF_ENABLED=false)');
  }


  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription(
      'Complete authentication system with login, register, password reset, and email verification',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Connect gRPC microservice (optional - only if GRPC_ENABLED is true)
  if (configService.get('GRPC_ENABLED') === 'true') {
    const grpcPort = configService.get('GRPC_PORT') || '5000';
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          protoPath: join(process.cwd(), 'src/grpc/proto/auth.proto'),
          url: `0.0.0.0:${grpcPort}`,
        },
      });

      await app.startAllMicroservices();
      console.log(`gRPC server is running on: 0.0.0.0:${grpcPort}`);
    } catch (error: any) {
      console.warn(`gRPC server failed to start: ${error.message}`);
    }
  }

  const port = configService.get('PORT') ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(
    `Swagger documentation available at: http://localhost:${port}/api`,
  );
}
void bootstrap();
