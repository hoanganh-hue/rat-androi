// Authentication Service
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { SocketService } from './socket.service';
import {
  User,
  UserRole,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthState
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);
  private socketService = inject(SocketService);

  private readonly TOKEN_KEY = 'dogerat_token';
  private readonly USER_KEY = 'dogerat_user';

  // Auth state
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();
  
  // Signals for reactive state
  public isAuthenticated = signal(false);
  public currentUser = signal<User | null>(null);
  public currentRole = signal<UserRole | null>(null);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.setAuthState(user, token);
      
      // Initialize Socket.IO connection
      this.socketService.connect(token);
      
      // Verify token with backend
      this.verifyToken().subscribe({
        next: (user) => {
          this.setAuthState(user, token);
        },
        error: () => {
          this.clearAuth();
          this.socketService.disconnect();
        }
      });
    }
  }

  /**
   * Login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.setAuthState(response.user, response.token);
        
        // Initialize Socket.IO connection after successful login
        this.socketService.connect(response.token);
        
        this.router.navigate(['/dashboard']);
      })
    );
  }

  /**
   * Register
   */
  register(data: RegisterRequest): Observable<any> {
    return this.api.post('/auth/register', data);
  }

  /**
   * Logout
   */
  logout(): void {
    // Disconnect Socket.IO before clearing auth
    this.socketService.disconnect();
    
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Get current user info from backend
   */
  verifyToken(): Observable<User> {
    return this.api.get<User>('/auth/me');
  }

  /**
   * Get token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored user from localStorage
   */
  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Set authentication state
   */
  private setAuthState(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.authStateSubject.next({
      isAuthenticated: true,
      user,
      token
    });

    this.isAuthenticated.set(true);
    this.currentUser.set(user);
    this.currentRole.set(user.role);
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });

    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentRole.set(null);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.currentRole() === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.currentRole();
    return currentRole !== null && roles.includes(currentRole);
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Check if user is manager or above
   */
  isManagerOrAbove(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER]);
  }

  /**
   * Check if user can control devices
   */
  canControlDevices(): boolean {
    return this.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR]);
  }
}

