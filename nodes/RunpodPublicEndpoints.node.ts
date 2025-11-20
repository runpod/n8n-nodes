import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { runpodProperties } from './RunpodPublicEndpoints.description';
import { RunpodResponse } from '../src/helpers/RunpodClient';

export class RunpodPublicEndpoints implements INodeType {
  // Simple in-memory cache for models
  private static modelCache: { data: string[], timestamp: number } | null = null;
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  description: INodeTypeDescription = {
    displayName: 'Runpod Public Endpoints',
    name: 'runpod-public-endpoints',
    icon: 'file:runpod-cube.svg',
    group: ['transform'],
    version: 1,
    description: 'Call Runpod Public Endpoints (sync/async)',
    defaults: { name: 'Runpod' },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [{ name: 'runpodPublicEndpointsApi', required: true }],
    properties: runpodProperties,
  };

  private static isCacheValid(): boolean {
    if (!RunpodPublicEndpoints.modelCache) return false;
    const now = Date.now();
    return (now - RunpodPublicEndpoints.modelCache.timestamp) < RunpodPublicEndpoints.CACHE_TTL;
  }

  private static async fetchModelsFromAPI(httpRequest: any): Promise<string[]> {
    try {
      const response = await httpRequest({
        url: 'https://api.runpod.io/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          query: `query GetPublicEndpoints {
            allAiApiPublicConfigs {
              aiApiId
            }
          }`
        },
        json: true,
      });

      const models = response.data?.allAiApiPublicConfigs?.map((config: any) => config.aiApiId) || [];
      
      // Update cache
      RunpodPublicEndpoints.modelCache = {
        data: models,
        timestamp: Date.now()
      };

      return models;
    } catch (error) {
      console.warn('Failed to fetch models from GraphQL API:', error);
      throw error;
    }
  }

  methods = {
    loadOptions: {
      async getRunpodModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        // Get the current operation to filter models
        const operation = this.getCurrentNodeParameter('operation') as string;
        
        try {
          let models: string[];
          
          // Check if we have valid cached data
          if (RunpodPublicEndpoints.isCacheValid()) {
            models = RunpodPublicEndpoints.modelCache!.data;
            console.log('Using cached models data');
          } else {
            // Fetch fresh data from API
            models = await RunpodPublicEndpoints.fetchModelsFromAPI(this.helpers.httpRequest);
            console.log('Fetched fresh models data from API');
          }
          
          // Categorize models based on their names/IDs
          const categorizedModels = RunpodPublicEndpoints.categorizeModels(models);
          
                 // Return models based on selected operation
                 switch (operation) {
                   case 'generateText':
                     return categorizedModels.text;
                   case 'generateImage':
                     return categorizedModels.image;
                   case 'generateVideo':
                     return categorizedModels.video;
                   case 'generateAudio':
                     return categorizedModels.audio;
                   case 'status':
                     // For status, return all models since we don't know which type was used
                     return [...categorizedModels.text, ...categorizedModels.image, ...categorizedModels.video, ...categorizedModels.audio];
                   default:
                     // Default to text models
                     return categorizedModels.text;
                 }
        } catch (error) {
          // Fallback to hardcoded models if GraphQL API fails
          console.warn('Failed to fetch models from GraphQL API, using fallback:', error);
          return RunpodPublicEndpoints.getFallbackModels(operation);
        }
      },
    },
  };

  static categorizeModels(models: string[]): { text: INodePropertyOptions[], image: INodePropertyOptions[], video: INodePropertyOptions[], audio: INodePropertyOptions[] } {
    const textModels: INodePropertyOptions[] = [];
    const imageModels: INodePropertyOptions[] = [];
    const videoModels: INodePropertyOptions[] = [];
    const audioModels: INodePropertyOptions[] = [];

    models.forEach(modelId => {
      const displayName = RunpodPublicEndpoints.getModelDisplayName(modelId);
      
      // Categorize based on model name patterns
      if (modelId.includes('granite') || modelId.includes('qwen3') || modelId.includes('deep-cogito') || modelId.includes('infinitetalk')) {
        textModels.push({ name: `${displayName} (Text)`, value: modelId });
      } else if (modelId.includes('flux') || modelId.includes('qwen-image') || modelId.includes('seedream')) {
        imageModels.push({ name: `${displayName} (Image)`, value: modelId });
      } else if (modelId.includes('nano-banana')) {
        imageModels.push({ name: `${displayName} (Image Edit)`, value: modelId });
      } else if (modelId.includes('wan') || modelId.includes('seedance') || modelId.includes('kling') || modelId.includes('sora')) {
        videoModels.push({ name: `${displayName} (Video)`, value: modelId });
      } else if (modelId.includes('whisper') || modelId.includes('minimax')) {
        audioModels.push({ name: `${displayName} (Audio)`, value: modelId });
      } else {
        // Default to text for unknown models
        textModels.push({ name: `${displayName} (Text)`, value: modelId });
      }
    });

    return { text: textModels, image: imageModels, video: videoModels, audio: audioModels };
  }

  static getModelDisplayName(modelId: string): string {
    // Convert model IDs to human-readable names
    const nameMap: { [key: string]: string } = {
      'granite-4-0-h-small': 'Granite 4.0 H Small',
      'qwen3-32b-awq': 'Qwen3 32B AWQ',
      'deep-cogito-v2-llama-70b': 'Deep Cogito v2 Llama 70B',
      'infinitetalk': 'InfiniteTalk',
      'black-forest-labs-flux-1-dev': 'Flux Dev',
      'black-forest-labs-flux-1-schnell': 'Flux Schnell',
      'black-forest-labs-flux-1-kontext-dev': 'Flux Kontext Dev',
      'qwen-image-t2i': 'Qwen Image',
      'qwen-image-t2i-lora': 'Qwen Image LoRA',
      'qwen-image-edit': 'Qwen Image Edit',
      'seedream-v4-t2i': 'Seedream 4.0 T2I',
      'seedream-v4-edit': 'Seedream 4.0 Edit',
      'seedream-3-0-t2i': 'Seedream 3.0',
      'nano-banana-edit': 'Nano Banana Edit',
      'seedance-1-0-pro': 'Seedance 1.0 Pro',
      'wan-2-5': 'WAN 2.5',
      'wan-2-2-t2v-720-lora': 'WAN 2.2 I2V 720p LoRA',
      'wan-2-2-i2v-720': 'WAN 2.2 I2V 720p',
      'wan-2-2-t2v-720': 'WAN 2.2 T2V 720p',
      'wan-2-1-i2v-720': 'WAN 2.1 I2V 720p',
      'wan-2-1-t2v-720': 'WAN 2.1 T2V 720p',
      'kling-v2-1-i2v-pro': 'Kling v2.1 I2V Pro',
      'sora-2-pro-i2v': 'Sora 2 Pro I2V',
      'sora-2-i2v': 'Sora 2 I2V',
      'whisper-v3-large': 'Whisper V3 Large',
      'minimax-speech-02-hd': 'Minimax Speech 02 HD',
    };

    return nameMap[modelId] || modelId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  static getFallbackModels(operation: string): INodePropertyOptions[] {
    // Fallback models if GraphQL API fails
    const textModels = [
      { name: 'Granite 4.0 H Small (Text)', value: 'granite-4-0-h-small' },
      { name: 'Qwen3 32B AWQ (Text)', value: 'qwen3-32b-awq' },
    ];

    const imageModels = [
      { name: 'Flux Dev (Image)', value: 'black-forest-labs-flux-1-dev' },
      { name: 'Flux Schnell (Image)', value: 'black-forest-labs-flux-1-schnell' },
      { name: 'Qwen Image (Image)', value: 'qwen-image-t2i' },
    ];

    const videoModels = [
      { name: 'Seedance 1.0 Pro (Video)', value: 'seedance-1-0-pro' },
      { name: 'WAN 2.5 (Video)', value: 'wan-2-5' },
    ];

    const audioModels = [
      { name: 'Whisper V3 Large (Audio)', value: 'whisper-v3-large' },
    ];

    switch (operation) {
      case 'generateText': return textModels;
      case 'generateImage': return imageModels;
      case 'generateVideo': return videoModels;
      case 'generateAudio': return audioModels;
      case 'status': return [...textModels, ...imageModels, ...videoModels, ...audioModels];
      default: return textModels;
    }
  }

  static getDefaultInputJson(modelId: string): string {
    // Text models
    if (modelId.includes('granite') || modelId.includes('qwen3') || modelId.includes('deep-cogito') || modelId.includes('infinitetalk')) {
      return JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'What is Runpod?'
          }
        ],
        sampling_params: {
          max_tokens: 512,
          temperature: 0.7,
          seed: -1,
          top_k: -1,
          top_p: 1
        }
      }, null, 2);
    }
    
    // Image models
    if (modelId.includes('flux') || modelId.includes('qwen-image') || modelId.includes('seedream')) {
      return JSON.stringify({
        prompt: 'A serene mountain landscape at sunset',
        negative_prompt: 'blurry, low quality',
        width: 1024,
        height: 1024,
        num_inference_steps: 20,
        guidance: 7.5,
        seed: 42,
        image_format: 'png'
      }, null, 2);
    }
    
    // Image editing models (require images array)
    if (modelId.includes('nano-banana')) {
      return JSON.stringify({
        images: [
          "https://example.com/source-image.jpg"
        ],
        prompt: "Make this image more vibrant and colorful",
        negative_prompt: "blurry, low quality",
        num_inference_steps: 20,
        guidance: 7.5,
        seed: 42,
        image_format: "png"
      }, null, 2);
    }
    
    // Video models
    if (modelId.includes('wan') || modelId.includes('seedance') || modelId.includes('kling') || modelId.includes('sora')) {
      return JSON.stringify({
        prompt: 'A serene morning in an ancient forest, golden sunlight filtering through tall pine trees',
        num_inference_steps: 30,
        guidance: 5,
        negative_prompt: '',
        size: '1280*720',
        duration: 5,
        flow_shift: 5,
        seed: -1,
        enable_prompt_optimization: false,
        enable_safety_checker: true
      }, null, 2);
    }
    
    // Audio models
    if (modelId.includes('whisper') || modelId.includes('minimax')) {
      return JSON.stringify({
        audio: 'https://example.com/audio.mp3',
        language: 'en',
        response_format: 'json'
      }, null, 2);
    }
    
    // Default fallback
    return JSON.stringify({
      prompt: 'Hello, world!',
      max_tokens: 100,
      temperature: 0.7
    }, null, 2);
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();

    const operation = this.getNodeParameter('operation', 0) as 'generateText' | 'generateImage' | 'generateVideo' | 'generateAudio' | 'status';
    const modelId = this.getNodeParameter('modelId', 0) as string;
    
    // Auto-populate Input JSON if it's empty
    let inputJson = this.getNodeParameter('inputJson', 0, '') as string;
    if (!inputJson.trim()) {
      inputJson = RunpodPublicEndpoints.getDefaultInputJson(modelId);
    }

    // Get the API key from credentials
    const credentials = await this.getCredentials('runpodPublicEndpointsApi');
    if (!credentials?.apiKey) {
      throw new NodeOperationError(this.getNode(), 'Runpod API key is required');
    }

    const results: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
          try {
            if (operation === 'generateText' || operation === 'generateImage' || operation === 'generateVideo' || operation === 'generateAudio') {
              const input = JSON.parse(inputJson);
              const wait = this.getNodeParameter('wait', i, false) as boolean;
              
              let response: any;
              
              if (wait) {
                // Use async with polling
                response = await RunpodPublicEndpoints.runAsyncWithPolling(this, modelId, input, credentials.apiKey as string, i);
              } else {
                // Use sync endpoint
                response = await this.helpers.httpRequest({
                  url: `https://api.runpod.ai/v2/${modelId}/runsync`,
                  method: 'POST',
                  body: { input },
                  json: true,
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${credentials.apiKey}`,
                  },
                });
              }
              
              const item = await RunpodPublicEndpoints.buildOutput(this, response, modelId, { download: this.getNodeParameter('download', i, false) as boolean });
              results.push(item);
            } else if (operation === 'status') {
              const jobId = this.getNodeParameter('jobId', i) as string;
              const response = await this.helpers.httpRequest({
                url: `https://api.runpod.ai/v2/${modelId}/status/${jobId}`,
                method: 'GET',
                json: true,
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${credentials.apiKey}`,
                },
              });
              const item = await RunpodPublicEndpoints.buildOutput(this, response, modelId, { download: this.getNodeParameter('download', i, false) as boolean });
              results.push(item);
            }
          } catch (err: any) {
            throw new NodeOperationError(this.getNode(), err?.message ?? 'Runpod error', { itemIndex: i });
          }
        }

    return [results];
  }

  private static async runAsyncWithPolling(executeFunctions: IExecuteFunctions, modelId: string, input: any, apiKey: string, itemIndex: number): Promise<any> {
    // Start async job
    const startResponse = await executeFunctions.helpers.httpRequest({
      url: `https://api.runpod.ai/v2/${modelId}/run`,
      method: 'POST',
      body: { input },
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    const jobId = startResponse.id;
    if (!jobId) {
      throw new NodeOperationError(executeFunctions.getNode(), 'Failed to start async job - no job ID returned');
    }

    // Poll for completion
    const pollMs = executeFunctions.getNodeParameter('pollMs', itemIndex, 1000) as number;
    const timeoutSeconds = executeFunctions.getNodeParameter('timeoutSeconds', itemIndex, 60) as number;
    const timeoutMs = timeoutSeconds * 1000;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const statusResponse = await executeFunctions.helpers.httpRequest({
        url: `https://api.runpod.ai/v2/${modelId}/status/${jobId}`,
        method: 'GET',
        json: true,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (statusResponse.status === 'COMPLETED') {
        return statusResponse;
      } else if (statusResponse.status === 'FAILED') {
        throw new NodeOperationError(executeFunctions.getNode(), `Job failed: ${jobId}`);
      }

      // Wait before next poll using a simple counter instead of setTimeout
      const pollStartTime = Date.now();
      while (Date.now() - pollStartTime < pollMs) {
        // Simple busy wait - this is acceptable for short polling intervals
      }
    }

    throw new NodeOperationError(executeFunctions.getNode(), `Job timed out after ${timeoutSeconds} seconds: ${jobId}`);
  }

  private static async buildOutput(executeFunctions: IExecuteFunctions, res: RunpodResponse<any>, modelId: string, opts: { download: boolean }): Promise<INodeExecutionData> {
    const json: IDataObject = { ...res, modelId };

    if (!opts.download) return { json };

    const output = res.output as IDataObject;
    const url = output?.image_url || output?.audio_url || output?.file_url;
    if (!url || typeof url !== 'string') return { json };

    // For now, just return JSON with the URL
    // TODO: Implement binary download when we have the correct method
    json.downloadUrl = url;
    return { json };
  }
}
