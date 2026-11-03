export type ReadingStatus = 'To Read' | 'Reading' | 'Finished';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  status: ReadingStatus;
}

export type BookDraft = Omit<Book, 'id'>;
