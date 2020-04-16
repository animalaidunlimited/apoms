import { TestBed } from '@angular/core/testing';

import { BoardSocketService } from './board-socket.service';

describe('BoardSocketService', () => {
  let service: BoardSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoardSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
