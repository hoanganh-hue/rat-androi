// Main Layout Component
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <!-- Sidebar -->
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">security</mat-icon>
          <div class="logo-text">
            <h2>DogeRat</h2>
            <small>Web Admin</small>
          </div>
        </div>

        <mat-nav-list>
          @for (item of getVisibleNavItems(); track item.route) {
            <a mat-list-item [routerLink]="item.route" routerLinkActive="active">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>

        <div class="sidenav-footer">
          <small>v2.0.0</small>
        </div>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        <!-- Top Bar -->
        <mat-toolbar class="topbar">
          <button mat-icon-button (click)="toggleSidebar()">
            <mat-icon>menu</mat-icon>
          </button>

          <span class="spacer"></span>

          <!-- User Menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <div class="user-info">
                <strong>{{ currentUser()?.username }}</strong>
                <small>{{ currentUser()?.role }}</small>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .layout-container {
        height: 100vh;
      }

      .sidenav {
        width: 260px;
        background-color: var(--bg-secondary);
        border-right: 1px solid var(--border-primary);
        display: flex;
        flex-direction: column;
      }

      .sidenav-header {
        padding: var(--spacing-lg);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        border-bottom: 1px solid var(--border-primary);
      }

      .logo-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--primary-brand);
      }

      .logo-text h2 {
        margin: 0;
        font-size: 20px;
        color: var(--text-primary);
      }

      .logo-text small {
        color: var(--text-secondary);
      }

      mat-nav-list {
        flex: 1;
        padding-top: var(--spacing-md);
      }

      mat-nav-list a {
        margin: var(--spacing-xs) var(--spacing-md);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        transition: all 0.2s ease;
      }

      mat-nav-list a:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
      }

      mat-nav-list a.active {
        background-color: rgba(33, 150, 243, 0.1);
        color: var(--primary-brand);
      }

      .sidenav-footer {
        padding: var(--spacing-md);
        text-align: center;
        color: var(--text-secondary);
        border-top: 1px solid var(--border-primary);
      }

      .topbar {
        background-color: var(--bg-secondary);
        border-bottom: 1px solid var(--border-primary);
        position: sticky;
        top: 0;
        z-index: 10;
      }

      .spacer {
        flex: 1;
      }

      .user-menu-header {
        padding: var(--spacing-md);
      }

      .user-info strong {
        display: block;
        color: var(--text-primary);
      }

      .user-info small {
        color: var(--text-secondary);
        text-transform: capitalize;
      }

      .content {
        height: calc(100vh - 64px);
        overflow-y: auto;
        background-color: var(--bg-primary);
      }

      @media (max-width: 768px) {
        .sidenav {
          width: 200px;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  sidenavOpened = signal(true);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Devices', icon: 'devices', route: '/devices' },
    { label: 'Users', icon: 'people', route: '/users', roles: ['admin', 'manager'] },
    { label: 'Audit Trail', icon: 'history', route: '/audit', roles: ['admin', 'manager'] },
  ];

  getVisibleNavItems(): NavItem[] {
    const userRole = this.currentUser()?.role;
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole || '');
    });
  }

  toggleSidebar() {
    this.sidenavOpened.update((v) => !v);
  }

  logout() {
    this.authService.logout();
  }
}
