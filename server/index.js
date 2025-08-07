import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Storage } from '@google-cloud/storage';
import { uploadToGCS } from './uploadToGCS.js';
import * as db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

// Connect to the database on startup
db.connect().then(() => {
    console.log('Database connected successfully.');
}).catch(err => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
});

app.post('/api/upload', upload.array('file'), async (req, res) => {
    if (!req.files?.length) return res.status(400).json({ error: 'file required' });

    const { sessionId } = req.body; // Assume sessionId is sent with upload
    if (!sessionId) return res.status(400).json({ error: 'sessionId required for upload' });

    try {
        const uploadPromises = req.files.map(async (file) => {
            const gcsPath = `session-uploads/${file.originalname}`;
            await uploadToGCS(file, 'session-uploads');
            await storeFileMetadata({
                id: uuidv4(),
                sessionId,
                filename: file.originalname,
                gcsPath,
                mimetype: file.mimetype,
                size: file.size,
            });
        });
        await Promise.all(uploadPromises);
        res.json({ status: 'uploaded', count: req.files.length });
    } catch (err) {
        console.error('GCS upload or DB metadata store failed:', err);
        res.status(500).json({ error: 'upload failed' });
    }
});

app.post('/api/research/session/create', async (req, res) => {
    const sessionId = uuidv4();
    try {
        await addSession(sessionId);
        res.json({ sessionId });
    } catch (err) {
        console.error('Failed to create session:', err);
        res.status(500).json({ error: 'session creation failed' });
    }
});

app.post('/api/research/behavioral/track', async (req, res) => {
    const { sessionId, command } = req.body;
    if (sessionId && command) {
        try {
            await logCommand(sessionId, command);
            res.json({ status: 'logged' });
        } catch (err) {
            console.error('Failed to log command:', err);
            res.status(500).json({ error: 'logging failed' });
        }
    } else {
        res.status(400).json({ error: 'invalid session or command' });
    }
});

// This endpoint is deprecated in favor of direct GCS upload and DB logging
app.post('/api/research/metadata/extract', (req, res) => {
    res.status(410).json({ error: 'This endpoint is deprecated.' });
});

app.post("/api/research/microphone/permission", (req, res) => {
    const { sessionId, granted, timestamp } = req.body;
    // This could be logged to a new table 'permissions_log' if needed
    console.log(`Mic permission for session ${sessionId}: ${granted} at ${timestamp}`);
    res.json({ status: "logged" });
});

// --- New API Endpoints ---

const storage = new Storage();
const bucketName = 'mazlabz-terminal-store';

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

app.get('/api/dashboard', async (req, res) => {
    try {
        const summary = await db.getDashboardSummary();
        res.json(summary);
    } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
        res.status(500).json({ error: 'failed to fetch dashboard data' });
    }
});

app.get('/api/files', async (req, res) => {
    try {
        const files = await db.getFiles();
        res.json({ files });
    } catch (err) {
        console.error('Failed to fetch files:', err);
        res.status(500).json({ error: 'failed to fetch files' });
    }
});

app.get('/api/files/:id', async (req, res) => {
    try {
        const fileRecord = await db.getFileById(req.params.id);
        if (!fileRecord) {
            return res.status(404).json({ error: 'File not found' });
        }
        const [url] = await storage.bucket(bucketName).file(fileRecord.gcs_path).getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // A long time in the future
        });
        res.redirect(url);
    } catch (err) {
        console.error('Failed to get download URL for file:', err);
        res.status(500).json({ error: 'failed to download file' });
    }
});

app.delete('/api/files/:id', async (req, res) => {
    try {
        const fileRecord = await db.getFileById(req.params.id);
        if (fileRecord) {
            await storage.bucket(bucketName).file(fileRecord.gcs_path).delete();
        }
        await db.deleteFile(req.params.id);
        res.json({ status: 'deleted' });
    } catch (err) {
        console.error('Failed to delete file:', err);
        res.status(500).json({ error: 'failed to delete file', detail: err.message });
    }
});

app.post('/api/leads', async (req, res) => {
    const { sessionId, name, email, company, projectType, budget } = req.body;
    if (!name || !email || !company) {
        return res.status(400).json({ error: 'Name, email, and company are required' });
    }
    try {
        await db.addLead({ sessionId, name, email, company, projectType, budget });
        res.status(201).json({ status: 'lead captured' });
    } catch (err) {
        console.error('Failed to save lead:', err);
        res.status(500).json({ error: 'failed to save lead' });
    }
});

// --- Admin Endpoints ---
app.get('/api/admin/leads', async (req, res) => {
    try {
        const leads = await db.getAllLeads();
        res.json(leads);
    } catch (err) {
        console.error('Failed to get leads:', err);
        res.status(500).json({ error: 'failed to retrieve leads' });
    }
});

app.get('/api/admin/logs', async (req, res) => {
    try {
        const logs = await db.getCommandLogs();
        res.json(logs);
    } catch (err) {
        console.error('Failed to get command logs:', err);
        res.status(500).json({ error: 'failed to retrieve command logs' });
    }
});

app.get('/api/admin/sessions', async (req, res) => {
    try {
        const sessions = await db.getAllSessions();
        res.json(sessions);
    } catch (err) {
        console.error('Failed to get sessions:', err);
        res.status(500).json({ error: 'failed to retrieve sessions' });
    }
});


// Serve Vite build output AFTER API routes
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});


const PORT = process.env.PORT || 8080;
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
