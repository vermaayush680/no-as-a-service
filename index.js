const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const { reasons } = require('./reasons');
const moment = require('moment');
require('dotenv').config(); // Load environment variables from .env file
const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;



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

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'No-as-a-Service is healthy', timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS') });
});
// Random rejection reason endpoint
app.get('/no', (req, res) => {
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  res.json({ reason });
});

// Start server
app.listen(PORT, () => {
  console.log(`No-as-a-Service is running on port ${PORT}`);
});
