import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config/config.loader';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

const env = validateEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  
  await app.listen(env.PORT);
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
