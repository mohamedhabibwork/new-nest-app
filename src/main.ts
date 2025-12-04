import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Security headers with Helmet
  app.use(helmet());

  // Compression middleware
  app.use(compression());

  // Cookie parser (required for CSRF)
  app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-CSRF-Token',
      'X-Request-ID',
      'X-Correlation-ID',
    ],
  });

  // Enable API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe with enhanced options
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: false,
      },
      skipMissingProperties: false,
      skipNullProperties: false,
      skipUndefinedProperties: false,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (errors) => {
        const formatted: Record<string, string[]> = {};
        errors.forEach((error) => {
          formatted[error.property] = Object.values(error.constraints || {});
        });
        return new BadRequestException({
          message: 'Validation failed',
          errors: formatted,
        });
      },
    }),
  );

  // Global exception filters
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector, {
      excludeExtraneousValues: true,
      exposeDefaultValues: false,
    }),
    new TransformInterceptor(),
    new LoggingInterceptor(),
  );

  // CSRF protection is handled by CsrfMiddleware in CsrfModule
  // Configured via NestModule.configure() method
  const csrfEnabled = configService.get('CSRF_ENABLED') !== 'false';
  if (csrfEnabled) {
    console.log('✅ CSRF protection enabled via middleware');
  } else {
    console.log('⚠️  CSRF protection disabled (CSRF_ENABLED=false)');
  }

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('PMS API')
    .setDescription(
      'Complete Project Management System API with authentication, workspaces, projects, tasks, collaboration, notifications, and file management',
    )
    .setVersion('1.0')
    .setContact('API Support', 'https://example.com', 'support@example.com')
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
    .addTag('workspaces', 'Workspace management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('tasks', 'Task management endpoints')
    .addTag('collaboration', 'Collaboration endpoints (comments, time logs)')
    .addTag('notifications', 'Notification management endpoints')
    .addTag('files', 'File management endpoints')
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.warn(`gRPC server failed to start: ${errorMessage}`);
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
