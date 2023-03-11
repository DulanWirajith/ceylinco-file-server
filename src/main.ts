import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app: any = await NestFactory.create(AppModule);

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

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public' });

  await app.listen(3000);
}
bootstrap();
