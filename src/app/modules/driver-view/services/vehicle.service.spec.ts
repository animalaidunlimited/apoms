import { TestBed } from '@angular/core/testing';

import { VehicleService } from './vehicle.service';
import { MaterialModule } from './../../../material-module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VehicleService', () => {
  let service: VehicleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
        HttpClientModule,
        HttpClientTestingModule,
        MaterialModule
      ],
      providers: [VehicleService],

    });
    service = TestBed.inject(VehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
