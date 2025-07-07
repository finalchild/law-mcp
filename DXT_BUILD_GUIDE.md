# DXT Build Guide for Korean Law MCP

## Overview

This guide explains how to build the Korean Law MCP server as a Desktop Extension (DXT).

## Prerequisites

- Deno v2.0 or higher
- zip command-line tool
- Basic understanding of MCP and DXT

## Directory Structure

```
law-mcp/
├── main.ts              # MCP server with Korean descriptions
├── manifest.json        # DXT manifest
├── deno.json           # Deno configuration
├── build-dxt.sh        # Build script for all platforms
├── build/              # Compiled binaries (created by build script)
└── dist/               # DXT packages (created by build script)
```

## Build Process

### 1. Test Locally

```bash
# Test with Deno before compiling
deno run --allow-net --allow-env main.ts
```

### 2. Build for Current Platform Only

```bash
# Compile for your current platform
deno compile --allow-net --allow-env --output korean-law-mcp main.ts

# Create DXT package
zip korean-law-mcp-current.dxt manifest.json korean-law-mcp
```

### 3. Build for All Platforms

```bash
# Build DXT packages for all platforms
./build-dxt.sh
```

This creates:
- `dist/korean-law-mcp-linux-x64.dxt`
- `dist/korean-law-mcp-macos-x64.dxt`
- `dist/korean-law-mcp-macos-arm64.dxt`
- `dist/korean-law-mcp-windows-x64.dxt`

## Manual Build Steps

If you prefer to build manually:

### Linux x64
```bash
deno compile --allow-net --allow-env --target x86_64-unknown-linux-gnu --output korean-law-mcp main.ts
zip korean-law-mcp-linux-x64.dxt manifest.json korean-law-mcp
```

### macOS x64 (Intel)
```bash
deno compile --allow-net --allow-env --target x86_64-apple-darwin --output korean-law-mcp main.ts
zip korean-law-mcp-macos-x64.dxt manifest.json korean-law-mcp
```

### macOS ARM64 (Apple Silicon)
```bash
deno compile --allow-net --allow-env --target aarch64-apple-darwin --output korean-law-mcp main.ts
zip korean-law-mcp-macos-arm64.dxt manifest.json korean-law-mcp
```

### Windows x64
```bash
deno compile --allow-net --allow-env --target x86_64-pc-windows-msvc --output korean-law-mcp.exe main.ts
zip korean-law-mcp-windows-x64.dxt manifest.json korean-law-mcp.exe
```

## Configuration

The DXT supports configuration through the `LAW_API_OC` environment variable:

```json
{
  "user_config": {
    "api_oc": {
      "type": "string",
      "title": "API OC 파라미터",
      "description": "open.law.go.kr API 인증을 위한 OC 값",
      "required": true
    }
  }
}
```

## Testing the DXT

1. Install the DXT in a compatible application
2. Configure the `api_oc` parameter if needed
3. Test the tools:
   - `search_laws`: Search for Korean laws
   - `get_law_details`: Get detailed law information

## Troubleshooting

### Binary Size
The compiled binaries are large (~100MB) because they include:
- Deno runtime
- All dependencies
- MCP SDK

### Platform Compatibility
- Linux: Requires glibc 2.31+
- macOS: Requires macOS 10.15+
- Windows: Requires Windows 10+

### API Errors
- Check your `LAW_API_OC` configuration
- Verify network connectivity to `open.law.go.kr`
- Check API response format hasn't changed

## Updates

To update the DXT:
1. Modify the source code in the root directory
2. Run `./prepare-dxt.sh` to update the DXT directory
3. Increment version in `manifest.json`
4. Rebuild using `./build-dxt.sh`

## License

ISC License - See LICENSE file for details
