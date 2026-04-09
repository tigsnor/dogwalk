import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const env = getEnv();

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(env.port);
  // eslint-disable-next-line no-console
  console.log(`DogWalk API running on port ${env.port}`);
}

void bootstrap();
