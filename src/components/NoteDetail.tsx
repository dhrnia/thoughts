import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../types';
import { 
  ArrowLeft, 
  Lock, 
  Unlock, 
  Info, 
  Key, 
  Check, 
  Trash2
} from 'lucide-react';
import { PropertiesPanel } from './PropertiesPanel';
import { FloatingToolbar, type FormatType } from './FloatingToolbar';
import { zenAudio } from '../utils/audio';

interface NoteDetailProps {
  note: Note;
  onBack: () => void;
  onUpdateNote: (updated: Note) => void;
  onDeleteNote: (id: string) => void;
  onRequestPin: (onSuccess: () => void) => void;
  isUnlockedInSession: boolean;
  onToggleQuietMode?: () => void;
  isQuietMode?: boolean;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({
  note,
  onBack,
  onUpdateNote,
  onDeleteNote,
  onRequestPin,
  isUnlockedInSession,
}) => {
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isInlineSegmentUnlocked, setIsInlineSegmentUnlocked] = useState(
    note.encryptedSegment?.isUnlocked || isUnlockedInSession
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('Saved at 11:42 PM');
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isInsideTable, setIsInsideTable] = useState(false);

  // Convert plain text or markdown to rich HTML
  const formatToHtml = (raw: string): string => {
    if (!raw) return '<p><br></p>';
    const cleanRaw = raw
      .replace(/<em>italic text<\/em>&nbsp;/g, '')
      .replace(/<strong>bold text<\/strong>&nbsp;/g, '');

    if (
      cleanRaw.includes('<p>') || 
      cleanRaw.includes('<div>') || 
      cleanRaw.includes('<strong>') || 
      cleanRaw.includes('<b>') || 
      cleanRaw.includes('<em>') || 
      cleanRaw.includes('<i>') || 
      cleanRaw.includes('<blockquote>') ||
      cleanRaw.includes('<table')
    ) {
      return cleanRaw;
    }
    return cleanRaw
      .split(/\n\n+/)
      .map(para => {
        const trimmed = para.trim();
        if (!trimmed) return '';
        let formatted = trimmed
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>');
        if (formatted.startsWith('“') || formatted.startsWith('&ldquo;') || formatted.startsWith('>')) {
          return `<blockquote>${formatted}</blockquote>`;
        }
        return `<p>${formatted.replace(/\n/g, '<br/>')}</p>`;
      })
      .filter(Boolean)
      .join('');
  };

  // Local editable fields
  const [title, setTitle] = useState(note.title);
  const [date] = useState(note.date);
  const [location] = useState(note.location || 'Kyoto Studio • 18°C Quiet Rain');
  const [htmlContent, setHtmlContent] = useState(() => formatToHtml(note.content));
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync editor innerHTML when note changes
  useEffect(() => {
    const formatted = formatToHtml(note.content);
    setHtmlContent(formatted);
    if (editorRef.current && editorRef.current.innerHTML !== formatted) {
      editorRef.current.innerHTML = formatted;
    }
  }, [note.id]);

