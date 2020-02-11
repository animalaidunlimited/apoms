import { TestBed } from '@angular/core/testing';

import { AddressSearchService } from './address-search.service';

describe('AddressSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AddressSearchService = TestBed.get(AddressSearchService);
    expect(service).toBeTruthy();
  });
});
