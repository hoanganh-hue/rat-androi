// Socket.IO Service - Real-time communication with server
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface SocketEvent {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private authService = inject(AuthService);
  
  private socket: Socket | null = null;
  private connected = new BehaviorSubject<boolean>(false);
  private eventSubject = new Subject<SocketEvent>();

  public connected$ = this.connected.asObservable();
  public events$ = this.eventSubject.asObservable();

  /**
   * Connect to Socket.IO server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getToken();
    
    this.socket = io(environment.socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      this.connected.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      this.connected.next(false);
    });

    // Listen for device events
    this.socket.on('device-connected', (data) => {
      this.eventSubject.next({ type: 'device-connected', data });
    });

    this.socket.on('device-disconnected', (data) => {
      this.eventSubject.next({ type: 'device-disconnected', data });
    });

    this.socket.on('device-message', (data) => {
      this.eventSubject.next({ type: 'device-message', data });
    });

    this.socket.on('command-response', (data) => {
      this.eventSubject.next({ type: 'command-response', data });
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
      this.eventSubject.next({ type: 'error', data: error });
    });
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected.next(false);
    }
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket.IO not connected. Cannot emit event:', event);
    }
  }

  /**
   * Listen for specific event
   */
  on(event: string): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on(event, (data: any) => {
          observer.next(data);
        });
      }

      return () => {
        if (this.socket) {
          this.socket.off(event);
        }
      };
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected.value;
  }
}

