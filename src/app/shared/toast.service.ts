import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast$ = new BehaviorSubject<{ message: string; type: ToastType; show: boolean }>({ message: '', type: 'info', show: false });

  show(message: string, type: ToastType = 'info', duration = 3000) {
    this.toast$.next({ message, type, show: true });
    setTimeout(() => {
      this.toast$.next({ ...this.toast$.value, show: false });
    }, duration);
  }
}
