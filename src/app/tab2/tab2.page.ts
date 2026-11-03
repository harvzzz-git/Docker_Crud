import { Component } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular/lazy';
import { Book, ReadingStatus } from '../models/book.model';
import { BookService } from '../services/book.service';

type BookFilter = 'All' | ReadingStatus;
interface ReorderDetail {
  from: number;
  to: number;
  complete: () => void;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  books: Book[] = [];
  searchTerm = '';
  filter: BookFilter = 'All';
  loadError = '';
  isEditModalOpen = false;
  editingBook: Book | null = null;
  readonly filters: BookFilter[] = ['All', 'To Read', 'Reading', 'Finished'];
  readonly statuses: ReadingStatus[] = ['To Read', 'Reading', 'Finished'];

  constructor(
    private readonly bookService: BookService,
    private readonly alertController: AlertController,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
  ) {}

  ionViewWillEnter(): Promise<void> {
    return this.loadBooks();
  }

  get filteredBooks(): Book[] {
    const query = this.searchTerm.trim().toLocaleLowerCase();
    return this.books.filter(book => {
      const matchesStatus = this.filter === 'All' || book.status === this.filter;
      const matchesSearch =
        !query ||
        [book.title, book.author, book.genre, book.isbn]
          .some(value => value.toLocaleLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }

  async refresh(event: Event): Promise<void> {
    const refresher = event.target as HTMLIonRefresherElement;
    try {
      await this.loadBooks();
    } finally {
      await refresher.complete();
    }
  }

  editBook(book: Book): void {
    this.editingBook = { ...book };
    this.isEditModalOpen = true;
  }

  closeEdit(): void {
    this.isEditModalOpen = false;
    this.editingBook = null;
  }

  async saveEditedBook(): Promise<void> {
    if (!this.editingBook) {
      return;
    }
    const updated: Book = {
      ...this.editingBook,
      title: this.editingBook.title.trim(),
      author: this.editingBook.author.trim(),
      genre: this.editingBook.genre.trim(),
      isbn: this.editingBook.isbn.trim(),
    };
    if (!updated.title || !updated.author || !updated.genre || !updated.isbn) {
      await this.showToast('Please complete every book field.', 'warning');
      return;
    }
    const saved = await this.withLoading('Updating book…', () => this.bookService.updateBook(updated));
    if (saved) {
      this.closeEdit();
    }
  }

  async confirmDelete(book: Book): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete book?',
      message: `Remove “${book.title}” from your library?`,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.withLoading('Deleting book…', () => this.bookService.deleteBook(book.id));
          },
        },
      ],
    });
    await alert.present();
  }

  async reorder(event: CustomEvent<ReorderDetail>): Promise<void> {
    const reordered = [...this.books];
    const [moved] = reordered.splice(event.detail.from, 1);
    reordered.splice(event.detail.to, 0, moved);
    await this.withLoading('Saving order…', () => this.bookService.reorderBooks(reordered));
    event.detail.complete();
  }

  statusColor(status: ReadingStatus): string {
    if (status === 'Finished') {
      return 'success';
    }
    return status === 'Reading' ? 'tertiary' : 'medium';
  }

  private async loadBooks(): Promise<void> {
    try {
      this.books = await this.bookService.getBooks();
      this.loadError = '';
    } catch (error) {
      this.loadError = this.errorMessage(error);
    }
  }

  private async withLoading(message: string, action: () => Promise<void>): Promise<boolean> {
    const loading = await this.loadingController.create({ message });
    await loading.present();
    try {
      await action();
      await this.loadBooks();
      if (this.loadError) {
        throw new Error(this.loadError);
      }
      await this.showToast('Your library has been updated.', 'success');
      return true;
    } catch (error) {
      await this.showToast(this.errorMessage(error), 'danger');
      return false;
    } finally {
      await loading.dismiss();
    }
  }

  private async showToast(message: string, color: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 2500,
      position: 'top',
    });
    await toast.present();
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'The requested change could not be completed.';
  }
}
