# Runpod n8n Node - Project Context & Architecture Guide

## 🎯 Project Overview

This is an **n8n Community Node** that integrates **Runpod's Public Endpoints API** into n8n workflows. It enables users to call AI models (text generation, image generation, video generation, and audio processing) via Runpod without writing custom code.

### Key Purpose

- **Enable non-technical users** to leverage Runpod AI models in n8n workflows
- **Provide smart categorization** of models by type (Text/Image/Video/Audio)
- **Support both sync and async** execution patterns
- **Handle complex API interactions** transparently

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    n8n Workflow                              │
│  (User creates workflow with Runpod node)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  Runpod Public Endpoints    │
        │  n8n Node                   │
        │  - UI Configuration         │
        │  - Input Validation         │
        │  - Async Polling Logic      │
        │  - Output Formatting        │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  RunpodClient               │
        │  (API Wrapper)              │
        │  - HTTP Requests            │
        │  - Error Handling           │
        │  - Type Safety              │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  Runpod Public API          │
        │  - /v2/{modelId}/runsync    │
        │  - /v2/{modelId}/run        │
        │  - /v2/{modelId}/status     │
        │  - /graphql (models list)   │
        └─────────────────────────────┘
```

### Component Layers

1. **n8n Node Layer** (`src/nodes/`)

   - User interface and configuration
   - Operation selection (sync, async, status)
   - Input/output data transformation
   - Polling and timeout management

2. **API Client Layer** (`src/helpers/`)

   - Abstraction over HTTP calls
   - Type-safe request/response handling
   - Error handling standardization

3. **Credentials Layer** (`src/credentials/`)
   - Secure API key storage
   - n8n credential system integration
   - Authentication header formatting

---

## 📁 Project Structure

```
n8n-nodes-runpod-public-endpoints/
├── credentials/
│   └── RunpodPublicEndpoints.credentials.ts    # API key credential type (legacy)
├── nodes/
│   ├── RunpodPublicEndpoints.node.ts           # Main node class & execute logic (legacy)
│   ├── RunpodPublicEndpoints.description.ts    # UI configuration (legacy)
│   └── RunpodPublicEndpoints.operations.ts     # Operation definitions (legacy)
├── src/
│   ├── credentials/
│   │   └── (reserved for future TypeScript version)
│   ├── helpers/
│   │   └── RunpodClient.ts                     # API client wrapper
│   └── nodes/
│       └── RunpodPublicEndpoints/
│           ├── RunpodPublicEndpoints.description.ts  # (future source)
│           ├── RunpodPublicEndpoints.operations.ts   # (future source)
│           └── runpod-cube.svg                       # Custom node icon
├── test/
│   ├── example-workflow.json                   # Main example workflow
│   └── example-workflows/
│       ├── text-generation.json
│       ├── image-generation.json
│       ├── video-generation.json
│       └── audio-generation.json
├── dist/                                        # Compiled output (gitignored)
├── package.json                                 # Dependencies and build config
├── tsconfig.json                               # TypeScript configuration
├── README.md                                    # User documentation
├── CONTRIBUTING.md                             # Contribution guidelines
├── TESTING.md                                  # Testing guide
├── CHANGELOG.md                                # Version history
└── LICENSE                                     # Apache 2.0

```

### File Organization Notes

- **Legacy location** (`/nodes/`, `/credentials/`): Original files compiled from TypeScript
- **Source location** (`/src/`): TypeScript source files (partial migration in progress)
- **dist/** folder: Generated from TypeScript compilation, published to npm

---

## 🔧 Technology Stack

### Core Technologies

- **Language**: TypeScript 5.4+
- **Runtime**: Node.js 18+
- **Framework**: n8n Community Node API (v1)
- **API**: Runpod Public Endpoints REST API + GraphQL for model discovery

### Dependencies

- **n8n-workflow**: Core n8n types and utilities (peer dependency)
- **n8n-core**: n8n execution engine (peer dependency)
- **@types/node**: Node.js type definitions
- **TypeScript**: Language compiler

### Build & Development

- **Build**: TypeScript compiler (`tsc`) + icon copy
- **Linting**: ESLint + TypeScript ESLint + Prettier
- **Testing**: Manual integration testing (npm test placeholder)
- **Package Manager**: npm

---

## 🔄 How It Works: Request Flow

### 1. Synchronous Operation (Instant Response)

```
User selects "Generate (Sync)" operation
              ↓
