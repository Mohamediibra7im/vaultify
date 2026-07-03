import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from './app.module';

const server = express();

async function createApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
}

// ponytail: Vercel serverless + local dev in one file
if (process.env.VERCEL) {
  createApp();
  module.exports = server;
} else {
  createApp().then(() => {
    const port = process.env.PORT || 4000;
    server.listen(port, () =>
      console.log(`Vaultify API running on http://localhost:${port}`),
    );
  });
}
