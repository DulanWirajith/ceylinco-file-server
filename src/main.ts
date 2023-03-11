import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // =>  FOR ENABLE CORS
  app.enableCors({
    allowedHeaders: ['content-type', 'authorization'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    origin: [
      'https://ceylinco-va-app-refcoins.web.app',
      'https://cva-dashboard-refoins.web.app',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  app.use('/uploads', express.static('../dist'));

  await app.listen(3000);
}
bootstrap();
