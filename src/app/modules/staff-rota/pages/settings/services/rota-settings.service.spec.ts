/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RotaSettingsService } from './rota-settings.service';

describe('Service: RotaSettings', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RotaSettingsService]
    });
  });

  it('should ...', inject([RotaSettingsService], (service: RotaSettingsService) => {
    expect(service).toBeTruthy();
  }));
});
