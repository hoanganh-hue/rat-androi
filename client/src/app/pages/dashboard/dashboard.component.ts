// Dashboard Component
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService, DeviceStatusUpdate } from '../../core/services/socket.service';
import { Device } from '../../core/models';

interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  recentActions: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p class="text-secondary">Welcome back, {{ currentUser()?.username }}</p>
        </div>
        <button mat-raised-button color="primary" (click)="refreshData()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <div class="stat-icon" style="background-color: rgba(33, 150, 243, 0.1);">
              <mat-icon style="color: var(--primary-brand);">devices</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats().totalDevices }}</h3>
              <p>Total Devices</p>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon" style="background-color: rgba(76, 175, 80, 0.1);">
              <mat-icon style="color: var(--accent-success);">check_circle</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats().onlineDevices }}</h3>
              <p>Online</p>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon" style="background-color: rgba(158, 158, 158, 0.1);">
              <mat-icon style="color: var(--status-offline);">cancel</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats().offlineDevices }}</h3>
              <p>Offline</p>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-icon" style="background-color: rgba(255, 193, 7, 0.1);">
              <mat-icon style="color: var(--accent-warning);">history</mat-icon>
            </div>
            <div class="stat-content">
              <h3>{{ stats().recentActions }}</h3>
              <p>Recent Actions</p>
            </div>
          </mat-card>
        </div>

        <!-- Recent Devices -->
        <mat-card class="devices-card">
          <mat-card-header>
            <h2>Recent Devices</h2>
          </mat-card-header>
          <mat-card-content>
            @if (devices().length === 0) {
              <div class="empty-state">
                <mat-icon>devices_other</mat-icon>
                <p>No devices connected yet</p>
                <small>Devices will appear here once they connect to the server</small>
              </div>
            } @else {
              <table mat-table [dataSource]="devices()" class="devices-table">
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let device">
                    <span
                      class="status-badge"
                      [class.online]="device.isOnline"
                      [class.offline]="!device.isOnline"
                    >
                      {{ device.isOnline ? 'Online' : 'Offline' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="model">
                  <th mat-header-cell *matHeaderCellDef>Model</th>
                  <td mat-cell *matCellDef="let device">{{ device.model }}</td>
                </ng-container>

                <ng-container matColumnDef="ip">
                  <th mat-header-cell *matHeaderCellDef>IP Address</th>
                  <td mat-cell *matCellDef="let device">
                    <code>{{ device.ip }}</code>
                  </td>
                </ng-container>

                <ng-container matColumnDef="lastSeen">
                  <th mat-header-cell *matHeaderCellDef>Last Seen</th>
                  <td mat-cell *matCellDef="let device">
                    {{ device.last_seen_at | date: 'short' }}
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
              </table>
            }
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: var(--spacing-lg);
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
      }

      .dashboard-header h1 {
        margin: 0;
      }

      .dashboard-header button {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--spacing-lg);
        margin-bottom: var(--spacing-xl);
      }

      .stat-card {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
        padding: var(--spacing-lg);
      }

      .stat-icon {
        width: 64px;
        height: 64px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .stat-icon mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .stat-content h3 {
        font-size: 32px;
        font-weight: 700;
        margin: 0;
        color: var(--text-primary);
      }

      .stat-content p {
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
      }

      .devices-card {
        padding: var(--spacing-lg);
      }

      .devices-card h2 {
        margin: 0 0 var(--spacing-lg) 0;
      }

      .devices-table {
        width: 100%;
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

      .empty-state p {
        font-size: 18px;
        margin: var(--spacing-sm) 0;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-md);
        }

        .stats-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);

  currentUser = this.authService.currentUser;
  loading = signal(true);
  stats = signal<DashboardStats>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    recentActions: 0,
  });
  devices = signal<Device[]>([]);
  displayedColumns = ['status', 'model', 'ip', 'lastSeen'];

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.loadDashboardData();
    this.setupRealtimeUpdates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  setupRealtimeUpdates() {
    // Listen to device status updates
    const statusSub = this.socketService.deviceStatusUpdates.subscribe(
      (update: DeviceStatusUpdate) => {
        const deviceList = this.devices();
        const deviceIndex = deviceList.findIndex((d) => d.device_id === update.device_id);

        if (deviceIndex >= 0) {
          deviceList[deviceIndex] = {
            ...deviceList[deviceIndex],
            isOnline: update.isOnline,
            last_seen_at: update.last_seen_at,
          };
          this.devices.set([...deviceList]);
          this.updateStats();
        }
      },
    );

    this.subscriptions.push(statusSub);
  }

  updateStats() {
    const devices = this.devices();
    const onlineCount = devices.filter((d) => d.isOnline).length;

    this.stats.set({
      totalDevices: devices.length,
      onlineDevices: onlineCount,
      offlineDevices: devices.length - onlineCount,
      recentActions: devices.length,
    });
  }

  loadDashboardData() {
    this.loading.set(true);

    this.api.get<{ devices: Device[] }>('/devices').subscribe({
      next: (response) => {
        const devices = response.devices;
        this.devices.set(devices.slice(0, 10)); // Show only 10 recent
        this.updateStats();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Failed to load dashboard data:', error);
        this.loading.set(false);
      },
    });
  }

  refreshData() {
    this.loadDashboardData();
  }
}
