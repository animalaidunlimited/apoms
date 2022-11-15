/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DailyRotaService } from './daily-rota.service';

describe('Service: DailyRota', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DailyRotaService]
    });
  });

  it('should ...', inject([DailyRotaService], (service: DailyRotaService) => {
    expect(service).toBeTruthy();
  }));
});
