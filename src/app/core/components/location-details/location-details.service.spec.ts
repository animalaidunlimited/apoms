import { TestBed } from '@angular/core/testing';

import { LocationDetailsService } from './location-details.service';

describe('LocationDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocationDetailsService = TestBed.get(LocationDetailsService);
    expect(service).toBeTruthy();
  });
});
