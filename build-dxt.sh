#!/bin/bash

# Exit on any error
set -e

echo "Building Korean Law MCP DXT binaries..."

# Create directories
mkdir -p build dist

# Compile for different platforms
echo "Compiling for Linux x64..."
deno compile --allow-net --allow-env --allow-write --target x86_64-unknown-linux-gnu --output build/korean-law-mcp-linux-x64 main.ts || { echo "Failed to compile for Linux x64"; exit 1; }
chmod +x build/korean-law-mcp-linux-x64

echo "Compiling for macOS x64..."
deno compile --allow-net --allow-env --allow-write --target x86_64-apple-darwin --output build/korean-law-mcp-macos-x64 main.ts || { echo "Failed to compile for macOS x64"; exit 1; }

echo "Compiling for macOS ARM64..."
deno compile --allow-net --allow-env --allow-write --target aarch64-apple-darwin --output build/korean-law-mcp-macos-arm64 main.ts || { echo "Failed to compile for macOS ARM64"; exit 1; }

echo "Compiling for Windows x64..."
deno compile --allow-net --allow-env --allow-write --target x86_64-pc-windows-msvc --output build/korean-law-mcp-windows-x64.exe main.ts || { echo "Failed to compile for Windows x64"; exit 1; }

echo "Build complete! Binaries are in the build/ directory"

# Create platform-specific DXT packages
echo "Creating platform-specific DXT packages..."

# Linux
cp build/korean-law-mcp-linux-x64 korean-law-mcp
zip -j dist/korean-law-mcp-linux-x64.dxt manifest.json korean-law-mcp
rm korean-law-mcp

# macOS x64
cp build/korean-law-mcp-macos-x64 korean-law-mcp
zip -j dist/korean-law-mcp-macos-x64.dxt manifest.json korean-law-mcp
rm korean-law-mcp

# macOS ARM64
cp build/korean-law-mcp-macos-arm64 korean-law-mcp
zip -j dist/korean-law-mcp-macos-arm64.dxt manifest.json korean-law-mcp
rm korean-law-mcp

# Windows
cp build/korean-law-mcp-windows-x64.exe korean-law-mcp.exe
zip -j dist/korean-law-mcp-windows-x64.dxt manifest.json korean-law-mcp.exe
rm korean-law-mcp.exe

echo "DXT packages created in dist/ directory:"
ls -la dist/*.dxt