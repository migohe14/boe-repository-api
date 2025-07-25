import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BoeProxyModule } from './boe-proxy/boe-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigService esté disponible en toda la app
    }),
    BoeProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

