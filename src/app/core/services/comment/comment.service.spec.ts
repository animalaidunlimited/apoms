/* tslint:disable:no-unused-variable */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async, inject } from '@angular/core/testing';
import { CommentService } from './comment.service';

describe('Service: Comment', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CommentService]
    });
  });

  it('should ...', inject([CommentService], (service: CommentService) => {
    expect(service).toBeTruthy();
  }));
});
