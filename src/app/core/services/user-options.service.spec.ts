import { TestBed } from '@angular/core/testing';

import { UserOptionsService } from './user-options.service';

describe('UserOptionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserOptionsService = TestBed.get(UserOptionsService);
    expect(service).toBeTruthy();
  });
});
