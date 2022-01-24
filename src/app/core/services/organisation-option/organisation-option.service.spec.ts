import { TestBed } from '@angular/core/testing';

import { OrganisationOptionsService } from './organisation-option.service';

describe('OrganisationOptionsService', () => {
  let service: OrganisationOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganisationOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
