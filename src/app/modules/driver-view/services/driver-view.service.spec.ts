import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { DriverViewService } from './driver-view.service';

describe('DriverViewService', () => {
  let service: DriverViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [DriverViewService]
    });
    service = TestBed.inject(DriverViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
