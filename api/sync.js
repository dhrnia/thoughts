import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return res.status(500).json({ success: false, error: 'DATABASE_URL environment variable is missing' });
  }

  const sql = neon(databaseUrl);

  try {
    if (req.method === 'POST') {
      const { notes = [] } = req.body || {};

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

      const rows = await sql`
        SELECT 
          id, title, subtitle, content, excerpt, date, 
          display_date as "displayDate", time_context as "timeContext", 
          location, tags, is_vaulted as "isVaulted", is_saved as "isSaved", 
          category, word_count as "wordCount", reading_time as "readingTime", 
          revision, created_at as "createdAt", updated_at as "updatedAt"
        FROM notes 
        ORDER BY updated_at DESC
      `;

      return res.status(200).json({ success: true, notes: rows });
    }

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT 
          id, title, subtitle, content, excerpt, date, 
          display_date as "displayDate", time_context as "timeContext", 
          location, tags, is_vaulted as "isVaulted", is_saved as "isSaved", 
          category, word_count as "wordCount", reading_time as "readingTime", 
          revision, created_at as "createdAt", updated_at as "updatedAt"
        FROM notes 
        ORDER BY updated_at DESC
      `;
      return res.status(200).json({ success: true, notes: rows });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
