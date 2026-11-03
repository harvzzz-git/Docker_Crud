import { Component } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular/lazy';
import { BookDraft, ReadingStatus } from '../models/book.model';
import { BookService } from '../services/book.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page {
  readonly statuses: ReadingStatus[] = ['To Read', 'Reading', 'Finished'];
  newBook: BookDraft = this.emptyBook();

  constructor(
    private readonly bookService: BookService,
    private readonly loadingController: LoadingController,
    private readonly toastController: ToastController,
  ) {}

  async addBook(): Promise<void> {
    const book: BookDraft = {
      title: this.newBook.title.trim(),
      author: this.newBook.author.trim(),
      genre: this.newBook.genre.trim(),
      isbn: this.newBook.isbn.trim(),
      status: this.newBook.status,
    };
    if (!book.title || !book.author || !book.genre || !book.isbn) {
      await this.showToast('Please complete every book field.', 'warning');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Saving book…' });
    await loading.present();
    try {
      await this.bookService.addBook(book);
      this.newBook = this.emptyBook();
      await this.showToast('Book added to your library.', 'success');
    } catch (error) {
      await this.showToast(this.errorMessage(error), 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private emptyBook(): BookDraft {
    return { title: '', author: '', genre: '', isbn: '', status: 'To Read' };
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
    return error instanceof Error ? error.message : 'Unable to save the book.';
  }
}
