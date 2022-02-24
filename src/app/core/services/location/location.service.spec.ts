import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocationService } from './location.service';


describe('LocationTrackingService', () => {
  let service: LocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientModule ],
      providers: [ MatSnackBar, Overlay, LocationService ]
    });
    service = TestBed.inject(LocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
