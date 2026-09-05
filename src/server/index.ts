import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import chatRouter from './routes/chat';
import advisorRouter from './routes/advisor';
import auditRouter from './routes/audit';
import dispatcherRouter from './routes/dispatcher';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Gemini API Routes
app.use('/api/gemini', chatRouter);
app.use('/api/gemini', advisorRouter);
app.use('/api/gemini', auditRouter);
app.use('/api/gemini', dispatcherRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚚 Truck Buddy Network Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
