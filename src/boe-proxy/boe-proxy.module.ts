import { Module } from '@nestjs/common';
import { BoeProxyController } from './boe-proxy.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // HttpModule nos permite realizar peticiones HTTP
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        timeout: 100000, // Timeout de 100 segundos  ** Traer toda la lesgislación - mejora usar caché Redis
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [BoeProxyController],
})
export class BoeProxyModule {}

