# VChart MCP Server Export

A TypeScript-based service for exporting VChart charts to images or HTML files using Koa2 and Puppeteer.

## Features

- Export charts to PNG images
- Export charts to HTML files
- Configurable chart dimensions
- RESTful API interface
- Static file serving for exported content

## Installation

```bash
npm install
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### POST /export

Export a chart based on the provided specification.

**Request Body:**
```typescript
{
  spec: any;        // VChart specification
  type?: 'image' | 'html';  // Export type (default: 'image')
  option?: {
    width?: string;  // Chart width (default: '800px')
    height?: string; // Chart height (default: '600px')
  }
}
```

**Response:**
```typescript
{
  success: boolean;
  data: {
    url: string;      // URL to access the exported file
    filePath: string; // Local file path
    type: 'image' | 'html';
  }
}
```

### GET /output/:filename

Access exported files directly.

## Example

```bash
# Export as image
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{
    "spec": {
      "type": "bar",
      "data": [{
        "id": "barData",
        "values": [
          {"month": "Jan", "sales": 120},
          {"month": "Feb", "sales": 200},
          {"month": "Mar", "sales": 150}
        ]
      }],
      "xField": "month",
      "yField": "sales"
    },
    "type": "image",
    "option": {
      "width": "800px",
      "height": "600px"
    }
  }'

# Export as HTML
curl -X POST http://localhost:3000/export \
  -H "Content-Type: application/json" \
  -d '{
    "spec": { ... },
    "type": "html"
  }'
```

## Project Structure

```
├── src/
│   ├── index.ts          # Server entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── chartService.ts   # Chart export service
│   └── routes.ts         # API routes
├── output/               # Exported files directory
├── test-export.js        # Test script
└── package.json
```

## Dependencies

- Koa2: Web framework
- Puppeteer: Headless browser for screenshot generation
- TypeScript: Type safety
- UUID: Unique file naming

## License

MIT