import { TestBed } from '@angular/core/testing';
import { OutstandingCaseService } from './outstanding-case.service';



describe('OutstandingCase2Service', () => {
  let service: OutstandingCaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutstandingCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
