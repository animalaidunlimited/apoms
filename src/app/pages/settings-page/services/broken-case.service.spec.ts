/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BrokenCaseService } from './broken-case.service';

describe('Service: BrokenCase', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BrokenCaseService]
    });
  });

  it('should ...', inject([BrokenCaseService], (service: BrokenCaseService) => {
    expect(service).toBeTruthy();
  }));
});
