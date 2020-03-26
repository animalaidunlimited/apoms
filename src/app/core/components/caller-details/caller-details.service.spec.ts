import { TestBed } from '@angular/core/testing';

import { CallerDetailsService } from './caller-details.service';

describe('CallerDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CallerDetailsService = TestBed.get(CallerDetailsService);
    expect(service).toBeTruthy();
  });
});
