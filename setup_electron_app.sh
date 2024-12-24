#!/bin/bash

# Set the base directory name
BASE_DIR="eBirdCBC"

# Create the base directory
mkdir -p "$BASE_DIR"

# Create subdirectories
mkdir -p "$BASE_DIR/app/main"
mkdir -p "$BASE_DIR/app/renderer/src"
mkdir -p "$BASE_DIR/app/renderer/public"
mkdir -p "$BASE_DIR/app/preload"
mkdir -p "$BASE_DIR/dist"
mkdir -p "$BASE_DIR/resources"
mkdir -p "$BASE_DIR/tests"
mkdir -p "$BASE_DIR/node_modules"

# Create essential files
touch "$BASE_DIR/package.json"
touch "$BASE_DIR/package-lock.json"
touch "$BASE_DIR/README.md"
touch "$BASE_DIR/app/main/main.js"
touch "$BASE_DIR/app/renderer/src/index.js"
touch "$BASE_DIR/app/preload/preload.js"

# Add a success message
echo "Electron app directory structure created successfully in $BASE_DIR!"