Validates inputs (modelId, input JSON)
              ↓
Calls: POST /v2/{modelId}/runsync
       with { input: {...} }
              ↓
Waits for immediate response
              ↓
Returns: { id, status: "COMPLETED", output: {...}, executionTime, ... }
              ↓
Formats output for n8n pipeline
```

**Best for**: Quick responses, text generation, small images
**Timeout**: Depends on Runpod, typically 30-120 seconds

### 2. Asynchronous Operation (Polling)

```
User selects "Generate (Async)" + "Wait for Completion: true"
              ↓
Calls: POST /v2/{modelId}/run
       Returns: { id, status: "QUEUED" }
              ↓
Polls: GET /v2/{modelId}/status/{jobId}
       Interval: configurable (default 1000ms)
              ↓
Checks status: QUEUED → IN_PROGRESS → COMPLETED (or FAILED)
              ↓
On COMPLETED: Returns { id, status: "COMPLETED", output: {...}, ... }
On TIMEOUT: Throws error after X seconds
              ↓
Formats output for n8n pipeline
```

**Best for**: Long-running tasks, video/large image generation
**Timeout**: Configurable per operation (default 60 seconds)

### 3. Status Check Operation

```
User selects "Get Status" operation + provides jobId
              ↓
Calls: GET /v2/{modelId}/status/{jobId}
              ↓
Returns current status + output (if completed)
              ↓
Formats output for n8n pipeline
```

**Use case**: Chain as separate node after async operation returns

---

## 🧠 Key Features Explained

### 1. Dynamic Model Discovery

- **What**: Node fetches available models from Runpod GraphQL API
- **When**: When user clicks model dropdown
- **How**:
  - Queries `https://api.runpod.io/graphql`
  - Caches results for 5 minutes (reduces API calls)
  - Falls back to hardcoded models if API fails

**File**: `nodes/RunpodPublicEndpoints.node.ts` (methods.loadOptions.getRunpodModels)

### 2. Smart Model Categorization

- **Categorizes models** by name patterns:

  - **Text**: granite, qwen3, deep-cogito, infinitetalk
  - **Image**: flux, qwen-image, seedream, nano-banana
  - **Video**: wan, seedance, kling, sora
  - **Audio**: whisper, minimax

- **UI adapts**: Dropdown shows only relevant models for selected operation

**File**: `nodes/RunpodPublicEndpoints.node.ts` (static categorizeModels)

### 3. Built-in JSON Examples

- **Auto-populate**: When Input JSON is empty, generates template based on model type
- **Examples cover**:
  - Text model parameters (messages, sampling_params)
  - Image model parameters (prompt, width, height, guidance, etc.)
  - Video model parameters (prompt, duration, size, etc.)
  - Audio model parameters (audio URL, language, format)

**File**: `nodes/RunpodPublicEndpoints.node.ts` (static getDefaultInputJson)

### 4. Configurable Async Polling

- **Wait for Completion**: Boolean toggle
- **Poll Interval**: 250-10000ms (default 1000ms)
- **Timeout**: 5-600 seconds (default 60s)
- **Exponential backoff**: Simple polling loop with configurable intervals

**File**: `nodes/RunpodPublicEndpoints.node.ts` (static runAsyncWithPolling)

### 5. Secure Credential Management

- **API Key Storage**: n8n handles encryption at rest
- **Header Format**: `Authorization: Bearer {apiKey}`
- **Credential Testing**: Built-in test endpoint validation

**File**: `credentials/RunpodPublicEndpoints.credentials.ts`

---

## 🔐 Authentication Flow

```
1. User creates/selects credential:
   ├─ Enters API key (from Runpod dashboard)
   └─ n8n encrypts and stores securely

2. Node execution:
   ├─ Retrieves credentials
   ├─ Extracts apiKey
   └─ Adds to request header: Authorization: Bearer {apiKey}

3. API requests:
   └─ Runpod validates Bearer token on each request

4. Error handling:
   ├─ 401 Unauthorized → Invalid API key
   ├─ 403 Forbidden → Insufficient permissions
   └─ Other errors → Wrapped in NodeOperationError
```

---

## 📝 Operation Types

