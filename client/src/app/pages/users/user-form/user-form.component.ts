// User Form Component
import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit User' : 'Create User' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" placeholder="Enter username" />
          @if (userForm.get('username')?.hasError('required')) {
            <mat-error>Username is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="user@example.com" />
          @if (userForm.get('email')?.hasError('email')) {
            <mat-error>Please enter a valid email</mat-error>
          }
        </mat-form-field>

        @if (!isEditMode) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Password</mat-label>
            <input
              matInput
              type="password"
              formControlName="password"
              placeholder="Enter password"
            />
            @if (userForm.get('password')?.hasError('required')) {
              <mat-error>Password is required</mat-error>
            }
            @if (userForm.get('password')?.hasError('minlength')) {
              <mat-error>Password must be at least 6 characters</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option value="admin">Admin - Full access</mat-option>
            <mat-option value="manager">Manager - Manage users & devices</mat-option>
            <mat-option value="operator">Operator - Control devices</mat-option>
            <mat-option value="viewer">Viewer - Read-only access</mat-option>
          </mat-select>
          @if (userForm.get('role')?.hasError('required')) {
            <mat-error>Role is required</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="save()"
        [disabled]="userForm.invalid || saving"
      >
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .user-form {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        padding: var(--spacing-md) 0;
      }

      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private dialogRef = inject(MatDialogRef<UserFormComponent>);
  private snackBar = inject(MatSnackBar);

  isEditMode = false;
  saving = false;

  userForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.email]],
    password: ['', []],
    role: ['viewer', Validators.required],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: User | null) {
    if (data) {
      this.isEditMode = true;
      this.userForm.patchValue({
        username: data.username,
        email: data.email || '',
        role: data.role,
      });
      // Don't require password for edit
      this.userForm.get('password')?.clearValidators();
    } else {
      // Require password for new user
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();
  }

  save() {
    if (this.userForm.invalid) {
      return;
    }

    this.saving = true;
    const userData = this.userForm.value;

    const request = this.isEditMode
      ? this.api.put(`/users/${this.data!.id}`, userData)
      : this.api.post('/users', userData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `User ${this.isEditMode ? 'updated' : 'created'} successfully`,
          'Close',
          { duration: 2000 },
        );
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.saving = false;
        this.snackBar.open(
          error.error?.error || `Failed to ${this.isEditMode ? 'update' : 'create'} user`,
          'Close',
          { duration: 3000 },
        );
      },
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
