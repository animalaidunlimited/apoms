import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserOptionsService {

  private homeCoordinates$;

  constructor() { }

  getCoordinates() {

    if (!this.homeCoordinates$)
    {
      this.homeCoordinates$ = {"latitude": 24.571270, "longitude": 73.691544};
    }

    return this.homeCoordinates$;
  }
}
