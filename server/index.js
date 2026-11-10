import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to query Neon
const getSql = () => {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured. Please set DATABASE_URL in your environment or .env file.');
  }
  return neon(databaseUrl);
};

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    if (!databaseUrl) {
      return res.json({ status: 'ok', database: 'unconfigured', message: 'Set DATABASE_URL to connect Neon' });
    }
    const sql = getSql();
    const result = await sql`SELECT 1 as connected`;
    res.json({ status: 'ok', database: 'connected', result });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET all notes
app.get('/api/notes', async (req, res) => {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id, 
        title, 
        subtitle, 
        content, 
        excerpt, 
        date, 
        display_date as "displayDate", 
        time_context as "timeContext", 
        location, 
        tags, 
        is_vaulted as "isVaulted", 
        is_saved as "isSaved", 
        category, 
        word_count as "wordCount", 
        reading_time as "readingTime", 
        revision, 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM notes 
      ORDER BY updated_at DESC
    `;
    res.json({ success: true, notes: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST / PUT Upsert note
app.post('/api/notes', async (req, res) => {
  try {
    const sql = getSql();
    const note = req.body;
    if (!note || !note.id) {
      return res.status(400).json({ success: false, error: 'Note id is required' });
    }

    await sql`
      INSERT INTO notes (
        id, title, subtitle, content, excerpt, date, display_date, time_context, 
        location, tags, is_vaulted, is_saved, category, word_count, reading_time, revision, updated_at
      ) VALUES (
        ${note.id},
        ${note.title || 'Untitled'},
        ${note.subtitle || null},
        ${note.content || ''},
        ${note.excerpt || ''},
        ${note.date || ''},
        ${note.displayDate || note.date || ''},
        ${note.timeContext || ''},
        ${note.location || ''},
        ${JSON.stringify(note.tags || [])},
        ${Boolean(note.isVaulted)},
        ${Boolean(note.isSaved)},
        ${note.category || 'reflections'},
        ${note.wordCount || 0},
        ${note.readingTime || '0 min'},
        ${note.revision || 'v1.0'},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        content = EXCLUDED.content,
        excerpt = EXCLUDED.excerpt,
        date = EXCLUDED.date,
        display_date = EXCLUDED.display_date,
        time_context = EXCLUDED.time_context,
        location = EXCLUDED.location,
        tags = EXCLUDED.tags,
        is_vaulted = EXCLUDED.is_vaulted,
        is_saved = EXCLUDED.is_saved,
        category = EXCLUDED.category,
        word_count = EXCLUDED.word_count,
        reading_time = EXCLUDED.reading_time,
        revision = EXCLUDED.revision,
        updated_at = NOW()
    `;

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE Note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const sql = getSql();
    const { id } = req.params;
    await sql`DELETE FROM notes WHERE id = ${id}`;
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Batch Sync (ensures local data is merged with Neon)
app.post('/api/sync', async (req, res) => {
  try {
    const sql = getSql();
    const { notes = [] } = req.body;

    // 1. Upsert all incoming local notes
    for (const note of notes) {
      if (!note.id) continue;
      await sql`
        INSERT INTO notes (
          id, title, subtitle, content, excerpt, date, display_date, time_context, 
          location, tags, is_vaulted, is_saved, category, word_count, reading_time, revision, updated_at
        ) VALUES (
          ${note.id},
          ${note.title || 'Untitled'},
          ${note.subtitle || null},
          ${note.content || ''},
          ${note.excerpt || ''},
          ${note.date || ''},
          ${note.displayDate || note.date || ''},
          ${note.timeContext || ''},
          ${note.location || ''},
          ${JSON.stringify(note.tags || [])},
          ${Boolean(note.isVaulted)},
          ${Boolean(note.isSaved)},
          ${note.category || 'reflections'},
          ${note.wordCount || 0},
          ${note.readingTime || '0 min'},
          ${note.revision || 'v1.0'},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          excerpt = EXCLUDED.excerpt,
          is_vaulted = EXCLUDED.is_vaulted,
          is_saved = EXCLUDED.is_saved,
          word_count = EXCLUDED.word_count,
          reading_time = EXCLUDED.reading_time,
          updated_at = NOW()
      `;
    }

    // 2. Fetch full merged set from Neon
    const allRows = await sql`
      SELECT 
        id, title, subtitle, content, excerpt, date, 
        display_date as "displayDate", time_context as "timeContext", 
        location, tags, is_vaulted as "isVaulted", is_saved as "isSaved", 
        category, word_count as "wordCount", reading_time as "readingTime", 
        revision, created_at as "createdAt", updated_at as "updatedAt"
      FROM notes 
      ORDER BY updated_at DESC
    `;

    res.json({ success: true, notes: allRows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve frontend dist if available (for fullstack production hosting)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`thoughts server listening on port ${PORT}`);
});
