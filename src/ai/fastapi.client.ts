import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class FastApiClient {
  constructor(private readonly http: HttpService) {}

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
      if (error instanceof AxiosError && error.response) {
        const message =
          error.response.data && typeof error.response.data.message === 'string'
            ? (error.response.data.message as string)
            : `Request failed with status ${error.response.status}`;
        throw new Error(message);
      }
      throw error;
    }
  }
}
