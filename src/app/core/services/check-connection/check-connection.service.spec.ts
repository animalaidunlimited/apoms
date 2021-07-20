import { TestBed } from '@angular/core/testing';

import { CheckConnectionService } from './check-connection.service';

describe('CheckConnectionService', () => {
  let service: CheckConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
