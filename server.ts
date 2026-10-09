import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRoute } from './server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// API routes handled directly
app.use(async (req, res, next) => {
  const urlPath = req.path;
  if (urlPath.startsWith('/api/')) {
    const handled = await handleApiRoute(req, res, urlPath);
    if (!handled) {
      next();
    }
  } else {
    next();
  }
});

// Serve static frontend from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
