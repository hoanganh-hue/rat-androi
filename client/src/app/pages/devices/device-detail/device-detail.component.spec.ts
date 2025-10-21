import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DeviceDetailComponent } from './device-detail.component';
import { ApiService } from '../../../core/services/api.service';
import type { Device } from '../../../core/models/device.model';

class MockApiService {
  response: any;
  constructor(resp: any) { this.response = resp; }
  get<T>(_endpoint: string) {
    return of(this.response as T);
  }
}

describe('DeviceDetailComponent', () => {
  const mockDevice: Device = {
    id: '1',
    socket_id: 's1',
    device_id: 'abcdefghijk',
    model: 'Pixel',
    version: '13',
    ip: '1.2.3.4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    isOnline: true,
  };

  const mockResponse = {
    device: mockDevice,
    logs: [],
    commands: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceDetailComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
        { provide: ApiService, useValue: new MockApiService(mockResponse) },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DeviceDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render device model and short id', () => {
    const fixture = TestBed.createComponent(DeviceDetailComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.section-header h2');
    expect(header?.textContent).toContain('Pixel');
    expect(header?.textContent).toContain('abcdefgh…'); // shortId
  });
});

