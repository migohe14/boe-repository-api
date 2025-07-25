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
      'Reenvía una solicitud a la API del BOE para obtener **todas** las leyes consolidadas. Utiliza el parámetro `limit=-1` que la API del BOE soporta para este fin.'
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
  async proxyList(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const boeUrl = `${this.boeApiBaseUrl}/legislacion-consolidada`; // URL base sin parámetros

    // Creamos el objeto de parámetros únicamente con `limit: -1`.
    // Se elimina `...query` para evitar enviar parámetros conflictivos (como `formato`)
    // que causaban el error 400 al probar desde Swagger.
    const params = {
      limit: -1,
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
