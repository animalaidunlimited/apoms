import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OutstandingCaseService } from './outstanding-case.service';

describe('OutstandingCaseService', () => {
  let service: OutstandingCaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OutstandingCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
