import type { IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export type RunpodStatus = 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | string;

export interface RunpodResponse<T = unknown> {
  delayTime?: number;
  executionTime?: number;
  id: string;
  output?: T;
  status: RunpodStatus;
  workerId?: string;
}

export class RunpodClient {
  constructor(private httpRequest: (options: IHttpRequestOptions) => Promise<any>) {}

  private async request<T>(options: IHttpRequestOptions): Promise<T> {
    try {
      // Ensure authentication headers are included
      const requestOptions: IHttpRequestOptions = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      };
      return await this.httpRequest(requestOptions);
    } catch (err: any) {
      const message = err?.message ?? 'Runpod request failed';
      throw new NodeOperationError(this as any, message);
    }
  }

  async runSync<T>(modelId: string, input: unknown): Promise<RunpodResponse<T>> {
    return this.request<RunpodResponse<T>>({
      url: `https://api.runpod.ai/v2/${modelId}/runsync`,
      method: 'POST',
      body: { input },
      json: true,
    });
  }

  async run<T>(modelId: string, input: unknown): Promise<RunpodResponse<T>> {
    return this.request<RunpodResponse<T>>({
      url: `https://api.runpod.ai/v2/${modelId}/run`,
      method: 'POST',
      body: { input },
      json: true,
    });
  }

  async status<T>(modelId: string, jobId: string): Promise<RunpodResponse<T>> {
    return this.request<RunpodResponse<T>>({
      url: `https://api.runpod.ai/v2/${modelId}/status/${jobId}`,
      method: 'GET',
      json: true,
    });
  }
}

