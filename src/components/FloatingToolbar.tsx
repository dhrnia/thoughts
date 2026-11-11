import React from 'react';
import { 
  List, 
  Eye,
  Table,
  Trash2
} from 'lucide-react';

export type FormatType = 
  | 'bold' 
  | 'italic' 
  | 'quote' 
  | 'list' 
  | 'table' 
  | 'table-add-row' 
  | 'table-del-row' 
  | 'table-add-col' 
  | 'table-del-col' 
  | 'table-del';

interface FloatingToolbarProps {
  wordCount: number;
  onApplyFormat: (format: FormatType) => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  isBoldActive?: boolean;
  isItalicActive?: boolean;
  isInsideTable?: boolean;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  wordCount,
  onApplyFormat,
  isPreviewMode,
  onTogglePreview,
  isBoldActive = false,
  isItalicActive = false,
  isInsideTable = false,
}) => {
  return (
    <div className="fixed bottom-[max(0.875rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-30 animate-slide-up select-none max-w-[calc(100vw-1rem)] sm:max-w-max px-2 sm:px-0">
      <div 
        className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white/95 backdrop-blur-md border border-[#E8E4DA] rounded-full shadow-elevation text-[#5B554D] flex-nowrap overflow-x-auto scrollbar-none"
        style={{
          boxShadow: '0 12px 32px -4px rgba(43,40,36,0.12), 0 0 0 1px rgba(255,255,255,0.8) inset'
        }}
      >
        {/* Font / Bold TT */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('bold');
          }}
          className={`h-8 min-w-[32px] px-1 rounded-full transition-all text-xs font-serif font-bold active:scale-95 flex items-center justify-center shrink-0 ${
            isBoldActive 
              ? 'bg-[#233831] text-white shadow-xs' 
              : 'hover:text-[#2B2824] hover:bg-[#F5F2EA] text-[#2B2824]'
          }`}
          title="Bold (Ctrl+B)"
        >
          <span className="font-serif font-black tracking-tighter">TT</span>
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('italic');
          }}
          className={`h-8 min-w-[32px] px-1 rounded-full transition-all text-xs font-serif italic active:scale-95 flex items-center justify-center shrink-0 ${
            isItalicActive
              ? 'bg-[#233831] text-white shadow-xs' 
              : 'hover:text-[#2B2824] hover:bg-[#F5F2EA]'
          }`}
          title="Italic (Ctrl+I)"
        >
          <span className="font-serif italic font-semibold">I</span>
        </button>

        {/* Blockquote 99 */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('quote');
          }}
          className="h-8 min-w-[32px] px-1 hover:text-[#2B2824] hover:bg-[#F5F2EA] active:scale-95 rounded-full transition-colors text-xs font-serif flex items-center justify-center shrink-0"
          title="Insert Quote block"
        >
          <span className="font-serif tracking-tighter font-semibold">” ”</span>
        </button>

        {/* List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('list');
          }}
          className="h-8 min-w-[32px] px-1 hover:text-[#2B2824] hover:bg-[#F5F2EA] active:scale-95 rounded-full transition-colors flex items-center justify-center shrink-0"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        {/* Insert Table */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('table');
          }}
          className={`h-8 min-w-[32px] px-1 rounded-full transition-all text-xs active:scale-95 flex items-center justify-center shrink-0 ${
            isInsideTable 
              ? 'bg-[#233831] text-white shadow-xs' 
              : 'hover:text-[#2B2824] hover:bg-[#F5F2EA] text-[#5B554D]'
          }`}
          title={isInsideTable ? "Inside table" : "Insert Table"}
        >
          <Table className="w-3.5 h-3.5" />
        </button>

        {/* Contextual Table Tools */}
        {isInsideTable && (
          <div className="flex items-center gap-1 pl-1 border-l border-[#E8E4DA] shrink-0">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('table-add-row');
              }}
              className="px-2 py-1 hover:text-[#2B2824] hover:bg-[#F5F2EA] active:scale-95 rounded text-[11px] font-sans font-medium transition-colors text-[#5B554D]"
              title="Add Row Below (or press Tab in last cell)"
            >
              +Row
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('table-add-col');
              }}
              className="px-2 py-1 hover:text-[#2B2824] hover:bg-[#F5F2EA] active:scale-95 rounded text-[11px] font-sans font-medium transition-colors text-[#5B554D]"
              title="Add Column to Right"
            >
              +Col
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('table-del-row');
              }}
              className="px-1.5 py-1 hover:text-red-700 hover:bg-red-50 active:scale-95 rounded text-[11px] font-sans font-medium transition-colors text-[#8C857B]"
              title="Delete Current Row"
            >
              -Row
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('table-del');
              }}
              className="p-1.5 hover:text-red-700 hover:bg-red-50 active:scale-95 rounded transition-colors text-[#8C857B]"
              title="Delete Entire Table"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="h-4 w-px bg-[#E8E4DA] mx-0.5 sm:mx-1 shrink-0" />

        {/* Preview toggle */}
        <button
          type="button"
          onClick={onTogglePreview}
          className={`h-8 min-w-[32px] px-1 rounded-full transition-colors active:scale-95 flex items-center justify-center shrink-0 ${
            isPreviewMode ? 'bg-[#233831] text-white' : 'hover:text-[#2B2824] hover:bg-[#F5F2EA]'
          }`}
          title={isPreviewMode ? "Switch to Edit mode" : "Preview mode"}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Word count */}
        <div className="flex items-center gap-1.5 pl-1.5 sm:px-2 text-[11px] sm:text-xs font-sans text-[#8C857B] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80" />
          <span className="font-mono whitespace-nowrap">{wordCount}w</span>
        </div>
      </div>
    </div>
  );
};
