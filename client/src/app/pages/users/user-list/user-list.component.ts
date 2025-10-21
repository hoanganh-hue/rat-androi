// User List Component
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="users-container">
      <div class="page-header">
        <div>
          <h1>User Management</h1>
          <p class="text-secondary">Manage system users and permissions</p>
        </div>
        <button mat-raised-button color="primary" (click)="createUser()">
          <mat-icon>add</mat-icon>
          Create User
        </button>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table mat-table [dataSource]="users()" class="users-table">
          <!-- Username Column -->
          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Username</th>
            <td mat-cell *matCellDef="let user">
              <div class="user-cell">
                <mat-icon>person</mat-icon>
                <span>{{ user.username }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Email Column -->
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email || 'N/A' }}</td>
          </ng-container>

          <!-- Role Column -->
          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Role</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip
                [class.admin]="user.role === 'admin'"
                [class.manager]="user.role === 'manager'"
                [class.operator]="user.role === 'operator'"
                [class.viewer]="user.role === 'viewer'">
                {{ user.role }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Created At Column -->
          <ng-container matColumnDef="created_at">
            <th mat-header-cell *matHeaderCellDef>Created</th>
            <td mat-cell *matCellDef="let user">
              {{ user.created_at | date:'short' }}
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button [matMenuTriggerFor]="userMenu">
                <mat-icon>more_vert</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu">
                <button mat-menu-item (click)="editUser(user)">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item (click)="resetPassword(user)">
                  <mat-icon>lock_reset</mat-icon>
                  <span>Reset Password</span>
                </button>
                <mat-divider></mat-divider>
                <button
                  mat-menu-item
                  (click)="deleteUser(user)"
                  [disabled]="user.role === 'admin'"
                  class="danger">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        @if (users().length === 0) {
          <div class="empty-state">
            <mat-icon>people</mat-icon>
            <h3>No users found</h3>
            <p>Create your first user to get started</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .users-container {
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

    .table-container {
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .users-table {
      width: 100%;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .user-cell mat-icon {
      color: var(--text-secondary);
    }

    mat-chip {
      text-transform: capitalize;
      font-size: 12px;
    }

    mat-chip.admin {
      background-color: rgba(244, 67, 54, 0.15);
      color: var(--accent-error);
    }

    mat-chip.manager {
      background-color: rgba(33, 150, 243, 0.15);
      color: var(--primary-brand);
    }

    mat-chip.operator {
      background-color: rgba(76, 175, 80, 0.15);
      color: var(--accent-success);
    }

    mat-chip.viewer {
      background-color: rgba(158, 158, 158, 0.15);
      color: var(--text-secondary);
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

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-md);
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  users = signal<User[]>([]);
  displayedColumns = ['username', 'email', 'role', 'created_at', 'actions'];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.get<{ users: User[] }>('/users').subscribe({
      next: (response) => {
        this.users.set(response.users);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      }
    });
  }

  createUser() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  editUser(user: User) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      data: user
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  resetPassword(user: User) {
    const newPassword = prompt(`Enter new password for ${user.username}:`);
    if (newPassword) {
      this.api.put(`/users/${user.id}`, { password: newPassword }).subscribe({
        next: () => {
          this.snackBar.open('Password reset successfully', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to reset password', 'Close', { duration: 3000 });
        }
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      this.api.delete(`/users/${user.id}`).subscribe({
        next: () => {
          this.snackBar.open('User deleted', 'Close', { duration: 2000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        }
      });
    }
  }
}

