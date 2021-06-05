import { TestBed } from '@angular/core/testing';

import { LocationTrackingService } from './location-tracking.service';

describe('LocationTrackingService', () => {
  let service: LocationTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
