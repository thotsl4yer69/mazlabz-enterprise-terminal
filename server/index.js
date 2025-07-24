import express from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sessions = new Set();
const commandLog = [];
const metadataStore = [];
const micPermissions = [];

app.post('/api/upload', upload.array('file'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'file required' });
  }
  console.log('UA:', req.get('user-agent'), 'Files:', req.files.map(f => f.originalname).join(','));
  const attachments = req.files.map(f => ({ filename: f.originalname, path: f.path }));
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'mazlabz.ai@gmail.com',
      subject: 'New Upload',
      text: 'Files attached',
      attachments
    });
  } catch (err) {
    console.error('Email failed', err);
  } finally {
    for (const f of req.files) fs.unlink(f.path, () => {});
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
app.post("/api/research/microphone/permission", (req, res) => {
  const { sessionId, granted, timestamp } = req.body;
  micPermissions.push({ sessionId, granted, ts: timestamp });
  res.json({ status: "logged" });
});


const PORT = process.env.PORT || 8080;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
