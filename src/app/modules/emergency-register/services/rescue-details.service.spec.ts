import { TestBed } from '@angular/core/testing';

import { RescueDetailsService } from './rescue-details.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RescueDetailsService', () => {
  let service: RescueDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RescueDetailsService]
    });
    service = TestBed.inject(RescueDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
