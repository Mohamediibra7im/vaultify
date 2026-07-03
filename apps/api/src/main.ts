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

// ponytail: Ensure app is ready before handling any request
const ready = createApp();

// ponytail: Vercel serverless — export handler that awaits init
module.exports = async (req: any, res: any) => {
  await ready;
  server(req, res);
};

// ponytail: Local dev — listen on port
if (!process.env.VERCEL) {
  ready.then(() => {
    const port = process.env.PORT || 4000;
    server.listen(port, () =>
      console.log(`Vaultify API running on http://localhost:${port}`),
    );
  });
}
