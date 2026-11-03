import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { firestore } from '../../firebase';
import { Book, BookDraft } from '../models/book.model';

interface StoredBook extends BookDraft {
  order?: number;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  async getBooks(): Promise<Book[]> {
    const records: Array<{ book: Book; order: number }> = [];
    const snapshot = await getDocs(collection(firestore, 'books'));
    for (const document of snapshot.docs) {
      const value: unknown = document.data();
      if (!this.isStoredBook(value)) {
        throw new Error('Firebase returned an invalid book record. Check the books collection in Cloud Firestore.');
      }
      const { order, ...book } = value;
      records.push({ book: { ...book, id: document.id }, order: order ?? records.length });
    }

    return records
      .sort((a, b) => a.order - b.order || a.book.id.localeCompare(b.book.id))
      .map(record => record.book);
  }

  async addBook(book: BookDraft): Promise<Book> {
    const books = await this.getBooks();
    const bookRef = await addDoc(collection(firestore, 'books'), { ...book, order: books.length });
    return { ...book, id: bookRef.id };
  }

  async updateBook(updatedBook: Book): Promise<void> {
    const books = await this.getBooks();
    const index = books.findIndex(book => book.id === updatedBook.id);
    if (index < 0) {
      throw new Error('This book no longer exists. Refresh the list and try again.');
    }
    const { id, ...book } = updatedBook;
    await updateDoc(doc(firestore, 'books', id), { ...book, order: index });
  }

  async deleteBook(id: string): Promise<void> {
    const bookRef = doc(firestore, 'books', id);
    const snapshot = await getDoc(bookRef);
    if (!snapshot.exists()) {
      throw new Error('This book no longer exists. Refresh the list and try again.');
    }
    await deleteDoc(bookRef);
  }

  async reorderBooks(books: Book[]): Promise<void> {
    if (books.length > 500) {
      throw new Error('Cloud Firestore can reorder at most 500 books at a time.');
    }
    const batch = writeBatch(firestore);
    books.forEach((book, order) => {
      const { id, ...details } = book;
      batch.update(doc(firestore, 'books', id), { ...details, order });
    });
    if (books.length) {
      await batch.commit();
    }
  }

  private isStoredBook(value: unknown): value is StoredBook {
    if (!value || typeof value !== 'object') {
      return false;
    }
    const book = value as Record<string, unknown>;
    return (
      typeof book['title'] === 'string' &&
      typeof book['author'] === 'string' &&
      typeof book['genre'] === 'string' &&
      typeof book['isbn'] === 'string' &&
      (book['status'] === 'To Read' ||
        book['status'] === 'Reading' ||
        book['status'] === 'Finished') &&
      (book['order'] === undefined ||
        (typeof book['order'] === 'number' && Number.isFinite(book['order'])))
    );
  }
}
