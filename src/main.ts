import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('BOE Repository API')
    .setDescription(
      'Proxy API para el servicio de Legislación Consolidada del BOE',
    )
    .setVersion('1.0')
    .addTag('Proxy BOE', 'Endpoints que actúan como proxy para la API del BOE')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();