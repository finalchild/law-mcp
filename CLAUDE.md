# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

- **Development**: `deno task dev` - Runs server with auto-reload
- **Production**: `deno task start` - Runs server without watch mode
- **Run tests**: `deno task test` - Runs all test files
- **Build DXT**: `deno task build` - Builds platform-specific binaries and creates DXT packages
- **Build current platform**: `deno task build:current` - Compiles binary for current platform only
- **Test DXT**: `deno task test:dxt` - Tests MCP protocol initialization and manifest validation

## Architecture Overview

This is a Model Context Protocol (MCP) server that provides access to Korean law data via the open.law.go.kr API. The codebase consists of:

### Core Components
- **main.ts**: MCP server implementation using stdio transport
  - Implements two tools: `search_laws` and `get_law_details`
  - Handles JSON/XML response parsing from the law API
  - Automatically saves law details as JSON and Markdown files

### Key Integration Points
- **MCP Protocol**: Uses `@modelcontextprotocol/sdk` for server implementation
- **API Integration**: Connects to `http://www.law.go.kr/DRF` endpoints
- **Authentication**: Uses OC parameter (email ID) from environment variable `LAW_API_OC`

### Tool Schemas
- **search_laws**: Search with pagination, sorting, and scope options
- **get_law_details**: Retrieve full law content by lawId or MST number

### Desktop Extension (DXT) Structure
- **manifest.json**: DXT metadata and configuration
- **Binary packaging**: Platform-specific builds (Linux, macOS x64/ARM64, Windows)
- **User configuration**: Supports customizable API OC parameter

### API Documentation Cache
The `api-docs` directory contains cached examples of API responses and documentation:
- **Korean API documentation**: HTML pages from open.law.go.kr describing the API endpoints
- **Response examples**: Sample responses in JSON, XML, and HTML formats for both search and details endpoints
- These files serve as reference for understanding the API structure and response formats