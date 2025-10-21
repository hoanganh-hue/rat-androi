// Login Component
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <mat-icon class="logo-icon">security</mat-icon>
            <h1>DogeRat Web Admin</h1>
            <p class="subtitle">Secure Device Management Platform</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input 
                matInput 
                formControlName="username" 
                placeholder="Enter your username"
                autocomplete="username">
              <mat-icon matPrefix>person</mat-icon>
              @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input 
                matInput 
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="password"
                placeholder="Enter your password"
                autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button 
                mat-icon-button 
                matSuffix 
                type="button"
                (click)="hidePassword.set(!hidePassword())"
                [attr.aria-label]="'Hide password'"
                [attr.aria-pressed]="hidePassword()">
                <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <button 
              mat-raised-button 
              color="primary" 
              type="submit"
              class="full-width login-button"
              [disabled]="loading() || loginForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                <span>Logging in...</span>
              } @else {
                <span>Login</span>
              }
            </button>
          </form>

          <div class="login-footer">
            <p class="text-secondary">
              Default credentials: <code>admin</code> / <code>Admin@123456</code>
            </p>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="version-info">
        <small>DogeRat Web Admin v2.0 | For educational purposes only</small>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
      padding: var(--spacing-lg);
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      padding: var(--spacing-xl);
    }

    .login-header {
      text-align: center;
      margin-bottom: var(--spacing-lg);
    }

    .logo-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--primary-brand);
      margin-bottom: var(--spacing-sm);
    }

    .login-header h1 {
      margin: var(--spacing-sm) 0;
      color: var(--text-primary);
    }

    .subtitle {
      color: var(--text-secondary);
      margin: 0;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: var(--spacing-md);
    }

    .login-button {
      height: 48px;
      font-size: 16px;
      font-weight: 500;
      margin-top: var(--spacing-md);
    }

    .button-spinner {
      display: inline-block;
      margin-right: var(--spacing-sm);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      background-color: rgba(244, 67, 54, 0.1);
      border-left: 4px solid var(--accent-error);
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-md);
      color: var(--accent-error);
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .login-footer {
      margin-top: var(--spacing-lg);
      text-align: center;
    }

    .login-footer code {
      background-color: var(--bg-tertiary);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      font-size: 12px;
    }

    .version-info {
      margin-top: var(--spacing-lg);
      text-align: center;
      color: var(--text-secondary);
    }

    @media (max-width: 600px) {
      .login-card {
        padding: var(--spacing-lg);
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const credentials = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading.set(false);
        // Navigation handled by AuthService
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.error || 'Login failed. Please check your credentials.'
        );
      }
    });
  }
}

