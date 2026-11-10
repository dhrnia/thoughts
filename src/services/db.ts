import type { Note } from '../types';

export const STORAGE_NOTES_KEY = 'thoughts_journal_notes_v1';
export const STORAGE_SYNC_ENDPOINT_KEY = 'thoughts_sync_endpoint_url';
export const STORAGE_LAST_SYNC_KEY = 'thoughts_last_sync_timestamp';

/**
 * Download all thoughts as a secure JSON backup file so user never loses data.
 */
export function exportNotesBackup(notes: Note[]): void {
  const dataStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `thoughts-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import and parse notes from an uploaded JSON backup file.
 */
export function importNotesBackup(file: File): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('Backup file does not contain a valid notes array');
        }
        // Basic schema check
        const validNotes: Note[] = parsed.filter(n => n && typeof n.id === 'string' && typeof n.title === 'string');
        resolve(validNotes);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid backup file';
        reject(new Error(message));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read backup file'));
    reader.readAsText(file);
  });
}

/**
 * Get configured backend sync endpoint (defaults to current origin or relative /api/sync)
 */
export function getSyncEndpoint(): string {
  try {
    return localStorage.getItem(STORAGE_SYNC_ENDPOINT_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Set custom backend sync endpoint (e.g. https://your-app.vercel.app/api/sync or http://localhost:3001)
 */
export function setSyncEndpoint(url: string): void {
  try {
    localStorage.setItem(STORAGE_SYNC_ENDPOINT_KEY, url.trim());
  } catch {}
}

/**
 * Test connectivity with the Neon-backed API
 */
export async function testSyncConnection(customEndpoint?: string): Promise<{ success: boolean; message: string }> {
  const endpoint = (customEndpoint !== undefined ? customEndpoint : getSyncEndpoint()) || '/api/sync';
  
  try {
    const targetUrl = endpoint.endsWith('/api/sync') ? endpoint : `${endpoint.replace(/\/+$/, '')}/api/sync`;
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      const data = await res.json();
      return { success: true, message: `Connected to Neon database (${data.notes?.length || 0} notes in cloud)` };
    } else {
      const err = await res.text();
      return { success: false, message: `Server returned status ${res.status}: ${err.slice(0, 80)}` };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection failed';
    return { success: false, message: `Could not reach server: ${msg}` };
  }
}

/**
 * Bidirectional Sync: Upload local notes to Neon and merge cloud updates
 */
export async function syncNotesWithCloud(
  localNotes: Note[], 
  customEndpoint?: string
): Promise<{ success: boolean; notes: Note[]; message: string }> {
  const endpoint = (customEndpoint !== undefined ? customEndpoint : getSyncEndpoint()) || '/api/sync';
  const targetUrl = endpoint.endsWith('/api/sync') ? endpoint : `${endpoint.replace(/\/+$/, '')}/api/sync`;

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ notes: localNotes })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Sync failed (${res.status}): ${errText.slice(0, 100)}`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.notes)) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      try {
        localStorage.setItem(STORAGE_LAST_SYNC_KEY, timestamp);
      } catch {}

      return {
        success: true,
        notes: data.notes as Note[],
        message: `Successfully synchronized ${data.notes.length} notes with Neon cloud at ${timestamp}`
      };
    }

    throw new Error(data.error || 'Unknown sync response');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sync failed';
    return {
      success: false,
      notes: localNotes,
      message: msg
    };
  }
}
