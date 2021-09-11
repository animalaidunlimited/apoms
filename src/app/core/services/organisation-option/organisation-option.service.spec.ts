import { TestBed } from '@angular/core/testing';

import { OrganisationOptionService } from './organisation-option.service';

describe('OrganisationOptionService', () => {
  let service: OrganisationOptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganisationOptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
