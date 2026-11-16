import express from 'express';
import routes from './routes/index.js';

const app = express();

app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EventHive API is healthy' });
});

app.use('/api', routes);

// 404 fallback for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;

