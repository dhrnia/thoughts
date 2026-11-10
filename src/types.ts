export interface EncryptedSegment {
  id: string;
  title: string;
  algorithm: string;
  preview: string;
  hiddenContent: string;
  isUnlocked?: boolean;
}

export interface Note {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  date: string;
  displayDate?: string;
  timeContext?: string;
  location?: string;
  tags: string[];
  metadataChips?: string[];
  isVaulted: boolean;
  isSaved?: boolean;
  category: 'reflections' | 'vault' | 'field-note' | 'routine' | 'ledger';
  wordCount: number;
  readingTime: string;
  revision?: string;
  createdAt: string;
  updatedAt?: string;
  coverImage?: string;
  imageCaption?: string;
  quote?: string;
  quoteAuthor?: string;
  encryptedSegment?: EncryptedSegment;
  cardType?: 'standard' | 'field-note' | 'locked' | 'rhythm';
  streakDays?: number;
}

export type ViewMode = 'journal' | 'detail' | 'settings';
export type FilterTab = 'all' | 'reflections' | 'vault' | 'saved';
