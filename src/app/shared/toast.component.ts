import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-toast',
  template: `
    <div class="toast" [class.show]="show" [ngClass]="type">
      <span>{{ message }}</span>
    </div>
  `,
  styleUrls: ['./toast.component.css'],
  standalone: true,
  providers: [],
    imports: [CommonModule]
})
export class ToastComponent {
  @Input() message = '';
  @Input() type: 'success' | 'error' | 'info' = 'info';
  @Input() show = false;
}
