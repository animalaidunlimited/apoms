import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ReleaseService } from './release.service';

describe('ReleaseService', () => {
  let service: ReleaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ReleaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
