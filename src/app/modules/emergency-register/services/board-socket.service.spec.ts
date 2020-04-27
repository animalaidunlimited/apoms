import { TestBed } from '@angular/core/testing';

import { BoardSocketService } from './board-socket.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BoardSocketService', () => {
  let service: BoardSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BoardSocketService]
    });
    service = TestBed.inject(BoardSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
