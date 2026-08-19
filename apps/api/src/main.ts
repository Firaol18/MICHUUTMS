import { NestFactory } from '@nestjs/core';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for both frontend apps
  app.enableCors({
    origin: [
      'http://localhost:5173', // Public portal
      'http://localhost:5174', // Admin portal
      'http://localhost:5175', // Public portal (fallback port)
      'http://localhost:5176', // Admin portal (fallback port)
      ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Serve static assets from public folder
  app.use(express.static(join(process.cwd(), 'public')));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('MICHUU TMS API')
    .setDescription('Tourism Management System — Account Management, Users, Auth & RBAC')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`📄 Swagger docs at http://localhost:${port}/api`);
}
bootstrap();


