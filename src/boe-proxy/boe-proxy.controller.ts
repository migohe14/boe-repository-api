import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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
  async proxyList(@Query() query: any, @Req() req: Request, @Res() res: Response) {
    const boeUrl = `${this.boeApiBaseUrl}/legislacion-consolidada`; // URL base sin parámetros

    // Forzamos que el límite sea -1 para obtener todos los resultados,
    // sobreescribiendo cualquier 'limit' que venga del cliente.
    const paramsWithFullLimit = {
      ...query,
      limit: -1,
    };

    await this.proxyRequest(boeUrl, req, res, paramsWithFullLimit);
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
