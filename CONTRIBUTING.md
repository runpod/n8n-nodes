# Contributing to Runpod Public Endpoints n8n Node

Thank you for your interest in contributing! This document provides guidelines for contributing to the Runpod Public Endpoints n8n Community Node.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- n8n instance for testing

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/n8n-nodes-runpod-public-endpoints.git
   cd n8n-nodes-runpod-public-endpoints
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Node**
   ```bash
   npm run build
   ```

4. **Link for Development**
   ```bash
   npm link
   ```

5. **Start n8n**
   ```bash
   n8n dev
   ```

## 📝 Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public methods
- Use meaningful variable and function names

## 🧪 Testing

### Manual Testing
1. Test all operation types (text, image, video, audio)
2. Test error scenarios (invalid API key, malformed JSON)
3. Test async operations with polling
4. Test model dropdown filtering

### Test Checklist
- [ ] Text generation works
- [ ] Image generation works  
- [ ] Video generation works
- [ ] Audio processing works
- [ ] Status checking works
- [ ] Error handling works
- [ ] Model dropdown filters correctly
- [ ] Credentials work properly

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment**
   - n8n version
   - Node.js version
   - Operating system

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior

3. **Error Messages**
   - Full error logs
   - Screenshots if applicable

4. **Additional Context**
   - Workflow configuration
   - API key status (without sharing the key)

## 💡 Feature Requests

When suggesting features:

1. **Describe the Problem**
   - What use case does this solve?
   - How does it improve the user experience?

2. **Propose a Solution**
   - Clear description of the feature
   - Mockups or examples if applicable

3. **Consider Alternatives**
   - Are there existing workarounds?
   - How does this fit with the existing API?

## 🔄 Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation

3. **Test Thoroughly**
   - Test all affected functionality
   - Ensure no regressions

4. **Submit PR**
   - Clear title and description
   - Link to related issues
   - Include screenshots for UI changes

## 📋 PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] All CI checks pass

## 🏷️ Release Process

Releases are handled by maintainers:

1. **Version Bump**
   - Update `package.json` version
   - Update CHANGELOG.md

2. **Publish to npm**
   ```bash
   npm publish
   ```

3. **Create GitHub Release**
   - Tag the release
   - Include release notes

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Runpod Support**: For API-related questions

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing! 🎉