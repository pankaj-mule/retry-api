const express = require('express');
const LRUCache = require('lru-cache');
const app = express();

// Maximum number of IPs to track (default: 1000)
const MAX_IPS = parseInt(process.env.MAX_IPS || '1000', 10);

// Store request counts per IP address using LRU cache
// This prevents memory issues by evicting least recently used IPs when limit is reached
// Note: In serverless environment, this cache is per-instance and may reset between cold starts
const requestCounts = new LRUCache({
  max: MAX_IPS,
  maxAge: 1000 * 60 * 60, // 1 hour TTL (optional - IPs expire after 1 hour of inactivity)
  updateAgeOnGet: true // Update TTL on access
});

// Middleware to get client IP address (Vercel-compatible)
const getClientIp = (req) => {
  // Vercel provides IP in x-forwarded-for or x-real-ip
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim() ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
};

// Middleware to parse query parameters
app.use(express.json());

// GET endpoint that succeeds only when same IP hits the specified retry count
app.get('/api/retry', (req, res) => {
  const clientIp = getClientIp(req);
  const retry = parseInt(req.query.retry, 10);

  // Check if retry parameter is provided and is a valid number
  if (isNaN(retry) || retry < 1) {
    return res.status(400).json({
      success: false,
      error: 'Invalid retry parameter',
      message: 'The retry parameter must be a positive number (e.g., ?retry=3)',
      timestamp: new Date().toISOString()
    });
  }

  // Get current request count for this IP
  const currentCount = requestCounts.get(clientIp) || 0;
  
  // Increment the count for this IP
  const newCount = currentCount + 1;
  requestCounts.set(clientIp, newCount);

  // Only succeed when this IP has made the specified number of requests
  if (newCount === retry) {
    // Reset the count and remove from LRU cache after success
    requestCounts.delete(clientIp);
    
    return res.status(200).json({
      success: true,
      message: `Request succeeded on the ${retry}${getOrdinalSuffix(retry)} attempt from this IP`,
      ip: clientIp,
      attempt: newCount,
      retry: retry,
      timestamp: new Date().toISOString()
    });
  }

  // Throw error for any other attempt count
  return res.status(500).json({
    success: false,
    error: 'Request failed',
    message: `Request failed. Attempt ${newCount} from IP ${clientIp}. This API only succeeds on the ${retry}${getOrdinalSuffix(retry)} request from the same IP.`,
    ip: clientIp,
    attempt: newCount,
    retry: retry,
    remainingAttempts: Math.max(0, retry - newCount),
    timestamp: new Date().toISOString()
  });
});

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Retry API server is running',
    timestamp: new Date().toISOString()
  });
});

// Optional: Endpoint to reset request counts (useful for testing)
app.post('/api/reset', (req, res) => {
  const clientIp = getClientIp(req);
  requestCounts.delete(clientIp);
  res.status(200).json({
    success: true,
    message: `Request count reset for IP: ${clientIp}`,
    timestamp: new Date().toISOString()
  });
});

// Optional: Endpoint to get cache statistics
app.get('/api/stats', (req, res) => {
  res.status(200).json({
    maxIPs: MAX_IPS,
    currentIPs: requestCounts.size,
    remainingCapacity: MAX_IPS - requestCounts.size,
    timestamp: new Date().toISOString()
  });
});

// Optional: Endpoint to get current request count for an IP
app.get('/api/status', (req, res) => {
  const clientIp = getClientIp(req);
  const retry = parseInt(req.query.retry, 10);
  const count = requestCounts.get(clientIp) || 0;
  const targetRetry = isNaN(retry) || retry < 1 ? null : retry;
  
  res.status(200).json({
    ip: clientIp,
    requestCount: count,
    targetRetry: targetRetry,
    remainingAttempts: targetRetry ? Math.max(0, targetRetry - count) : null,
    timestamp: new Date().toISOString()
  });
});

// Export the Express app as a serverless function
module.exports = app;

