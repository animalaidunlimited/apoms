import { TestBed } from '@angular/core/testing';

import { RescueDetailsService } from './rescue-details.service';

describe('RescueDetailsService', () => {
  let service: RescueDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RescueDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
