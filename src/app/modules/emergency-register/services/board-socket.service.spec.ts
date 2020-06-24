import { TestBed } from '@angular/core/testing';

import { MessagingService } from './board-socket.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BoardSocketService', () => {
<<<<<<< HEAD
  let service: MessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MessagingService]
    });
    service = TestBed.inject(MessagingService);
  });
=======
    let service: BoardSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [BoardSocketService],
        });
        service = TestBed.inject(BoardSocketService);
    });
>>>>>>> 52215419447ebc087dbdfe49fec58856bfa4d47b

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
