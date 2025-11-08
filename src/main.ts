import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config/config.loader';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

const env = validateEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Nexum')
    .setDescription('API documentation for Nexum')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unexpected fields
      forbidNonWhitelisted: true, // throws error if unknown fields provided
      transform: true, // auto-converts DTO fields (string → Date, etc.)
    }),
  );

  const port = env.PORT || 3000;
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
