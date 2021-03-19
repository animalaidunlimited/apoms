import { UpdateAvailableEvent, UpdateActivatedEvent } from '@angular/service-worker';
import { Observable, Subject } from 'rxjs';

export class SwUpdateServerMock {
  public available: Observable<UpdateAvailableEvent> = new Subject();
  public activated: Observable<UpdateActivatedEvent> = new Subject();
  public isEnabled = false;

  public checkForUpdate(): Promise<void> {
    return new Promise((resolve) => resolve());
  }
  public activateUpdate(): Promise<void> {
    return new Promise((resolve) => resolve());
  }
}