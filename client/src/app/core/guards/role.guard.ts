// Role Guard - Protect routes based on user role
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // User doesn't have required role
    router.navigate(['/forbidden']);
    return false;
  };
};

// Predefined role guards
export const adminOnly: CanActivateFn = roleGuard([UserRole.ADMIN]);
export const adminOrManager: CanActivateFn = roleGuard([UserRole.ADMIN, UserRole.MANAGER]);
export const canControlDevices: CanActivateFn = roleGuard([UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR]);

