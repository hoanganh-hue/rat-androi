// Device List Component
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Device } from '../../../core/models';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="devices-container">
      <div class="page-header">
        <div>
          <h1>Device Management</h1>
          <p class="text-secondary">Manage all connected devices</p>
        </div>
        <button mat-raised-button color="primary" (click)="refreshDevices()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="filters-section">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search devices</mat-label>
          <input
            matInput
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search by model, IP, or ID...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <div class="filter-chips">
          <mat-chip-listbox>
            <mat-chip-option
              [selected]="statusFilter() === 'all'"
              (click)="setStatusFilter('all')">
              All ({{ devices().length }})
            </mat-chip-option>
            <mat-chip-option
              [selected]="statusFilter() === 'online'"
              (click)="setStatusFilter('online')">
              Online ({{ getOnlineCount() }})
            </mat-chip-option>
            <mat-chip-option
              [selected]="statusFilter() === 'offline'"
              (click)="setStatusFilter('offline')">
              Offline ({{ getOfflineCount() }})
            </mat-chip-option>
          </mat-chip-listbox>
        </div>
      </div>

      <!-- Devices Table -->
      <div class="table-container">
        <table mat-table [dataSource]="filteredDevices()" class="devices-table">
          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let device">
              <span
                class="status-badge"
                [class.online]="device.isOnline"
                [class.offline]="!device.isOnline">
                <mat-icon>{{ device.isOnline ? 'check_circle' : 'cancel' }}</mat-icon>
                {{ device.isOnline ? 'Online' : 'Offline' }}
              </span>
            </td>
          </ng-container>

          <!-- Device ID Column -->
          <ng-container matColumnDef="device_id">
            <th mat-header-cell *matHeaderCellDef>Device ID</th>
            <td mat-cell *matCellDef="let device">
              <code class="device-id">{{ device.device_id.substring(0, 8) }}...</code>
            </td>
          </ng-container>

          <!-- Model Column -->
          <ng-container matColumnDef="model">
            <th mat-header-cell *matHeaderCellDef>Model</th>
            <td mat-cell *matCellDef="let device">{{ device.model }}</td>
          </ng-container>

          <!-- IP Address Column -->
          <ng-container matColumnDef="ip">
            <th mat-header-cell *matHeaderCellDef>IP Address</th>
            <td mat-cell *matCellDef="let device">
              <code>{{ device.ip }}</code>
            </td>
          </ng-container>

          <!-- Android Version Column -->
          <ng-container matColumnDef="version">
            <th mat-header-cell *matHeaderCellDef>Android</th>
            <td mat-cell *matCellDef="let device">{{ device.android_version }}</td>
          </ng-container>

          <!-- Last Seen Column -->
          <ng-container matColumnDef="last_seen">
            <th mat-header-cell *matHeaderCellDef>Last Seen</th>
            <td mat-cell *matCellDef="let device">
              {{ device.last_seen_at | date:'short' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let device">
              <button
                mat-icon-button
                [matMenuTriggerFor]="deviceMenu"
                [disabled]="!device.isOnline">
                <mat-icon>more_vert</mat-icon>
              </button>

              <mat-menu #deviceMenu="matMenu">
                <button mat-menu-item (click)="viewDetails(device)">
                  <mat-icon>info</mat-icon>
                  <span>View Details</span>
                </button>
                <button mat-menu-item (click)="sendCommand(device, 'get_info')">
                  <mat-icon>smartphone</mat-icon>
                  <span>Get Device Info</span>
                </button>
                <button mat-menu-item (click)="sendCommand(device, 'get_location')">
                  <mat-icon>location_on</mat-icon>
                  <span>Get Location</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="deleteDevice(device)" class="danger">
                  <mat-icon>delete</mat-icon>
                  <span>Delete Device</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        @if (filteredDevices().length === 0) {
          <div class="empty-state">
            <mat-icon>devices_other</mat-icon>
            <h3>No devices found</h3>
            <p>
              @if (searchQuery) {
                No devices match your search criteria.
              } @else {
                No devices have connected to the server yet.
              }
            </p>
          </div>
        }
      </div>

      <!-- Pagination -->
      <mat-paginator
        [length]="filteredDevices().length"
        [pageSize]="pageSize"
        [pageSizeOptions]="[10, 25, 50, 100]"
        (page)="onPageChange($event)"
        showFirstLastButtons>
      </mat-paginator>
    </div>
  `,
  styles: [`
    .devices-container {
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
      margin-bottom: var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .search-field {
      max-width: 500px;
    }

    .filter-chips mat-chip-listbox {
      display: flex;
      gap: var(--spacing-sm);
    }

    .table-container {
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-bottom: var(--spacing-md);
    }

    .devices-table {
      width: 100%;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-badge.online {
      background-color: rgba(76, 175, 80, 0.15);
      color: var(--accent-success);
    }

    .status-badge.offline {
      background-color: rgba(158, 158, 158, 0.15);
      color: var(--status-offline);
    }

    .device-id {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      padding: 2px 6px;
      background-color: var(--bg-tertiary);
      border-radius: var(--radius-sm);
    }

    code {
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    .danger {
      color: var(--accent-error);
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

    .empty-state h3 {
      margin: var(--spacing-sm) 0;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }

      .search-field {
        max-width: 100%;
      }
    }
  `]
})
export class DeviceListComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  devices = signal<Device[]>([]);
  filteredDevices = signal<Device[]>([]);
  statusFilter = signal<'all' | 'online' | 'offline'>('all');
  searchQuery = '';
  pageSize = 25;

  displayedColumns = ['status', 'device_id', 'model', 'ip', 'version', 'last_seen', 'actions'];

  ngOnInit() {
    this.loadDevices();
  }

  loadDevices() {
    this.api.get<{ devices: Device[] }>('/devices').subscribe({
      next: (response) => {
        this.devices.set(response.devices);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to load devices:', error);
        this.snackBar.open('Failed to load devices', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters() {
    let filtered = this.devices();

    // Status filter
    if (this.statusFilter() === 'online') {
      filtered = filtered.filter(d => d.isOnline);
    } else if (this.statusFilter() === 'offline') {
      filtered = filtered.filter(d => !d.isOnline);
    }

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.model.toLowerCase().includes(query) ||
        d.ip.toLowerCase().includes(query) ||
        d.device_id.toLowerCase().includes(query)
      );
    }

    this.filteredDevices.set(filtered);
  }

  setStatusFilter(status: 'all' | 'online' | 'offline') {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  getOnlineCount(): number {
    return this.devices().filter(d => d.isOnline).length;
  }

  getOfflineCount(): number {
    return this.devices().filter(d => !d.isOnline).length;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
  }

  refreshDevices() {
    this.loadDevices();
    this.snackBar.open('Devices refreshed', 'Close', { duration: 2000 });
  }

  viewDetails(device: Device) {
    this.router.navigate(['/devices', device.id]);
  }

  sendCommand(device: Device, action: string) {
    this.api.post(`/devices/${device.id}/command`, { action }).subscribe({
      next: () => {
        this.snackBar.open('Command sent successfully', 'Close', { duration: 2000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to send command', 'Close', { duration: 3000 });
      }
    });
  }

  deleteDevice(device: Device) {
    if (confirm(`Are you sure you want to delete device ${device.model}?`)) {
      this.api.delete(`/devices/${device.id}`).subscribe({
        next: () => {
          this.snackBar.open('Device deleted', 'Close', { duration: 2000 });
          this.loadDevices();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete device', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

