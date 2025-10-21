import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DeviceListComponent } from './device-list.component';
import { ApiService } from '../../../core/services/api.service';

class MockApiService {
  get<T>(_endpoint: string) {
    return of({ devices: [] } as any as T);
  }
}

describe('DeviceListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceListComponent, NoopAnimationsModule],
      providers: [
        { provide: ApiService, useClass: MockApiService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DeviceListComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render empty state when no devices', () => {
    const fixture = TestBed.createComponent(DeviceListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });
});

