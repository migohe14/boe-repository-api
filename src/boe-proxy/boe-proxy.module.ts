import { Module } from '@nestjs/common';
import { BoeProxyController } from './boe-proxy.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

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
    CacheModule.registerAsync({
      isGlobal: true, // Hace el módulo de caché disponible en toda la app
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // The redisStore function from cache-manager-redis-store is synchronous
        store: redisStore({
          // Usamos la URL de conexión directamente, que es más simple para Upstash
          url: configService.get<string>('REDIS_URL'),
          // TTL por defecto para todas las claves en milisegundos (24 horas)
          ttl: 86400000, // 24 * 60 * 60 * 1000
        }),
      }),
    }),
  ],
  controllers: [BoeProxyController],
})
export class BoeProxyModule {}
