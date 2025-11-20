# n8n Community Node: Runpod Public Endpoints

[![npm version](https://badge.fury.io/js/n8n-nodes-runpod-public-endpoints.svg)](https://badge.fury.io/js/n8n-nodes-runpod-public-endpoints)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A powerful n8n Community Node that provides seamless integration with Runpod's Public Endpoints API. Generate text, images, videos, and audio using cutting-edge AI models with dynamic model discovery and smart categorization.

## 🚀 Features

- **🔄 Dynamic Model Discovery** - Automatically fetches all available Runpod models via GraphQL API
- **🎯 Smart Categorization** - Models automatically sorted by Text/Image/Video/Audio
- **⚡ Performance Optimized** - 5-minute caching reduces API calls
- **🛡️ Robust Error Handling** - Fallback to hardcoded models if API fails
- **📝 Built-in Examples** - Pre-configured JSON templates for each model type
- **🔐 Secure Authentication** - API key stored securely in n8n credentials
- **🎨 Clean UI** - Custom icon and intuitive interface

## 📦 Installation

### Method 1: npm (Recommended)

```bash
npm install n8n-nodes-runpod-public-endpoints
```

### Method 2: n8n Community Nodes

1. Go to **Settings** → **Community Nodes** in your n8n instance
2. Click **Install a community node**
3. Search for `n8n-nodes-runpod-public-endpoints`
4. Click **Install**

### Method 3: Manual Installation

```bash
# Clone the repository
git clone https://github.com/runpod/n8n-nodes-runpod-public-endpoints.git
cd n8n-nodes-runpod-public-endpoints

# Install dependencies
npm install

# Build the node
npm run build

# Link to n8n (for development)
npm link
```

## 🔧 Setup

### 1. Get Your Runpod API Key

1. Sign up at [Runpod](https://runpod.io)
2. Go to **Settings** → **API Keys**
3. Create a new API key
4. Copy the key (starts with `rpa_`)

### 2. Configure Credentials in n8n

1. In n8n, go to **Credentials** → **Add Credential**
2. Search for **Runpod API**
3. Enter your API key
4. Test the connection

## 🎯 Usage

### Basic Workflow

1. **Add the Node** - Search for "Runpod Public Endpoints" in the nodes panel
2. **Select Operation** - Choose from:
   - **Generate Text** - Chat models (Granite, Qwen3, Deep Cogito)
   - **Generate Image** - Diffusion models (Flux, Qwen Image, Seedream)
   - **Generate Video** - Video models (WAN, Seedance, Kling, Sora)
   - **Generate Audio** - Audio models (Whisper, Minimax)
   - **Get Status** - Check async job status

3. **Choose Model** - Dropdown automatically shows relevant models
4. **Configure Input** - Use built-in examples or customize JSON
5. **Execute** - Run your workflow!

### Example Operations

#### Text Generation
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "What is Runpod?"
    }
  ],
  "sampling_params": {
    "max_tokens": 512,
    "temperature": 0.7,
    "seed": -1,
    "top_k": -1,
    "top_p": 1
  }
}
```

#### Image Generation
```json
{
  "prompt": "A serene mountain landscape at sunset",
  "negative_prompt": "blurry, low quality",
  "width": 1024,
  "height": 1024,
  "num_inference_steps": 20,
  "guidance": 7.5,
  "seed": 42,
  "image_format": "png"
}
```

#### Video Generation
```json
{
  "prompt": "A serene morning in an ancient forest, golden sunlight filtering through tall pine trees",
  "num_inference_steps": 30,
  "guidance": 5,
  "negative_prompt": "",
  "size": "1280*720",
  "duration": 5,
  "flow_shift": 5,
  "seed": -1,
  "enable_prompt_optimization": false,
  "enable_safety_checker": true
}
```

## 🔄 Async Operations

For long-running tasks (video generation, complex images), use async mode:

1. **Set Wait for Completion** to `false`
2. **Execute** - Returns a job ID
3. **Use Get Status** operation to check progress
4. **Poll** until status is `COMPLETED`

## 📚 Supported Models

### Text Models
- **Granite 4.0 H Small** - IBM's latest language model
- **Qwen3 32B AWQ** - Alibaba's efficient language model
- **Deep Cogito v2 Llama 70B** - Large-scale reasoning model
- **InfiniteTalk** - Conversational AI model

### Image Models
- **Flux Dev/Schnell** - Stability AI's latest diffusion models
- **Qwen Image** - Alibaba's text-to-image model
- **Seedream 4.0** - Advanced image generation
- **Nano Banana Edit** - Image editing capabilities

### Video Models
- **Sora 2 Pro I2V** - OpenAI's latest video model
- **WAN 2.5** - High-quality video generation
- **Seedance 1.0 Pro** - Professional video creation
- **Kling v2.1** - Advanced video synthesis

### Audio Models
- **Whisper V3 Large** - OpenAI's speech recognition
- **Minimax Speech 02 HD** - High-definition speech synthesis

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- n8n instance

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/runpod/n8n-nodes-runpod-public-endpoints.git
cd n8n-nodes-runpod-public-endpoints

# Install dependencies
npm install

# Build the node
npm run build

# Link to n8n for development
npm link

# Start n8n in development mode
n8n dev
```

### Project Structure

```
src/
├── credentials/
│   └── RunpodApi.credentials.ts    # API key authentication
├── helpers/
│   └── RunpodClient.ts             # API client wrapper
└── nodes/
    └── RunpodPublicEndpoints/
        ├── RunpodPublicEndpoints.node.ts        # Main node logic
        ├── RunpodPublicEndpoints.description.ts # UI configuration
        └── runpod-cube.svg                      # Custom icon
```

### Testing

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Runpod Documentation**: https://docs.runpod.io/hub/public-endpoint-reference
- **n8n Community Nodes**: https://docs.n8n.io/integrations/community-nodes/
- **GitHub Repository**: https://github.com/runpod/n8n-nodes-runpod-public-endpoints
- **npm Package**: https://www.npmjs.com/package/n8n-nodes-runpod-public-endpoints

## 🚨 Troubleshooting

### Common Issues

#### 1. **"Runpod API" credential not showing**
- **Solution**: Restart n8n after installing the node
- **Check**: Verify the node appears in Settings → Community Nodes

#### 2. **401 Authentication Error**
- **Solution**: Verify your API key is correct and starts with `rpa_`
- **Check**: Test the credential connection in n8n

#### 3. **JSON parsing errors**
- **Solution**: Use the built-in examples or validate JSON syntax
- **Check**: Ensure no unescaped newlines in string values

#### 4. **Job stuck in IN_QUEUE**
- **Solution**: Enable "Wait for Completion" or use async polling
- **Check**: Some models have longer queue times

#### 5. **Model dropdown empty**
- **Solution**: Check internet connection (uses GraphQL API)
- **Fallback**: Node includes hardcoded models if API fails

### Debug Mode

Enable debug logging in n8n to see detailed error messages:

```bash
N8N_LOG_LEVEL=debug n8n start
```

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/runpod/n8n-nodes-runpod-public-endpoints/issues)
- **Discussions**: [GitHub Discussions](https://github.com/runpod/n8n-nodes-runpod-public-endpoints/discussions)
- **Runpod Support**: https://runpod.io/support

## 🙏 Acknowledgments

- **Runpod** for providing the Public Endpoints API
- **n8n** for the amazing workflow automation platform
- **Community contributors** for feedback and improvements

---

Made with ❤️ by the Runpod team