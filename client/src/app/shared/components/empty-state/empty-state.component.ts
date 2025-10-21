// Empty State Component
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon>{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      @if (message) {
        <p>{{ message }}</p>
      }
      @if (actionLabel) {
        <button mat-raised-button color="primary" (click)="onAction()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--text-secondary);
    }

    mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
      margin-bottom: var(--spacing-md);
    }

    h3 {
      margin: var(--spacing-sm) 0;
      color: var(--text-primary);
    }

    p {
      margin: var(--spacing-sm) 0 var(--spacing-lg) 0;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data';
  @Input() message = '';
  @Input() actionLabel = '';

  onAction() {
    // Override in parent component
  }
}

