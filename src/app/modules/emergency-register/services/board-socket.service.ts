import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UpdatedRescue, OutstandingCaseResponse, OutstandingRescue, OutstandingRescueResponse } from 'src/app/core/models/outstanding-case';
import { RescueDetailsParent } from 'src/app/core/models/responses';


@Injectable({
  providedIn: 'root'
})
export class BoardSocketService {

  socket;

  constructor(private authService: AuthService) { }

  async setupSocketConnection() {

    let room = await this.authService.getOrganisationSocketEndPoint();

    this.socket = io(`${environment.SOCKET_ENDPOINT}/${room}`);

  }

  getOutstandingRescues():Observable<OutstandingCaseResponse>
  {

    let observable:Observable<OutstandingCaseResponse> = new Observable(observer => {

      this.socket.on('OUTSTANDING_RESCUES', (data: any) => {

        //TODO fix this. For some reason these needs to be parsed instead of being able to
        //cast directly to the type
        observer.next(JSON.parse(data));
      });
      // return () => {
      //   this.socket.disconnect();
      // };
    })
    return observable;
  }

  getUpdatedRescues():Observable<OutstandingRescue>
  {

    let observable = new Observable<OutstandingRescue>(observer => {

      this.socket.on('UPDATING_RESCUE', (data: any) => {
        observer.next(JSON.parse(data));
      });
      // return () => {
      //   this.socket.disconnect();
      // };
    })
    return observable;
  }

}
