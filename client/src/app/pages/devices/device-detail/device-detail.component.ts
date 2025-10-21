// Device Detail Component (skeleton)
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../core/services/api.service';
import { Device } from '../../../core/models';

interface DeviceDetailResponse {
  device: Device & { isOnline: boolean };
  logs: any[];
  commands: any[];
}

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="detail-container">
      <div class="page-header">
        <button mat-stroked-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          Back to Devices
        </button>
        <h1>Device Detail</h1>
        <span></span>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (device()) {
        <mat-card class="section-card">
          <div class="section-header">
            <div class="title">
              <mat-icon>{{ device()!.isOnline ? 'check_circle' : 'cancel' }}</mat-icon>
              <h2>{{ device()!.model }} <small class="muted">({{ shortId(device()!.device_id) }})</small></h2>
            </div>
            <span class="badge" [class.online]="device()!.isOnline" [class.offline]="!device()!.isOnline">
              {{ device()!.isOnline ? 'Online' : 'Offline' }}
            </span>
          </div>
          <mat-divider></mat-divider>
          <div class="grid">
            <div>
              <label>Device ID</label>
              <code>{{ device()!.device_id }}</code>
            </div>
            <div>
              <label>Android</label>
              <span>{{ device()!.version }}</span>
            </div>
            <div>
              <label>IP Address</label>
              <code>{{ device()!.ip }}</code>
            </div>
            <div>
              <label>Last Seen</label>
              <span>{{ device()!.last_seen_at | date:'short' }}</span>
            </div>
          </div>
        </mat-card>

        <mat-card class="section-card">
          <div class="section-header">
            <h3>Recent Logs</h3>
          </div>
          @if (logs().length === 0) {
            <div class="empty">No logs yet</div>
          } @else {
            <ul class="list">
              @for (log of logs(); track log.id) {
                <li>
                  <span>{{ log.type || 'log' }}</span>
                  <small class="muted">{{ log.created_at | date:'short' }}</small>
                </li>
              }
            </ul>
          }
        </mat-card>

        <mat-card class="section-card">
          <div class="section-header">
            <h3>Recent Commands</h3>
          </div>
          @if (commands().length === 0) {
            <div class="empty">No commands yet</div>
          } @else {
            <ul class="list">
              @for (cmd of commands(); track cmd.id) {
                <li>
                  <span>{{ cmd.command }}</span>
                  <small class="muted">{{ cmd.status }} • {{ cmd.created_at | date:'short' }}</small>
                </li>
              }
            </ul>
          }
        </mat-card>
      } @else {
        <div class="empty">Device not found</div>
      }
    </div>
  `,
  styles: [`
    .detail-container { padding: var(--spacing-lg); }
    .page-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--spacing-xl); }
    .page-header h1 { margin: 0; }
    .loading { display:flex; justify-content:center; padding: var(--spacing-xl); }
    .section-card { margin-bottom: var(--spacing-lg); padding: var(--spacing-lg); }
    .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--spacing-md); }
    .title { display:flex; align-items:center; gap: var(--spacing-md); }
    .title mat-icon { color: var(--text-secondary); }
    .badge { padding: 4px 10px; border-radius: 999px; font-size: 12px; }
    .badge.online { background: rgba(76,175,80,0.15); color: var(--accent-success); }
    .badge.offline { background: rgba(158,158,158,0.15); color: var(--text-secondary); }
    .grid { display:grid; gap: var(--spacing-md); grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); margin-top: var(--spacing-md); }
    label { display:block; font-size:12px; color: var(--text-secondary); margin-bottom: 4px; }
    code { background: var(--bg-tertiary); padding: 2px 6px; border-radius: var(--radius-sm); font-size: 12px; }
    .list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap: 8px; }
    .list li { display:flex; align-items:center; justify-content:space-between; padding: 8px 0; border-bottom: 1px solid var(--border-primary); }
    .list li:last-child { border-bottom: 0; }
    .muted { color: var(--text-secondary); }
    .empty { text-align:center; color: var(--text-secondary); padding: var(--spacing-lg); }
  `]
})
export class DeviceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);

  loading = signal(true);
  device = signal<(Device & { isOnline: boolean }) | null>(null);
  logs = signal<any[]>([]);
  commands = signal<any[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      return;
    }

    this.api.get<DeviceDetailResponse>(`/devices/${id}`).subscribe({
      next: (resp) => {
        this.device.set(resp.device);
        this.logs.set(resp.logs || []);
        this.commands.set(resp.commands || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load device detail', err);
        this.snackBar.open('Failed to load device detail', 'Close', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/devices']);
  }

  shortId(id: string): string {
    return id?.substring(0, 8) + '…';
  }
}

