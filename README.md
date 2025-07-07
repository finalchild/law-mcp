# Korean Law MCP Server

A Model Context Protocol (MCP) server for fetching Korean laws from the open.law.go.kr API.

## Features

- Search Korean laws by keyword with pagination and sorting options
- Get detailed law information including articles, amendments, and supplements
- Clean JSON responses with key information extracted
- Automatic response formatting for better readability

## Running the Server

```bash
# Development mode with auto-reload
deno task dev

# Production mode
deno task start
```

## Available Tools

### search_laws
Search for Korean laws by keyword.

Parameters:
- `query` (required): Search query
- `page`: Page number (default: 1)
- `display`: Results per page, max 100 (default: 20)
- `search`: Search scope - 1=law name, 2=full text (default: 1)
- `sort`: Sort option - lasc, ldes, dasc, ddes, etc. (default: lasc)

### get_law_details
Get detailed information about a specific law.

Parameters:
- `lawId` or `mst` (one required): Law ID or Master Sequence Number

Returns structured JSON with:
- Basic information (name, type, ministry, dates)
- Full articles text
- Amendments history
- Supplementary provisions

## API Documentation

The API documentation is cached in the `api-docs` directory.