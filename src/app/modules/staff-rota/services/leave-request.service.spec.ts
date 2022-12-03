/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { LeaveRequestService } from './leave-request.service';

describe('Service: LeaveRequest', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LeaveRequestService]
    });
  });

  it('should ...', inject([LeaveRequestService], (service: LeaveRequestService) => {
    expect(service).toBeTruthy();
  }));
});
