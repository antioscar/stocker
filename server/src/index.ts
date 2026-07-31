// Server entry point for the StockCaja API
import express from 'express';
import router from './routes/index.js';

const app = express();

// Middleware
app.use(express.json());

// Apply routes
app.use('/api', router);

const PORT = process.env['PORT'] || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
