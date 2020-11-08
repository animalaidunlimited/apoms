import { TestBed } from '@angular/core/testing';

import { UserActionService } from './user-action.service';

describe('UserActionService', () => {
  let service: UserActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
