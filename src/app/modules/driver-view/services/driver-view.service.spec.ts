import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { DriverViewService } from './driver-view.service';
import { MaterialModule } from './../../../material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('DriverViewService', () => {
  let service: DriverViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule
      ],
      providers: [DriverViewService]
    });
    service = TestBed.inject(DriverViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
