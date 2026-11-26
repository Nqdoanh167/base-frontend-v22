import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private sequence = 0;
  private readonly _toasts = signal<ToastMessage[]>([]);

  readonly toasts = this._toasts.asReadonly();

  success(text: string, duration = 3000): void {
    this.push('success', text, duration);
  }

  error(text: string, duration = 5000): void {
    this.push('error', text, duration);
  }

  info(text: string, duration = 3000): void {
    this.push('info', text, duration);
  }

  warning(text: string, duration = 4000): void {
    this.push('warning', text, duration);
  }

  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }

  private push(kind: ToastKind, text: string, duration: number): void {
    const id = ++this.sequence;
    this._toasts.update((list) => [...list, { id, kind, text, duration }]);

    if (duration > 0) {
      window.setTimeout(() => this.dismiss(id), duration);
    }
  }
}