| Operation        | Endpoint                       | Method | Use Case             | Response Time       |
| ---------------- | ------------------------------ | ------ | -------------------- | ------------------- |
| Generate (Sync)  | `/v2/{modelId}/runsync`        | POST   | Quick tasks, testing | 10-120s             |
| Generate (Async) | `/v2/{modelId}/run`            | POST   | Start long job       | <1s (returns jobId) |
| Get Status       | `/v2/{modelId}/status/{jobId}` | GET    | Check async progress | <1s                 |

### Request Format

All operations send request body wrapped in `{ input: {...} }`:

```json
{
  "input": {
    // Model-specific parameters
    "prompt": "...",
    "messages": [...],
    "width": 1024,
    // etc.
  }
}
```

### Response Format

```json
{
  "id": "job-uuid",
  "status": "COMPLETED|QUEUED|IN_PROGRESS|FAILED",
  "output": {
    /* model output */
  },
  "executionTime": 1234, // milliseconds
  "delayTime": 100, // queue time
  "workerId": "worker-id"
}
```

---

## 🛠️ Development Workflow

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Build TypeScript
npm run build

# 3. Link to n8n (for development)
npm link

# 4. Start n8n in dev mode (in another terminal)
n8n dev
```

### Making Changes

1. **Edit TypeScript files** in `/nodes/` or `/src/`
2. **Run `npm run build`** to compile
3. **Restart n8n dev server** to pick up changes
4. **Test in n8n UI** at http://localhost:5678

### Testing Checklist

- [ ] Text generation works (sync)
- [ ] Image generation works (sync)
- [ ] Video generation works (async with polling)
- [ ] Audio processing works
- [ ] Status checking works
- [ ] Model dropdown filters correctly by operation
- [ ] Error handling with invalid API key
- [ ] Error handling with malformed JSON input
- [ ] Async timeout logic works
- [ ] Credentials persist and test correctly

---

## 🐛 Error Handling

### Common Error Scenarios

| Error                     | Cause                             | Solution                                         |
| ------------------------- | --------------------------------- | ------------------------------------------------ |
| `401 Unauthorized`        | Invalid/missing API key           | Verify API key in credentials                    |
| `Model not found`         | Model ID typo or deprecated       | Check model dropdown suggestions                 |
| `JSON parsing error`      | Malformed input JSON              | Use built-in examples, validate JSON             |
| `Timeout after X seconds` | Job too long for timeout          | Increase timeout value or use async without wait |
| `Job failed`              | Runpod API returned FAILED status | Check input parameters, check Runpod logs        |
| `No models available`     | GraphQL API down, no internet     | Uses fallback hardcoded models                   |

### Error Implementation

- **Thrown via**: `NodeOperationError` from n8n-workflow
- **Contains**: Error message + context (jobId, status, modelId)
- **Logged**: n8n logs with full stack trace (debug mode)

**File**: `nodes/RunpodPublicEndpoints.node.ts` (catch blocks)

---

## 📦 Release & Publishing

### Version Management

- **Current**: v1.0.14
- **Format**: Semantic Versioning (MAJOR.MINOR.PATCH)
- **File**: `package.json` (version field)

### Publishing Process

1. Update `package.json` version
2. Update `CHANGELOG.md` with changes
3. Commit to git
4. Tag release: `git tag v1.0.14`
5. Run: `npm publish` (publishes to npm registry)
6. Create GitHub release with notes

### Distribution Channels

- **npm**: `npm install n8n-nodes-runpod-public-endpoints`
- **n8n Community Nodes**: Via official community nodes UI
- **Manual**: Copy dist folder to n8n node_modules

---

## 🧪 Testing & Examples

### Manual Testing

1. **Set up credentials**: Add Runpod API key to n8n
2. **Use example workflows**: Located in `/test/example-workflows/`
3. **Test each operation**: Text, Image, Video, Audio, Status
4. **Monitor execution**: Use n8n's execution logs

### Example Workflows Provided

- `test/example-workflow.json` - All three operations chained
- `test/example-workflows/text-generation.json` - Granite model
- `test/example-workflows/image-generation.json` - Flux model
- `test/example-workflows/video-generation.json` - WAN model
- `test/example-workflows/audio-generation.json` - Whisper model

### Environment Variables (for testing)

- `RUNPOD_API_KEY`: Used in example workflows (credential reference)

---

## 🎓 Important Concepts for Contributors

### 1. n8n Node Interface

- **INodeType**: Main interface all nodes implement
- **IExecuteFunctions**: Runtime context, has access to:
  - Input data items
  - Node parameters
  - Credentials
  - HTTP request helper
  - Logging capabilities

### 2. Async/Await Patterns

- All API calls are async
- Node must handle multiple input items (batch processing)
- Polling loop uses simple timing, not setTimeout (n8n compatibility)

### 3. Type Safety

- Use strong types for API responses
- `RunpodResponse<T>` is generic for different output types
- TypeScript strict mode enabled

### 4. UI Binding

- Parameters defined in description file control UI
- Field names map to actual parameters retrieved in execute()
- Display conditions via `displayOptions`

---

## ⚠️ Known Limitations & Future Work

### Current Limitations

- Binary data download is stubbed (TODO in buildOutput)
- No retry logic on transient failures (429, 5xx errors)
- Simple polling without exponential backoff
- No webhook support for async completion notifications
- Fallback models are hardcoded (update required for new models)

### Planned Features

- [ ] Binary data download implementation
- [ ] Advanced retry logic with exponential backoff
- [ ] Webhook notifications for async completion
- [ ] Custom timeout per model type
- [ ] Model parameter validation/schema
- [ ] Request/response logging
- [ ] Batch processing optimization

### Migration Notes

- **Source structure**: Being migrated from `/nodes/` to `/src/nodes/`
- **Build process**: Currently compiles both locations
- **Plan**: Consolidate to single source location

---

## 📚 External Resources

### Official Documentation

- **Runpod Docs**: https://docs.runpod.io/hub/public-endpoints
- **Runpod API Reference**: https://docs.runpod.io/hub/public-endpoint-reference
- **n8n Community Nodes**: https://docs.n8n.io/integrations/community-nodes/
- **n8n Node Development**: https://docs.n8n.io/integrations/creating-nodes/

### Repository

- **GitHub**: https://github.com/runpod/n8n-nodes-runpod-public-endpoints
- **npm**: https://www.npmjs.com/package/n8n-nodes-runpod-public-endpoints
- **Issues**: https://github.com/runpod/n8n-nodes-runpod-public-endpoints/issues

---

## 🤝 Contributing Guidelines

### Before You Start

1. Read this context document (you are here!)
2. Review `CONTRIBUTING.md` for workflow
3. Check existing issues/PRs to avoid duplicates
4. Set up development environment locally

### Code Standards

- **Language**: TypeScript (strict mode)
- **Formatting**: ESLint + Prettier (run `npm run lint`)
- **Naming**: Descriptive names, camelCase for variables/methods
- **Comments**: JSDoc for public methods, inline for complex logic
- **Types**: Always use explicit types, avoid `any`

### PR Checklist

- [ ] Code compiles without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Testing done manually in n8n
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated
- [ ] No breaking changes (or documented)

---

## 📞 Support & Communication

### Getting Help

- **Documentation**: See README.md and TESTING.md
- **Issues**: Report bugs with reproduction steps
- **Discussions**: Ask questions in GitHub discussions
- **Runpod Support**: For API-specific issues

### Contact

- **GitHub Issues**: https://github.com/runpod/n8n-nodes-runpod-public-endpoints/issues
- **GitHub Discussions**: https://github.com/runpod/n8n-nodes-runpod-public-endpoints/discussions
- **Email**: community@runpod.io

---

## 📋 Quick Reference Checklist

### For Code Changes

- [ ] Files modified in correct location
- [ ] TypeScript compiles (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Changes tested in n8n dev mode
- [ ] Types are explicit and correct
- [ ] Error handling added
- [ ] JSDoc comments for public methods

### For New Features

- [ ] Operation added to node description
- [ ] UI fields properly configured with displayOptions
- [ ] Execute method handles new operation
- [ ] Example workflow provided
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] Manual testing completed

### For Bug Fixes

- [ ] Root cause identified and documented
- [ ] Fix verified with reproduction case
- [ ] Edge cases considered
- [ ] Error message is user-friendly
- [ ] CHANGELOG.md updated

---

**This document should be updated whenever significant changes are made to the codebase architecture or processes.**
