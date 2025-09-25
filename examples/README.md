# Lithia Examples

This directory contains example projects demonstrating different features and use cases of the Lithia framework.

## Available Examples

- **1-basic-api** - Basic API example with file-based routing, middleware, and validation

## Running Examples

### Using the CLI Tool

The easiest way to run examples is using the built-in CLI tool:

```bash
# From the project root
npm run examples

# Or directly
node examples/cli.js
```

This will show an interactive menu to select and run any available example.

### Available Commands

```bash
# List all available examples
npm run examples list

# Run a specific example interactively
npm run examples run

# Run a specific example directly
npm run examples run --project 1-basic-api

# Create a new example
npm run examples create my-new-example
```

### Manual Execution

You can also run examples manually:

```bash
# Navigate to the example directory
cd examples/1-basic-api

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Creating New Examples

To create a new example:

1. Use the CLI: `npm run examples create my-example-name`
2. Or manually create a folder following the pattern: `N-name` (e.g., `2-auth-example`)
3. Add a `package.json` with the required scripts and dependencies
4. Create your example code in the `src/` directory

## Example Structure

Each example should follow this structure:

```
N-example-name/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── lithia.config.js      # Lithia configuration
├── src/
│   ├── routes/           # Route files
│   └── middlewares/      # Middleware files
└── README.md             # Example-specific documentation
```

## Testing Examples

You can test examples manually using curl or any HTTP client:

```bash
# Test basic endpoint
curl http://localhost:3000/hello

# Test auth endpoint
curl -X POST http://localhost:3000/auth \
  -H 'Content-Type: application/json' \
  -d '{"name":"test","code":"123"}'

# Test dynamic route
curl http://localhost:3000/users/123

# Test status endpoint
curl http://localhost:3000/api/status
```

## Contributing

When adding new examples:

1. Follow the naming convention: `N-descriptive-name`
2. Include comprehensive documentation
3. Ensure the example demonstrates a specific feature or pattern
4. Keep examples simple and focused on a single concept
5. Test manually using curl or HTTP clients
