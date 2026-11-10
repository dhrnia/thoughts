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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-slide-up select-none max-w-[95vw]">
      <div 
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/95 backdrop-blur-md border border-[#E8E4DA] rounded-full shadow-elevation text-[#5B554D] flex-wrap justify-center"
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
          className={`p-1.5 rounded-full transition-all text-xs font-serif font-bold ${
            isBoldActive 
              ? 'bg-[#233831] text-white shadow-xs' 
              : 'hover:text-[#2B2824] hover:bg-[#F5F2EA] text-[#2B2824]'
          }`}
          title="Bold (Ctrl+B)"
        >
          <span className="px-1.5 font-serif font-black tracking-tighter">TT</span>
        </button>

        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('italic');
          }}
          className={`p-1.5 rounded-full transition-all text-xs font-serif italic ${
            isItalicActive
              ? 'bg-[#233831] text-white shadow-xs'
              : 'hover:text-[#2B2824] hover:bg-[#F5F2EA]'
          }`}
          title="Italic (Ctrl+I)"
        >
          <span className="px-1.5 font-serif italic font-semibold">I</span>
        </button>

        {/* Blockquote 99 */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('quote');
          }}
          className="p-1.5 hover:text-[#2B2824] hover:bg-[#F5F2EA] rounded-full transition-colors text-xs font-serif"
          title="Insert Quote block"
        >
          <span className="px-1 font-serif tracking-tighter font-semibold">” ”</span>
        </button>

        {/* List */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onApplyFormat('list');
          }}
          className="p-1.5 hover:text-[#2B2824] hover:bg-[#F5F2EA] rounded-full transition-colors"
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
          className={`p-1.5 rounded-full transition-all text-xs ${
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
          <div className="flex items-center gap-1 pl-1 border-l border-[#E8E4DA]">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onApplyFormat('table-add-row');
              }}
              className="px-2 py-0.5 hover:text-[#2B2824] hover:bg-[#F5F2EA] rounded text-[11px] font-sans font-medium transition-colors text-[#5B554D]"
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
              className="px-2 py-0.5 hover:text-[#2B2824] hover:bg-[#F5F2EA] rounded text-[11px] font-sans font-medium transition-colors text-[#5B554D]"
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
              className="px-1.5 py-0.5 hover:text-red-700 hover:bg-red-50 rounded text-[11px] font-sans font-medium transition-colors text-[#8C857B]"
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
              className="p-1 hover:text-red-700 hover:bg-red-50 rounded transition-colors text-[#8C857B]"
              title="Delete Entire Table"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="h-4 w-px bg-[#E8E4DA] mx-1" />

        {/* Preview toggle */}
        <button
          type="button"
          onClick={onTogglePreview}
          className={`p-1.5 rounded-full transition-colors ${
            isPreviewMode ? 'bg-[#233831] text-white' : 'hover:text-[#2B2824] hover:bg-[#F5F2EA]'
          }`}
          title={isPreviewMode ? "Switch to Edit mode" : "Preview mode"}
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Word count */}
        <div className="flex items-center gap-1.5 px-2 text-xs font-sans text-[#8C857B]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80" />
          <span className="font-mono whitespace-nowrap">{wordCount} words</span>
        </div>
      </div>
    </div>
  );
};

