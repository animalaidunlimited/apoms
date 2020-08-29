import { TestBed } from '@angular/core/testing';

import { MediaPasteService } from './media-paste.service';

describe('MediaPasteService', () => {
  let service: MediaPasteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaPasteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
