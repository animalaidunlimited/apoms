import { TestBed } from '@angular/core/testing';

import { CallerSearchService } from './caller-search.service';

describe('CallerSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CallerSearchService = TestBed.get(CallerSearchService);
    expect(service).toBeTruthy();
  });
});
