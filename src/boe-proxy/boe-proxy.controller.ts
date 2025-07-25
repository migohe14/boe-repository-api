import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Proxy BOE')
@Controller('legislacion-consolidada')
export class BoeProxyController {
  private readonly boeApiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
    const boeUrl = `${this.boeApiBaseUrl}/legislacion-consolidada`; // URL base sin parámetros

    const params = {
      // Si no se provee un límite, se usa 25 por defecto para que la UI de Swagger sea rápida.
      limit: limit === undefined ? 25 : limit,
    };

    await this.proxyRequest(boeUrl, req, res, params);
  }

  private async proxyRequest(url: string, req: Request, res: Response, params?: any) {
    try {
      // Construimos las cabeceras de forma segura, evitando valores 'undefined'
      const headers: Record<string, string> = {};
      if (req.headers.accept) {
        headers['Accept'] = req.headers.accept;
      }

      const boeResponse = await firstValueFrom(
        this.httpService.get(url, {
          params,
          headers, // Reenviamos la cabecera Accept si existe
          responseType: 'stream', // Usamos stream para eficiencia
        }),
      );
      res.set(boeResponse.headers); // Reenviamos las cabeceras de la respuesta
      boeResponse.data.pipe(res); // Enviamos la respuesta al cliente
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response) {
    if (error instanceof AxiosError && error.response) {
      // Si el error viene de la API del BOE, lo reenviamos tal cual
      res.status(error.response.status).set(error.response.headers);
      error.response.data.pipe(res);
    } else {
      // Si es un error de red u otro, enviamos un 500
      res.status(500).json({
        statusCode: 500,
        message: 'Error en el servidor proxy.',
        error: error.message,
      });
    }
  }
}
