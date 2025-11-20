import type { INodeProperties } from 'n8n-workflow';

export const runpodProperties: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
      { name: 'Generate Text', value: 'generateText', description: 'Generate text using chat models (Granite, Qwen3)' },
      { name: 'Generate Image', value: 'generateImage', description: 'Generate images using diffusion models (Flux, Qwen Image, Seedream)' },
      { name: 'Generate Video', value: 'generateVideo', description: 'Generate videos using video models (WAN, Seedance, Kling)' },
      { name: 'Generate Audio', value: 'generateAudio', description: 'Generate or process audio using audio models (Whisper, Minimax)' },
      { name: 'Get Status', value: 'status', description: 'Check status of async job' },
    ],
    default: 'generateText',
  },
  {
    displayName: 'Model',
    name: 'modelId',
    type: 'options',
    typeOptions: {
      loadOptionsMethod: 'getRunpodModels',
    },
    default: '',
    description: 'Select a Runpod Public Endpoint model',
    required: true,
    displayOptions: { show: { operation: ['generateText','generateImage','generateVideo','generateAudio','status'] } },
  },
  {
    displayName: 'Input JSON',
    name: 'inputJson',
    type: 'string',
    typeOptions: { 
      rows: 12
    },
    default: '// EXAMPLE CODE - Choose format based on your model:\n// 📚 Full docs: https://docs.runpod.io/hub/public-endpoint-reference\n\n// TEXT MODELS (Granite, Qwen3):\n{\n  "messages": [\n    {\n      "role": "system",\n      "content": "You are a helpful assistant."\n    },\n    {\n      "role": "user",\n      "content": "What is Runpod?"\n    }\n  ],\n  "sampling_params": {\n    "max_tokens": 512,\n    "temperature": 0.7,\n    "seed": -1,\n    "top_k": -1,\n    "top_p": 1\n  }\n}\n\n// IMAGE MODELS (Flux, Qwen Image, Seedream):\n{\n  "prompt": "A serene mountain landscape at sunset",\n  "negative_prompt": "blurry, low quality",\n  "width": 1024,\n  "height": 1024,\n  "num_inference_steps": 20,\n  "guidance": 7.5,\n  "seed": 42,\n  "image_format": "png"\n}\n\n// VIDEO MODELS (WAN, Seedance, Kling):\n{\n  "prompt": "A serene morning in an ancient forest, golden sunlight filtering through tall pine trees",\n  "num_inference_steps": 30,\n  "guidance": 5,\n  "negative_prompt": "",\n  "size": "1280*720",\n  "duration": 5,\n  "flow_shift": 5,\n  "seed": -1,\n  "enable_prompt_optimization": false,\n  "enable_safety_checker": true\n}',
    displayOptions: { show: { operation: ['generateText','generateImage','generateVideo','generateAudio'] } },
    description: 'JSON object passed under { input: ... }. Format varies by model type. See examples above and Runpod docs: https://docs.runpod.io/hub/public-endpoint-reference',
  },
  {
    displayName: 'Job ID',
    name: 'jobId',
    type: 'string',
    default: '',
    required: true,
    displayOptions: { show: { operation: ['status'] } },
  },
  {
    displayName: 'Wait for Completion',
    name: 'wait',
    type: 'boolean',
    default: false,
    displayOptions: { show: { operation: ['run'] } },
  },
  {
    displayName: 'Poll Interval (ms)',
    name: 'pollMs',
    type: 'number',
    typeOptions: { minValue: 250, maxValue: 10000 },
    default: 1000,
    displayOptions: { show: { operation: ['run'], wait: [true] } },
  },
  {
    displayName: 'Timeout (seconds)',
    name: 'timeoutSeconds',
    type: 'number',
    typeOptions: { minValue: 5, maxValue: 600 },
    default: 60,
    displayOptions: { show: { operation: ['run'], wait: [true] } },
  },
  {
    displayName: 'Download Output as Binary',
    name: 'download',
    type: 'boolean',
    default: false,
    description: 'If true, fetch image_url/audio_url and attach to binary output',
  },
];

