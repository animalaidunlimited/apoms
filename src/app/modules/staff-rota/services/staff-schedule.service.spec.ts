/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { StaffScheduleService } from './staff-schedule.service';

describe('Service: StaffSchedule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StaffScheduleService]
    });
  });

  it('should ...', inject([StaffScheduleService], (service: StaffScheduleService) => {
    expect(service).toBeTruthy();
  }));
});
