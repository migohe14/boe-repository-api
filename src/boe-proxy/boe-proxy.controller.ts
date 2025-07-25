import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('Proxy BOE')
@Controller('legislacion-consolidada')
export class BoeProxyController {
  private readonly boeApiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    // Obtenemos la URL base de la API del BOE desde el archivo .env
    const boeApiUrl = this.configService.get<string>('BOE_API_BASE_URL');
    if (!boeApiUrl) {
      throw new Error('La variable de entorno BOE_API_BASE_URL no está definida.');
    }
    this.boeApiBaseUrl = boeApiUrl;
  }

  /**
   * Proxy para la lista de normas: /legislacion-consolidada
   */
  @Get()
  @ApiOperation({
    summary: 'Proxy para la lista de normas de legislación consolidada del BOE',
    description:
      'Reenvía una solicitud a la API del BOE para obtener una lista de leyes consolidadas. Por defecto, devuelve los primeros 25 resultados. Use el parámetro `limit` para cambiar esta cantidad o `limit=-1` para obtener todos los resultados (puede ser muy lento, usar Postamn).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description:
      'Número de resultados a devolver. Por defecto es 25.',
    type: Number,
    example: 25,
  })
  @ApiResponse({
    status: 200,
    description:
      'Respuesta exitosa desde la API del BOE. El contenido y el `Content-Type` son reenviados directamente. Se especifican los `content-types` soportados para que Swagger envíe una cabecera `Accept` válida.',
    content: {
      'application/json': {},
      'application/xml': {},
      'text/html': {},
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso no encontrado en la API del BOE.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno en el servidor proxy.',
  })
  async proxyList(
    @Query('limit') limit: number | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Creamos una clave de caché única basada en la URL original de la petición
    const cacheKey = `boe-proxy:${req.originalUrl}`;

    try {
      // 1. Comprobar si la respuesta está en la caché
      const cachedResponse = await this.cacheManager.get<{
        headers: Record<string, any>;
        body: any; // El body puede ser un buffer
      }>(cacheKey);

      if (cachedResponse) {
        // CACHE HIT: Si está, la enviamos directamente
        res.set(cachedResponse.headers).send(Buffer.from(cachedResponse.body));
        return;
      }

      // CACHE MISS: Si no está en caché, hacemos la petición a la API del BOE
      const boeUrl = `${this.boeApiBaseUrl}/legislacion-consolidada`;
      const params = { ...req.query };
      if (limit === undefined) {
        params.limit = '25';
      }

      const headers: Record<string, string> = {};
      if (req.headers.accept) {
        headers['Accept'] = req.headers.accept;
      }

      const boeResponse = await firstValueFrom(
        this.httpService.get(boeUrl, {
          params,
          headers,
          // IMPORTANTE: Usamos 'arraybuffer' para poder cachear la respuesta completa.
          // Esto funciona para cualquier tipo de contenido (JSON, XML, HTML).
          responseType: 'arraybuffer',
        }),
      );

      // 3. Guardar la respuesta en la caché
      const dataToCache = {
        headers: boeResponse.headers,
        body: boeResponse.data,
      };
      // Guardamos en caché por 24 horas (TTL en milisegundos para cache-manager v5+)
      await this.cacheManager.set(cacheKey, dataToCache, 86400000);

      // 4. Enviar la respuesta al cliente
      res.set(dataToCache.headers).send(dataToCache.body);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response) {
    if (error instanceof AxiosError && error.response) {
      // Si el error viene de la API del BOE, lo reenviamos
      res.status(error.response.status).set(error.response.headers);
      res.send(error.response.data); // Usamos .send() porque la data ya está cargada
    } else {
      // Si es un error de red u otro, enviamos un 500 genérico
      res.status(500).json({
        statusCode: 500,
        message: 'Error en el servidor proxy.',
      });
    }
  }
}