  // Update bold/italic active state based on user selection
  const updateActiveFormats = () => {
    try {
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode || !editorRef.current || !editorRef.current.contains(selection.anchorNode)) {
        setIsBoldActive(false);
        setIsItalicActive(false);
        setIsInsideTable(false);
        return;
      }
      setIsBoldActive(document.queryCommandState('bold'));
      setIsItalicActive(document.queryCommandState('italic'));

      const el = selection.anchorNode.nodeType === Node.ELEMENT_NODE 
        ? (selection.anchorNode as HTMLElement) 
        : selection.anchorNode.parentElement;
      setIsInsideTable(!!el?.closest('table'));
    } catch {
      setIsBoldActive(false);
      setIsItalicActive(false);
      setIsInsideTable(false);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats);
    return () => document.removeEventListener('selectionchange', updateActiveFormats);
  }, []);

  // Handle rich content changes
  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    const plainText = editorRef.current.innerText || '';
    setHtmlContent(newHtml);
    updateActiveFormats();

    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const readingTimeMinutes = Math.max(0.5, (words / 200)).toFixed(1);

    onUpdateNote({
      ...note,
      content: newHtml,
      wordCount: words,
      readingTime: `${readingTimeMinutes} min`,
      excerpt: plainText.slice(0, 140) + '...',
      updatedAt: 'Just now',
    });
    setSaveStatus('Saved just now');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    onUpdateNote({
      ...note,
      title: val,
      updatedAt: 'Just now',
    });
    setSaveStatus('Saved just now');
  };

  const handleUnlockSegment = () => {
    if (isUnlockedInSession) {
      setIsInlineSegmentUnlocked(true);
      zenAudio.playBell(528);
    } else {
      onRequestPin(() => {
        setIsInlineSegmentUnlocked(true);
        zenAudio.playBell(528);
      });
    }
  };

  const handleToggleVaultStatus = () => {
    if (!note.isVaulted) {
      // Locking note
      onUpdateNote({
        ...note,
        isVaulted: true,
      });
      zenAudio.playBell(440);
    } else {
      // Removing lock requires PIN
      onRequestPin(() => {
        onUpdateNote({
          ...note,
          isVaulted: false,
        });
        zenAudio.playBell(528);
      });
    }
  };

  const handleApplyFormat = (format: FormatType) => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }

    if (format === 'bold') {
      document.execCommand('bold', false);
    } else if (format === 'italic') {
      document.execCommand('italic', false);
    } else if (format === 'quote') {
      const selection = window.getSelection();
      const hasSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed && selection.toString().trim().length > 0;
      if (hasSelection) {
        const selectedText = selection?.toString() || 'Enter quote or reflection...';
        document.execCommand('insertHTML', false, `<blockquote>“${selectedText}”</blockquote><p><br></p>`);
      } else {
        document.execCommand('insertHTML', false, '<blockquote>“Enter quote or reflection...”</blockquote><p><br></p>');
      }
    } else if (format === 'list') {
      document.execCommand('insertUnorderedList', false);
    } else if (format === 'table') {
      const tableHtml = `
<div class="table-wrapper my-6 overflow-x-auto">
  <table class="w-full border-collapse border border-[#E8E4DA] text-sm my-2">
    <thead>
      <tr class="bg-[#F3EFE6]">
        <th class="border border-[#E8E4DA] px-4 py-2.5 text-left font-serif font-medium text-[#2B2824]">Header 1</th>
        <th class="border border-[#E8E4DA] px-4 py-2.5 text-left font-serif font-medium text-[#2B2824]">Header 2</th>
        <th class="border border-[#E8E4DA] px-4 py-2.5 text-left font-serif font-medium text-[#2B2824]">Header 3</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-[#E8E4DA] px-4 py-2 text-[#4A443C]">Row 1, Cell 1</td>
        <td class="border border-[#E8E4DA] px-4 py-2 text-[#4A443C]">Row 1, Cell 2</td>
        <td class="border border-[#E8E4DA] px-4 py-2 text-[#4A443C]">Row 1, Cell 3</td>
      </tr>
      <tr>
        <td class="border border-[#E8E4DA] px-4 py-2 text-[#4A443C]">Row 2, Cell 1</td>
        <td class="border border-[#E8E4DA] px-4 py-2 text-[#4A443C]">Row 2, Cell 2</td>
        <td class="border border-[#E8E4DA] px-4 py-2 text-[#4A443C]">Row 2, Cell 3</td>
      </tr>
    </tbody>
  </table>
</div>
<p><br></p>`;

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
        document.execCommand('insertHTML', false, tableHtml);
      } else if (editorRef.current) {
        editorRef.current.innerHTML += tableHtml;
      }
    } else if (format === 'table-add-row') {
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;
      const el = selection.anchorNode.nodeType === Node.ELEMENT_NODE 
        ? (selection.anchorNode as HTMLElement) 
        : selection.anchorNode.parentElement;
      const tr = el?.closest('tr');
      const table = el?.closest('table');
      if (table) {
        const colCount = table.querySelector('tr')?.children.length || 3;
        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
          const td = document.createElement('td');
          td.className = 'border border-[#E8E4DA] px-4 py-2 text-[#4A443C]';
          td.innerHTML = '<br>';
          newRow.appendChild(td);
        }
        if (tr && tr.parentElement) {
          if (tr.parentElement.tagName.toLowerCase() === 'thead') {
            const tbody = table.querySelector('tbody');
            if (tbody && tbody.firstChild) {
              tbody.insertBefore(newRow, tbody.firstChild);
            } else if (tbody) {
              tbody.appendChild(newRow);
            } else {
              table.appendChild(newRow);
            }
          } else {
            tr.insertAdjacentElement('afterend', newRow);
          }
        } else {
          const tbody = table.querySelector('tbody') || table;
          tbody.appendChild(newRow);
        }

        const firstCell = newRow.querySelector('td');
        if (firstCell) {
          const range = document.createRange();
          range.selectNodeContents(firstCell);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    } else if (format === 'table-add-col') {
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;
      const el = selection.anchorNode.nodeType === Node.ELEMENT_NODE 
        ? (selection.anchorNode as HTMLElement) 
        : selection.anchorNode.parentElement;
      const cell = el?.closest('th, td');
      const table = el?.closest('table');
      if (table) {
        let colIndex = -1;
        if (cell && cell.parentElement) {
          colIndex = Array.from(cell.parentElement.children).indexOf(cell);
        }
        const rows = Array.from(table.querySelectorAll('tr'));
        rows.forEach((row) => {
          const isHeader = row.parentElement?.tagName.toLowerCase() === 'thead' || row.querySelector('th') !== null;
          const newCell = document.createElement(isHeader ? 'th' : 'td');
          newCell.className = isHeader 
            ? 'border border-[#E8E4DA] px-4 py-2.5 text-left font-serif font-medium text-[#2B2824] bg-[#F3EFE6]'
            : 'border border-[#E8E4DA] px-4 py-2 text-[#4A443C]';
          newCell.innerHTML = isHeader ? `Header ${row.children.length + 1}` : '<br>';

          if (colIndex >= 0 && colIndex < row.children.length) {
            row.children[colIndex].insertAdjacentElement('afterend', newCell);
          } else {
            row.appendChild(newCell);
          }
        });
      }
    } else if (format === 'table-del-row') {
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;
      const el = selection.anchorNode.nodeType === Node.ELEMENT_NODE 
        ? (selection.anchorNode as HTMLElement) 
        : selection.anchorNode.parentElement;
      const tr = el?.closest('tr');
      const table = el?.closest('table');
      if (tr && table) {
        const allRows = table.querySelectorAll('tr');
        if (allRows.length <= 1) {
          const wrapper = table.closest('.table-wrapper') || table;
          wrapper.remove();
        } else {
          tr.remove();
        }
      }
    } else if (format === 'table-del-col') {
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;
      const el = selection.anchorNode.nodeType === Node.ELEMENT_NODE 
        ? (selection.anchorNode as HTMLElement) 
        : selection.anchorNode.parentElement;
      const cell = el?.closest('th, td');
      const table = el?.closest('table');
      if (cell && cell.parentElement && table) {
        const colIndex = Array.from(cell.parentElement.children).indexOf(cell);
        const rows = Array.from(table.querySelectorAll('tr'));
        if (cell.parentElement.children.length <= 1) {
          const wrapper = table.closest('.table-wrapper') || table;
          wrapper.remove();
        } else {
          rows.forEach((row) => {
            if (row.children[colIndex]) {
              row.children[colIndex].remove();
            }
          });
        }
      }
    } else if (format === 'table-del') {
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;
      const el = selection.anchorNode.nodeType === Node.ELEMENT_NODE 
        ? (selection.anchorNode as HTMLElement) 
        : selection.anchorNode.parentElement;
      const table = el?.closest('table');
      if (table) {
        const wrapper = table.closest('.table-wrapper') || table;
        wrapper.remove();
      }
    }

    handleEditorInput();
  };

  // Keyboard navigation for tables: Tab key moves to next cell or creates new row
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') {
      const selection = window.getSelection();
      if (!selection || !selection.anchorNode) return;
      const el = selection.anchorNode.nodeType === Node.ELEMENT_NODE 
        ? (selection.anchorNode as HTMLElement) 
        : selection.anchorNode.parentElement;
      const currentCell = el?.closest('td, th');
      const table = el?.closest('table');

      if (currentCell && table) {
        e.preventDefault();
        const allCells = Array.from(table.querySelectorAll('th, td'));
        const currentIndex = allCells.indexOf(currentCell as HTMLElement);

        if (e.shiftKey) {
          // Navigate to previous cell
          if (currentIndex > 0) {
            const prevCell = allCells[currentIndex - 1] as HTMLElement;
            const range = document.createRange();
            range.selectNodeContents(prevCell);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } else {
          // Navigate to next cell or create new row if at last cell
          if (currentIndex < allCells.length - 1) {
            const nextCell = allCells[currentIndex + 1] as HTMLElement;
            const range = document.createRange();
            range.selectNodeContents(nextCell);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          } else {
            // At the last cell! Automatically add a new row
            handleApplyFormat('table-add-row');
          }
        }
      }
    }
  };

  return (
    <div className="relative min-h-screen flex bg-[#FAF8F5]">
      {/* Central Reading / Writing Canvas */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-20 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E4DA]/70 px-3 sm:px-8 py-2.5 sm:py-3 pt-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between">
          {/* Left: Back to Entries + Save status */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-sans text-[#5B554D] hover:text-[#2B2824] active:scale-95 transition-all py-1.5 px-2 -ml-1 rounded-lg hover:bg-[#EAE6DC] min-h-[36px]"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Back</span>
            </button>

            <span className="hidden sm:inline-block text-[#CCC5B4]">•</span>
            <span className="hidden sm:inline-block text-xs text-[#8C857B] font-sans">
              {saveStatus}
            </span>
          </div>

          {/* Right: Vault Badge, Properties (i), Delete, Done button */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Vaulted Badge / Lock Button */}
            <button
              onClick={handleToggleVaultStatus}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-sans font-medium uppercase tracking-wider transition-all border active:scale-95 min-h-[34px] ${
                note.isVaulted
                  ? 'bg-[#233831] text-white border-[#233831] shadow-subtle'
                  : 'bg-white hover:bg-[#EFECE2] text-[#8C857B] border-[#E8E4DA]'
              }`}
              title={note.isVaulted ? "Note is PIN locked. Click to modify" : "Click to lock this note with PIN"}
            >
              {note.isVaulted ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
              <span className="hidden sm:inline">{note.isVaulted ? 'Vaulted' : 'Lock with PIN'}</span>
              <span className="sm:hidden">{note.isVaulted ? 'Vaulted' : 'Lock'}</span>
            </button>

            {/* Info / Properties Panel Toggle */}
            <button
              onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
              className={`p-2 rounded-lg transition-colors border active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                isPropertiesOpen
                  ? 'bg-[#EAE6DC] text-[#2B2824] border-[#CCC5B4]'
                  : 'text-[#8C857B] hover:text-[#2B2824] hover:bg-[#EFECE2] border-transparent'
              }`}
              title="Toggle Document Properties"
              aria-label="Document properties"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Delete note */}
            <button
              onClick={() => {
                if (confirm('Delete this entry?')) {
                  onDeleteNote(note.id);
                }
              }}
              className="p-2 text-[#8C857B] hover:text-rose-700 hover:bg-rose-50 active:scale-95 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Delete Entry"
              aria-label="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Done Button */}
            <button
              onClick={onBack}
              className="px-3.5 sm:px-4 py-1.5 bg-[#233831] hover:bg-[#1A2B25] active:scale-95 text-white text-xs font-medium rounded-lg shadow-sm transition-all min-h-[34px] flex items-center"
            >
              Done
            </button>
          </div>
        </div>

        {/* Note Document Canvas */}
        <main className="w-full max-w-3xl mx-auto px-4 sm:px-8 md:px-12 py-6 sm:py-12 pb-36">
          {/* Header Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#8C857B] font-sans uppercase tracking-widest gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <span className="font-medium text-[#8C857B]">{date}</span>
            <span className="text-[#8C857B]/80 lowercase first-letter:uppercase tracking-normal font-serif text-xs sm:text-sm">
              {location}
            </span>
          </div>

          {/* Title */}
          <div className="mb-6 sm:mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Title of thought..."
              className="w-full font-serif text-2xl sm:text-4xl md:text-5xl font-normal text-[#2B2824] bg-transparent border-none outline-none tracking-tight placeholder-[#CCC5B4]"
            />
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {isPreviewMode ? (
              <div 
                className="note-content-editor font-serif text-base sm:text-lg text-[#2B2824] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                onKeyDown={handleEditorKeyDown}
                data-placeholder="Begin writing in quietness..."
                className="note-content-editor font-serif text-base sm:text-lg text-[#2B2824] leading-relaxed select-text"
              />
            )}

            {/* Encrypted Segment Card */}
            {note.encryptedSegment && (
              <div className="my-8 rounded-2xl bg-[#F5F2EA]/80 border border-[#E8E4DA] p-5 sm:p-6 transition-all duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DA]/60 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-[#E4DFD3] text-[#233831]">
                      <Key className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-sans uppercase tracking-wider font-medium text-[#2B2824]">
                      {note.encryptedSegment.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-white/70 px-2 py-0.5 rounded border border-[#E8E4DA] text-[#8C857B]">
                    {note.encryptedSegment.algorithm}
                  </span>
                </div>

                {isInlineSegmentUnlocked ? (
                  <div className="animate-fade-in">
                    <p className="font-serif text-base text-[#2B2824] leading-relaxed italic bg-white/80 p-4 rounded-xl border border-emerald-900/10">
                      {note.encryptedSegment.hiddenContent}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-emerald-800 font-sans">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Decrypted with Vault Passcode
                      </span>
                      <button
                        onClick={() => setIsInlineSegmentUnlocked(false)}
                        className="text-xs text-[#8C857B] hover:text-[#2B2824] underline"
                      >
                        Re-lock segment
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-serif text-[#8C857B] mb-4">
                      {note.encryptedSegment.preview}
                    </p>
                    <button
                      onClick={handleUnlockSegment}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#233831] hover:bg-[#1A2B25] text-white text-xs font-medium shadow-subtle transition-all"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Unlock Encrypted Segment</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Note Image & Caption */}
            {note.coverImage && (
              <figure className="my-8 rounded-2xl overflow-hidden border border-[#E8E4DA] bg-white shadow-subtle">
                <div className="max-h-[460px] overflow-hidden">
                  <img
                    src={note.coverImage}
                    alt={note.imageCaption || 'Journal photograph'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {note.imageCaption && (
                  <figcaption className="p-3 text-center text-xs font-serif italic text-[#8C857B] bg-[#FAF8F5]/80 border-t border-[#E8E4DA]/50">
                    {note.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </main>

        {/* Floating Bottom Toolbar */}
        <FloatingToolbar
          wordCount={note.wordCount || 0}
          onApplyFormat={handleApplyFormat}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          isBoldActive={isBoldActive}
          isItalicActive={isItalicActive}
          isInsideTable={isInsideTable}
        />
      </div>

      {/* Right Properties Panel */}
      <PropertiesPanel
        note={note}
        isOpen={isPropertiesOpen}
        onClose={() => setIsPropertiesOpen(false)}
        onToggleVaultStatus={handleToggleVaultStatus}
      />
    </div>
  );
};
