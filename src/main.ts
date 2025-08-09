import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('bootstrap')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')))
  app.useWebSocketAdapter(new IoAdapter(app))

  app.enableCors({
    origin: '*', 
  });

  const port = process.env.PORT || 3001
  await app.listen(port);

  logger.log(`Aplication listening on port port ${port}`)
}
bootstrap();
