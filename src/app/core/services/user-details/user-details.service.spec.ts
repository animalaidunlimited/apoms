import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserDetailsService } from './user-details.service';

describe('UserDetailsService', () => {
  let service: UserDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(UserDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
