import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { StreetTreatService } from './streettreat.service';


describe('StreetreatService', () => {
  let service: StreetTreatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
                  HttpClientTestingModule
    ]
    });
    service = TestBed.inject(StreetTreatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


