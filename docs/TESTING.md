# Testing the Runpod n8n Node

## Quick Setup Guide

### 1. Install the Node in n8n

```bash
# From the project directory
npm link

# In your n8n installation directory (usually ~/.n8n or where you installed n8n)
npm link @runpod/n8n-nodes
```

### 2. Start n8n in Development Mode

```bash
n8n dev
```

### 3. Create Credentials

1. Go to **Settings** → **Credentials**
2. Click **Add Credential**
3. Search for **"Runpod API"**
4. Enter your API key: `YOUR_RUNPOD_API_KEY`
5. Save the credential

### 4. Test the Node

1. Create a new workflow
2. Add the **"Runpod Public Endpoints"** node
3. Configure it with:
   - **Operation**: Generate (Sync)
   - **Model ID**: `granite-4-0-h-small`
   - **Input JSON**:
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
         "temperature": 0.7
       }
     }
     ```
4. Select your Runpod API credential
5. Execute the workflow

### 5. Expected Results

The node should return:

- **id**: Job ID
- **status**: "COMPLETED"
- **output**: Array with the AI response
- **executionTime**: Time taken in milliseconds
- **modelId**: The model used

## API Test Results

✅ **API Key Valid**: `YOUR_RUNPOD_API_KEY`
✅ **Model Accessible**: `granite-4-0-h-small`
✅ **Async Flow Working**: Job creation → Status polling → Completion
✅ **Response Format**: Proper JSON with all expected fields

## Troubleshooting

- **Authentication Error**: Verify API key is correct
- **Model Not Found**: Check model ID spelling
- **Timeout**: Increase timeout settings for longer operations
- **Build Errors**: Run `npm run build` to check TypeScript compilation

