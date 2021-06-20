import 'source-map-support/register';
import { NestFactory } from '@nestjs/core';
import { RpcException, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ValidationError, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.ORDER_SERVICE_HOST || 'localhost',
      port,
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: false,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        console.log(errors);
        return new RpcException(errors);
      },
    }),
  );
  app.listen(() => console.log(`Order service is running on port ${port}`));
}
bootstrap();
