// Audit Trail Component
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { AuditTrail } from '../../../core/models';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div class="audit-container">
      <div class="page-header">
        <div>
          <h1>Audit Trail</h1>
          <p class="text-secondary">Track all system activities and changes</p>
        </div>
        <button mat-raised-button color="primary" (click)="exportToCSV()">
          <mat-icon>download</mat-icon>
          Export CSV
        </button>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <mat-form-field appearance="outline">
          <mat-label>User</mat-label>
          <mat-select [(ngModel)]="filters.userId" (ngModelChange)="applyFilters()">
            <mat-option [value]="null">All Users</mat-option>
            @for (user of uniqueUsers(); track user) {
              <mat-option [value]="user">{{ user }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Action Type</mat-label>
          <mat-select [(ngModel)]="filters.action" (ngModelChange)="applyFilters()">
            <mat-option [value]="null">All Actions</mat-option>
            @for (action of uniqueActions(); track action) {
              <mat-option [value]="action">{{ action }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Start Date</mat-label>
          <input
            matInput
            [matDatepicker]="startPicker"
            [(ngModel)]="filters.startDate"
            (ngModelChange)="applyFilters()">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>End Date</mat-label>
          <input
            matInput
            [matDatepicker]="endPicker"
            [(ngModel)]="filters.endDate"
            (ngModelChange)="applyFilters()">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
        </mat-form-field>

        <button mat-stroked-button (click)="clearFilters()">
          <mat-icon>clear</mat-icon>
          Clear Filters
        </button>
      </div>

      <!-- Audit Table -->
      <div class="table-container">
        <table mat-table [dataSource]="filteredAudits()" class="audit-table">
          <!-- Timestamp Column -->
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Timestamp</th>
            <td mat-cell *matCellDef="let audit">
              {{ audit.timestamp | date:'short' }}
            </td>
          </ng-container>

          <!-- User Column -->
          <ng-container matColumnDef="user">
            <th mat-header-cell *matHeaderCellDef>User</th>
            <td mat-cell *matCellDef="let audit">
              <div class="user-cell">
                <mat-icon>person</mat-icon>
                <span>{{ audit.user_username }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Action Column -->
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef>Action</th>
            <td mat-cell *matCellDef="let audit">
              <mat-chip
                [class]="getActionClass(audit.action)">
                {{ audit.action }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Resource Column -->
          <ng-container matColumnDef="resource">
            <th mat-header-cell *matHeaderCellDef>Resource</th>
            <td mat-cell *matCellDef="let audit">
              {{ audit.resource_type }}
            </td>
          </ng-container>

          <!-- Details Column -->
          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef>Details</th>
            <td mat-cell *matCellDef="let audit">
              <code class="details-code">{{ audit.details || 'N/A' }}</code>
            </td>
          </ng-container>

          <!-- IP Address Column -->
          <ng-container matColumnDef="ip">
            <th mat-header-cell *matHeaderCellDef>IP Address</th>
            <td mat-cell *matCellDef="let audit">
              <code>{{ audit.ip_address }}</code>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        @if (filteredAudits().length === 0) {
          <div class="empty-state">
            <mat-icon>history</mat-icon>
            <h3>No audit logs found</h3>
            <p>No activities match your filter criteria</p>
          </div>
        }
      </div>

      <!-- Pagination -->
      <mat-paginator
        [length]="filteredAudits().length"
        [pageSize]="25"
        [pageSizeOptions]="[25, 50, 100]"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .audit-container {
      padding: var(--spacing-lg);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-xl);
    }

    .page-header h1 {
      margin: 0;
    }

    .page-header button {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .filters-section {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-lg);
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
    }

    .filters-section mat-form-field {
      min-width: 200px;
    }

    .table-container {
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--spacing-md);
    }

    .audit-table {
      width: 100%;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .user-cell mat-icon {
      color: var(--text-secondary);
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    mat-chip {
      font-size: 11px;
      text-transform: uppercase;
    }

    mat-chip.create {
      background-color: rgba(76, 175, 80, 0.15);
      color: var(--accent-success);
    }

    mat-chip.update {
      background-color: rgba(33, 150, 243, 0.15);
      color: var(--primary-brand);
    }

    mat-chip.delete {
      background-color: rgba(244, 67, 54, 0.15);
      color: var(--accent-error);
    }

    mat-chip.login {
      background-color: rgba(156, 39, 176, 0.15);
      color: #9c27b0;
    }

    .details-code {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
    }

    code {
      font-family: 'Courier New', monospace;
      font-size: 12px;
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-xl);
      color: var(--text-secondary);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
      margin-bottom: var(--spacing-md);
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .filters-section mat-form-field {
        min-width: 100%;
      }
    }
  `]
})
export class AuditListComponent implements OnInit {
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  audits = signal<AuditTrail[]>([]);
  filteredAudits = signal<AuditTrail[]>([]);
  displayedColumns = ['timestamp', 'user', 'action', 'resource', 'details', 'ip'];

  filters = {
    userId: null as string | null,
    action: null as string | null,
    startDate: null as Date | null,
    endDate: null as Date | null
  };

  ngOnInit() {
    this.loadAudits();
  }

  loadAudits() {
    this.api.get<{ audits: AuditTrail[] }>('/audit').subscribe({
      next: (response) => {
        this.audits.set(response.audits);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to load audits:', error);
        this.snackBar.open('Failed to load audit logs', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters() {
    let filtered = this.audits();

    if (this.filters.userId) {
      filtered = filtered.filter(a => a.user_username === this.filters.userId);
    }

    if (this.filters.action) {
      filtered = filtered.filter(a => a.action === this.filters.action);
    }

    if (this.filters.startDate) {
      filtered = filtered.filter(a => new Date(a.timestamp) >= this.filters.startDate!);
    }

    if (this.filters.endDate) {
      filtered = filtered.filter(a => new Date(a.timestamp) <= this.filters.endDate!);
    }

    this.filteredAudits.set(filtered);
  }

  clearFilters() {
    this.filters = {
      userId: null,
      action: null,
      startDate: null,
      endDate: null
    };
    this.applyFilters();
  }

  uniqueUsers(): string[] {
    return [...new Set(this.audits().map(a => a.user_username))];
  }

  uniqueActions(): string[] {
    return [...new Set(this.audits().map(a => a.action))];
  }

  getActionClass(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create')) return 'create';
    if (actionLower.includes('update')) return 'update';
    if (actionLower.includes('delete')) return 'delete';
    if (actionLower.includes('login')) return 'login';
    return '';
  }

  exportToCSV() {
    const csvData = this.convertToCSV(this.filteredAudits());
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.snackBar.open('Audit trail exported', 'Close', { duration: 2000 });
  }

  private convertToCSV(audits: AuditTrail[]): string {
    const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'IP Address'];
    const rows = audits.map(a => [
      new Date(a.timestamp).toISOString(),
      a.user_username,
      a.action,
      a.resource_type,
      a.details || '',
      a.ip_address
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }
}

