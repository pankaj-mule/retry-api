# Retry API Server

A simple Express API server for testing retry logic. This server tracks requests per IP address and only succeeds when the same IP has made the specified number of requests (via the `retry` parameter). Uses LRU cache to prevent memory issues by limiting the number of tracked IPs.

## Installation

```bash
npm install
```

## Usage

Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000` by default. You can change the port by setting the `PORT` environment variable. You can also configure the maximum number of IPs to track using the `MAX_IPS` environment variable (default: 1000).

```bash
PORT=3001 MAX_IPS=500 npm start
```

## API Endpoints

### GET /api/retry

Tests retry logic. Tracks requests per IP address and only succeeds when the same IP has made the number of requests specified by the `retry` parameter.

**Query Parameters:**
- `retry` (number, required): The number of requests required from the same IP before success

**Success Response (when attempt count matches retry parameter):**
```json
{
  "success": true,
  "message": "Request succeeded on the 3rd attempt from this IP",
  "ip": "127.0.0.1",
  "attempt": 3,
  "retry": 3,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (when attempt count doesn't match retry parameter):**
```json
{
  "success": false,
  "error": "Request failed",
  "message": "Request failed. Attempt 1 from IP 127.0.0.1. This API only succeeds on the 3rd request from the same IP.",
  "ip": "127.0.0.1",
  "attempt": 1,
  "retry": 3,
  "remainingAttempts": 2,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Invalid Parameter Response:**
```json
{
  "success": false,
  "error": "Invalid retry parameter",
  "message": "The retry parameter must be a positive number (e.g., ?retry=3)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/status

Get the current request count for your IP address.

**Query Parameters:**
- `retry` (number, optional): If provided, calculates remaining attempts based on this target

**Response:**
```json
{
  "ip": "127.0.0.1",
  "requestCount": 2,
  "targetRetry": 3,
  "remainingAttempts": 1,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/stats

Get cache statistics including current number of tracked IPs.

**Response:**
```json
{
  "maxIPs": 1000,
  "currentIPs": 42,
  "remainingCapacity": 958,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/reset

Reset the request count for your IP address (useful for testing).

**Response:**
```json
{
  "success": true,
  "message": "Request count reset for IP: 127.0.0.1",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Retry API server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Examples

```bash
# Example: Testing with retry=3
# First request from your IP - will fail
curl "http://localhost:3000/api/retry?retry=3"

# Second request from your IP - will fail
curl "http://localhost:3000/api/retry?retry=3"

# Third request from your IP - will succeed
curl "http://localhost:3000/api/retry?retry=3"

# Example: Testing with retry=5
# First 4 requests will fail, 5th will succeed
curl "http://localhost:3000/api/retry?retry=5"
curl "http://localhost:3000/api/retry?retry=5"
curl "http://localhost:3000/api/retry?retry=5"
curl "http://localhost:3000/api/retry?retry=5"
curl "http://localhost:3000/api/retry?retry=5"  # This will succeed

# Check your current status
curl "http://localhost:3000/api/status?retry=3"

# Check cache statistics
curl "http://localhost:3000/api/stats"

# Reset your request count (for testing)
curl -X POST "http://localhost:3000/api/reset"
```

## How It Works

- The server tracks request counts per IP address using an LRU (Least Recently Used) cache
- Each IP address has its own counter that increments with each request
- The API only succeeds when a specific IP has made the exact number of requests specified by the `retry` parameter
- The LRU cache automatically evicts the least recently used IPs when the maximum limit is reached (default: 1000 IPs)
- IP entries expire after 1 hour of inactivity (configurable via TTL)
- Request counts persist until the server is restarted, manually reset, or the IP is evicted from the cache

