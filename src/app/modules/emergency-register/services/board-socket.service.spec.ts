import { TestBed } from '@angular/core/testing';

import { MessagingService } from './board-socket.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BoardSocketService', () => {
  let service: MessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MessagingService]
    });
    service = TestBed.inject(MessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
