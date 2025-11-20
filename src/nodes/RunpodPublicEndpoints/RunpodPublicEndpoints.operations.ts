import type { INodeProperties } from 'n8n-workflow';

export const runpodProperties: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    options: [
      { name: 'Generate (Sync)', value: 'runSync', description: 'POST /runsync and return output' },
      { name: 'Generate (Async)', value: 'run', description: 'POST /run and return job id' },
      { name: 'Get Status', value: 'status', description: 'GET /status/{jobId}' },
    ],
    default: 'runSync',
  },
  {
    displayName: 'Model ID',
    name: 'modelId',
    type: 'string',
    default: 'black-forest-labs-flux-1-dev',
    description: 'Public Endpoint model ID (see Runpod model reference)',
    required: true,
  },
  {
    displayName: 'Input JSON',
    name: 'inputJson',
    type: 'json',
    typeOptions: { alwaysOpenEditWindow: true },
    default: { prompt: 'A serene mountain landscape at sunset', width: 1024, height: 1024 },
    displayOptions: { show: { operation: ['runSync','run'] } },
    description: 'Object passed under { input: ... }',
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

