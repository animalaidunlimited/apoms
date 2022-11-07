
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, async, inject } from '@angular/core/testing';
import { UserNotificationService } from './user-notification.service';

describe('Service: UserNotification', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],      
      providers: [UserNotificationService]
    });
  });

  it('should ...', inject([UserNotificationService], (service: UserNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
