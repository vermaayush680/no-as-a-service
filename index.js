const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file
const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Load reasons from JSON
const reasons = JSON.parse(fs.readFileSync('./reasons.json', 'utf-8'));

// Rate limiter: 120 requests per minute per IP
console.log(`Rate limit window: ${process.env.RATE_LIMIT_WINDOW || 60 * 1000} ms`);
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW || 60 * 1000, // 1 minute
  max: process.env.RATE_LIMIT_MAX || 120,
  keyGenerator: (req, res) => {
    return req.headers['cf-connecting-ip'] || req.ip; // Fallback if header missing (or for non-CF)
  },
  message: { error: `Too many requests, please try again later. (${process.env.RATE_LIMIT_MAX || 120} reqs/min/IP)` }
});

app.use(limiter);

// Random rejection reason endpoint
app.get('/no', (req, res) => {
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  res.json({ reason });
});

// Start server
app.listen(PORT, () => {
  console.log(`No-as-a-Service is running on port ${PORT}`);
});
