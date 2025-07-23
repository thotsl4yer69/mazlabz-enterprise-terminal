import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

const sessions = new Set();
const commandLog = [];
const metadataStore = [];

app.post('/api/upload', upload.array('file'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'file required' });
  }
  res.json({ status: 'stored', count: req.files.length });
});

app.post('/api/research/session/create', (req, res) => {
  const sessionId = uuidv4();
  sessions.add(sessionId);
  res.json({ sessionId });
});

app.post('/api/research/behavioral/track', (req, res) => {
  const { sessionId, command } = req.body;
  if (sessionId && command && sessions.has(sessionId)) {
    commandLog.push({ sessionId, command, ts: Date.now() });
    res.json({ status: 'logged' });
  } else {
    res.status(400).json({ error: 'invalid session or command' });
  }
});

app.post('/api/research/metadata/extract', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'file required' });
  }
  const meta = {
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    ts: Date.now()
  };
  metadataStore.push(meta);
  res.json({ metadata: meta });
});

const PORT = process.env.PORT || 8080;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
