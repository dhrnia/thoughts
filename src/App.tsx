import React, { useState, useEffect } from 'react';
import type { Note, FilterTab } from './types';
import { INITIAL_NOTES } from './data/initialNotes';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { JournalGrid } from './components/JournalGrid';
import { NoteDetail } from './components/NoteDetail';
import { PinModal } from './components/PinModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { zenAudio } from './utils/audio';

const STORAGE_NOTES_KEY = 'thoughts_journal_notes_v1';
const STORAGE_PIN_KEY = 'thoughts_vault_pin_v1';
const STORAGE_SIDEBAR_KEY = 'thoughts_sidebar_collapsed_v1';

export const App: React.FC = () => {
  // Load notes
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NOTES_KEY);
      if (stored) {
        const parsed: Note[] = JSON.parse(stored);
        const DEMO_IDS = new Set([
          'note-midnight-thoughts',
          'note-morning-walk',
          'note-field-note-kyoto',
          'note-private-ledger-2025',
          'note-tea-ceremony',
          'note-deep-vault-boundaries',
          'note-architecture-of-solitude'
        ]);
        return parsed
          .filter(n => !DEMO_IDS.has(n.id) && n.cardType !== 'rhythm' && !n.id.includes('rhythm'))
          .map(n => {
            const updated = { ...n };
            if (updated.excerpt && updated.excerpt.includes('Stored with strict')) {
              updated.excerpt = '';
            }
            updated.metadataChips = [];
            return updated;
          });
      }
    } catch {}
    return INITIAL_NOTES;
  });

  // Master PIN (Default: 1234)
  const [pin, setPin] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_PIN_KEY);
      if (stored) return stored;
    } catch {}
    return '1234';
  });

  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<FilterTab>('all');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar collapse & mobile states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_SIDEBAR_KEY) === 'true';
    } catch {}
    return false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Settings & Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [pinModalConfig, setPinModalConfig] = useState<{
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    onSuccess: () => {},
  });

  // Set of note IDs unlocked in this session
  const [unlockedNoteIds, setUnlockedNoteIds] = useState<Set<string>>(new Set());

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
    } catch {}
  }, [notes]);

  // Save PIN to localStorage
  const handleUpdatePin = (newPin: string) => {
    setPin(newPin);
    try {
      localStorage.setItem(STORAGE_PIN_KEY, newPin);
    } catch {}
  };

  // Save sidebar collapsed state
  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_SIDEBAR_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // Note actions
  const handleNewEntry = () => {
    const newNoteId = `note-${Date.now()}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const newNote: Note = {
      id: newNoteId,
      title: 'Untitled Reflection',
      excerpt: 'Begin writing your thoughts...',
      content: '',
      date: formattedDate.toUpperCase(),
      displayDate: formattedDate,
      timeContext: 'Just now',
      location: 'Quiet Studio',
      tags: ['reflections'],
      metadataChips: [],
      isVaulted: false,
      isSaved: false,
      category: 'reflections',
      wordCount: 0,
      readingTime: '0 min',
      revision: 'v1.0',
      createdAt: formattedDate,
      updatedAt: 'Just now',
      cardType: 'standard'
    };

    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    zenAudio.playBell(440);
  };

  const handleUpdateNote = (updated: Note) => {
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    if (selectedNote && selectedNote.id === updated.id) {
      setSelectedNote(updated);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null);
    }
  };

  const handleToggleSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, isSaved: !n.isSaved };
      }
      return n;
    }));
    zenAudio.playClick();
  };

  // Vault Unlock Handler
  const handleRequestUnlock = (note: Note) => {
    setPinModalConfig({
      isOpen: true,
      title: 'Enter PIN',
      onSuccess: () => {
        setUnlockedNoteIds(prev => new Set(prev).add(note.id));
        setSelectedNote(note);
      }
    });
  };

  // General PIN prompt helper
  const handleRequestPin = (onSuccess: () => void, title?: string) => {
    setPinModalConfig({
      isOpen: true,
      title: title || 'Enter PIN',
      onSuccess
    });
  };

  const handleRelockAll = () => {
    setUnlockedNoteIds(new Set());
    if (selectedNote && selectedNote.isVaulted) {
      setSelectedNote(null);
    }
  };

  const handleResetNotes = () => {
    setNotes(INITIAL_NOTES);
    setUnlockedNoteIds(new Set());
    setSelectedNote(null);
  };

  const vaultCount = notes.filter(n => n.isVaulted).length;
  const savedCount = notes.filter(n => n.isSaved).length;
  const regularNotesCount = notes.filter(n => n.cardType !== 'rhythm' && !n.id.includes('rhythm')).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2B2824] flex font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedNote(null);
        }}
        onNewEntry={handleNewEntry}
        onOpenSettings={() => setIsSettingsOpen(true)}
        vaultCount={vaultCount}
        totalCount={regularNotesCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onNewEntry={handleNewEntry}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* View Switching */}
        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            onBack={() => setSelectedNote(null)}
            onUpdateNote={handleUpdateNote}
            onDeleteNote={handleDeleteNote}
            onRequestPin={handleRequestPin}
            isUnlockedInSession={unlockedNoteIds.has(selectedNote.id)}
          />
        ) : (
          <JournalGrid
            notes={notes}
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onSelectNote={(note) => {
              if (note.isVaulted && !unlockedNoteIds.has(note.id)) {
                handleRequestUnlock(note);
              } else {
                setSelectedNote(note);
              }
            }}
            onRequestUnlock={handleRequestUnlock}
            onToggleSaved={handleToggleSaved}
            unlockedNoteIds={unlockedNoteIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNewNote={handleNewEntry}
          />
        )}

        {/* Mobile Bottom Navigation (only when browsing journal on mobile) */}
        {!selectedNote && (
          <MobileBottomNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onNewEntry={handleNewEntry}
            onOpenSettings={() => setIsSettingsOpen(true)}
            vaultCount={vaultCount}
            savedCount={savedCount}
          />
        )}
      </div>

      {/* PIN Unlock & Management Modal */}
      <PinModal
        isOpen={pinModalConfig.isOpen}
        onClose={() => setPinModalConfig(prev => ({ ...prev, isOpen: false }))}
        onSuccess={pinModalConfig.onSuccess}
        title={pinModalConfig.title}
        subtitle={pinModalConfig.subtitle}
        correctPin={pin}
        onUpdatePin={handleUpdatePin}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        pin={pin}
        onUpdatePin={handleUpdatePin}
        onRelockAll={handleRelockAll}
        notes={notes}
        onNotesUpdated={setNotes}
      />
    </div>
  );
};

export default App;
