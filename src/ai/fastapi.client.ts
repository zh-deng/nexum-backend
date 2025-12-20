import { Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class FastApiClient implements OnModuleInit {
  constructor(private readonly http: HttpService) {}

  onModuleInit() {
    const baseUrl = process.env.FASTAPI_BASE_URL || 'http://host.docker.internal:8000';
    const hasToken = Boolean(process.env.FASTAPI_INTERNAL_TOKEN);

    console.log('FastAPI client configured', {
      baseUrl,
      tokenPresent: hasToken,
    });
  }

  async request<T, D>(
    endpoint: string,
    options: {
      method?: 'POST';
      data?: D;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://host.docker.internal:8000';

    const { method = 'POST', data, headers = {}, timeout = 30_000 } = options;

    try {
      const response = await firstValueFrom(
        this.http.request<T>({
          method,
          url: `${FASTAPI_BASE_URL}${endpoint}`,
          data,
          timeout,
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Token': process.env.FASTAPI_INTERNAL_TOKEN,
            ...headers,
          },
        })
      );

      return response.data;
    } catch (error: unknown) {
      // Handle axios errors
      if (error instanceof AxiosError) {
        // Log details for observability in Fly logs

        console.error('FastAPI request error', {
          endpoint,
          status: error.response?.status,
          // Avoid logging sensitive headers/body; include safe summary
          responseDataType: typeof error.response?.data,
          responseDataSummary:
            typeof error.response?.data === 'string'
              ? error.response.data.slice(0, 500)
              : undefined,
          message: error.message,
        });

        if (error.response) {
          const message =
            error.response.data && typeof error.response.data.message === 'string'
              ? (error.response.data.message as string)
              : `Upstream FastAPI error: status ${error.response.status}`;
          // Return 502 to indicate upstream service failure
          throw new HttpException(message, HttpStatus.BAD_GATEWAY);
        }
        // Network error / timeout
        throw new HttpException(
          'Upstream FastAPI unreachable: ' + (error.message || 'Request failed'),
          HttpStatus.GATEWAY_TIMEOUT
        );
      }

      console.error('Unknown error calling FastAPI', { endpoint, error });
      throw new HttpException('Unknown upstream error', HttpStatus.BAD_GATEWAY);
    }
  }
}
